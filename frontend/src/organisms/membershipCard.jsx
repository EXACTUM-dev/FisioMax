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
    ? new Date(data.membershipRegisteredAt).toLocaleDateString()
    : '—';
  const expiresAt = data.membershipExpiresAt
    ? new Date(data.membershipExpiresAt).toLocaleDateString()
    : '—';
  const plan = data.membershipPlan || 'No asignado';

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
          <span className="font-medium">{plan}</span>
        </div>
      </div>

      <div className="mt-4">
        <Button size="sm" label="Pagar membresía" onClick={() => { /* placeholder */ }} />
      </div>
    </aside>
  );
}
