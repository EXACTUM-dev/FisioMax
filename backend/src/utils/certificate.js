/**
 * @fileoverview Custom PDF Certificate Generator
 * @version 0.4.0
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

export async function createCertificate({ nombres, apellidoP, apellidoM, membresiaTipo, vigencia, noAfiliado }) {
  const nombreCompleto = [nombres, apellidoP, apellidoM].filter(Boolean).join(' ').trim().toUpperCase();

  const templatePath = path.join(__dirname, 'certificateTemplate.pdf');
  const templateBytes = fs.readFileSync(templatePath);
  const pdfDoc = await PDFDocument.load(templateBytes);
  pdfDoc.registerFontkit(fontkit);

  let customFont;
  try {
    const fontPath = path.join(__dirname, 'fonts', 'LibreBaskerville-Regular.ttf');
    console.log('📁 Cargando fuente...');
    const fontBytes = fs.readFileSync(fontPath);
    customFont = await pdfDoc.embedFont(fontBytes);
    console.log('✅ Fuente cargada');
  } catch (error) {
    console.warn('⚠️  Usando Helvetica Bold');
    customFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  const standardFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const page = pdfDoc.getPage(0);
  const { width } = page.getSize();
  const customColor = rgb(77 / 255, 78 / 255, 77 / 255);
  const maxTextWidth = width * 0.8;

  // === NOMBRE (1, 2 o 3 líneas) ===
  const nombreSize = calculateOptimalFontSize(nombreCompleto, customFont, maxTextWidth, 29, 14);
  const nombreWidth = customFont.widthOfTextAtSize(nombreCompleto, nombreSize);

  if (nombreWidth <= maxTextWidth) {
    // 1 línea
    console.log(`📏 Nombre: 1 línea - ${nombreSize}pt`);
    page.drawText(nombreCompleto, {
      x: (width - nombreWidth) / 2,
      y: 380,
      size: nombreSize,
      font: customFont,
      color: customColor
    });
  } else {
    // Intentar 2 líneas
    const l1 = nombres.toUpperCase();
    const l2 = [apellidoP, apellidoM].filter(Boolean).join(' ').toUpperCase();
    const s1 = calculateOptimalFontSize(l1, customFont, maxTextWidth, 29, 14);
    const s2 = calculateOptimalFontSize(l2, customFont, maxTextWidth, 29, 14);
    const w1 = customFont.widthOfTextAtSize(l1, s1);
    const w2 = customFont.widthOfTextAtSize(l2, s2);

    if (w1 <= maxTextWidth && w2 <= maxTextWidth) {
      // 2 líneas
      const sp = Math.max(s1, s2) * 1.2;
      console.log(`📏 Nombre: 2 líneas`);
      console.log(`   L1: "${l1}" - ${s1}pt`);
      console.log(`   L2: "${l2}" - ${s2}pt`);
      page.drawText(l1, { x: (width - w1) / 2, y: 395, size: s1, font: customFont, color: customColor });
      page.drawText(l2, { x: (width - w2) / 2, y: 395 - sp, size: s2, font: customFont, color: customColor });
    } else {
      // 3 líneas
      console.log(`📏 Nombre: 3 líneas`);
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

      console.log(`   L1: "${ln1}" - ${sz1}pt`);
      if (ln2) console.log(`   L2: "${ln2}" - ${sz2}pt`);
      if (ln3) console.log(`   L3: "${ln3}" - ${sz3}pt`);

      page.drawText(ln1, { x: (width - wd1) / 2, y: 405, size: sz1, font: customFont, color: customColor });
      if (ln2) page.drawText(ln2, { x: (width - wd2) / 2, y: 405 - spacing, size: sz2, font: customFont, color: customColor });
      if (ln3) page.drawText(ln3, { x: (width - wd3) / 2, y: 405 - (spacing * 2), size: sz3, font: customFont, color: customColor });
    }
  }

  // === TIPO MEMBRESÍA (1 o 2 líneas) ===
  const membresiaTipoUpper = membresiaTipo.toUpperCase();
  const tipoSize = calculateOptimalFontSize(membresiaTipoUpper, customFont, maxTextWidth, 29, 14);
  const tipoWidth = customFont.widthOfTextAtSize(membresiaTipoUpper, tipoSize);

  if (tipoWidth <= maxTextWidth) {
    console.log(`📏 Tipo: 1 línea - ${tipoSize}pt`);
    page.drawText(membresiaTipoUpper, {
      x: (width - tipoWidth) / 2,
      y: 230,
      size: tipoSize,
      font: customFont,
      color: customColor
    });
  } else {
    console.log(`📏 Tipo: 2 líneas`);
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

    console.log(`   L1: "${tl1}" - ${ts1}pt`);
    console.log(`   L2: "${tl2}" - ${ts2}pt`);

    page.drawText(tl1, { x: (width - tw1) / 2, y: 240, size: ts1, font: customFont, color: customColor });
    page.drawText(tl2, { x: (width - tw2) / 2, y: 240 - tsp, size: ts2, font: customFont, color: customColor });
  }

  // === AFILIADO NO ===
  if (noAfiliado) {
    const afiliadoText = `${noAfiliado}`;
    const afiliadoSize = 16;
    const afiliadoWidth = customFont.widthOfTextAtSize(afiliadoText, afiliadoSize);
    page.drawText(afiliadoText, {
      x: (width - afiliadoWidth) / 2,
      y: 175,
      size: afiliadoSize,
      font: customFont,
      color: customColor
    });
  }

  // === VIGENCIA ===
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