/**
 * @fileoverview Custom PDF Certificate Generator
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Generate PDF certificates from a template, inserting custom data such as name, category, validity period, and membership number
 */

import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import fs from 'fs';


/**
 * Generate a custom PDF certificate from a template
 * @async
 * @function generarCertificado
 * @param {DatosCertificado} datos - Object with certificate data
 * @returns {Promise<GeneratedCertificate>} Object with the generated PDF and metadata
 */
async function createCertificate({ nombre, categoria, vigencia, numero }) {
  // 1. Cargar plantilla
  const templateBytes = fs.readFileSync('./certificateTemplate.pdf');
  const pdfDoc = await PDFDocument.load(templateBytes);

  // 2. Elegir fuente
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // 3. Seleccionar página
  const page = pdfDoc.getPage(0);

  // 4. Dibujar textos en coordenadas exactas
  page.drawText(nombre, {
    x: 140,
    y: 420,
    size: 32,
    font,
    color: rgb(0, 0, 0)
  });

  page.drawText(categoria, {
    x: 140,
    y: 350,
    size: 24,
    font,
    color: rgb(0, 0, 0)
  });

  page.drawText(`VIGENCIA ${vigencia}`, {
    x: 120,
    y: 140,
    size: 18,
    font,
    color: rgb(0, 0, 0)
  });

  page.drawText(`AFILIADO NO: ${numero}`, {
    x: 120,
    y: 110,
    size: 18,
    font,
    color: rgb(0, 0, 0)
  });

  // 5. Guardar PDF final
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(`./certificado_${nombre}.pdf`, pdfBytes);
}

generarCertificado({
  nombre: "Mauricio Salas Hernández",
  categoria: "LICENCIADO EN FORMACIÓN",
  vigencia: "DICIEMBRE 2025",
  numero: "000241"
});
