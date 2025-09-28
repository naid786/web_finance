import { NextRequest, NextResponse } from 'next/server';
import { extractTransactionsFromPdfText, convertTransactionsToExcel } from '@/lib/transactionUtils';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf');
    
    if (!pdfFile) {
      return NextResponse.json({ success: false, message: 'No PDF file uploaded.' }, { status: 400 });
    }

    // Convert the uploaded file to Buffer
    const pdfBuffer = Buffer.from(await (pdfFile as Blob).arrayBuffer());

    // Extract transactions from PDF
    const extractedData = await extractTransactionsFromPdfText(pdfBuffer);
    
    // Generate unique filename for the output
    const timestamp = Date.now();
    const outputPath = `/temp/transactions_${timestamp}.xlsx`;
    
    // Convert transactions to Excel format
    const excelBuffer = await convertTransactionsToExcel(extractedData.transactions, outputPath, extractedData.headers);

    // Return the Excel file as a response
    return new NextResponse(new Uint8Array(excelBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="transactions.xlsx"',
      },
    });
  } catch (err) {
    console.error('PDF to Excel conversion error:', err);
    return NextResponse.json({ 
      success: false, 
      message: err instanceof Error ? err.message : 'Unknown error occurred during conversion' 
    }, { status: 500 });
  }
}
