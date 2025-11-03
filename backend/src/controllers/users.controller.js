/**
 * @fileoverview Controller to handle user-related requests.
 * Manages user profile retrieval and transformation, including document URL generation.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

    import { getUsuarioByClerkId, getUserById, getUsuarios, updateUserById } from '../models/users.model.js';
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
    const documentosadicionalesUrls = user.documentosAdicionales &&
        user.documentosadicionales.length > 0 ?
      await S3Service.getPresignedUrls(user.documentosadicionales) :
      [];

        const transformedUser = {
        nombres: user.nombres || '',
        apellidoP: user.apellidoP || '',
        apellidoM: user.apellidoM || '',
        email: user.correo || '',
        telefono: user.telefonoCasa || '',
        telefonoCasa: user.telefonoCasa || '',
        telefonoWhatsapp: user.telefonoWhatsapp || '',
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
        cursosCompletados: user.cursosCompletados || null,
        diplomados: user.diplomados || null,
        horasServicio: user.horasServicio || null,
        cedula: cedulaUrl,
        titulo: tituloUrl,
        constancias: constanciasUrl,
        documentosadicionales: documentosadicionalesUrls,
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
    const documentosadicionalesUrls = user.documentosadicionales &&
        user.documentosadicionales.length > 0 ?
      await S3Service.getPresignedUrls(user.documentosadicionales) :
      [];

        const transformedUser = {
        nombres: user.nombres || '',
        apellidoP: user.apellidoP || '',
        apellidoM: user.apellidoM || '',
        email: user.correo || '',
        telefono: user.telefonoCasa || '',
        telefonoCasa: user.telefonoCasa || '',
        telefonoWhatsapp: user.telefonoWhatsapp || '',
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
        cursosCompletados: user.cursosCompletados || null,
        diplomados: user.diplomados || null,
        horasServicio: user.horasServicio || null,
        cedula: cedulaUrl,
        titulo: tituloUrl,
        constancias: constanciasUrl,
        documentosadicionales: documentosadicionalesUrls,
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
     * Update an existing user's basic information
     * Expects fields in req.body (only allowed fields will be updated)
     */
    export async function updateUser(req, res) {
    try {
        const { userId } = req.params;
        const updateData = req.body || {};

        if (!userId) {
        return res.status(400).json({ success: false, error: 'ID de usuario requerido' });
        }

        // Map 'telefono' from frontend to 'telefonoCasa' for database
        if (updateData.telefono !== undefined && updateData.telefonoCasa === undefined) {
            updateData.telefonoCasa = updateData.telefono;
            delete updateData.telefono;
        }

        const updated = await updateUserById(userId, updateData);

        if (!updated) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        // Transform minimal fields for frontend consistency
        const transformedUser = {
        nombres: updated.nombres || '',
        apellidoP: updated.apellidoP || '',
        apellidoM: updated.apellidoM || '',
        email: updated.correo || '',
        telefono: updated.telefonoCasa || '',
        telefonoCasa: updated.telefonoCasa || '',
        telefonoWhatsapp: updated.telefonoWhatsapp || '',
        fechaNacimiento: updated.fechaNacimiento || '',
        licenciatura: updated.licenciatura || '',
        pais: updated.pais || '',
        estado: updated.estado || '',
        ciudad: updated.ciudad || '',
        calle: updated.calle || '',
        numExterior: updated.numExterior || '',
        numInterior: updated.numInterior || '',
        colonia: updated.colonia || '',
        codigoPostal: updated.codigoPostal || '',
        instagram: updated.instagram || '',
        linkedin: updated.linkedin || '',
        facebook: updated.facebook || '',
        paginaWeb: updated.paginaWeb || '',
        cursosCompletados: updated.cursosCompletados || null,
        diplomados: updated.diplomados || null,
        horasServicio: updated.horasServicio || null,
        IDUsuario: updated.IDUsuario,
        IDRol: updated.IDRol || null,
        rol: updated.rolNombre || null,
        clerkID: updated.clerkID || null,
        };

        return res.status(200).json({ success: true, data: transformedUser });
    } catch (error) {
        console.error('Error actualizando usuario:', error);
        return res.status(500).json({ success: false, error: 'Error al actualizar el usuario', message: error.message });
    }
    }

    /**
     * Update user documents (titulo, cedula, constancias)
     * Handles file uploads to S3 and updates database
     */
    export async function updateUserDocuments(req, res) {
    try {
        const { userId } = req.params;

        if (!userId) {
        return res.status(400).json({ success: false, error: 'ID de usuario requerido' });
        }

        const updateData = {};

        // Check if AWS is configured
        const isS3Configured = process.env.AWS_REGION && process.env.AWS_BUCKET_NAME;

        if (isS3Configured) {
        // Upload files to S3 if provided
        if (req.files?.titulo?.[0]) {
            updateData.titulo = await S3Service.uploadFile(req.files.titulo[0], 'titulos');
        }
        if (req.files?.cedula?.[0]) {
            updateData.cedula = await S3Service.uploadFile(req.files.cedula[0], 'cedulas');
        }
        if (req.files?.constancias?.[0]) {
            updateData.constancias = await S3Service.uploadFile(req.files.constancias[0], 'constancias');
        }
        } else {
        console.warn('AWS S3 not configured. Files will not be uploaded.');
        // Store file names instead of URLs for development
        if (req.files?.titulo?.[0]) {
            updateData.titulo = req.files.titulo[0].originalname;
        }
        if (req.files?.cedula?.[0]) {
            updateData.cedula = req.files.cedula[0].originalname;
        }
        if (req.files?.constancias?.[0]) {
            updateData.constancias = req.files.constancias[0].originalname;
        }
        }

        // If no files were uploaded, return error
        if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ success: false, error: 'No se proporcionaron archivos para actualizar' });
        }

        // Update user in database
        const updated = await updateUserById(userId, updateData);

        if (!updated) {
        return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
        }

        // Generate fresh presigned URLs for all documents
        const [cedulaUrl, tituloUrl, constanciasUrl] = await Promise.all([
        S3Service.getPresignedUrl(updated.cedula),
        S3Service.getPresignedUrl(updated.titulo),
        S3Service.getPresignedUrl(updated.constancias),
        ]);

        // Transform user data for frontend
        const transformedUser = {
        nombres: updated.nombres || '',
        apellidoP: updated.apellidoP || '',
        apellidoM: updated.apellidoM || '',
        email: updated.correo || '',
        telefono: updated.telefonoCasa || '',
        telefonoCasa: updated.telefonoCasa || '',
        telefonoWhatsapp: updated.telefonoWhatsapp || '',
        fechaNacimiento: updated.fechaNacimiento || '',
        licenciatura: updated.licenciatura || '',
        pais: updated.pais || '',
        estado: updated.estado || '',
        ciudad: updated.ciudad || '',
        calle: updated.calle || '',
        numExterior: updated.numExterior || '',
        numInterior: updated.numInterior || '',
        colonia: updated.colonia || '',
        codigoPostal: updated.codigoPostal || '',
        instagram: updated.instagram || '',
        linkedin: updated.linkedin || '',
        facebook: updated.facebook || '',
        paginaWeb: updated.paginaWeb || '',
        cursosCompletados: updated.cursosCompletados || null,
        diplomados: updated.diplomados || null,
        horasServicio: updated.horasServicio || null,
        cedula: cedulaUrl,
        titulo: tituloUrl,
        constancias: constanciasUrl,
        IDUsuario: updated.IDUsuario,
        IDRol: updated.IDRol || null,
        rol: updated.rolNombre || null,
        clerkID: updated.clerkID || null,
        };

        return res.status(200).json({ success: true, data: transformedUser });
    } catch (error) {
        console.error('Error actualizando documentos del usuario:', error);
        return res.status(500).json({ success: false, error: 'Error al actualizar los documentos', message: error.message });
    }
    }
