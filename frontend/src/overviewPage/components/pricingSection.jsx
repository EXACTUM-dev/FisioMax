/**
 * @fileoverview Pricing section with membership plans
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";

export default function PricingSection() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Estudiante/Pasante",
      price: "$900",
      description: "Para personas sin título ni cédula profesional.",
      features: [
        "Artículos semanales",
        "Sesiones mensuales",
        "Libros y materiales digitales",
        "Podcasts especializados",
        "Contenido exclusivo en la plataforma",
        "Acceso a congresos",
        "Publicaciones exclusivas",
        "Red de contactos",
      ],
    },
    {
      name: "Licenciados en Formación",
      price: "$1,100",
      description:
        "Para personas con título y cédula profesional, con menos de 120 horas de formación.",
      features: [
        "Todo lo anterior, más:",
        "Derecho a voz en asambleas",
        "Oportunidad de participar en comités",
      ],
    },
    {
      name: "Especializados",
      price: "$1,500",
      description:
        "Para profesionistas con título, cédula y más de 120 horas de formación.",
      features: [
        "Todo lo anterior, más:",
        "Posibilidad de ser ponente en eventos",
        "Aparición en el directorio público de especialistas",
      ],
    },
  ];

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
            Elige el plan perfecto para ti
          </h2>
          <p className="text-xl text-gray-600">
            Elige la membresía que mejor se adapte a tu trayectoria profesional.
            Todos los planes son anuales.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full"
            >
              <div className="p-8 flex flex-col h-full">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </h3>
                <p className="text-3xl font-bold text-gray-900 mb-1">
                  {plan.price}
                  <span className="text-lg text-gray-500">/año</span>
                </p>
                <ul className="mt-6 space-y-3 flex-1">
                  {plan.features.map((feature, fIndex) => (
                    <li key={fIndex} className="flex items-start gap-2">
                      <CheckCircle2 className="w-5 h-5 text-[#CAD00F] shrink-0 mt-0.5" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <p className="text-gray-600 mb-6 text-sm mt-6">
                  {plan.description}
                </p>
                <button
                  onClick={() => {
                    navigate("/solicitud-membresia", {
                      state: {
                        selectedPlan: plan.name,
                        showInfoModal: true,
                        fromOverview: true,
                      },
                    });
                  }}
                  className="w-full py-3 rounded-md font-semibold transition-colors bg-gray-900 hover:bg-gray-800 text-white mt-auto"
                >
                  Elegir plan
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
