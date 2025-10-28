    /**
     * @fileoverview Controller to handle user-related requests
     * @version 1.0.0
     * @author EXACTUM-dev
     * @description Handles user profile retrieval and management
     */

    import { getUsuarioByClerkId } from '../models/users.model.js';

    /**
     * Get the profile of the authenticated user
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with user data or error
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
        cedula: user.cedula || null,
        titulo: user.titulo || null,
        constancias: user.constancias || null,
        documentosAdicionales: user.documentosAdicionales || [],
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
