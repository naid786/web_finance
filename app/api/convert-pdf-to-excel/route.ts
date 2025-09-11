import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { convertPdfToExcelAction } from '../../../actions/convert_pdf_to_excel';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf');
    if (!pdfFile ) {
      return NextResponse.json({ success: false, message: 'No PDF file uploaded.' }, { status: 400 });
    }
    const pdfBuffer = Buffer.from(await (pdfFile as Blob).arrayBuffer());
      const result = await convertPdfToExcelAction(formData);
    if (result.success && result.downloadUrl) {
      // The file is saved in public, so can be downloaded via /transactions_xxx.xlsx
      return NextResponse.json({ success: true, downloadUrl: `/${path.basename(result.downloadUrl)}` });
    } else {
      return NextResponse.json({ success: false, message: result.message || 'Conversion failed.' }, { status: 500 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
}
