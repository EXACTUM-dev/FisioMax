/**
 * @fileoverview Componente reutilizable para botones de acción en tablas
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from "react";
import Button from "../atoms/button";

/**
 * Componente de botones de acción para tablas
 * @param {Object} props - Propiedades del componente
 * @param {Function} props.onRegisterUser - Función para manejar el registro de usuario
 * @param {Function} props.onRoles - Función para manejar la navegación a roles
 * @param {boolean} props.showRegisterUser - Mostrar botón de registrar usuario (default: true)
 * @param {boolean} props.showRoles - Mostrar botón de roles (default: true)
 * @param {string} props.className - Clases CSS adicionales
 */
export default function ActionButtons({
  onRegisterUser,
  onRoles,
  showRegisterUser = true,
  showRoles = true,
  className = "",
}) {
  return (
    <div className={`flex justify-end gap-3 mb-6 ${className}`}>
      {showRegisterUser && (
        <Button 
          size="sm" 
          label="Registrar usuario"
          onClick={onRegisterUser}
        />
      )}
      {showRoles && (
        <Button 
          size="sm" 
          label="Roles"
          onClick={onRoles}
        />
      )}
    </div>
  );
}
