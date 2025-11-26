/**
 * @fileoverview Discount-specific controller functions
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Handles discount-related HTTP requests
 */

import { getActiveDiscounts } from "../models/discount.model.js";
import { generateSignedUrl } from "../utils/cloudfront.js";

/**
 * Gets all active discounts with thumbnails
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export async function getActiveDiscountsController(req, res) {
  try {
    const membershipType = req.query.membershipType || null;

    const discounts = await getActiveDiscounts(membershipType);

    // Generate signed URLs for thumbnails
    const discountsWithThumbnails = discounts.map((discount) => {
      let thumbnailUrl = null;
      if (discount.thumbnailMultimedia) {
        try {
          thumbnailUrl = generateSignedUrl(discount.thumbnailMultimedia);
        } catch (error) {
          // Thumbnail generation failed, continue without it
        }
      }

      return {
        IDContenido: discount.IDContenido,
        nombre: discount.nombre,
        descripcion: discount.descripcion,
        tipo: discount.tipo,
        tipoMembresia: discount.tipoMembresia,
        fechaInicio: discount.fechaInicio,
        fechaFin: discount.fechaFin,
        createdAt: discount.createdAt,
        thumbnailUrl,
      };
    });

    return res.status(200).json({
      success: true,
      discounts: discountsWithThumbnails,
      total: discountsWithThumbnails.length,
    });
  } catch (error) {
    console.error("Error fetching active discounts:", error);
    return res.status(500).json({
      success: false,
      error: "database_error",
      message: "Error al obtener descuentos activos",
    });
  }
}
