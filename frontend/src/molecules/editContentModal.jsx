/**
 * @fileoverview Modal for editing content title and description.
 * @author EXACTUM-dev
 * @version 1.0.0
 * @description Provides form interface for updating content details.
 */

import React, { useState, useEffect } from "react";
import Button from "../atoms/button";
import Modal from "../molecules/modal";

/**
 * Edit content modal component
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Controls whether the modal is open
 * @param {Object} props.content - Content object to edit
 * @param {string} props.content.title - Current title
 * @param {string} props.content.subtitle - Current description
 * @param {Function} props.onSave - Callback function for save action
 * @param {Function} props.onCancel - Callback function for cancel action
 * @returns {React.Element} Edit content modal component
 */
export default function EditContentModal({
  open,
  content,
  onSave,
  onCancel,
}) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [errors, setErrors] = useState({});

  // Update form when content changes
  useEffect(() => {
    if (content) {
      setTitulo(content.title || "");
      setDescripcion(content.subtitle || "");
      setErrors({});
    }
  }, [content]);

  /**
   * Validates form fields
   * @returns {boolean} True if form is valid
   */
  const validateForm = () => {
    const newErrors = {};

    if (!titulo.trim()) {
      newErrors.titulo = "El título es requerido";
    } else if (titulo.length > 50) {
      newErrors.titulo = "El título no puede exceder 50 caracteres";
    }

    if (!descripcion.trim()) {
      newErrors.descripcion = "La descripción es requerida";
    } else if (descripcion.length > 500) {
      newErrors.descripcion = "La descripción no puede exceder 500 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSave({
        nombre: titulo.trim(),
        descripcion: descripcion.trim(),
      });
    }
  };

  /**
   * Handle cancel action
   */
  const handleCancel = () => {
    setErrors({});
    onCancel();
  };

  if (!open) return null;

  return (
    <Modal
      open={open}
      onClose={handleCancel}
      size="md"
      position="center"
      closeOnOverlayClick={false}
      showCloseButton={true}
    >
      <h2 className="text-xl font-bold text-slate-900 mb-6">Editar Contenido</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Título */}
        <div>
          <label
            htmlFor="titulo"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Título *
          </label>
          <input
            id="titulo"
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.titulo
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#CAD00F]"
            }`}
            placeholder="Ingresa el título del contenido"
            maxLength={50}
          />
          <div className="flex justify-between mt-1">
            {errors.titulo && (
              <p className="text-sm text-red-600">{errors.titulo}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {titulo.length}/50 caracteres
            </p>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Descripción *
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 resize-none ${
              errors.descripcion
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-[#CAD00F]"
            }`}
            placeholder="Ingresa la descripción del contenido"
            rows={4}
            maxLength={500}
          />
          <div className="flex justify-between mt-1">
            {errors.descripcion && (
              <p className="text-sm text-red-600">{errors.descripcion}</p>
            )}
            <p className="text-xs text-gray-500 ml-auto">
              {descripcion.length}/500 caracteres
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            label="Cancelar"
            variant="outline"
            onClick={handleCancel}
            type="button"
            radius="xl"
          />
          <Button
            label="Guardar Cambios"
            variant="brand"
            type="submit"
            radius="xl"
          />
        </div>
      </form>
    </Modal>
  );
}
