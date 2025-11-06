/**
 * @fileoverview Membership card component for displaying membership information.
 * Shows registration date, expiration date, and membership plan.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';
import Button from "../atoms/button";

/**
 * Displays user's membership information and payment button.
 * @param {!Object} props - Component props.
 * @param {!Object} props.data - User profile data containing membership information.
 * @return {!JSX.Element} Membership card component.
 */
export default function MembershipCard({data = {}}) {

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
  const paymentStatus = data.membershipPaymentStatus || 'pendiente';

  return (
    <aside className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm max-w-md w-full">
      <h3 className="text-lg font-semibold mb-3">Membresía</h3>

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
    </aside>
  );
}
