import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Dummy transaction extraction and Excel conversion
async function extractTransactionsAndConvertToExcel(pdfBuffer: Buffer): Promise<{ success: boolean; filePath?: string; message?: string }> {
  // TODO: Replace with real PDF parsing and Excel generation logic
  // For now, just save the PDF as a placeholder Excel file
  const tempDir = path.join(process.cwd(), 'public');
  const excelFileName = `transactions_${Date.now()}.xlsx`;
  const excelFilePath = path.join(tempDir, excelFileName);
  await fs.writeFile(excelFilePath, pdfBuffer); // Just saving PDF as .xlsx for demo
  return { success: true, filePath: `/public/${excelFileName}` };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf');
    if (!pdfFile || typeof pdfFile === 'string') {
      return NextResponse.json({ success: false, message: 'No PDF file uploaded.' }, { status: 400 });
    }
    const pdfBuffer = Buffer.from(await (pdfFile as Blob).arrayBuffer());
    const result = await extractTransactionsAndConvertToExcel(pdfBuffer);
    if (result.success && result.filePath) {
      // The file is saved in public, so can be downloaded via /transactions_xxx.xlsx
      return NextResponse.json({ success: true, downloadUrl: `/${path.basename(result.filePath)}` });
    } else {
      return NextResponse.json({ success: false, message: result.message || 'Conversion failed.' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: 'Server error.' }, { status: 500 });
  }
}
