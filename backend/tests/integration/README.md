# Pruebas de Integración - FisioMax Backend

Este directorio contiene las pruebas de integración para el backend de FisioMax. Las pruebas de integración verifican que todos los componentes del sistema funcionen correctamente juntos.

## Estructura de Archivos

```
tests/integration/
├── setup.js                    # Configuración base para todas las pruebas de integración
├── endpoints.test.js           # Pruebas de endpoints principales
├── auth.test.js               # Pruebas de autenticación y autorización
├── error-handling.test.js     # Pruebas de manejo de errores
├── email-service.test.js      # Pruebas del servicio de email (SES)
├── middleware.test.js         # Pruebas de middleware y configuración
└── README.md                  # Este archivo
```

## Tipos de Pruebas Incluidas

### 1. Pruebas de Endpoints (`endpoints.test.js`)
- Verificación de endpoints principales
- Manejo de datos de entrada
- Respuestas correctas del servidor
- Validación de campos requeridos

### 2. Pruebas de Autenticación (`auth.test.js`)
- Endpoints protegidos sin autenticación
- Tokens inválidos
- Tokens válidos
- Autorización por roles (admin/user)

### 3. Pruebas de Manejo de Errores (`error-handling.test.js`)
- Errores de validación (400)
- Errores de autorización (401)
- Errores de permisos (403)
- Errores internos del servidor (500)
- Errores de timeout
- Errores asíncronos
- JSON malformado

### 4. Pruebas del Servicio de Email (`email-service.test.js`)
- Envío de emails con datos válidos
- Validación de campos requeridos
- Manejo de errores del servicio SES
- Validación de formato de email
- Caracteres especiales

### 5. Pruebas de Middleware (`middleware.test.js`)
- Middleware de seguridad (Helmet)
- Configuración CORS
- Compresión de respuestas
- Logging (Morgan)
- Parsing de JSON y URL-encoded
- Headers de respuesta

## Comandos Disponibles

### Ejecutar todas las pruebas de integración
```bash
npm run test:integration
```

### Ejecutar pruebas de integración en modo watch
```bash
npm run test:integration:watch
```

### Ejecutar pruebas específicas
```bash
# Solo pruebas de endpoints
npm run test:integration -- --testNamePattern="Endpoints"

# Solo pruebas de autenticación
npm run test:integration -- --testNamePattern="Autenticación"

# Solo pruebas de email
npm run test:integration -- --testNamePattern="Email"
```

### Ejecutar con cobertura
```bash
npm run test:coverage
```

## Configuración

### Variables de Entorno
Las pruebas utilizan las siguientes variables de entorno (configuradas en `setup.js`):

```env
NODE_ENV=test
JWT_SECRET=test-secret-key
CLERK_SECRET_KEY=test-clerk-key
```

### Timeout
Las pruebas de integración tienen un timeout de 30 segundos para permitir operaciones más complejas.

### Mocks
- **Servicio SES**: Se mockea para evitar envío real de emails durante las pruebas
- **Middleware de autenticación**: Se mockea para simular diferentes estados de autenticación

## Mejores Prácticas

### 1. Aislamiento de Pruebas
- Cada prueba es independiente
- Se limpia el estado después de cada prueba
- Se utilizan mocks para servicios externos

### 2. Datos de Prueba
- Utilizar datos realistas pero ficticios
- Incluir casos edge (caracteres especiales, datos vacíos)
- Probar tanto casos exitosos como de error

### 3. Assertions
- Verificar tanto el código de estado como el contenido de la respuesta
- Incluir verificaciones de headers cuando sea relevante
- Validar la estructura de datos devueltos

### 4. Manejo de Errores
- Probar diferentes tipos de errores
- Verificar que los errores se manejan de forma segura
- No exponer información sensible en respuestas de error

## Agregar Nuevas Pruebas

### 1. Para nuevos endpoints:
```javascript
describe('POST /api/nuevo-endpoint', () => {
  test('debería procesar datos correctamente', async () => {
    const response = await request(app)
      .post('/api/nuevo-endpoint')
      .send({ data: 'test' })
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
  });
});
```

### 2. Para nuevos middleware:
```javascript
describe('Nuevo Middleware', () => {
  test('debería aplicar middleware correctamente', async () => {
    const response = await request(app)
      .get('/api/test')
      .expect(200);

    expect(response.headers).toHaveProperty('nuevo-header');
  });
});
```

## Troubleshooting

### Problemas Comunes

1. **Timeout en pruebas**: Aumentar el timeout en `jest.config.js`
2. **Errores de módulos**: Verificar imports y configuración de Jest
3. **Mocks no funcionan**: Asegurar que los mocks estén en el lugar correcto
4. **Variables de entorno**: Verificar que `.env.test` existe y está configurado

### Debugging
```bash
# Ejecutar con logs detallados
npm run test:integration -- --verbose

# Ejecutar una prueba específica
npm run test:integration -- --testNamePattern="nombre específico"
```

## Integración Continua

Las pruebas de integración están configuradas para ejecutarse en CI/CD:

```bash
npm run test:ci
```

Este comando ejecuta todas las pruebas con cobertura y sin modo watch, ideal para entornos de integración continua.
