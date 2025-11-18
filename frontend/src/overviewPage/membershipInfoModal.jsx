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
          <div className="flex items-start gap-4">
            <FaRegFileAlt className="text-[#CAD00F] w-6 h-6 mt-1" />
            <div>
              <p className="font-semibold text-gray-800">
                1. Envía tu solicitud
              </p>
              {selectedPlan && (
                <div className="mb-2 mt-2 px-3 py-2 rounded bg-[#CAD00F]/20 text-gray-900 font-semibold text-sm border border-[#CAD00F]/40 inline-block">
                  <span className="mr-2">Tipo de membresía seleccionada:</span>
                  <span className="font-bold">{selectedPlan}</span>
                </div>
              )}
              <ul className="list-disc ml-5 text-gray-700 text-sm mt-1">
                <li>Llena tus datos personales.</li>
                <li>Escoge el tipo de membresía.</li>
                <li>
                  Adjunta certificados PDF para{" "}
                  <span className="underline">
                    justificar horas de formación
                  </span>{" "}
                  (si se requieren).
                </li>
              </ul>
            </div>
          </div>
          <div className="flex items-start gap-4 opacity-60">
            <FaRegCheckCircle className="text-gray-400 w-6 h-6 mt-1" />
            <div>
              <p className="font-semibold text-gray-400">2. Validación</p>
              <p className="text-gray-400 text-sm mt-1">
                SOMEFIPP revisará y verificará tu información. Este proceso
                puede tardar algunos días.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 opacity-60">
            <FaRegCreditCard className="text-gray-400 w-6 h-6 mt-1" />
            <div>
              <p className="font-semibold text-gray-400">3. Pago</p>
              <p className="text-gray-400 text-sm mt-1">
                Si tu solicitud es aprobada, recibirás un correo con la
                información para realizar el pago.
              </p>
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
