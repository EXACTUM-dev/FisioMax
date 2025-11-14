/**
 * @fileoverview Edit button atom component
 * @version 1.0.0
 * @author EXACTUM-dev
 * @description Reusable edit button with consistent styling
 */
import React from "react";
import editIcon from "../assets/icons/square-pen.png";

/**
 * EditButton component - Atomic design atom
 * @param {Object} props - Component properties
 * @param {boolean} props.isEditing - Whether currently in editing mode
 * @param {Function} props.onClick - Click handler function
 * @param {string} [props.className] - Additional CSS classes
 * @param {string} [props.editLabel="Editar"] - Aria label for edit mode
 * @param {string} [props.cancelLabel="Cancelar edición"] - Aria label for cancel mode
 * @returns {JSX.Element} Edit button component
 */
export default function EditButton({
  isEditing = false,
  onClick,
  className = "",
  editLabel = "Editar",
  cancelLabel = "Cancelar edición",
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded hover:bg-[#CAD00F]/10 transition-colors cursor-pointer ${className}`}
      aria-label={isEditing ? cancelLabel : editLabel}
      title={isEditing ? cancelLabel : editLabel}
    >
      <img
        src={editIcon}
        alt={isEditing ? "Cancelar" : "Editar"}
        className="w-5 h-5 object-contain opacity-80"
      />
    </button>
  );
}
