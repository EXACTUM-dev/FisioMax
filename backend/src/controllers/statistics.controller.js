/**
 * @fileoverview Statistics controller for membership reports
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Handles HTTP requests for membership statistics endpoints
 */

import PDFDocument from "pdfkit";
import {
  getResidenceStatistics,
  getCategoryStatistics,
  getEducationStatistics,
} from "../models/statistics.model.js";

/**
 * Get membership statistics (residence, category, education)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @route GET /api/statistics/memberships
 */
export const getMembershipStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date format if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({
        success: false,
        error: "Formato de fecha de inicio inválido. Use YYYY-MM-DD",
      });
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({
        success: false,
        error: "Formato de fecha de fin inválido. Use YYYY-MM-DD",
      });
    }

    // Fetch all statistics in parallel
    const [residence, category, education] = await Promise.all([
      getResidenceStatistics(startDate || null, endDate || null),
      getCategoryStatistics(startDate || null, endDate || null),
      getEducationStatistics(startDate || null, endDate || null),
    ]);

    res.json({
      success: true,
      data: {
        residence,
        category,
        education,
      },
    });
  } catch (error) {
    console.error("Error al obtener estadísticas de membresías:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    });
  }
};

/**
 * Formats a date string (YYYY-MM-DD) to a readable format (DD/MM/YYYY)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date string in DD/MM/YYYY format
 */
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString + "T00:00:00");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Export membership statistics as PDF
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @route GET /api/statistics/memberships/export
 */
export const exportMembershipStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date format if provided
    if (startDate && !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) {
      return res.status(400).json({
        success: false,
        error: "Formato de fecha de inicio inválido. Use YYYY-MM-DD",
      });
    }

    if (endDate && !/^\d{4}-\d{2}-\d{2}$/.test(endDate)) {
      return res.status(400).json({
        success: false,
        error: "Formato de fecha de fin inválido. Use YYYY-MM-DD",
      });
    }

    // Fetch statistics
    const [residence, category, education] = await Promise.all([
      getResidenceStatistics(startDate || null, endDate || null),
      getCategoryStatistics(startDate || null, endDate || null),
      getEducationStatistics(startDate || null, endDate || null),
    ]);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Set response headers
    const filename = `reporte-membresias-${new Date().toISOString().split("T")[0]}.pdf`;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Title
    doc.fontSize(20).font("Helvetica-Bold").text("Reporte de Estadísticas de Membresías", { align: "center" });
    doc.moveDown(0.5);

    // Date range
    doc.fontSize(12).font("Helvetica");
    if (startDate && endDate) {
      doc.text(`Período: ${formatDate(startDate)} al ${formatDate(endDate)}`, { align: "center" });
    } else if (startDate) {
      doc.text(`Desde: ${formatDate(startDate)}`, { align: "center" });
    } else if (endDate) {
      doc.text(`Hasta: ${formatDate(endDate)}`, { align: "center" });
    } else {
      doc.text("Todos los datos disponibles", { align: "center" });
    }
    doc.moveDown(1);

    // Generation date
    const now = new Date();
    const genDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
    doc.fontSize(10).fillColor("gray").text(`Generado el: ${genDate}`, { align: "center" });
    doc.fillColor("black");
    doc.moveDown(1.5);

    // Helper function to convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : { r: 210, g: 180, b: 13 }; // Default color
    };

    // Helper function to add a centered square bar chart
    const addBarChart = (title, data, doc, colors = ["#D2B40D", "#296B00", "#E58E15", "#cad00f", "#8B4513"]) => {
      // Page dimensions (standard letter size: 612x792 points)
      const pageWidth = 612;
      const pageHeight = 792;
      const margin = 50;
      const availableWidth = pageWidth - (margin * 2);
      
      // Calculate space needed for the chart
      // Title: ~20 points, spacing: ~10 points, chart: variable, bottom spacing: ~50 points
      const titleHeight = 20;
      const topSpacing = 10;
      const bottomSpacing = 50; // Extra space for safety
      const estimatedChartSize = Math.min(availableWidth * 0.70, 380);
      const totalSpaceNeeded = titleHeight + topSpacing + estimatedChartSize + bottomSpacing;
      
      // Check if we need a new page
      // Consider both top and bottom margins (50 each) plus safety margin
      const currentY = doc.y;
      const availableSpace = pageHeight - currentY - margin - 30; // 30 points safety margin
      
      if (availableSpace < totalSpaceNeeded) {
        doc.addPage();
      }
      
      // Title
      doc.fontSize(14).font("Helvetica-Bold").text(title, { align: "center" });
      doc.moveDown(0.5);
      
      if (!data || data.length === 0) {
        doc.fontSize(11).font("Helvetica").fillColor("gray").text("No hay datos disponibles", { align: "center" });
        doc.fillColor("black");
        doc.moveDown(1);
        return;
      }

      // Calculate max value for scaling
      const maxValue = Math.max(...data.map((d) => d.value || 0), 1);
      const yAxisMax = Math.max(Math.ceil(maxValue / 5) * 5, 5);

      // Calculate available space again after title
      // Use remaining space on page, considering bottom margin and safety margin
      const spaceAfterTitle = pageHeight - doc.y - margin - 30; // 30 points safety margin
      const maxChartSize = Math.min(spaceAfterTitle - 20, availableWidth * 0.70, 380); // 20 points extra padding
      
      // Make chart square and perfectly centered
      // Adjust size to fit in available space
      const chartSize = maxChartSize;
      const chartX = (pageWidth - chartSize) / 2; // Perfectly centered horizontally
      const chartY = doc.y + 10; // Add small top margin
      const chartHeight = chartSize; // Square chart
      const chartWidth = chartSize;

      // Chart area background (light gray)
      doc.rect(chartX, chartY, chartWidth, chartHeight)
        .fillColor("#fafafa")
        .fill()
        .strokeColor("#e0e0e0")
        .lineWidth(1)
        .stroke();

      // Calculate bar dimensions
      const barSpacing = 20;
      const labelHeight = 40;
      const valueLabelHeight = 30;
      const yAxisLabelWidth = 40;
      const chartPadding = 25;
      const availableHeight = chartHeight - labelHeight - valueLabelHeight - (chartPadding * 2);
      const numBars = data.length;
      const totalBarWidth = chartWidth - (yAxisLabelWidth + chartPadding * 2);
      const barWidth = Math.max((totalBarWidth - (barSpacing * (numBars - 1))) / numBars, 25);
      const barStartX = chartX + yAxisLabelWidth + chartPadding;

      // Draw Y-axis grid lines and labels
      const numGridLines = 5;
      doc.fontSize(10).fillColor("#333333").font("Helvetica");
      for (let i = 0; i <= numGridLines; i++) {
        const value = (yAxisMax / numGridLines) * i;
        const y = chartY + chartHeight - labelHeight - valueLabelHeight - chartPadding - (availableHeight * (i / numGridLines));
        
        // Grid line (horizontal)
        doc.moveTo(chartX + yAxisLabelWidth, y)
          .lineTo(chartX + chartWidth - chartPadding, y)
          .strokeColor("#d0d0d0")
          .lineWidth(0.8)
          .stroke();
        
        // Y-axis label (right aligned)
        doc.text(Math.round(value).toString(), chartX + 5, y - 6, { 
          width: yAxisLabelWidth - 10, 
          align: "right" 
        });
      }
      doc.fillColor("black");

      // Draw bars
      data.forEach((item, index) => {
        const barX = barStartX + (index * (barWidth + barSpacing));
        const barValue = item.value || 0;
        const barHeight = (barValue / yAxisMax) * availableHeight;
        const barY = chartY + chartHeight - labelHeight - valueLabelHeight - chartPadding - barHeight;

        // Bar color
        const color = colors[index % colors.length];
        const rgb = hexToRgb(color);
        
        // Set fill and stroke colors, then draw rectangle with both
        doc.fillColor(`rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`);
        doc.strokeColor("#333333").lineWidth(0.8); // Dark gray border instead of black for better visibility
        doc.rect(barX, barY, barWidth, barHeight);
        doc.fillAndStroke(); // Use fillAndStroke to preserve colors
        
        // Reset fill color to black for text
        doc.fillColor("black");

        // Value label on top of bar
        if (barValue > 0) {
          doc.fontSize(10).font("Helvetica-Bold").fillColor("black");
          const valueTextY = barY - 18;
          if (valueTextY > chartY + 10) {
            doc.text(String(barValue), barX, valueTextY, { 
              width: barWidth, 
              align: "center" 
            });
          }
        }

        // X-axis label (truncate if too long)
        doc.fontSize(9).font("Helvetica").fillColor("black");
        const labelText = (item.label || "Sin especificar");
        const maxLabelLength = 18;
        const displayLabel = labelText.length > maxLabelLength 
          ? labelText.substring(0, maxLabelLength - 3) + "..."
          : labelText;
        doc.text(displayLabel, barX, chartY + chartHeight - labelHeight + 8, { 
          width: barWidth, 
          align: "center" 
        });
      });

      // Draw axes (thicker and more visible)
      doc.strokeColor("black").lineWidth(1.5);
      // X-axis
      doc.moveTo(chartX + yAxisLabelWidth, chartY + chartHeight - labelHeight - valueLabelHeight - chartPadding)
        .lineTo(chartX + chartWidth - chartPadding, chartY + chartHeight - labelHeight - valueLabelHeight - chartPadding)
        .stroke();
      // Y-axis
      doc.moveTo(chartX + yAxisLabelWidth, chartY + chartPadding)
        .lineTo(chartX + yAxisLabelWidth, chartY + chartHeight - labelHeight - valueLabelHeight - chartPadding)
        .stroke();

      // Update Y position for next chart
      doc.y = chartY + chartHeight + 30;
      doc.moveDown(0.5);
    };

    // Add bar charts with colors
    // Each chart will automatically check for space and create new page if needed
    const colors = ["#D2B40D", "#296B00", "#E58E15", "#cad00f", "#8B4513"];
    
    addBarChart("Lugares de Residencia", residence, doc, colors);
    addBarChart("Categoría de Membresía", category, doc, colors);
    addBarChart("Grado de Estudios", education, doc, colors);

    // Footer
    doc.moveDown(2);
    doc.fontSize(8).fillColor("gray").text("Sociedad Mexicana de Fisioterapia en Piso Pélvico", { align: "center" });
    
    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error("Error al exportar estadísticas de membresías:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    });
  }
};

