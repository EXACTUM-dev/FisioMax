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
      "La plataforma reúne recursos que realmente aportan a la práctica clínica.",
    name: "Dr. Ana Torres",
    title: "Fisioterapeuta, CDMX",
  },
  {
    quote:
      "Las sesiones mensuales me han ayudado a perfeccionar mi criterio y resolver casos complejos. Este es mucho texto nada más para probar el límite.",
    name: "Carlos Gómez",
    title: "Especialista, Guadalajara",
  },
  {
    quote:
      "La comunidad es muy activa y el acompañamiento hace toda la diferencia.",
    name: "Sofía Reyes",
    title: "Fisioterapeuta, Monterrey",
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
