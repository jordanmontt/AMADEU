/**
 * Reads the positioned text of a PDF with pdf.js, for the canonical text import (ADR 0057).
 */
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import type { PdfPage } from './canonical';

export async function readPdfPages(path: string, first: number, last: number): Promise<PdfPage[]> {
  const document = await getDocument({ url: path, verbosity: 0 }).promise;
  const pages: PdfPage[] = [];
  for (let number = first; number <= last; number++) {
    const page = await document.getPage(number);
    // Loading the operator list makes pdf.js resolve each font's real name.
    await page.getOperatorList();
    const content = await page.getTextContent();
    const fontName = (id: string): string =>
      page.commonObjs.has(id) ? String((page.commonObjs.get(id) as { name?: string }).name) : '';
    pages.push({
      number,
      items: content.items
        .filter((item): item is TextItem => 'str' in item)
        .map((item) => ({
          text: item.str,
          x: Number(item.transform[4]),
          y: Number(item.transform[5]),
          size: Number(item.transform[3]),
          bold: /bold/i.test(fontName(item.fontName)),
        })),
    });
  }
  await document.destroy();
  return pages;
}
