/**
 * @fileoverview Testimonials section component
 * @author EXACTUM-dev
 * @version 1.1.0
 */

import React from "react";
import InfiniteMovingCards from "./ui/infiniteMovingCards";
const testimonials = [
  {
    quote:
      "Me gusta la oportunidad de intercambiar experiencias y derivar pacientes dentro de la comunidad, así como la actualización constante que nos proporcionan.",
    name: "Iolanda Curiel ",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "Me ha gustado de SOMEFIPP el conocer a más Fisios de la rama del piso pélvico, y poder compartir experiencias o información valiosa de mucha utilidad. \nLas sesiones mensuales que dejan grandes aprendizajes los cuales podemos aplicar con nuestros pacientes.",
    name: "Edna Rodriguez",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "Una herramienta primordial como apoyo y compañerismo de fisios pélvicos dando su máximo potencial para brindar excelencia.",
    name: "Isabel Zamudio",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "La Somefipp me ha dado capacitación constante y me ha dado una comunidad  de colegas para poder compartir y expandir mis conocimientos, además de ser un filtro para la rehabilitación de piso pelvico en México.",
    name: "Nora Ibañez",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "Me encanta la  capacitación continua, mejora de la práctica al ser una comunidad y el mapa interactivo para ubicarnos.",
    name: "Irving García",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "Soy nueva por aquí, pero me encanta la idea de poder conectar con más profesionales y actualizarnos en el área. Estoy emocionada por el congreso.",
    name: "María José Gil",
    title: "Licenciada en Formación",
  },
  {
    quote:
      "SOMEFIPP me gusta por que es un respaldo profesional para pacientes y otros profesionales de la salud, además de la capacitación constante.",
    name: "Diana Maya",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "Gracias a la SOMEFIPP, esta comunidad es un pilar de apoyo y educación, y el semillero vital que está elevando la fisioterapia pélvica. \n ¡Sigamos construyendo bienestar y futuro!",
    name: "Cielo Luna",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "Algo bueno que he encontrado es una red de soporte para fisoterapeutas que esta siempre dispuesta a ayudar a otros. Desde mi salida de la universidad cada quien tomó su camino y aqui veo una verdadera comunidad.",
    name: "Gabriela Rivas",
    title: "Fisioterapeuta de Piso Pélvico",
  },
  {
    quote:
      "SOMEFIPP ha sido un espacio donde se abren verdaderamente las puertas al conocimiento y al emprendimiento. Nos permite ofrecer nuestros servicios, crear oportunidades de comunicación y aprender de otros profesionales, enriqueciendo así nuestro crecimiento personal y profesional.",
    name: "Alitzel Barrera",
    title: "Fisioterapeuta de Piso Pélvico",
  },
];
/**
 * Testimonials section showcasing user feedback
 * @component
 * @return {JSX.Element} The Testimonials section
 */

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Lo que otros profesionales destacan de SOMEFIPP
          </h2>
          <p className="text-xl text-gray-600">
            Historias reales de profesionales que están prosperando con SOMEFIPP
          </p>
        </div>
        <InfiniteMovingCards
          items={testimonials}
          direction="right"
          speed="slow"
        />
      </div>
    </section>
  );
}
