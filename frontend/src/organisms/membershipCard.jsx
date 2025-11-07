/**
 * @fileoverview Membership card component for displaying membership information.
 * Shows registration date, expiration date, and membership plan.
 * @version 1.1.0
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';
import Button from "../atoms/button";
import EditButton from "../atoms/editButton";
import Dropdown from "../molecules/dropdown";

/**
 * Displays user's membership information and payment button.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User profile data containing membership information.
 * @param {boolean} props.canEdit - Whether the current user can edit this membership.
 * @param {Function} props.onSave - Callback function to save changes.
 * @param {Function} props.onEditChange - Callback to notify parent of edit state changes.
 * @return {!JSX.Element} Membership card component.
 */
export default function MembershipCard({data = {}, canEdit = false, onSave, onEditChange}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    membershipType: '',
    membershipRegisteredAt: '',
    membershipExpiresAt: '',
    membershipPaymentStatus: ''
  });

  // Initialize form data when data changes or entering edit mode
  useEffect(() => {
    if (data && isEditing) {
      setFormData({
        membershipType: data.membershipType || '',
        membershipRegisteredAt: data.membershipRegisteredAt ? data.membershipRegisteredAt.split('T')[0] : '',
        membershipExpiresAt: data.membershipExpiresAt ? data.membershipExpiresAt.split('T')[0] : '',
        membershipPaymentStatus: data.membershipPaymentStatus || 'Pendiente'
      });
    }
  }, [data, isEditing]);

  // Notify parent component of edit state
  useEffect(() => {
    if (onEditChange) {
      onEditChange(isEditing);
    }
  }, [isEditing, onEditChange]);

  const registeredAt = data.membershipRegisteredAt
    ? new Date(data.membershipRegisteredAt).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '—';
  
  const expiresAt = data.membershipExpiresAt
    ? new Date(data.membershipExpiresAt).toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : '—';
  
  const plan = data.membershipType || 'No asignado';
  const hoursFormation = data.membershipHoursFormation || 0;
  const paymentStatus = data.membershipPaymentStatus || 'Pendiente';

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    setFormData({
      membershipType: data.membershipType || '',
      membershipRegisteredAt: data.membershipRegisteredAt ? data.membershipRegisteredAt.split('T')[0] : '',
      membershipExpiresAt: data.membershipExpiresAt ? data.membershipExpiresAt.split('T')[0] : '',
      membershipPaymentStatus: data.membershipPaymentStatus || 'Pendiente'
    });
  };

  const handleSave = async () => {
    if (onSave) {
      try {
        // Format the date to ISO string if it exists
        const dataToSave = {
          membershipType: formData.membershipType,
          membershipRegisteredAt: formData.membershipRegisteredAt ? new Date(formData.membershipRegisteredAt).toISOString() : null,
          membershipExpiresAt: formData.membershipExpiresAt ? new Date(formData.membershipExpiresAt).toISOString() : null,
          membershipPaymentStatus: formData.membershipPaymentStatus
        };
        
        await onSave(dataToSave);
        setIsEditing(false);
      } catch (error) {
        console.error('Error al guardar cambios de membresía:', error);
        // Keep in edit mode on error
      }
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Options for membership type dropdown
  const membershipTypeOptions = [
    { value: '', label: 'Seleccionar plan' },
    { value: 'básica', label: 'Básica' },
    { value: 'premium', label: 'Premium' },
    { value: 'empresarial', label: 'Empresarial' }
  ];

  // Options for payment status dropdown
  const paymentStatusOptions = [
    { value: 'Pendiente', label: 'Pendiente' },
    { value: 'Pagado', label: 'Pagado' },
    { value: 'Vencido', label: 'Vencido' }
  ];

  return (
    <aside className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm max-w-md w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Membresía</h3>
        {canEdit && !isEditing && <EditButton onClick={handleEdit} />}
      </div>

      {!isEditing ? (
        <>
          <div className="text-sm text-slate-700 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha de registro</span>
              <span className="font-medium">{registeredAt}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Fecha de vencimiento</span>
              <span className="font-medium">{expiresAt}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Plan de membresía</span>
              <span className="font-medium capitalize">{plan}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Estatus de pago</span>
              <span className={`font-medium capitalize ${
                paymentStatus === 'Pagado' ? 'text-green-600' : 
                paymentStatus === 'Pendiente' ? 'text-yellow-600' : 
                'text-red-600'
              }`}>
                {paymentStatus}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Button size="sm" label="Pagar membresía" onClick={() => { /* placeholder */ }} />
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-slate-700 space-y-4">
            <div>
              <label htmlFor="membershipRegisteredAt" className="block text-slate-500 mb-1">
                Fecha de registro
              </label>
              <input
                id="membershipRegisteredAt"
                type="date"
                value={formData.membershipRegisteredAt}
                onChange={(e) => handleChange('membershipRegisteredAt', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="membershipExpiresAt" className="block text-slate-500 mb-1">
                Fecha de vencimiento
              </label>
              <input
                id="membershipExpiresAt"
                type="date"
                value={formData.membershipExpiresAt}
                onChange={(e) => handleChange('membershipExpiresAt', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#CAD00F] focus:border-transparent"
              />
            </div>

            <div>
              <Dropdown
                name="membershipType"
                label="Plan de membresía"
                value={formData.membershipType}
                onChange={(e) => handleChange('membershipType', e.target.value)}
                options={membershipTypeOptions}
                placeholder="Seleccionar plan"
              />
            </div>

            <div>
              <Dropdown
                name="membershipPaymentStatus"
                label="Estatus de pago"
                value={formData.membershipPaymentStatus}
                onChange={(e) => handleChange('membershipPaymentStatus', e.target.value)}
                options={paymentStatusOptions}
                placeholder="Seleccionar estatus"
              />
            </div>
          </div>

          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              variant="brand"
              label="Guardar" 
              onClick={handleSave}
              className="flex-1"
            />
            <Button 
              size="sm" 
              variant="gray"
              label="Cancelar" 
              onClick={handleCancel}
              className="flex-1"
            />
          </div>
        </>
      )}
    </aside>
  );
}
