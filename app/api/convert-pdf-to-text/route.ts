"use server";
import { render_page } from '@/lib/pdfText';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf');
    
    if (!pdfFile) {
      return NextResponse.json({ success: false, message: 'No PDF file uploaded.' }, { status: 400 });
    }

    // Convert the uploaded file to Buffer
    const arrayBuffer = await (pdfFile as Blob).arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    // Extract text from PDF using pdf-parse
    const extractedText = await extractTextFromPdf(pdfBuffer);

    // Return the extracted text as JSON
    return NextResponse.json({ 
      success: true, 
      text: extractedText,
      message: 'Text extracted successfully'
    }, { status: 200 });
    
  } catch (err) {
    console.error('PDF to text conversion error:', err);
    return NextResponse.json({ 
      success: false, 
      message: err instanceof Error ? err.message : 'Unknown error occurred during conversion' 
    }, { status: 500 });
  }
}



async function extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
  try {
    // Ensure we have a proper Buffer before attempting to parse
    if (!Buffer.isBuffer(pdfBuffer)) {
      throw new Error(`Expected Buffer, received ${typeof pdfBuffer}`);
    }
    
    if (pdfBuffer.length === 0) {
      throw new Error('PDF Buffer is empty');
    }

    console.log('Starting PDF text extraction, buffer size:', pdfBuffer.length);
    
    // Import pdf-parse with better error handling
    let pdfParse: ((buffer: Buffer, options?: { [key: string]: unknown }) => Promise<{ text: string; numpages: number; info: unknown; metadata: unknown; version: string }>);
    try {
      const pdfParseModule = await import('pdf-parse');
      pdfParse = pdfParseModule.default || pdfParseModule;
      
      if (typeof pdfParse !== 'function') {
        throw new Error('pdf-parse is not a function');
      }
    } catch (importError) {
      console.error('Import error:', importError);
      throw new Error(`Failed to import pdf-parse: ${importError}`);
    }

    // Create a clean buffer copy to ensure no corruption
    const cleanBuffer = Buffer.from(pdfBuffer);
    
    console.log('About to parse PDF for text extraction...');
    

    // Call pdf-parse with the buffer and catch specific errors
    let pdfData;
    try {
      pdfData = await pdfParse(cleanBuffer, { pagerender: render_page });
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
    
    console.log('PDF text extraction successful, text length:', pdfData.text.length);
    
    return pdfData.text.trim();
    
  } catch (error) {
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}