/**
 * @fileoverview Custom PDF Certificate Generator
 * @version 0.4.1
 * @author EXACTUM-dev
 * @description Certificate generator with auto-sizing and multi-line support (up to 3 lines for names)
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';
import path from "path";
import { fileURLToPath } from 'url';
import fontkit from '@pdf-lib/fontkit';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Calculates the optimal font size for text to fit within a maximum width
 * @param {string} text - The text to measure
 * @param {Object} font - PDF-lib font object
 * @param {number} maxWidth - Maximum width in points that the text should occupy
 * @param {number} [maxSize=29] - Maximum font size in points
 * @param {number} [minSize=14] - Minimum font size in points
 * @returns {number} Optimal font size in points that fits the text within maxWidth
 */
function calculateOptimalFontSize(text, font, maxWidth, maxSize = 29, minSize = 14) {
  let fontSize = maxSize;
  let textWidth = font.widthOfTextAtSize(text, fontSize);
  if (textWidth <= maxWidth) return fontSize;
  while (textWidth > maxWidth && fontSize > minSize) {
    fontSize -= 0.5;
    textWidth = font.widthOfTextAtSize(text, fontSize);
  }
  return fontSize;
}

/**
 * Creates a PDF certificate with member information
 * Supports automatic text sizing and multi-line layout (up to 3 lines for names)
 * @param {Object} params - Certificate parameters
 * @param {string} params.nombres - Member's first name(s)
 * @param {string} params.apellidoP - Member's paternal last name
 * @param {string} params.apellidoM - Member's maternal last name
 * @param {string} params.membresiaTipo - Type of membership
 * @param {string} params.vigencia - Validity period of the membership
 * @param {string} params.membresiaNoAfiliado - Membership affiliate number
 * @returns {Promise<{buffer: Buffer, filename: string, mimeType: string}>} PDF certificate data
 * @returns {Buffer} return.buffer - PDF file as a buffer
 * @returns {string} return.filename - Generated filename for the certificate
 * @returns {string} return.mimeType - MIME type (always "application/pdf")
 * @throws {Error} If template file is not found or PDF generation fails
 */
export async function createCertificate({ nombres, apellidoP, apellidoM, membresiaTipo, vigencia, membresiaNoAfiliado }) {
  const nombreCompleto = [nombres, apellidoP, apellidoM].filter(Boolean).join(' ').trim().toUpperCase();

  const templatePath = path.join(__dirname, 'certificateTemplate.pdf');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  let customFont;
  try {
    const fontPath = path.join(__dirname, 'fonts', 'LibreBaskerville-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    customFont = await pdfDoc.embedFont(fontBytes);
  } catch (error) {
    customFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  const standardFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.getPage(0);
  const { width } = page.getSize();
  const customColor = rgb(77 / 255, 78 / 255, 77 / 255);
  const maxTextWidth = width * 0.8;

  // === NAME (1, 2 or 3 lines) ===
  const nombreSize = calculateOptimalFontSize(nombreCompleto, customFont, maxTextWidth, 29, 14);
  const nombreWidth = customFont.widthOfTextAtSize(nombreCompleto, nombreSize);

  if (nombreWidth <= maxTextWidth) {
    page.drawText(nombreCompleto, {
      x: (width - nombreWidth) / 2,
      y: 380,
      size: nombreSize,
      font: customFont,
      color: customColor
    });
  } else {
    // Try 2 lines
    const l1 = nombres.toUpperCase();
    const l2 = [apellidoP, apellidoM].filter(Boolean).join(' ').toUpperCase();
    const s1 = calculateOptimalFontSize(l1, customFont, maxTextWidth, 29, 14);
    const s2 = calculateOptimalFontSize(l2, customFont, maxTextWidth, 29, 14);
    const w1 = customFont.widthOfTextAtSize(l1, s1);
    const w2 = customFont.widthOfTextAtSize(l2, s2);

    if (w1 <= maxTextWidth && w2 <= maxTextWidth) {
      const sp = Math.max(s1, s2) * 1.2;
      page.drawText(l1, { x: (width - w1) / 2, y: 395, size: s1, font: customFont, color: customColor });
      page.drawText(l2, { x: (width - w2) / 2, y: 395 - sp, size: s2, font: customFont, color: customColor });
    } else {
      const ln1 = nombres.toUpperCase();
      const ln2 = apellidoP ? apellidoP.toUpperCase() : '';
      const ln3 = apellidoM ? apellidoM.toUpperCase() : '';

      const sz1 = calculateOptimalFontSize(ln1, customFont, maxTextWidth, 29, 14);
      const sz2 = ln2 ? calculateOptimalFontSize(ln2, customFont, maxTextWidth, 29, 14) : 0;
      const sz3 = ln3 ? calculateOptimalFontSize(ln3, customFont, maxTextWidth, 29, 14) : 0;

      const wd1 = customFont.widthOfTextAtSize(ln1, sz1);
      const wd2 = ln2 ? customFont.widthOfTextAtSize(ln2, sz2) : 0;
      const wd3 = ln3 ? customFont.widthOfTextAtSize(ln3, sz3) : 0;

      const spacing = Math.max(sz1, sz2, sz3) * 1.15;

      page.drawText(ln1, { x: (width - wd1) / 2, y: 405, size: sz1, font: customFont, color: customColor });
      if (ln2) page.drawText(ln2, { x: (width - wd2) / 2, y: 405 - spacing, size: sz2, font: customFont, color: customColor });
      if (ln3) page.drawText(ln3, { x: (width - wd3) / 2, y: 405 - (spacing * 2), size: sz3, font: customFont, color: customColor });
    }
  }

  // === MEMBERSHIP TYPE (1 or 2 lines) ===
  const membresiaTipoUpper = membresiaTipo.toUpperCase();
  const tipoSize = calculateOptimalFontSize(membresiaTipoUpper, customFont, maxTextWidth, 29, 14);
  const tipoWidth = customFont.widthOfTextAtSize(membresiaTipoUpper, tipoSize);

  if (tipoWidth <= maxTextWidth) {
    page.drawText(membresiaTipoUpper, {
      x: (width - tipoWidth) / 2,
      y: 230,
      size: tipoSize,
      font: customFont,
      color: customColor
    });
  } else {
    const palabras = membresiaTipoUpper.split(' ');
    let corte = Math.floor(palabras.length / 2);

    const preps = ['EN', 'DE', 'CON', 'PARA', 'POR'];
    for (let i = 1; i < palabras.length - 1; i++) {
      if (preps.includes(palabras[i])) {
        corte = i;
        break;
      }
    }

    const tl1 = palabras.slice(0, corte).join(' ');
    const tl2 = palabras.slice(corte).join(' ');
    const ts1 = calculateOptimalFontSize(tl1, customFont, maxTextWidth, 29, 14);
    const ts2 = calculateOptimalFontSize(tl2, customFont, maxTextWidth, 29, 14);
    const tw1 = customFont.widthOfTextAtSize(tl1, ts1);
    const tw2 = customFont.widthOfTextAtSize(tl2, ts2);
    const tsp = Math.max(ts1, ts2) * 1.2;

    page.drawText(tl1, { x: (width - tw1) / 2, y: 240, size: ts1, font: customFont, color: customColor });
    page.drawText(tl2, { x: (width - tw2) / 2, y: 240 - tsp, size: ts2, font: customFont, color: customColor });
  }

  // === AFFILIATE NUMBER ===
  if (membresiaNoAfiliado) {
    const afiliadoText = `${String(membresiaNoAfiliado).padStart(6, '0')}`;
    const afiliadoSize = 16;
    // Fixed X position to the right of the preprinted text
    page.drawText(afiliadoText, {
      x: 770,
      y: 18,
      size: afiliadoSize,
      font: customFont,
      color: customColor
    });
  }

  // === VALIDITY PERIOD ===
  const vigenciaText = `VIGENCIA ${vigencia}`;
  const vigenciaSize = 16;
  const vigenciaWidth = standardFont.widthOfTextAtSize(vigenciaText, vigenciaSize);
  page.drawText(vigenciaText, {
    x: (width - vigenciaWidth) / 2,
    y: 140,
    size: vigenciaSize,
    font: customFont,
    color: customColor
  });

  const pdfBytes = await pdfDoc.save();
  return {
    buffer: Buffer.from(pdfBytes),
    filename: `certificado_${nombreCompleto.replace(/\s+/g, '_')}.pdf`,
    mimeType: "application/pdf"
  };
}