// Extract plain text from PDF / DOCX buffers. Never executes uploads.
export async function extractText(
  buffer: Buffer, mimetype: string, originalName: string
): Promise<string> {
  const name = (originalName || '').toLowerCase();
  const isPdf = mimetype === 'application/pdf' || name.endsWith('.pdf');
  const isDocx =
    mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    name.endsWith('.docx');
  if (isPdf) return extractPdf(buffer);
  if (isDocx) return extractDocx(buffer);
  throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
}
async function extractPdf(buffer: Buffer): Promise<string> {
  try {
    // pdf-parse v2 API: PDFParse class with getText().
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('pdf-parse') as {
      PDFParse?: new (opts: { data: Uint8Array }) => {
        getText(): Promise<{ text: string }>; destroy(): Promise<void>;
      };
    };
    if (!mod.PDFParse) throw new Error('PDF parser unavailable');
    const parser = new mod.PDFParse({ data: new Uint8Array(buffer) });
    try {
      const result = await parser.getText();
      return (result?.text || '').trim();
    } finally {
      await parser.destroy().catch(() => undefined);
    }
  } catch {
    throw new Error('Could not read this PDF. It may be scanned/image-only or corrupted. Please upload a text-based PDF or DOCX file.');
  }
}
async function extractDocx(buffer: Buffer): Promise<string> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth') as {
      extractRawText(opts: { buffer: Buffer }): Promise<{ value: string }>;
    };
    const result = await mammoth.extractRawText({ buffer });
    return (result?.value || '').trim();
  } catch {
    throw new Error('Could not read this DOCX file. It may be corrupted. Please try a text-based PDF or DOCX file.');
  }
}
