/**
 * @fileoverview About section with mission statement
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React from "react";
import { Users } from "lucide-react";

/**
 * @component
 * @return {JSX.Element} The AboutSection component
 */

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="bg-linear-to-br from-gray-700 to-gray-900 rounded-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
            <img
              src="/team-placeholder.jpg"
              alt="SOMEFIPP Team"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = `
                  <div class="text-white text-center p-8">
                    <svg class="w-20 h-20 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    <p class="text-lg">SOMEFIPP Team</p>
                  </div>
                `;
              }}
            />
          </div>
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Nuestra Misión
            </h2>
            <p className="text-gray-700 mb-4 leading-relaxed">
              La SOMEFIPP surge con la misión de profesionalizar la fisioterapia
              de piso pélvico en México mediante formación continua, acceso a
              expertos y un respaldo profesional sólido.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Desde 2022 hemos crecido de manera sostenida, consolidándonos como
              una red nacional que impulsa el desarrollo clínico y educativo.
              Hoy colaboramos con proveedores, especialistas y organizaciones
              para fortalecer la práctica del piso pélvico en el país.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
