/**
 * @fileoverview Benefits section showing platform features
 * @author EXACTUM-dev
 * @version 1.1.1
 */

import React, { useState } from "react";
import { Users, BookOpen, FileText, Headphones } from "lucide-react";

const benefitData = [
  {
    key: "biblioteca",
    icon: <BookOpen className="w-6 h-6" />,
    title: "Biblioteca Digital",
    desc: "Explora una vasta biblioteca de guías y recursos exclusivos.",
    image: (
      <div className="w-full h-full flex items-center justify-center">
        <img
          src="/FISIOMAX.png"
          alt="FisioMax 3"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    ),
  },
  {
    key: "articulos",
    icon: <FileText className="w-6 h-6" />,
    title: "Artículos Exclusivos",
    desc: "Accede a investigaciones y artículos de vanguardia en fisioterapia de piso pélvico.",
    image: (
      <div className="w-full h-full flex items-center justify-center">
        <img
          src="/FISIOMAX2.png"
          alt="FisioMax 2"
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    ),
  },
  {
    key: "sesiones",
    icon: <Users className="w-6 h-6" />,
    title: "Sesiones con Expertos",
    desc: "Participa en sesiones con líderes del sector.",
    image: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    ),
  },
  {
    key: "networking",
    icon: <Headphones className="w-6 h-6" />,
    title: "Networking Profesional",
    desc: "Conecta con colegas y mentores en nuestra comunidad privada.",
    image: (
      <div className="w-full h-full flex flex-col items-center justify-center gap-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
      </div>
    ),
  },
];
/**
 * @component
 * @return {JSX.Element} The BenefitsSection component
 */

export default function BenefitsSection() {
  const [selected, setSelected] = useState(0);

  return (
    <section id="benefits" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-3">
            Todo lo que necesitas para crecer
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Tu membresía SOMEFIPP te da acceso a una plataforma completa de
            recursos, conocimiento y comunidad.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid md:grid-cols-2 gap-8 items-center p-6 md:p-10">
            <div className="space-y-4">
              {benefitData.map((benefit, idx) => (
                <button
                  key={benefit.key}
                  onClick={() => setSelected(idx)}
                  type="button"
                  aria-pressed={selected === idx}
                  className={`w-full text-left rounded-lg transition-shadow px-3 py-4 flex items-start gap-4 ${
                    selected === idx
                      ? "shadow-md ring-2 ring-[#CAD00F]/40 bg-[#CAD00F]/5"
                      : "hover:shadow-sm hover:bg-[#CAD00F]/3"
                  }`}
                >
                  <div className="mt-1 text-[#CAD00F]">{benefit.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600">{benefit.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center">
              <div
                className="w-full h-64 md:h-80 lg:h-100 rounded-lg overflow-hidden flex items-center justify-center p-6"
                role="img"
                aria-label={benefitData[selected].title}
              >
                <div
                  className="w-full h-full rounded-lg flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(202,208,15,0.12), rgba(249,250,251,0.8))",
                  }}
                >
                  {benefitData[selected] && benefitData[selected].image ? (
                    <div className="w-full h-full flex items-center justify-center">
                      {benefitData[selected].image}
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-11/12 h-5/6 bg-gray-100 rounded-lg flex flex-col items-center justify-center gap-3 p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
