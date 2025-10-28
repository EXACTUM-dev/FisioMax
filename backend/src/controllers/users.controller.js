    /**
     * @fileoverview Controller to handle user-related requests
     * @version 1.0.0
     * @author EXACTUM-dev
     * @description Handles user profile retrieval and management
     */

    import { getUsuarioByClerkId, getUserById, getUsuarios } from '../models/users.model.js';
    import S3Service from '../services/s3Service.js';

    /**
     * Get all users with their roles
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with users array or error
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

        // Generate fresh presigned URLs for documents
        const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
        S3Service.getPresignedUrl(user.cedula),
        S3Service.getPresignedUrl(user.titulo),
        S3Service.getPresignedUrl(user.constancias)
        ]);

        // Generate presigned URLs for additional documents
        const documentosAdicionalesUrls = user.documentosAdicionales && user.documentosAdicionales.length > 0
        ? await S3Service.getPresignedUrls(user.documentosAdicionales)
        : [];

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
     * Get a specific user's profile by ID
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with user data or error
     */
    export async function getUserProfileById(req, res) {
    try {
        const { userId } = req.params;

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
        S3Service.getPresignedUrl(user.constancias)
        ]);

        // Generate presigned URLs for additional documents
        const documentosAdicionalesUrls = user.documentosAdicionales && user.documentosAdicionales.length > 0
        ? await S3Service.getPresignedUrls(user.documentosAdicionales)
        : [];

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
