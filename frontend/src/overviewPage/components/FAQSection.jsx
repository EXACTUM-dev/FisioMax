/**
 * @fileoverview FAQ section component
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useRef, useState } from "react";

export default function FAQSection() {
  const faqs = [
    {
      question: "¿Necesito experiencia previa para unirme?",
      answer:
        "No. Tenemos categorías para estudiantes, fisioterapeutas titulados, especializados y profesionales de la salud de otras áreas.",
    },
    {
      question: "¿El contenido se actualiza constantemente?",
      answer:
        "Sí. Nuevos artículos, materiales y sesiones se añaden cada semana o cada mes.",
    },
    {
      question: "¿La membresía incluye formaciones avaladas?",
      answer:
        "Incluye acceso a información, materiales exclusivos y beneficios relacionados con formaciones avaladas.",
    },
    {
      question: "¿Qué descuentos puedo obtener?",
      answer:
        "Con proveedores nacionales de insumos, tecnología y educación especializada.",
    },
    {
      question: "¿Puedo unirme desde fuera de México?",
      answer:
        "Sí. Existe una categoría específica para profesionales extranjeros.",
    },
  ];

  const detailsRefs = faqs.map(() => useRef(null));
  const [hovered, setHovered] = useState(null);

  const handleAnswerClick = (idx) => {
    const details = detailsRefs[idx].current;
    if (details && details.open) {
      details.open = false;
    }
  };

  return (
    <section id="faqs" className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Preguntas Frecuentes
          </h2>
          <p className="text-xl text-gray-600">
            ¿Tienes preguntas? Tenemos respuestas.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={index}
              ref={detailsRefs[index]}
              className={`bg-white rounded-lg shadow-sm overflow-hidden group transition-colors ${hovered === index ? "bg-gray-100" : ""
                }`}
              onMouseEnter={() => setHovered(index)}
              onMouseLeave={() => setHovered(null)}
            >
              <summary
                className={`px-6 py-4 cursor-pointer font-semibold text-gray-900 flex justify-between items-center transition-colors ${hovered === index ? "bg-gray-100" : "hover:bg-gray-100"
                  }`}
              >
                {faq.question}
                <svg
                  className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </summary>
              <div
                className={`px-6 pb-4 text-gray-700 cursor-pointer transition-colors ${hovered === index ? "bg-gray-100" : ""
                  }`}
                onClick={() => handleAnswerClick(index)}
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
