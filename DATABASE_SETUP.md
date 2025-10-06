# Configuración de Base de Datos para Solicitudes de Membresía

## 🗄️ Configuración de MySQL

### 1. Crear Base de Datos

Ejecuta el script SQL en tu servidor MySQL:

```bash
# Conectarte a MySQL
mysql -u root -p

# Ejecutar el script
source backend/database/schema.sql
```

O ejecuta el contenido del archivo `backend/database/schema.sql` directamente en tu cliente MySQL.

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en el directorio `backend/` con tu configuración:

```env
# Base de datos MySQL
DB_HOST=localhost
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_password_mysql
DB_DATABASE=fisiomax_db

# Servidor
PORT=3000
NODE_ENV=development

# CORS
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# AWS SES (para emails)
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
```

### 3. Probar Conexión

```bash
# En el directorio backend
cd backend
node test-db-connection.js
```

Si todo está bien configurado, verás:
```
✅ Conexión a la base de datos exitosa
✅ Solicitud creada con ID: MEM-1234567890-abc123def
✅ Solicitud obtenida: {...}
✅ Solicitudes obtenidas: X registros
✅ Total de solicitudes: X
✅ Estado actualizado: aprobada
✅ Datos de prueba eliminados
🎉 Todas las pruebas de base de datos pasaron exitosamente!
```

## 🚀 Iniciar la Aplicación

### 1. Backend
```bash
cd backend
npm start
```

### 2. Frontend
```bash
cd frontend
npm run dev
```

### 3. Probar la Aplicación
1. Ve a: `http://localhost:5173/solicitud-membresia`
2. Completa el formulario
3. Sube archivos (PDF, DOC, DOCX)
4. Envía la solicitud

## 📊 Verificar en Base de Datos

```sql
-- Ver todas las solicitudes
SELECT * FROM membership_applications ORDER BY fecha_solicitud DESC;

-- Ver documentos
SELECT * FROM membership_documents;

-- Ver logs de cambios
SELECT * FROM membership_status_logs ORDER BY changed_at DESC;

-- Estadísticas
SELECT estado_solicitud, COUNT(*) as total 
FROM membership_applications 
GROUP BY estado_solicitud;
```

## 🔧 Endpoints Disponibles

```
POST   /api/membership-applications           # Crear solicitud
GET    /api/membership-applications           # Listar solicitudes
GET    /api/membership-applications/:id       # Obtener por ID
PUT    /api/membership-applications/:id/status # Actualizar estado
GET    /api/membership-applications/:id/documents/:type # Descargar documento
```

## 🎯 Características Implementadas

- ✅ **Base de datos MySQL** con tablas normalizadas
- ✅ **Pool de conexiones** para mejor rendimiento
- ✅ **Validaciones** en frontend y backend
- ✅ **Carga de archivos** con almacenamiento seguro
- ✅ **Emails automáticos** de confirmación y notificación
- ✅ **Logs de cambios** de estado
- ✅ **Paginación** y filtros
- ✅ **Manejo de errores** robusto

## 🐛 Solución de Problemas

### Error de Conexión a BD
- Verifica que MySQL esté corriendo
- Confirma las credenciales en `.env`
- Asegúrate de que la base de datos existe

### Error de Archivos
- Verifica permisos del directorio `uploads/`
- Confirma que los archivos sean PDF, DOC o DOCX
- Revisa el tamaño máximo (10MB)

### Error de Emails
- Configura AWS SES correctamente
- Verifica las credenciales AWS
- Confirma que los emails están verificados en SES

¡La aplicación está lista para producción! 🎉
