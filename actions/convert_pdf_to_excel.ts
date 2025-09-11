'use server';

import * as XLSX from 'xlsx';
// ...existing code...
import * as z from "zod";

interface Transaction {
  [key: string]: string | null;
}

interface ExtractedData {
  transactions: Transaction[];
  headers?: string[];
}

/**
 * Extracts transactions from a PDF by reading content and parsing tables.
 * Returns an object with extracted transactions that can be converted to Excel.
 */
export async function extractTransactionsFromPdfText(pdfFile: Buffer): Promise<ExtractedData> {
  try {
    // Dynamic import to avoid bundling issues with Node.js modules
    const pdfParse = (await import('pdf-parse')).default;
    const pdfData = await pdfParse(pdfFile);
    
    const transactions: Transaction[] = [];
    const text = pdfData.text;
    
    // Split by date pattern to get individual transaction blocks
    // const transactionBlocks = text.split(/\n(?=\d{2}\/\d{2}\/\d{4})/).filter((block: string) => {
    //   return block.trim().length > 0 && /\d{2}\/\d{2}\/\d{4}/.test(block);
    // });
      const transactionBlocks = text.split(/(?=(?:\n\d{2}\/\d{2}\/\d{4}[A-Za-z]|\n\d{4}-\d{2}-\d{2}[A-Za-z]))/)
          .filter((block: string) => {
              return block.trim().length > 0;
          });
    
    for (const block of transactionBlocks) {
      const transaction = parseCapitecTransaction(block.trim());
      if (transaction) {
        transactions.push(transaction);
      }
    }
    
    if (transactions.length === 0) {
      throw new Error("No transaction-like lines found in the PDF.");
    }
    
    return {
      transactions,
      headers: transactions.length > 0 ? Object.keys(transactions[0]) : []
    };
    
  } catch (error) {
    throw new Error(`Failed to extract transactions from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parses a Capitec bank transaction block into structured data
 */
function parseCapitecTransaction(block: string): Transaction | null {
  try {
    // Extract the date (first line)
      const dateMatch = block.match(/^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/);
    if (!dateMatch) return null;
    
    const date = dateMatch[1];
    
    // Look for amount patterns (positive and negative)
    const amountPattern = /(-)?(R)?\d{1,3}(?: \d{3})*\.\d{2}/g;
    const amounts = [...block.matchAll(amountPattern)].map(match => match[0]);
    
    if (amounts.length < 2) return null;
    // Extract the last amount as balance (usually the rightmost number)
    const balance = amounts.length > 0 ? amounts[amounts.length - 1] : '';
    
    // Extract transaction amount (usually second to last, or look for negative amounts)
    let transactionAmount = '';
    let fees = '';

    if (amounts.length >= 2) {
      // Look for negative amounts (debits)
      const negativeAmounts = amounts.filter(amt => amt!== balance);
      if (negativeAmounts.length > 0) {
        transactionAmount = negativeAmounts[0];
        // If there are multiple negative amounts, the second might be fees
        if (negativeAmounts.length > 1) {
          fees = negativeAmounts[1];
        }
      } else if (amounts.length >= 2) {
        // For credits, take the first amount
        transactionAmount = amounts[0];
      }
    }
    // Extract description (everything between date and amounts)
      let description = block.replace(/^(R)?\d{2}\/\d{2}\/\d{4}/, '').trim().replace(/^(\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2})/, '').trim();  
    // Remove amounts from description
    amounts.forEach(amount => {
      const escapedAmount = amount.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      description = description.replace(new RegExp(escapedAmount, 'g'), '').trim();
    });
    
    // Clean up description
    description = description.replace(/\s+/g, ' ').trim();
        
    return {
      Date: date,
        Description: description || '',
      Amount: transactionAmount,
      Fees: fees,
      Balance: balance
    };
    
  } catch (error) {
    console.error('Error parsing transaction block:', block, error);
    return null;
  }
}

/**
 * Converts extracted transaction data to Excel format and saves it to a file.
 */
export async function convertTransactionsToExcel(
  transactions: Transaction[], 
  outputPath: string,
  headers?: string[]
): Promise<Buffer> {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert transactions to worksheet
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    
    // Add the worksheet to the workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    
    // Return workbook as a Buffer instead of saving to disk
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return excelBuffer;
    
  } catch (error) {
    throw new Error(`Failed to convert to Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Server action to handle PDF to Excel conversion from FormData.
 * This is meant to be called from a form submission.
 */
const formSchema = z.object({
  pdf: z.custom<File>((v) => v instanceof File && v.type === "application/pdf", {
    message: "Only PDF files are allowed",
  }),
  bank: z.string(),
});

// ...existing code...
export async function convertPdfToExcelAction(formData: FormData): Promise<{ success: boolean; message: string; downloadUrl?: string }> {
  try {
    console.log("Starting PDF to Excel conversion action");
    // Get the file from FormData
    const file = formData.get('pdf') as File;
    
    if (!file) {
      throw new Error('No PDF file provided');
    }
    if (file.type !== 'application/pdf') {
      throw new Error('File must be a PDF');
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Extract transactions
    const extractedData = await extractTransactionsFromPdfText(pdfBuffer);
    
    // Generate unique filename
    const timestamp = Date.now();
    const outputPath = `/temp/transactions_${timestamp}.xlsx`;
    
    // Convert to Excel
    const excelBuffer = await convertTransactionsToExcel(extractedData.transactions, outputPath, extractedData.headers);

    // Return a data URL so the client can download without saving on the server
    const excelBase64 = Buffer.from(excelBuffer).toString('base64');
    const dataUrl = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelBase64}`;

    return {
      success: true,
      message: `Successfully extracted ${extractedData.transactions.length} transactions`,
      // downloadUrl: dataUrl,
    };

  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Main function that combines PDF extraction and Excel conversion from file object.
 */
export async function convertPdfToExcel(pdfFile: Buffer | File, excelPath: string): Promise<void> {
  try {
    // Convert File to Buffer if needed
    let pdfBuffer: Buffer;
    if (pdfFile instanceof File) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);
    } else {
      pdfBuffer = pdfFile;
    }
    
    const extractedData = await extractTransactionsFromPdfText(pdfBuffer);
    await convertTransactionsToExcel(extractedData.transactions, excelPath, extractedData.headers);
  } catch (error) {
    throw new Error(`PDF to Excel conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}