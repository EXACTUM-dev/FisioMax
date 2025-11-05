/**
 * @fileoverview Controller to handle user-related requests.
 * Manages user profile retrieval and transformation, including document URL generation.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { getUsuarioByClerkId, getUserById, getUsuarios, reassignUserToSinRol, markUserDeleted } from '../models/users.model.js';
import S3Service from '../services/s3Service.js';

/**
 * Gets all users with their roles from the database.
 * @param {!Object} req - Express request object.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with users array or error.
 */
export async function getAllUsers(req, res) {
  try {
    const users = await getUsuarios();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener los usuarios',
      message: error.message,
    });
  }
}

/**
 * Gets the profile of the authenticated user.
 * Generates fresh presigned URLs for user documents.
 * @param {!Object} req - Express request object with auth.userId.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with user data or error.
 */
export async function getCurrentUserProfile(req, res) {
  try {
    const clerkId = req.auth?.userId;

    if (!clerkId) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado',
      });
    }

    const user = await getUsuarioByClerkId(clerkId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado en la base de datos',
      });
    }

    // Generate fresh presigned URLs for documents
    const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
      S3Service.getPresignedUrl(user.cedula),
      S3Service.getPresignedUrl(user.titulo),
      S3Service.getPresignedUrl(user.constancias),
    ]);

    // Generate presigned URLs for additional documents
    const documentosAdicionalesUrls = user.documentosAdicionales &&
        user.documentosAdicionales.length > 0 ?
      await S3Service.getPresignedUrls(user.documentosAdicionales) :
      [];

    const transformedUser = {
      nombres: user.nombres || '',
      apellidoP: user.apellidoP || '',
      apellidoM: user.apellidoM || '',
      email: user.correo || '',
      telefono: user.telefono || '',
      fechaNacimiento: user.fechaNacimiento || '',
      foto: user.foto || null,
      licenciatura: user.licenciatura || '',
      pais: user.pais || '',
      estado: user.estado || '',
      ciudad: user.ciudad || '',
      calle: user.calle || '',
      numExterior: user.numExterior || '',
      numInterior: user.numInterior || '',
      colonia: user.colonia || '',
      codigoPostal: user.codigoPostal || '',
      instagram: user.instagram || '',
      linkedin: user.linkedin || '',
      facebook: user.facebook || '',
      paginaWeb: user.paginaWeb || '',
      cedula: cedulaUrl,
      titulo: tituloUrl,
      constancias: constanciasUrl,
      documentosAdicionales: documentosAdicionalesUrls,
      rol: user.rolNombre || null,
      IDRol: user.IDRol || null,
      IDUsuario: user.IDUsuario,
      clerkID: user.clerkID,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error('Error obteniendo perfil del usuario:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el perfil del usuario',
      message: error.message,
    });
  }
}

/**
 * Gets a specific user's profile by ID.
 * Generates fresh presigned URLs for user documents.
 * @param {!Object} req - Express request object with params.userId.
 * @param {!Object} res - Express response object.
 * @return {!Promise<void>} Sends JSON response with user data or error.
 */
export async function getUserProfileById(req, res) {
  try {
    const {userId} = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'ID de usuario requerido',
      });
    }

    const user = await getUserById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado en la base de datos',
      });
    }

    // Generate fresh presigned URLs for documents
    const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
      S3Service.getPresignedUrl(user.cedula),
      S3Service.getPresignedUrl(user.titulo),
      S3Service.getPresignedUrl(user.constancias),
    ]);

    // Generate presigned URLs for additional documents
    const documentosAdicionalesUrls = user.documentosAdicionales &&
        user.documentosAdicionales.length > 0 ?
      await S3Service.getPresignedUrls(user.documentosAdicionales) :
      [];

    const transformedUser = {
      nombres: user.nombres || '',
      apellidoP: user.apellidoP || '',
      apellidoM: user.apellidoM || '',
      email: user.correo || '',
      telefono: user.telefono || '',
      fechaNacimiento: user.fechaNacimiento || '',
      foto: user.foto || null,
      licenciatura: user.licenciatura || '',
      pais: user.pais || '',
      estado: user.estado || '',
      ciudad: user.ciudad || '',
      calle: user.calle || '',
      numExterior: user.numExterior || '',
      numInterior: user.numInterior || '',
      colonia: user.colonia || '',
      codigoPostal: user.codigoPostal || '',
      instagram: user.instagram || '',
      linkedin: user.linkedin || '',
      facebook: user.facebook || '',
      paginaWeb: user.paginaWeb || '',
      cedula: cedulaUrl,
      titulo: tituloUrl,
      constancias: constanciasUrl,
      documentosAdicionales: documentosAdicionalesUrls,
      rol: user.rolNombre || null,
      IDRol: user.IDRol || null,
      IDUsuario: user.IDUsuario,
      clerkID: user.clerkID,
      createdAt: user.createdAt,
    };

    res.status(200).json({
      success: true,
      data: transformedUser,
    });
  } catch (error) {
    console.error('Error obteniendo perfil del usuario por ID:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener el perfil del usuario',
      message: error.message,
    });
  }
}

/**
 * Deletes a user (soft-delete) after reassigning "SinRol".
 *
 * This function performs the following steps:
 * 1. Validates the provided user ID.
 * 2. Prevents the authenticated user from deleting their own account.
 * 3. Reassigns the user's role to "SinRol".
 * 4. Marks the user as deleted in the database.
 *
 * @async
 * @function deleteUser
 * @param {import('express').Request} req - Express request object containing the user ID in params.
 * @param {import('express').Response} res - Express response object for sending the result.
 * @throws {Error} Returns appropriate HTTP status codes and messages for errors.
 * @return {Promise<void>} Sends a JSON response indicating success or failure.
 */
export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const clerkId = req.auth?.userId;

    // Validate user ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "ID de usuario no proporcionado."
      });
    }

    // Prevent self-deletion
    const user = await getUsuarioByClerkId(clerkId);
    if (user?.IDUsuario?.toString() === id) {
      return res.status(403).json({
        success: false,
        message: "No puedes eliminar tu propia cuenta."
      });
    }

    // Check if the user exists
    const userToDelete = await getUserById(id);
    if (!userToDelete) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado."
      });
    }

    // Reassign role to "SinRol"
    await reassignUserToSinRol(id);

    // Mark the user as deleted
    const affectedRows = await markUserDeleted(id);
    if (affectedRows === 0) {
      return res.status(500).json({
        success: false,
        message: "No se pudo eliminar el usuario."
      });
    }

    // Respond with success message
    res.status(200).json({
      success: true,
      message: `El usuario \"${userToDelete.nombres} ${userToDelete.apellidoP} ${userToDelete.apellidoM}\" fue eliminado con éxito.`
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor.",
      error: error.message
    });
  }
}
