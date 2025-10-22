# Pruebas Unitarias - Solicitud de Membresías

Este directorio contiene las pruebas unitarias para la historia de usuario "Envío de Solicitudes de Membresías" basada en el diagrama de actividades 1.1 y el diagrama UML de secuencia del flujo de registro.

## Estructura de Archivos

```
tests/
├── pages/
│   ├── membershipApplication.test.jsx    # Pruebas principales del flujo
│   └── register.test.jsx                 # Pruebas existentes del componente
├── utils/
│   └── testUtils.js                      # Utilidades para pruebas
├── setup/
│   └── membershipApplication.setup.js    # Configuración específica
└── README.md                             # Esta documentación
```

## Cobertura de Pruebas

Las pruebas cubren todos los escenarios del diagrama de actividades y UML:

### 1. Visita a la Landing Page
- ✅ Renderizado correcto de la página de registro
- ✅ Visualización del formulario de solicitud con todos los campos obligatorios
- ✅ Presencia de botones de acción

### 2. Captura de Datos Personales (Campos del UML)
- ✅ Entrada de datos en todos los campos obligatorios:
  - Nombres, Apellido Paterno, Apellido Materno
  - Correo electrónico, Teléfono, Redes Sociales
  - País, Estado, Ciudad, Colonia, Código Postal
  - Título, Cédula
- ✅ Carga de constancia en formato PDF
- ✅ Validación de tipos de archivo

### 3. Validación de Campos Obligatorios
- ✅ Validación de todos los campos requeridos según UML
- ✅ Validación de formato de email
- ✅ Validación de formato de teléfono
- ✅ Validación de código postal
- ✅ Validación de tipos de archivo (solo PDF)

### 4. Flujo de Cancelación
- ✅ Descarte de cambios al cancelar
- ✅ Limpieza del formulario

### 5. Manejo de Errores
- ✅ Mostrar mensaje específico: "Llene todos los campos obligatorios"
- ✅ Manejo de errores de validación

### 6. Registro Exitoso
- ✅ Registro de solicitud con datos válidos
- ✅ Mensaje de éxito exacto del UML: "Se ha mandado la solicitud con éxito. Los administradores le avisarán el estado final de su solicitación."
- ✅ Simulación del flujo completo: Vista → Router → Controller → Model → S3 → DB

## Cómo Ejecutar las Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar solo las pruebas de solicitud de membresías
```bash
npm test -- --testPathPattern=membershipApplication
```

### Ejecutar con cobertura
```bash
npm test -- --coverage --testPathPattern=membershipApplication
```

### Ejecutar en modo watch
```bash
npm test -- --watch --testPathPattern=membershipApplication
```

## Configuración de Jest

Las pruebas utilizan la siguiente configuración:

- **Testing Library**: Para renderizado y interacciones
- **User Event**: Para simular eventos de usuario
- **React Router**: Para pruebas de navegación
- **Mocks**: Para Clerk y APIs externas

## Utilidades Disponibles

### `renderWithRouter(component)`
Renderiza un componente con el router para pruebas de navegación.

### `mockMembershipFormData`
Datos mock para pruebas, incluyendo datos válidos e inválidos.

### `userEventHelpers`
Funciones helper para simular interacciones de usuario:
- `fillFormWithValidData()`: Llena formulario con datos válidos
- `fillFormWithInvalidData()`: Llena formulario con datos inválidos

### `formSelectors`
Selectores para elementos del formulario:
- `emailInput()`, `firstNameInput()`, etc.
- `submitButton()`, `cancelButton()`

## Casos de Prueba Adicionales

Las pruebas incluyen casos adicionales para:
- Enlaces de navegación
- Diseño responsivo
- Múltiples archivos de documentación
- Manejo de errores de red

## Mock de Clerk

El componente `SignUp` de Clerk está mockeado para las pruebas, simulando:
- Campos de formulario
- Botones de acción
- Validaciones básicas

## Notas de Implementación

1. **Validaciones**: Las validaciones reales deben implementarse en el componente
2. **Mensajes de Error**: Los mensajes específicos deben agregarse al componente
3. **API Calls**: Las llamadas a API deben mockearse según sea necesario
4. **Navegación**: La navegación después del éxito debe implementarse

## Mantenimiento

Para mantener las pruebas actualizadas:

1. Actualizar mocks cuando cambien las APIs
2. Agregar nuevos casos de prueba para nuevas validaciones
3. Actualizar utilidades cuando cambien los selectores
4. Revisar cobertura de código regularmente
