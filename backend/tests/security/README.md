# 🔒 Pruebas de Seguridad - FisioMax Backend

Este directorio contiene un conjunto completo de pruebas de seguridad para el backend de FisioMax, diseñadas para validar la robustez y seguridad de la aplicación.

## 📁 Estructura de Pruebas

### 🛡️ Archivos de Pruebas

- **`auth.test.js`** - Pruebas de autenticación y autorización
- **`input-validation.test.js`** - Pruebas de validación y sanitización de entrada
- **`headers-security.test.js`** - Pruebas de headers de seguridad HTTP
- **`error-handling.test.js`** - Pruebas de manejo seguro de errores
- **`config-security.test.js`** - Pruebas de configuración de seguridad
- **`integration-security.test.js`** - Pruebas de integración end-to-end

## 🎯 Áreas de Seguridad Cubiertas

### 1. Autenticación y Autorización
- ✅ Validación de JWT de Clerk
- ✅ Protección de rutas sensibles
- ✅ Manejo de tokens expirados e inválidos
- ✅ Autorización basada en roles
- ✅ Protección contra ataques de fuerza bruta

### 2. Validación de Entrada
- ✅ Sanitización de datos de entrada
- ✅ Validación con Joi
- ✅ Protección contra inyección SQL
- ✅ Protección contra XSS
- ✅ Validación de tamaño de payload

### 3. Headers de Seguridad
- ✅ Configuración de Helmet
- ✅ Headers de seguridad HTTP
- ✅ Configuración CORS
- ✅ Protección contra clickjacking
- ✅ Content Security Policy

### 4. Manejo de Errores
- ✅ No exposición de información sensible
- ✅ Logs seguros
- ✅ Códigos de estado HTTP apropiados
- ✅ Manejo de errores asíncronos

### 5. Configuración
- ✅ Variables de entorno seguras
- ✅ Configuración de base de datos
- ✅ Configuración CORS
- ✅ Configuración AWS/S3
- ✅ Validación de configuración

### 6. Integración End-to-End
- ✅ Flujos completos de autenticación
- ✅ Operaciones CRUD seguras
- ✅ Protección contra ataques comunes
- ✅ Manejo de datos sensibles

## 🚀 Cómo Ejecutar las Pruebas

### Ejecutar todas las pruebas de seguridad:
```bash
npm test -- tests/security/
```

### Ejecutar una categoría específica:
```bash
# Pruebas de autenticación
npm test -- tests/security/auth.test.js

# Pruebas de validación de entrada
npm test -- tests/security/input-validation.test.js

# Pruebas de headers de seguridad
npm test -- tests/security/headers-security.test.js

# Pruebas de manejo de errores
npm test -- tests/security/error-handling.test.js

# Pruebas de configuración
npm test -- tests/security/config-security.test.js

# Pruebas de integración
npm test -- tests/security/integration-security.test.js
```

### Ejecutar en modo watch:
```bash
npm run test:watch -- tests/security/
```

## 🔧 Configuración Requerida

### Variables de Entorno para Pruebas
Crear un archivo `.env.test` con las siguientes variables:

```env
# Configuración de la aplicación
NODE_ENV=test
PORT=5001

# Configuración de autenticación
JWT_SECRET=test_jwt_secret_key_very_long_and_secure
SESSION_SECRET=test_session_secret_key_very_long_and_secure
CLERK_SECRET_KEY=sk_test_clerk_secret_key

# Configuración de base de datos (para pruebas)
DB_HOST=localhost
DB_USER=test_user
DB_PASSWORD=test_secure_password
DB_DATABASE=fisiomax_test

# Configuración AWS (para pruebas)
AWS_ACCESS_KEY_ID=test_access_key
AWS_SECRET_ACCESS_KEY=test_secret_key
S3_BUCKET_NAME=test-bucket

# Configuración CORS
CORS_ORIGINS=http://localhost:5174,http://localhost:3000

# Configuración de logging
LOG_LEVEL=error
LOG_FORMAT=combined

# Configuración de rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
API_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=1000
```

## 📊 Cobertura de Seguridad

Las pruebas cubren los siguientes estándares de seguridad:

### OWASP Top 10
- ✅ **A01: Broken Access Control** - Validación de autorización
- ✅ **A02: Cryptographic Failures** - Validación de configuración de secretos
- ✅ **A03: Injection** - Protección contra inyección SQL y XSS
- ✅ **A04: Insecure Design** - Validación de diseño de seguridad
- ✅ **A05: Security Misconfiguration** - Validación de configuración
- ✅ **A06: Vulnerable Components** - Validación de dependencias
- ✅ **A07: Authentication Failures** - Validación de autenticación
- ✅ **A08: Software Integrity Failures** - Validación de integridad
- ✅ **A09: Logging Failures** - Validación de logging seguro
- ✅ **A10: Server-Side Request Forgery** - Validación de SSRF

### Estándares Adicionales
- ✅ **Headers de Seguridad HTTP** - Helmet.js
- ✅ **CORS Configuration** - Configuración segura
- ✅ **Error Handling** - Manejo seguro de errores
- ✅ **Input Validation** - Validación y sanitización
- ✅ **Rate Limiting** - Protección contra abuso

## 🔍 Interpretación de Resultados

### ✅ Pruebas Exitosas
- Todas las validaciones de seguridad pasan
- No se detectan vulnerabilidades
- La configuración es segura

### ❌ Pruebas Fallidas
- Revisar los errores específicos
- Corregir la configuración o código
- Re-ejecutar las pruebas

### ⚠️ Advertencias
- Configuraciones que podrían mejorarse
- Mejores prácticas no implementadas
- Recomendaciones de seguridad

## 🛠️ Mantenimiento

### Actualización de Pruebas
1. Revisar regularmente las pruebas de seguridad
2. Actualizar según nuevos estándares de seguridad
3. Agregar pruebas para nuevas funcionalidades
4. Mantener actualizadas las dependencias de testing

### Nuevas Pruebas
Para agregar nuevas pruebas de seguridad:

1. Crear archivo en `tests/security/`
2. Seguir el patrón de naming: `[area]-security.test.js`
3. Incluir documentación JSDoc
4. Agregar casos de prueba comprehensivos
5. Actualizar este README

## 📚 Recursos Adicionales

### Documentación de Seguridad
- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)

### Herramientas Relacionadas
- [Helmet.js](https://helmetjs.github.io/) - Headers de seguridad
- [Joi](https://joi.dev/) - Validación de esquemas
- [Supertest](https://github.com/visionmedia/supertest) - Testing de APIs

## 🤝 Contribución

Para contribuir a las pruebas de seguridad:

1. Fork del repositorio
2. Crear rama para nueva funcionalidad
3. Implementar pruebas de seguridad
4. Ejecutar todas las pruebas
5. Crear pull request con descripción detallada

---

**Nota**: Estas pruebas son parte integral del proceso de desarrollo seguro. Deben ejecutarse en cada commit y antes de cada despliegue a producción.
