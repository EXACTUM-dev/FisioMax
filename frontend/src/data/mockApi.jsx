/**
 * @fileoverview Mock API for demo data (slides, products, users, videos)
 * @version 0.1.0
 * @author EXACTUM-dev
 * @description Provides mock data for development and testing
 */

import rehabilitacionImg from "../assets/images/rehabilitacion-suelo-pelvico.jpg";
import fisioterapiaImg from "../assets/images/fisioterapia-suelo-pelvico.jpg";

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

const users = [
  {
    id: 1,
    nombre: "Juan Perez",
    email: "juan.perez@example.com",
    roleId: "r1",
  },
  { id: 2, nombre: "Ana Gomez", email: "ana.gomez@example.com", roleId: "r2" },
  {
    id: 3,
    nombre: "Luis Martinez",
    email: "luis.martinez@example.com",
    roleId: "r3",
  },
];

const roles = [
  {
    id: "r1",
    rol: "Administrador",
    permisos: ["Usuarios", "Reportes", "Ajustes", "Contenido", "Medios"],
  },
  { id: "r2", rol: "Editor", permisos: ["Contenido", "Medios"] },
  { id: "r3", rol: "Invitado", permisos: "Lectura" },
];

const sideSlides = [
  {
    id: "pelvic-basics",
    title:
      "Introducción Completa y Detallada a la Fisioterapia de Piso Pélvico",
    subtitle:
      "Descubre el arte de la fisioterapia adaptada al piso pélvico con técnicas modernas",
    imageUrl: rehabilitacionImg,
    imageAlt: "Sesión de fisioterapia de piso pélvico",
  },
  {
    id: "pelvic-2",
    title: "Técnicas Avanzadas de Suelo Pélvico",
    subtitle: "Técnicas avanzadas de rehabilitación para profesionales",
    imageUrl: fisioterapiaImg,
    imageAlt: "Sesión de fisioterapia de piso pélvico",
  },
  {
    id: "pelvic-3",
    title: "Ejercicios de Rehabilitación en Casa para Pacientes",
    subtitle:
      "Rutinas completas para continuar tu terapia desde la comodidad de tu hogar",
    imageUrl: fisioterapiaImg,
    imageAlt: "Ejercicios de rehabilitación",
  },
];

// Mock video data
const mockVideos = {
  "pelvic-basics": {
    videoData: {
      IDContenido: "pelvic-basics",
      titulo:
        "Introducción Completa y Detallada a la Fisioterapia de Piso Pélvico: Fundamentos, Técnicas y Aplicaciones Prácticas",
      descripcion:
        "Este video presenta los conceptos básicos de la fisioterapia de piso pélvico, incluyendo anatomía, técnicas de evaluación y ejercicios fundamentales para comenzar el tratamiento.",
      tipoMembresia: "basico",
    },
    signedUrl: "https://d1rfbz5vvf7qte.cloudfront.net/videos/video.mp4",
  },
  "pelvic-2": {
    videoData: {
      IDContenido: "pelvic-2",
      titulo: "Técnicas Avanzadas de Suelo Pélvico",
      descripcion:
        "Aprende técnicas avanzadas para el tratamiento del suelo pélvico, incluyendo ejercicios de fortalecimiento progresivo y manejo de casos complejos.",
      tipoMembresia: "premium",
    },
    signedUrl: "https://d1rfbz5vvf7qte.cloudfront.net/videos/video.mp4",
  },
  "pelvic-3": {
    videoData: {
      IDContenido: "pelvic-3",
      titulo:
        "Ejercicios de Rehabilitación en Casa para Pacientes con Disfunción del Suelo Pélvico",
      descripcion:
        "Una guía completa de ejercicios que los pacientes pueden realizar en casa para complementar su tratamiento de fisioterapia de piso pélvico.",
      tipoMembresia: "basico",
    },
    signedUrl: "https://d1rfbz5vvf7qte.cloudfront.net/videos/video.mp4",
  },
};

export const userFormFields = [
  {
    name: "nombre",
    label: "Nombre",
    type: "text",
    placeholder: "Ingresa tu nombre",
  },
  {
    name: "correo",
    label: "Correo electrónico",
    type: "email",
    placeholder: "Ingresa tu correo",
  },
];

/**
 * Fetches hero carousel slides
 * @returns {Promise<Array>} Array of hero slide objects
 */
export async function getHeroSlides() {
  return heroSlides;
}

/**
 * Fetches row carousel slides
 * @returns {Promise<Array>} Array of row slide objects
 */
export async function getRowSlides() {
  return [
    ...heroSlides,
    ...heroSlides.map((s) => ({ ...s, id: `${s.id}-copy1` })),
    ...heroSlides.map((s) => ({ ...s, id: `${s.id}-copy2` })),
  ];
}

/**
 * Fetches products data
 * @returns {Promise<Object>} Products object with columns and rows
 */
export async function getProducts() {
  return products;
}

/**
 * Fetches users list
 * @returns {Promise<Array>} Array of user objects
 */
export async function getUsers() {
  return users;
}

/**
 * Fetches roles list
 * @returns {Promise<Array>} Array of role objects
 */
export async function getRoles() {
  return roles;
}

/**
 * Fetches side container slides
 * @returns {Promise<Array>} Array of side slide objects
 */
export async function getSideSlides() {
  return sideSlides;
}

export const defaultVideoId = "pelvic-3";

/**
 * Fetches video data by ID
 * @param {string} videoId - Video unique identifier
 * @returns {Promise<Object>} Video data with signed URL and metadata
 */
export async function getVideoById(videoId) {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const id = videoId || defaultVideoId;
  const video = mockVideos[id];
  if (!video) {
    throw new Error(`Video with ID ${id} not found`);
  }

  return video;
}
