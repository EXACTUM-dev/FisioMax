# FisioMax

![Status](https://img.shields.io/badge/Status-MBI-success)
![License](https://img.shields.io/badge/License-ISC-blue)
![Version](https://img.shields.io/badge/Version-1.1.0-blue)

Plataforma integral para la gestión de contenido fisioterapéutico y membresías de usuarios.

FisioMax es una aplicación web diseñada para modernizar la interacción entre fisioterapeutas y pacientes, permitiendo la gestión eficiente de membresías, acceso a contenido exclusivo de rehabilitación y seguimiento de pagos.

---

## Tabla de Contenidos

- [Características Principales](#-características-principales)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Arquitectura](#-arquitectura)
- [Comenzando](#-comenzando)
  - [Prerrequisitos](#prerrequisitos)
  - [Instalación](#instalación)
  - [Configuración](#configuración)
- [Ejecución](#-ejecución)
- [Testing](#-testing)
- [Contribución](#-contribución)
- [Licencia](#-licencia)

---

## Características Principales

*   **Gestión de Usuarios**: Registro e inicio de sesión seguro mediante Clerk.
*   **Membresías y Pagos**: Integración completa con Mercado Pago para suscripciones (Admin).
*   **Contenido Multimedia**: Visualización de videos y guías de ejercicios fisioterapéuticos.
*   **Perfil de Usuario**: Historial de pagos, descarga de comprobantes y gestión de cuenta.
*   **Panel Administrativo**: Visualización de usuarios y estados de pago (Role-Based Access Control).
*   **Seguridad**: Protección de rutas, validación de datos y manejo seguro de sesiones.

---

## Tecnologías Utilizadas

### Frontend
*   **Framework**: [React 19](https://react.dev/)
*   **Build Tool**: [Vite](https://vitejs.dev/)
*   **Estilos**: [Tailwind CSS 4](https://tailwindcss.com/)
*   **Autenticación**: [Clerk](https://clerk.com/)
*   **Routing**: [React Router 7](https://reactrouter.com/)
*   **Utilidades**: React Icons, SweetAlert2, PDF.js

### Backend
*   **Runtime**: [Node.js](https://nodejs.org/)
*   **Framework**: [Express.js](https://expressjs.com/)
*   **Base de Datos**: MySQL (con `mysql2`)
*   **Seguridad**: Helmet, CORS, Express Rate Limit, Joi (Validación)
*   **Servicios AWS**: S3 (Almacenamiento), SES (Emails)
*   **Pagos**: Mercado Pago SDK

### Testing
*   **Framework**: [Jest](https://jestjs.io/)
*   **Librerías**: Supertest, React Testing Library

---

## Arquitectura

El proyecto sigue una arquitectura **N-Tier de 3 Capas** (Presentación, Negocio y Datos), organizada en un monorepo:

1.  **Capa de Presentación (Cliente)**: Frontend en React que interactúa con el usuario.
2.  **Capa de Negocio (Servidor)**: API REST en Node.js/Express que procesa la lógica y reglas de negocio.
3.  **Capa de Datos**: Base de datos MySQL para persistencia y almacenamiento.

```
FisioMax/
├── frontend/          # Capa de Presentación (React + Vite)
│   ├── src/
│   │   ├── components/  # Componentes reutilizables
│   │   ├── organisms/   # Componentes complejos de negocio
│   │   ├── pages/       # Vistas principales
│   │   └── services/    # Comunicación con API
│   └── ...
├── backend/           # Capa de Negocio (Node.js + Express)
│   ├── src/
│   │   ├── controllers/ # Lógica de negocio
│   │   ├── models/      # Acceso a datos (MySQL)
│   │   ├── routes/      # Definición de endpoints
│   │   └── config/      # Configuración de servicios
│   └── ...
└── ...
```

---

## Comenzando

### Prerrequisitos

*   Node.js (v18 o superior)
*   npm (v9 o superior)
*   MySQL Server
*   Cuenta en Clerk (para autenticación)
*   Cuenta en Mercado Pago (para pagos)
*   Cuenta AWS (opcional, para S3/SES)

### Instalación

1.  **Clonar el repositorio**
    ```bash
    git clone https://github.com/EXACTUM-dev/FisioMax.git
    cd FisioMax
    ```

2.  **Instalar dependencias del Backend**
    ```bash
    cd backend
    npm install
    ```

3.  **Instalar dependencias del Frontend**
    ```bash
    cd ../frontend
    npm install
    ```

### Configuración

Crea un archivo `.env` en la carpeta `backend` y otro en `frontend` basándote en los ejemplos proporcionados (`.env.example`).

**Backend (.env):**
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=fisiomax_db
CLERK_SECRET_KEY=sk_...
MERCADOPAGO_ACCESS_TOKEN=APP_USR-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

**Frontend (.env):**
```env
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_URL=http://localhost:3000
```

---

## Ejecución

Para correr el proyecto en entorno de desarrollo, necesitarás dos terminales:

**Terminal 1 (Backend):**
```bash
cd backend
npm start
```
*El servidor iniciará en http://localhost:3000*

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```
*La aplicación iniciará en http://localhost:5173*

---

## Testing

El proyecto cuenta con una suite de pruebas unitarias y de integración.

**Ejecutar tests del Backend:**
```bash
cd backend
npm test
# O para tests específicos:
npm run test:unit
npm run test:integration
npm run test:security
```

**Ejecutar tests del Frontend:**
```bash
cd frontend
npm test
```

---

## Contribución

1.  Haz un Fork del proyecto.
2.  Crea tu rama de funcionalidad (`git checkout -b feature/AmazingFeature`).
3.  Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`).
4.  Haz Push a la rama (`git push origin feature/AmazingFeature`).
5.  Abre un Pull Request.

---

## Licencia

Distribuido bajo la licencia ISC. Ver `LICENSE` para más información.

---

**Desarrollado por el equipo EXACTUM-dev**
