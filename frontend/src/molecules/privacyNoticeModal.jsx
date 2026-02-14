/**
 * @fileoverview Reusable modal to display the SOMEFIPP privacy notice
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Modal with internal scrolling displaying the privacy notice
 * stylized with numbered sections and professional formatting
 */

import React from "react";
import Modal from "./modal";
import Button from "../atoms/button";

//Privacy Notice Format
export default function PrivacyNoticeModal({ open, onClose }) {
  return (
    <Modal open={open} onClose={onClose} size="md" position="center">
      <div className="p-6">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-2 text-gray-900">
          Aviso de Privacidad
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Sociedad Mexicana de Fisioterapia en Piso Pélvico, A.C. (SOMEFIPP)
        </p>

        {/* Content of the notice with scroll */}
        <div className="text-gray-700 text-sm mb-6 max-h-[60vh] overflow-y-auto pr-2 space-y-6">
          
          {/* Introduction */}
          <section className="leading-relaxed">
            <p>
              En cumplimiento con la Ley Federal de Protección de Datos Personales 
              en Posesión de los Particulares y su Reglamento, la Sociedad Mexicana 
              de Fisioterapia en Piso Pélvico, A.C., con domicilio en Texcoco, 
              Estado de México, México, hace de su conocimiento que es responsable 
              del tratamiento, protección y confidencialidad de los datos personales 
              que recabe de sus asociados, alumnos, participantes, proveedores, 
              pacientes y público en general.
            </p>
          </section>

          <hr className="border-gray-200" />

          {/* Section 1 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              1. Datos personales que se recaban
            </h3>
            <p className="mb-3">
              SOMEFIPP podrá recabar los siguientes datos personales:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Datos de identificación:</strong> nombre completo, edad, nacionalidad, género, estado civil.
                </span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Datos de contacto:</strong> teléfono, correo electrónico, domicilio, redes profesionales.
                </span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Datos académicos y profesionales:</strong> formación, cédula profesional, institución de procedencia, experiencia laboral.
                </span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Datos fiscales y bancarios:</strong> únicamente cuando sean necesarios para realizar pagos, reembolsos o emitir comprobantes fiscales.
                </span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  <strong className="text-gray-900">Datos sensibles:</strong> únicamente los relacionados con su ejercicio profesional en fisioterapia o con fines académicos o de investigación, previa autorización expresa.
                </span>
              </li>
            </ul>
          </section>

          <hr className="border-gray-200" />

          {/* Section 2 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              2. Finalidades del tratamiento
            </h3>
            <p className="mb-3">
              Los datos personales serán utilizados para:
            </p>
            <ul className="space-y-2 ml-4">
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  Registrar y acreditar la participación en actividades académicas, científicas y profesionales organizadas por SOMEFIPP (diplomados, congresos, talleres, cursos, membresías, etc.).
                </span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>Integrar bases de datos de asociados, participantes y egresados.</span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>Emitir constancias, reconocimientos y comprobantes.</span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  Cumplir obligaciones legales y contractuales derivadas de las relaciones académicas o profesionales.
                </span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  Contactar a los titulares para envío de información institucional, educativa o de difusión relacionada con la fisioterapia en piso pélvico.
                </span>
              </li>
              <li className="flex">
                <span className="text-gray-900 mr-2">•</span>
                <span>
                  Fines estadísticos y de mejora continua, garantizando el anonimato cuando se publiquen resultados globales.
                </span>
              </li>
            </ul>
          </section>

          <hr className="border-gray-200" />

          {/* Section 3 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              3. Transferencia de datos
            </h3>
            <div className="space-y-2">
              <p>
                SOMEFIPP no transferirá sus datos personales a terceros sin su autorización expresa.
              </p>
              <p>
                En caso de ser necesario compartir información con instituciones académicas, clínicas o plataformas tecnológicas (para la gestión de inscripciones, certificaciones o colaboración académica), se solicitará consentimiento previo y por escrito del titular.
              </p>
              <p>
                Solo se podrán transferir datos sin consentimiento cuando así lo exija una autoridad competente conforme a la ley.
              </p>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 4 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              4. Medidas de seguridad
            </h3>
            <p>
              SOMEFIPP ha implementado medidas administrativas, técnicas y físicas para proteger sus datos personales contra daño, pérdida, alteración, destrucción o uso no autorizado. Solo el personal autorizado podrá acceder a la información en cumplimiento de sus funciones.
            </p>
          </section>

          <hr className="border-gray-200" />

          {/* Section 5 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h3>
            <p>
              Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales, así como a revocar su consentimiento.
              Para ejercer estos derechos, deberá enviar una solicitud al correo electrónico:{" "}
              <a 
                href="mailto:presidencia@somefipp.com" 
                className="text-blue-600 hover:text-blue-800 underline font-medium"
              >
                presidencia@somefipp.com
              </a>
              , indicando su nombre completo, medio de contacto y el derecho que desea ejercer.
            </p>
          </section>

          <hr className="border-gray-200" />

          {/* Section 6 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              6. Revocación del consentimiento
            </h3>
            <div className="space-y-2">
              <p>
                En cualquier momento podrá revocar su consentimiento para el uso de sus datos personales, mediante una solicitud enviada al mismo correo electrónico.
              </p>
              <p>
                La revocación no tendrá efectos retroactivos sobre tratamientos ya realizados conforme a la ley.
              </p>
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Section 7 */}
          <section>
            <h3 className="text-base font-semibold text-gray-900 mb-3">
              7. Cambios al aviso de privacidad
            </h3>
            <p>
              SOMEFIPP podrá modificar o actualizar este aviso de privacidad en cualquier momento. Cualquier cambio será notificado mediante su sitio web oficial o correo electrónico institucional.
            </p>
          </section>

          <hr className="border-gray-200" />

          {/* Footer informative */}
          <section className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs text-gray-600 mb-2">
              <strong>Última actualización:</strong> 25 de noviembre de 2025
            </p>
            <p className="text-xs text-gray-600 mb-1">
              <strong>Sociedad Mexicana de Fisioterapia en Piso Pélvico, A.C. (SOMEFIPP)</strong>
            </p>
            <p className="text-xs text-gray-600 mb-1">
              <strong>Domicilio:</strong> Texcoco, Estado de México, México
            </p>
            <p className="text-xs text-gray-600">
              <strong>Correo de contacto:</strong>{" "}
              <a 
                href="mailto:presidencia@somefipp.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                presidencia@somefipp.com
              </a>
            </p>
          </section>
        </div>

        {/* Close button */}
        <Button variant="brand" onClick={onClose} className="w-full">
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
