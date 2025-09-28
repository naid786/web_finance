import * as XLSX from 'xlsx';

export interface Transaction {
  [key: string]: string | null;
}

export interface ExtractedData {
  transactions: Transaction[];
  headers?: string[];
}

/**
 * Extracts transactions from a PDF by reading content and parsing tables.
 * Returns an object with extracted transactions that can be converted to Excel.
 */
export async function extractTransactionsFromPdfText(pdfFile: Buffer): Promise<ExtractedData> {
  try {
    // Ensure we have a proper Buffer before attempting to parse
    if (!Buffer.isBuffer(pdfFile)) {
      throw new Error(`Expected Buffer, received ${typeof pdfFile}`);
    }
    
    if (pdfFile.length === 0) {
      throw new Error('PDF Buffer is empty');
    }

    console.log('Starting PDF extraction, buffer size:', pdfFile.length);
    
    // Import pdf-parse with better error handling
    let pdfParse: any;
    try {
      const module = await import('pdf-parse');
      pdfParse = module.default || module;
      
      if (typeof pdfParse !== 'function') {
        throw new Error('pdf-parse is not a function');
      }
    } catch (importError) {
      console.error('Import error:', importError);
      throw new Error(`Failed to import pdf-parse: ${importError}`);
    }

    // Create a clean buffer copy to ensure no corruption
    const cleanBuffer = Buffer.from(pdfFile);
    
    console.log('About to parse PDF...');
    
    // Call pdf-parse with the buffer and catch specific errors
    let pdfData;
    try {
      pdfData = await pdfParse(cleanBuffer);
    } catch (parseError) {
      console.error('PDF Parse Error:', parseError);
      
      // Check if the error message contains file path references
      if (parseError instanceof Error && parseError.message.includes('./test/data/')) {
        throw new Error('PDF parsing library is incorrectly trying to access file system. This might be due to corrupted PDF data or library issue.');
      }
      
      throw new Error(`PDF parsing failed: ${parseError instanceof Error ? parseError.message : 'Unknown parsing error'}`);
    }
    
    if (!pdfData || !pdfData.text) {
      throw new Error('No text content extracted from PDF');
    }
    
    console.log('PDF parsing successful, text length:', pdfData.text.length);
    
    const transactions: Transaction[] = [];
    const text = pdfData.text;
    
    // Split by date pattern to get individual transaction blocks
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
export function parseCapitecTransaction(block: string): Transaction | null {
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