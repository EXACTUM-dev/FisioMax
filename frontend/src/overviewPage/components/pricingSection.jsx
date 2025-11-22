/**
 * @fileoverview Pricing section with membership plans
 * @author EXACTUM-dev
 * @version 1.0.1
 */

// Imports
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import Button from "../../atoms/button";

/**
 * PricingSection
 * Renders membership plans. If the last row has fewer than 3 cards,
 * the row is centered on desktop to keep visual balance.
 */
export default function PricingSection() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);

  // Plans list: "Licenciado Especializado" moved to the end so "everything above" makes sense.
  const plans = [
    {
      name: "Estudiante",
      price: "$900",
      description: "Para personas sin título ni cédula profesional.",
      features: [
        "Artículos semanales",
        "Sesiones mensuales",
        "Libros y materiales digitales",
        "Contenido exclusivo en la plataforma",
        "Acceso a congresos con precio preferencial",
        "Publicaciones exclusivas",
        "Red de contactos",
      ],
    },
    {
      name: "Licenciado en Formación",
      price: "$1,100",
      description:
        "Para personas con título y cédula profesional, con menos de 120 horas de formación.",
      features: [
        "Todo lo anterior, más:",
        "Descuentos en formaciones especializadas en piso pélvico",
        "Oportunidad de participar en comités",
      ],
    },
    {
      name: "Fisioterapeuta Extranjero",
      price: "$1,100",
      description:
        "Para personas con título y cédula profesional, con menos de 120 horas de formación.",
      features: [
        "Todo lo anterior, más:",
        "Descuentos en formaciones especializadas en piso pélvico",
        "Oportunidad de participar en comités",
      ],
    },
    {
      name: "Personal de la Salud",
      price: "$1,100",
      description:
        "Para personas con título y cédula profesional, con menos de 120 horas de formación.",
      features: [
        "Todo lo anterior, más:",
        "Descuentos en formaciones especializadas en piso pélvico",
        "Oportunidad de participar en comités",
      ],
    },
    {
      name: "Licenciado Especializado",
      price: "$1,500",
      description:
        "Para profesionistas con título, cédula y más de 120 horas de formación.",
      features: [
        "Todo lo anterior, más:",
        "Posibilidad de ser ponente en eventos y sesiones",
        "Aparición en el directorio público de especialistas",
      ],
    },
  ];

  // Group plans into rows of 3 to allow centering the last incomplete row.
  const planRows = [];
  for (let i = 0; i < plans.length; i += 3) {
    planRows.push(plans.slice(i, i + 3));
  }

  return (
    <section id="pricing" className="py-20 px-4 bg-gray-50">
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
          {planRows.map((row, rIdx) =>
            row.length === 3 ? (
              // Full row (3 items): render each card as a grid child.
              row.map((plan, pIdx) => {
                const key = `row-${rIdx}-col-${pIdx}`;
                return (
                  <div
                    key={key}
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
                            <span className="text-gray-700 text-sm">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-gray-600 mb-6 text-sm mt-6">
                        {plan.description}
                      </p>
                      <Button
                        onClick={() => {
                          navigate("/solicitud-membresia", {
                            state: {
                              selectedPlan: plan.name,
                              showInfoModal: true,
                              fromOverview: true,
                            },
                          });
                        }}
                        variant="gray"
                        className="w-full py-3 font-semibold mt-auto"
                      >
                        Elegir plan
                      </Button>
                    </div>
                  </div>
                );
              })
            ) : (
              // Incomplete row (<3 items): span the 3 columns and center its cards.
              <div
                key={`row-${rIdx}`}
                className="md:col-span-3 flex justify-center gap-8"
              >
                {row.map((plan, pIdx) => {
                  const key = `row-${rIdx}-col-${pIdx}`;
                  return (
                    <div
                      key={key}
                      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full max-w-sm w-full"
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
                              <span className="text-gray-700 text-sm">
                                {feature}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <p className="text-gray-600 mb-6 text-sm mt-6">
                          {plan.description}
                        </p>
                        <Button
                          onClick={() => {
                            navigate("/solicitud-membresia", {
                              state: {
                                selectedPlan: plan.name,
                                showInfoModal: true,
                                fromOverview: true,
                              },
                            });
                          }}
                          variant="gray"
                          className="w-full py-3 font-semibold mt-auto"
                        >
                          Elegir plan
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
