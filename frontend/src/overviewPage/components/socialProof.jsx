/**
 * @fileoverview Social proof section with metrics
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React from "react";

export default function SocialProof() {
  return (
    <section className="bg-gray-50 py-18 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <p className="text-base md:text-lg text-gray-500 uppercase tracking-wide mb-8">
          La comunidad líder en fisioterapia de piso pélvico en México.
        </p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-12 md:gap-0">
          <div className="flex-1">
            <p className="text-6xl font-extrabold text-[#232323] mb-2">200+</p>
            <p className="text-lg text-gray-700 font-medium">
              Miembros Activos
            </p>
          </div>
          <div className="hidden md:block w-px h-20 bg-gray-300 mx-8"></div>
          <div className="flex-1">
            <p className="text-6xl font-extrabold text-[#232323] mb-2">120+</p>
            <p className="text-lg text-gray-700 font-medium">
              Horas de contenido formativo
            </p>
          </div>
          <div className="hidden md:block w-px h-20 bg-gray-300 mx-8"></div>
          <div className="flex-1">
            <p className="text-6xl font-extrabold text-[#232323] mb-2">20+</p>
            <p className="text-lg text-gray-700 font-medium">
              Expertos en el último año
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
