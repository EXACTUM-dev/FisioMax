/**
 * @fileoverview Utilidades para las pruebas unitarias de FisioMax
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import { render } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

/**
 * Renderiza un componente con el router para pruebas
 * @param {React.Component} component - Componente a renderizar
 * @returns {Object} Resultado del render
 */
export const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

/**
 * Datos mock para pruebas de formulario de membresía según el UML
 */
export const mockMembershipFormData = {
  validData: {
    nombres: "Juan Carlos",
    apellidoP: "García",
    apellidoM: "López",
    correo: "juan.garcia@ejemplo.com",
    telefono: "5551234567",
    redesSociales: "@juangarcia",
    pais: "México",
    estado: "Jalisco",
    ciudad: "Guadalajara",
    colonia: "Centro",
    codigoPostal: "44100",
    titulo: "Lic. en Fisioterapia",
    cedula: "12345678",
    constancia: new File(['contenido'], 'constancia.pdf', { type: 'application/pdf' })
  },
  invalidData: {
    nombres: "",
    apellidoP: "",
    apellidoM: "",
    correo: "email-invalido",
    telefono: "123",
    redesSociales: "",
    pais: "",
    estado: "",
    ciudad: "",
    colonia: "",
    codigoPostal: "",
    titulo: "",
    cedula: "",
    constancia: null
  }
};

/**
 * Utilidades para simular eventos de usuario según el UML
 */
export const userEventHelpers = {
  /**
   * Simula llenar un formulario completo con datos válidos según el UML
   * @param {Object} user - Instancia de userEvent
   * @param {Object} formElements - Elementos del formulario
   * @param {Object} data - Datos a ingresar
   */
  async fillFormWithValidData(user, formElements, data = mockMembershipFormData.validData) {
    await user.type(formElements.nombresInput, data.nombres);
    await user.type(formElements.apellidoPInput, data.apellidoP);
    await user.type(formElements.apellidoMInput, data.apellidoM);
    await user.type(formElements.correoInput, data.correo);
    await user.type(formElements.telefonoInput, data.telefono);
    await user.type(formElements.redesSocialesInput, data.redesSociales);
    await user.type(formElements.paisInput, data.pais);
    await user.type(formElements.estadoInput, data.estado);
    await user.type(formElements.ciudadInput, data.ciudad);
    await user.type(formElements.coloniaInput, data.colonia);
    await user.type(formElements.codigoPostalInput, data.codigoPostal);
    await user.type(formElements.tituloInput, data.titulo);
    await user.type(formElements.cedulaInput, data.cedula);
    
    if (data.constancia) {
      await user.upload(formElements.constanciaInput, data.constancia);
    }
  },

  /**
   * Simula llenar un formulario con datos inválidos según el UML
   * @param {Object} user - Instancia de userEvent
   * @param {Object} formElements - Elementos del formulario
   * @param {Object} data - Datos a ingresar
   */
  async fillFormWithInvalidData(user, formElements, data = mockMembershipFormData.invalidData) {
    await user.type(formElements.nombresInput, data.nombres);
    await user.type(formElements.apellidoPInput, data.apellidoP);
    await user.type(formElements.apellidoMInput, data.apellidoM);
    await user.type(formElements.correoInput, data.correo);
    await user.type(formElements.telefonoInput, data.telefono);
    await user.type(formElements.redesSocialesInput, data.redesSociales);
    await user.type(formElements.paisInput, data.pais);
    await user.type(formElements.estadoInput, data.estado);
    await user.type(formElements.ciudadInput, data.ciudad);
    await user.type(formElements.coloniaInput, data.colonia);
    await user.type(formElements.codigoPostalInput, data.codigoPostal);
    await user.type(formElements.tituloInput, data.titulo);
    await user.type(formElements.cedulaInput, data.cedula);
  }
};

/**
 * Selectores de elementos del formulario según el UML
 */
export const formSelectors = {
  nombresInput: () => screen.getByTestId("nombres-input"),
  apellidoPInput: () => screen.getByTestId("apellido-p-input"),
  apellidoMInput: () => screen.getByTestId("apellido-m-input"),
  correoInput: () => screen.getByTestId("correo-input"),
  telefonoInput: () => screen.getByTestId("telefono-input"),
  redesSocialesInput: () => screen.getByTestId("redes-sociales-input"),
  paisInput: () => screen.getByTestId("pais-input"),
  estadoInput: () => screen.getByTestId("estado-input"),
  ciudadInput: () => screen.getByTestId("ciudad-input"),
  coloniaInput: () => screen.getByTestId("colonia-input"),
  codigoPostalInput: () => screen.getByTestId("codigo-postal-input"),
  tituloInput: () => screen.getByTestId("titulo-input"),
  cedulaInput: () => screen.getByTestId("cedula-input"),
  constanciaInput: () => screen.getByTestId("constancia-input"),
  submitButton: () => screen.getByTestId("submit-button"),
  cancelButton: () => screen.getByTestId("cancel-button"),
  membershipForm: () => screen.getByTestId("membership-form")
};

/**
 * Mensajes de error esperados según el UML
 */
export const expectedErrorMessages = {
  requiredFields: "Llene todos los campos obligatorios",
  invalidEmail: "Por favor ingresa un correo electrónico válido",
  invalidFileType: "Solo se permiten archivos PDF",
  invalidPhone: "Por favor ingresa un teléfono válido",
  invalidPostalCode: "Por favor ingresa un código postal válido"
};

/**
 * Mensajes de éxito esperados según el UML
 */
export const expectedSuccessMessages = {
  applicationSubmitted: "Se ha mandado la solicitud con éxito. Los administradores le avisarán el estado final de su solicitación.",
  confirmationWindow: "Se ha mandado la solicitud con éxito. Los administradores le avisarán el estado final de su solicitación."
};
