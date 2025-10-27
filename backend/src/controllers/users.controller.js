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
        nombres: user.firstName || '',
        apellidoP: user.lastName || '',
        apellidoM: user.middleName || '',
        email: user.email || '',
        telefonoCasa: user.homePhone || '',
        telefonoWhatsApp: user.telefonoWhatsApp || '',
        licenciatura: user.degree || '',
        pais: user.country || '',
        estado: user.state || '',
        ciudad: user.city || '',
        calle: user.street || '',
        numExterior: user.exteriorNumber || '',
        numInterior: user.interiorNumber || '',
        colonia: user.neighborhood || '',
        codigoPostal: user.postalCode || '',
        instagram: user.instagram || '',
        linkedin: user.linkedin || '',
        facebook: user.facebook || '',
        paginaWeb: user.website || '',      
        cedula: user.professionalId || null,
        titulo: user.degreeDocument || null,
        constancias: user.certificates || null,
        documentosAdicionales: user.documentosAdicionales || [],
        rol: user.rolNombre || null,
        IDRol: user.IDRol || null,
        IDUsuario: user.IDUsuario,
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
