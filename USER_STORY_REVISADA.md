# User Story: Envío de Solicitudes de Membresías

**Como** solicitante de membresía  
**Quiero** poder enviar mi solicitud de membresía con todos mis datos personales y documentación  
**Para** poder ser evaluado por los administradores y obtener mi membresía

## Descripción

Se necesita crear un sistema de registro que capture información esencial del solicitante según el flujo definido en el diagrama UML de secuencia. El sistema debe permitir al usuario llenar un formulario completo con datos personales, información de contacto, datos de ubicación y subir documentación requerida.

**Nivel Técnico**

Se implementa un formulario web responsivo con validaciones client-side y server-side, siguiendo la arquitectura Vista → Router → Controller → Model → S3 → DB.

**Limitantes:**

- Un solo intento de registro por dispositivo para prevenir spam
- Solo archivos PDF para documentación
- Todos los campos son obligatorios

## How? - Cómo se va a construir?

- Formulario web con validaciones en tiempo real
- Almacenamiento seguro con encriptación en base de datos
- Subida de archivos a S3 (Amazon Simple Storage Service)
- Flujo de validación: Vista.jsx → Router → Controller → Model → S3 → DB
- Método `envioDatosSolicitud()` en el controlador
- Método `validarCamposObligatorios()` para validación
- Método `datosSolicitud()` para procesamiento

## Criterios de Aceptación

### Campos Obligatorios (según UML)
- ✅ **Datos Personales**: Nombres, Apellido Paterno, Apellido Materno
- ✅ **Información de Contacto**: Correo electrónico, Teléfono, Redes Sociales
- ✅ **Ubicación**: País, Estado, Ciudad, Colonia, Código Postal
- ✅ **Información Profesional**: Título, Cédula
- ✅ **Documentación**: Constancia en formato PDF

### Flujo de Validación
1. Usuario llena formulario en Vista.jsx
2. Sistema valida campos obligatorios con `validarCamposObligatorios()`
3. Si validación exitosa: datos se procesan con `datosSolicitud()`
4. Archivo PDF se sube a S3
5. Datos se insertan en base de datos
6. Usuario recibe confirmación

### Mensajes del Sistema
- **Error de validación**: "Llene todos los campos obligatorios"
- **Éxito**: "Se ha mandado la solicitud con éxito. Los administradores le avisarán el estado final de su solicitación."

### Funcionalidades Adicionales
- Subida de archivos en formato PDF únicamente
- Confirmación de registro exitoso
- Notificación automática al equipo administrativo de nueva solicitud
- Mensaje claro de "solicitud enviada" con pasos siguientes

## Requerimientos No Funcionales

### Seguridad
- Limitado a 1 intento de registro por device ID para prevenir spam
- Encriptación de datos personales en tránsito y almacenamiento
- Sanitización de inputs para prevenir ataques XSS/SQL injection
- Validación server-side de todos los campos obligatorios
- Validación de tipo de archivo (solo PDF)

### Usabilidad
- Navegación con TAB entre campos del formulario
- Formulario responsive para móviles y tablets
- Tiempo máximo de completar (suponiendo que se cuentan con todos los archivos a subir): 5 minutos
- Auto-guardado de progreso cada 30 segundos
- Validación en tiempo real de campos obligatorios
- Mensajes de error claros y específicos

### Rendimiento
- Carga inicial del formulario en menos de 3 segundos
- Envío de solicitud procesado en menos de 4 segundos
- Soporte para hasta 50 registros simultáneos
- Subida de archivos PDF optimizada
- Validación eficiente de 13 campos obligatorios

### Compatibilidad
- Compatible con navegadores Google Chrome Stable
- Funcional en dispositivos iOS y Android
- Soporte para carga de archivos PDF en dispositivos móviles

## Requerimientos de Información

### Datos del Solicitante (13 campos obligatorios)
- **Datos Personales**: Nombres, Apellido Paterno, Apellido Materno
- **Contacto**: Correo electrónico, Teléfono, Redes Sociales
- **Ubicación**: País, Estado, Ciudad, Colonia, Código Postal
- **Profesional**: Título, Cédula

### Documentación
- Constancia en formato PDF
- Peso máximo por archivo: 10MB
- Validación de tipo MIME: application/pdf

### Metadata
- Timestamp de registro
- IP del solicitante
- Device ID (para limitar intentos)
- User Agent
- Estado de validación
- ID único de solicitud

## Flujo Técnico Detallado

```
Usuario → Vista.jsx → Router (POST/solicitud) → Controller
                                                      ↓
                                              envioDatosSolicitud()
                                                      ↓
                                              validarCamposObligatorios()
                                                      ↓
                                              [Validación Exitosa]
                                                      ↓
                                              datosSolicitud()
                                                      ↓
                                              Model → S3 (Constancia1.pdf)
                                                      ↓
                                              Model → DB (INSERT datos)
                                                      ↓
                                              Usuario ← Mensaje de Éxito
```

## Casos de Prueba Principales

### Caso 1: Registro Exitoso
- Usuario llena todos los 13 campos obligatorios
- Adjunta constancia PDF válida
- Sistema procesa y guarda datos
- Usuario recibe mensaje de éxito

### Caso 2: Error de Validación
- Usuario deja campos vacíos
- Sistema muestra "Llene todos los campos obligatorios"
- Usuario puede corregir y reintentar

### Caso 3: Archivo Inválido
- Usuario intenta subir archivo no-PDF
- Sistema rechaza y solicita PDF válido

### Caso 4: Límite de Intentos
- Usuario intenta registrar desde mismo device ID
- Sistema bloquea segundo intento

## Definición de Terminado (DoD)

- [ ] Formulario implementado con 13 campos obligatorios
- [ ] Validaciones client-side y server-side funcionando
- [ ] Subida de archivos PDF a S3
- [ ] Inserción de datos en base de datos
- [ ] Mensajes de error y éxito según UML
- [ ] Pruebas unitarias pasando (100% cobertura)
- [ ] Pruebas de integración completadas
- [ ] Documentación actualizada
- [ ] Revisión de código aprobada
- [ ] Deployment en ambiente de testing
- [ ] Validación con usuarios finales

## Notas de Implementación

- Seguir estrictamente el diagrama UML de secuencia
- Implementar todos los métodos mencionados en el UML
- Usar los mensajes exactos especificados
- Mantener consistencia con las pruebas unitarias creadas
- Validar todos los campos obligatorios en el orden especificado
