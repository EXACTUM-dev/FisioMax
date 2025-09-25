/**
 * Version: 0.2.0
 * Mock API for demo data (slides, products, users)
 */
import rehabilitacionImg from '../assets/images/rehabilitacion-suelo-pelvico.jpg'
import fisioterapiaImg from '../assets/images/fisioterapia-suelo-pelvico.jpg'
const heroSlides = [
  {
    id: "pelvic-basics",
    title: "Básicos de Piso Pélvico",
    subtitle: "Descubre el arte de la fisioterapia adaptada al piso pélvico",
    imageUrl: rehabilitacionImg,
    imageAlt: "Sesión de fisioterapia de piso pélvico",
  },
  {
    id: "pelvic-2",
    title: "Avanzados de Suelo Pélvico",
    subtitle:
      "Texto random para ver como se ve con otro texto un poco más largo aun más largo y un poco más",
    imageUrl: fisioterapiaImg,
    imageAlt: "Sesión de fisioterapia de piso pélvico",
  },
  {
    id: "pelvic-3",
    title: "Ejercicios de rehabilitación en casa",
    subtitle: "Rutinas de ejercicios para continuar tu terapia en casa",
    imageUrl: fisioterapiaImg,
    imageAlt: "Sesión de fisioterapia de piso pélvico",
  },
];

const products = {
  columns: [
    { key: "name", label: "Product name", className: "w-[40%]" },
    { key: "color", label: "Color", className: "w-[15%]" },
    { key: "category", label: "Category", className: "w-[20%]" },
    { key: "price", label: "Price", className: "w-[15%]" },
  ],
  rows: [
    {
      id: "1",
      name: 'Apple MacBook Pro 17"',
      color: "Silver",
      category: "Laptop",
      price: "$2999",
    },
    {
      id: "2",
      name: "Microsoft Surface Pro",
      color: "White",
      category: "Laptop PC",
      price: "$1999",
    },
    {
      id: "3",
      name: "Magic Mouse 2",
      color: "Black",
      category: "Accessories",
      price: "$99",
    },
    {
      id: "4",
      name: "Apple Watch",
      color: "Silver",
      category: "Accessories",
      price: "$179",
    },
    { id: "5", name: "iPad", color: "Gold", category: "Tablet", price: "$699" },
    {
      id: "6",
      name: 'Apple iMac 27"',
      color: "Silver",
      category: "PC Desktop",
      price: "$3999",
    },
  ],
};

// Users mock (moved from App)
const users = [
  {
    id: "u1",
    nombre: "Ana Gómez",
    correo: "ana.gomez@example.com",
    documentos: { type: "pdf", url: "/docs/ana-gomez.pdf" },
  },
  {
    id: "u2",
    nombre: "Luis Pérez",
    correo: "luis.perez@example.com",
    documentos: { type: "pdf", url: "/docs/luis-perez.pdf" },
  },
  {
    id: "u3",
    nombre: "María López",
    correo: "maria.lopez@example.com",
    documentos: { type: "pdf", url: "/docs/maria-lopez.pdf" },
  },
];

export async function getHeroSlides() {
  return heroSlides;
}

export async function getRowSlides() {
  return [
    ...heroSlides,
    ...heroSlides.map((s) => ({ ...s, id: `${s.id}-copy1` })),
    ...heroSlides.map((s) => ({ ...s, id: `${s.id}-copy2` })),
  ];
}

export async function getProducts() {
  return products;
}

export async function getUsers() {
  return users;
}

const roles = [
  {
    id: "r1",
    rol: "Administrador",
    permisos: ["Usuarios", "Reportes", "Ajustes", "Contenido", "Medios"],
  },
  { id: "r2", rol: "Editor", permisos: ["Contenido", "Medios"] },
  { id: "r3", rol: "Invitado", permisos: "Lectura" },
];

export async function getRoles() {
  return roles;
}

// Mock de campos para formulario de usuario
export const userFormFields = [
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    placeholder: "Ingresa tu nombre"
  },
  {
    name: "correo",
    label: "Correo electrónico",
    type: "email",
    placeholder: "Ingresa tu correo"
  }
];

// Slides para el SideContainer (pueden ser los mismos que heroSlides o personalizados)
const sideSlides = [
  {
    id: "side-1",
    title: "Slide Lateral 1",
    subtitle: "Descripción del slide lateral 1",
    imageUrl: "/src/assets/images/rehabilitacion-suelo-pelvico.jpg",
    imageAlt: "Imagen slide lateral 1",
  },
  {
    id: "side-2",
    title: "Slide Lateral 2",
    subtitle: "Descripción del slide lateral 2",
    imageUrl: "/src/assets/images/fisioterapia-suelo-pelvico.jpg",
    imageAlt: "Imagen slide lateral 2",
  },
  {
    id: "side-3",
    title: "Slide Lateral 3",
    subtitle: "Descripción del slide lateral 3",
    imageUrl: "/src/assets/images/fisioterapia-suelo-pelvico.jpg",
    imageAlt: "Imagen slide lateral 3",
  },
];

export async function getSideSlides() {
  return sideSlides;
}