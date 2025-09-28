'use server';

import * as z from "zod";
import { 
  extractTransactionsFromPdfText, 
  convertTransactionsToExcel, 
  type Transaction, 
  type ExtractedData 
} from '@/lib/transactionUtils';

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
      downloadUrl: dataUrl,
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