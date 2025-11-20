/**
 * @fileoverview Statistics controller for membership reports
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Handles HTTP requests for membership statistics endpoints
 */

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
 * Export membership statistics as PDF (placeholder for future implementation)
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

    // TODO: Implement PDF generation
    // For now, return JSON data
    res.json({
      success: true,
      message: "Exportación PDF no implementada aún",
      data: {
        residence,
        category,
        education,
      },
    });
  } catch (error) {
    console.error("Error al exportar estadísticas de membresías:", error);
    res.status(500).json({
      success: false,
      error: "Error interno del servidor",
      message: error.message,
    });
  }
};

