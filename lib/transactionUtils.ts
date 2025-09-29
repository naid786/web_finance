import * as XLSX from 'xlsx';
import { FormattedTextRow, render_page } from './pdfText';

export interface Transaction {
  [key: string]: string | null;
}

interface MatrixResult {
  rows: string[][];
  cells: { text: string }[][];
  columnCount: number;
  rowCount: number;
  columnBounds: { x: number; width: number }[];
}

export interface ExtractedData {
  excelBuffer: Buffer;
  headers?: string[];
}

// Helper function to convert formatted text rows to matrix structure
function convertFormattedTextToMatrix(formattedRows: SimpleFormattedTextRow[]): MatrixResult {
  const rows: string[][] = [];

  formattedRows.forEach(row => {
    // Split the text by significant spacing to create columns
    const text = row.text || '';
    const columns = text.split(/\s{3,}/).filter((col: string) => col.trim()); // Split on 3+ spaces
    rows.push(columns);
  });

  // Find maximum number of columns
  const maxColumns = Math.max(...rows.map(row => row.length), 1);

  // Normalize all rows to have the same number of columns
  const normalizedRows = rows.map(row => {
    const normalizedRow = [...row];
    while (normalizedRow.length < maxColumns) {
      normalizedRow.push('');
    }
    return normalizedRow;
  });

  return {
    rows: normalizedRows,
    cells: normalizedRows.map(row => row.map(cell => ({ text: cell }))),
    columnCount: maxColumns,
    rowCount: normalizedRows.length,
    columnBounds: Array.from({ length: maxColumns }, (_, i) => ({ x: i * 100, width: 100 }))
  };
}

// Interface for formatted text row (simplified version)
interface SimpleFormattedTextRow {
  text: string;
  x: number;
  y: number;
  items: { str: string; transform?: number[] }[];
}

// Helper function to create Excel workbook from matrix data
function createExcelFromMatrix(textMatrix: MatrixResult | string[][]): XLSX.WorkBook {
  const workbook = XLSX.utils.book_new();

  // Create worksheet from the text matrix
  let worksheet: XLSX.WorkSheet;

  // Handle different matrix types
  if (Array.isArray(textMatrix)) {
    // Direct string[][] array
    worksheet = XLSX.utils.aoa_to_sheet(textMatrix);
  } else if ('rows' in textMatrix && Array.isArray(textMatrix.rows)) {
    // MatrixResult or Text2DMatrix with rows property
    worksheet = XLSX.utils.aoa_to_sheet(textMatrix.rows);
  } else {
    // Fallback to empty sheet
    worksheet = XLSX.utils.aoa_to_sheet([['No data available']]);
  }

  // Apply basic formatting
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:A1');

  // Auto-size columns based on content
  const colWidths: { wch: number }[] = [];

  let dataRows: string[][];
  if (Array.isArray(textMatrix)) {
    dataRows = textMatrix;
  } else if ('rows' in textMatrix) {
    dataRows = textMatrix.rows;
  } else {
    dataRows = [];
  }

  for (let col = range.s.c; col <= range.e.c; col++) {
    let maxWidth = 10;
    for (let row = range.s.r; row <= range.e.r; row++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const cell = worksheet[cellAddress];
      if (cell && cell.v) {
        const cellText = String(cell.v);
        maxWidth = Math.max(maxWidth, cellText.length);
      }
    }
    colWidths.push({ wch: Math.min(maxWidth + 2, 50) }); // Cap at 50 chars
  }
  worksheet['!cols'] = colWidths;

  // Set first row as header if it exists
  if (dataRows.length > 0) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].s = {
          font: { bold: true },
          fill: { fgColor: { rgb: 'EEEEEE' } }
        };
      }
    }
  }

  XLSX.utils.book_append_sheet(workbook, worksheet, 'PDF_Data');
  return workbook;
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
    const cleanBuffer = Buffer.from(pdfFile);
    
    console.log('About to parse PDF...');
    
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
    

    console.log('PDF parsing successful, text length:', pdfData.text.length);
    
    const data = pdfData.text.replace(/\n/g, '').trim();
    
    // Handle concatenated JSON arrays from multiple pages
    let text: FormattedTextRow[] = [];
    let textMatrix: MatrixResult ;
    let pagesProcessed = 0;

    try {
      // If the data contains multiple JSON arrays concatenated together,
      // we need to split them and parse each one separately
      if (data.startsWith('[') && data.includes('][')) {
        // Split on '][' pattern and fix the brackets
        const jsonParts = data.split('][');
        for (let i = 0; i < jsonParts.length; i++) {
          let part = jsonParts[i];
          // Add missing brackets
          if (i === 0) {
            part = part + ']';
          } else if (i === jsonParts.length - 1) {
            part = '[' + part;
          } else {
            part = '[' + part + ']';
          }
          
          try {
            const pageData = JSON.parse(part) as FormattedTextRow[];
            text.push(...pageData);
          } catch (partError) {
            console.warn('Failed to parse part of JSON data:', part.substring(0, 100), partError);
          }
        }
      } else {
        // Single JSON array
        text = JSON.parse(data) as FormattedTextRow[];
      }
    } catch (parseError) {
      console.error('JSON parse error for data:', data.substring(0, 200) + '...');
      throw new Error(`Failed to parse extracted text as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown JSON parsing error'}`);
    }

    if (text.length === 0) {
      throw new Error('Extracted text is empty or not in expected format');
    }
    // Convert to SimpleFormattedTextRow format
    const simpleFormattedRows: SimpleFormattedTextRow[] = text.map(row => ({
      text: row.text || '',
      x: row.x || 0,
      y: row.y || 0,
      items: row.items || []
    }));

    // Convert formatted text to matrix-like structure
    textMatrix = convertFormattedTextToMatrix(simpleFormattedRows);
    pagesProcessed = text.length || 1;

    // Create Excel workbook from text matrix
    const workbook = createExcelFromMatrix(textMatrix);

    // Generate Excel buffer
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'buffer',
      cellStyles: true,
      sheetStubs: false
    });
    
    return {
      excelBuffer,
      headers: pagesProcessed > 0 && textMatrix.rows.length > 0 ? textMatrix.rows[0] : []
    };

    
    
  } catch (error) {
    console.error('Transaction extraction error:', error);
    
    // Provide more specific error messages based on the error type
    if (error instanceof Error) {
      if (error.message.includes('JSON')) {
        throw new Error(`Failed to extract transactions from PDF: ${error.message}. The PDF content may not be in the expected format.`);
      } else if (error.message.includes('pdf-parse')) {
        throw new Error(`Failed to extract transactions from PDF: PDF parsing library error - ${error.message}`);
      } else if (error.message.includes('Buffer')) {
        throw new Error(`Failed to extract transactions from PDF: Invalid file format - ${error.message}`);
      } else {
        throw new Error(`Failed to extract transactions from PDF: ${error.message}`);
      }
    }
    
    throw new Error(`Failed to extract transactions from PDF: ${String(error)}`);
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
  transactions: Transaction[]
  // outputPath and headers parameters removed as they're not used
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