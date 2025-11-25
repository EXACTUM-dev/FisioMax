/**
 * @fileoverview Hero section component with main promise and CTA
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/button";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="bg-gray-50 py-20 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Profesionalizando tu práctica clínica en el beneficio de tus pacientes
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Pertenece a la primer sociedad creada por fisioterapeutas pélvicos del
          país, con el objetivo de mejorar nuestra práctica profesional.
        </p>
        <div className="flex flex-col gap-2 justify-center items-center">
          <Button
            onClick={() => {
              navigate("/solicitud-membresia", {
                state: { showInfoModal: true, fromOverview: true },
              });
            }}
            variant="brand"
            className="px-8 py-3 text-lg"
          >
            Únete a la SOMEFIPP
          </Button>
          <a
            href="https://api.whatsapp.com/send/?phone=525611116465&text=%21Hola%21+%C2%BFEn+qu%C3%A9+podemos+ayudarte%3F&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 text-gray-500 text-base underline cursor-pointer hover:text-gray-700 transition-colors"
          >
            Contáctanos para más información
          </a>
        </div>

        {/* Video */}
        <div className="mt-10 max-w-4xl mx-auto">
          <div className="relative rounded-2xl shadow-xl overflow-hidden aspect-video">
            <video
              className="w-full h-full object-cover"
              controls 
              controlsList="nodownload"
              autoPlay
              muted
              playsInline
            >
              <source src="/SOMEFIPP.mp4" type="video/mp4" />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}
