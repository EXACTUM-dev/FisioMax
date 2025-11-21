/**
 * @fileoverview Footer component compact and well-distributed
 * @author EXACTUM-dev
 * @version 1.2.0
 */

import React from "react";
import {
  FaInstagram,
  FaYoutube,
  FaFacebookF,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";

/**
 * Footer component compact and well-distributed
 * @component
 * @return {JSX.Element} The Footer component
 */

export default function Footer() {
  return (
    <footer className="bg-white text-black py-4 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 py-1">
        <div className="flex items-center gap-2">
          <img
            src="/SOMEFIPPlogo.png"
            alt="SOMEFIPP Logo"
            className="w-7 h-7 rounded-full"
          />
          <span className="text-black font-semibold text-base">SOMEFIPP</span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 md:flex-row md:gap-2">
          <span className="text-xs text-gray-400">
            © 2025 SOMEFIPP. Todos los derechos reservados.
          </span>
          <span className="hidden md:inline-block mx-2">|</span>
          <a
            href="https://drive.google.com/file/d/1mFpjamiwh9n4pUDIPUWtwfrid744CxxK/view?usp=sharing"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#CAD00F] hover:underline font-semibold text-xs"
          >
            Made by EXACTUM
          </a>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="mailto:contacto@somefipp.com"
            className="hover:text-[#CAD00F] transition-colors"
            title="Correo electrónico"
          >
            <FaEnvelope size={18} />
          </a>
          <a
            href="https://api.whatsapp.com/send/?phone=525611116465&text=%21Hola%21+%C2%BFEn+qu%C3%A9+podemos+ayudarte%3F&type=phone_number&app_absent=0"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#CAD00F] transition-colors"
            title="WhatsApp"
          >
            <FaWhatsapp size={18} />
          </a>
          <a
            href="https://instagram.com/somefipp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#CAD00F] transition-colors"
            title="Instagram"
          >
            <FaInstagram size={18} />
          </a>
          <a
            href="https://youtube.com/@somefipp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#CAD00F] transition-colors"
            title="YouTube"
          >
            <FaYoutube size={18} />
          </a>
          <a
            href="https://facebook.com/somefipp"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-[#CAD00F] transition-colors"
            title="Facebook"
          >
            <FaFacebookF size={18} />
          </a>
        </div>
      </div>
    </footer>
  );
}
