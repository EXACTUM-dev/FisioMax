/**
 * @fileoverview Informative modal for the SOMEFIPP membership process
 * @author EXACTUM-dev
 * @version 1.0.0
 */

import React from "react";
import Button from "../atoms/button";
import Modal from "../molecules/modal";
import {
  FaRegFileAlt,
  FaRegCheckCircle,
  FaRegCreditCard,
} from "react-icons/fa";

/**
 * Informative modal for the SOMEFIPP membership process
 * @component
 * @param {Object} props
 * @param {boolean} props.open - Whether the modal is open
 * @param {Function} props.onClose - Closes the modal
 */
export default function MembershipInfoModal({
  open,
  onClose,
  selectedPlan,
  highlightStep = 1,
}) {
  const isStep1 = highlightStep === 1;
  const isStep2 = highlightStep === 2;
  const isStep3 = highlightStep === 3;
  return (
    <Modal open={open} onClose={onClose} size="md" position="center">
      <div className="text-left">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Proceso de membresía
        </h3>
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border-2
              ${
                highlightStep === 1
                  ? "bg-[#CAD00F] text-gray-900 border-[#CAD00F]"
                  : "bg-gray-200 text-gray-400 border-gray-200"
              }`}
            >
              1
            </div>
            <span
              className={`text-xs mt-2 font-semibold ${
                highlightStep === 1 ? "text-gray-800" : "text-gray-400"
              }`}
            >
              Solicitud
            </span>
          </div>
          <div className="flex-1 h-1 bg-[#CAD00F]/40 mx-2" />
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border-2
              ${
                highlightStep === 2
                  ? "bg-[#CAD00F] text-gray-900 border-[#CAD00F]"
                  : "bg-gray-200 text-gray-400 border-gray-200"
              }`}
            >
              2
            </div>
            <span
              className={`text-xs mt-2 font-semibold ${
                highlightStep === 2 ? "text-gray-800" : "text-gray-400"
              }`}
            >
              Validación
            </span>
          </div>
          <div className="flex-1 h-1 bg-[#CAD00F]/40 mx-2" />
          <div className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold border-2
              ${
                highlightStep === 3
                  ? "bg-[#CAD00F] text-gray-900 border-[#CAD00F]"
                  : "bg-gray-200 text-gray-400 border-gray-200"
              }`}
            >
              3
            </div>
            <span
              className={`text-xs mt-2 font-semibold ${
                highlightStep === 3 ? "text-gray-800" : "text-gray-400"
              }`}
            >
              Pago
            </span>
          </div>
        </div>
        <div className="space-y-6">
          <div
            className={`flex items-start gap-4 ${isStep1 ? "" : "opacity-60"}`}
          >
            <FaRegFileAlt
              className={`${
                isStep1 ? "text-[#CAD00F]" : "text-gray-400"
              } w-6 h-6 mt-1`}
            />
            <div>
              <p
                className={`${
                  isStep1
                    ? "font-semibold text-gray-800"
                    : "font-semibold text-gray-400"
                }`}
              >
                1. Envía tu solicitud
              </p>
              {selectedPlan && (
                <div
                  className={`mb-2 mt-2 px-3 py-2 rounded bg-[#CAD00F]/20 ${
                    isStep1 ? "text-gray-900" : "text-gray-400"
                  } font-semibold text-sm border border-[#CAD00F]/40 inline-block`}
                >
                  <span className="mr-2">Tipo de membresía seleccionada:</span>
                  <span className="font-bold">{selectedPlan}</span>
                </div>
              )}
              <ul
                className={`${
                  isStep1 ? "text-gray-700" : "text-gray-400"
                } list-disc ml-5 text-sm mt-1`}
              >
                <li>Llena tus datos personales.</li>
                <li>Escoge el tipo de membresía.</li>
                <li>
                  Adjunta certificados PDF para{" "}
                  <span
                    className={`${
                      isStep1 ? "underline" : "underline text-gray-400"
                    }`}
                  >
                    justificar horas de formación
                  </span>{" "}
                  (si se requieren).
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`flex items-start gap-4 ${isStep2 ? "" : "opacity-60"}`}
          >
            <FaRegCheckCircle
              className={`${
                isStep2 ? "text-[#CAD00F]" : "text-gray-400"
              } w-6 h-6 mt-1`}
            />
            <div>
              <p
                className={`${
                  isStep2
                    ? "font-semibold text-gray-800"
                    : "font-semibold text-gray-400"
                }`}
              >
                2. Validación
              </p>
              <p
                className={`${
                  isStep2 ? "text-gray-700" : "text-gray-400"
                } text-sm mt-1`}
              >
                SOMEFIPP revisará y verificará tu información lo antes posible.
              </p>
              <ul
                className={`${
                  isStep2 ? "text-gray-700" : "text-gray-400"
                } list-disc ml-5 text-sm mt-2`}
              >
                <li>
                  Te enviaremos un correo de confirmación con el link para
                  realizar el pago.
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`flex items-start gap-4 ${isStep3 ? "" : "opacity-60"}`}
          >
            <FaRegCreditCard
              className={`${
                isStep3 ? "text-[#CAD00F]" : "text-gray-400"
              } w-6 h-6 mt-1`}
            />
            <div>
              <p
                className={`${
                  isStep3
                    ? "font-semibold text-gray-800"
                    : "font-semibold text-gray-400"
                }`}
              >
                3. Pago
              </p>
              <p
                className={`${
                  isStep3 ? "text-gray-700" : "text-gray-400"
                } text-sm mt-1`}
              >
                Una vez aprobada tu solicitud, completa el pago usando el link
                que te enviaremos.
              </p>
              <ul
                className={`${
                  isStep3 ? "text-gray-700" : "text-gray-400"
                } list-disc ml-5 text-sm mt-2`}
              >
                <li>
                  Confirma tu pago y disfruta de tus beneficios como miembro.
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button variant="brand" onClick={onClose} className="w-full">
            Entendido
          </Button>
        </div>
      </div>
    </Modal>
  );
}
