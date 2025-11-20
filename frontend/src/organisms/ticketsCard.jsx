/**
 * @fileoverview Tickets card component for displaying payment tickets.
 * Shows empty state when no tickets are available.
 * @version 1.1.0
 * @author EXACTUM-dev
 */

import React from 'react';
import cash from '../assets/icons/cash.png';

/**
 * Format date to readable Spanish format.
 * @param {string} dateString - ISO date string.
 * @returns {string} Formatted date.
 */
const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Format currency amount.
 * @param {number} amount - Amount to format.
 * @returns {string} Formatted currency.
 */
const formatCurrency = (amount) => {
  if (!amount) return '$0.00';
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount);
};

/**
 * Get payment method icon/label.
 * @param {string} method - Payment method ID.
 * @returns {string} Readable payment method.
 */
const getPaymentMethodLabel = (method) => {
  if (!method) return 'No especificado';
  
  const methods = {
    'visa': '💳 Visa',
    'master': '💳 Mastercard',
    'amex': '💳 American Express',
    'oxxo': '🏪 OXXO',
    'spei': '🏦 SPEI',
    'bancomer': '🏦 Bancomer',
    'banamex': '🏦 Banamex',
  };
  
  return methods[method.toLowerCase()] || `💳 ${method}`;
};

/**
 * Get membership type label.
 * @param {string} type - Membership type.
 * @returns {string} Readable membership type.
 */
const getMembershipTypeLabel = (type) => {
  if (!type) return 'Sin tipo';
  
  const types = {
    'básica': 'Básica',
    'premium': 'Premium',
    'empresarial': 'Empresarial',
    'ordinaria': 'Ordinaria',
  };
  
  return types[type.toLowerCase()] || type;
};

/**
 * Displays user's payment tickets in a card layout.
 * @param {!Object} props - Component props.
 * @param {!Array<!Object>} props.tickets - Array of ticket objects.
 * @return {!JSX.Element} Tickets card component.
 */
export default function TicketsCard({ tickets = [] }) {
  return (
    <aside className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm max-w-md w-full">
      <h3 className="text-lg font-semibold mb-3">Tickets de pago</h3>

      {tickets.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <img src={cash} alt="cash" className="mx-auto mb-3 w-12 h-12 object-contain" />
          <div className="font-medium">Aún no tienes tickets</div>
          <div className="text-sm text-slate-500">Tus tickets de pago aparecerán aquí</div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {tickets.map((ticket) => (
            <div
              key={ticket.IDPago}
              className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              {/* Header with amount and date */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="text-xl font-bold text-[#CAD00F]">
                    {formatCurrency(ticket.cantidad)}
                  </div>
                  <div className="text-xs text-slate-500">
                    {formatDate(ticket.fechaPago)}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    ticket.membershipPaymentStatus === 'Pagado'
                      ? 'bg-green-100 text-green-700'
                      : ticket.membershipPaymentStatus === 'Pendiente'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {ticket.membershipPaymentStatus}
                </div>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Folio:</span>
                  <span className="font-mono text-xs text-slate-700">
                    {ticket.folio.substring(0, 16)}...
                  </span>
                </div>

                {ticket.membershipType && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Membresía:</span>
                    <span className="font-medium capitalize">
                      {getMembershipTypeLabel(ticket.membershipType)}
                    </span>
                  </div>
                )}

                {ticket.payment_method_id && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Método:</span>
                    <span className="font-medium">
                      {getPaymentMethodLabel(ticket.payment_method_id)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}

