/**
 * @fileoverview Tickets card component for displaying payment tickets.
 * Shows empty state when no tickets are available.
 * @version 1.0.0
 * @author EXACTUM-dev
 */

import React from 'react';
import cash from '../assets/icons/cash.png';

/**
 * Displays user's payment tickets in a card layout.
 * @param {!Object} props - Component props.
 * @param {!Array<!Object>} props.tickets - Array of ticket objects.
 * @return {!JSX.Element} Tickets card component.
 */
export default function TicketsCard({tickets = []}) {
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
        <ul className="space-y-2">
          {tickets.map((t) => (
            <li key={t.id} className="p-2 border rounded">{t.label || JSON.stringify(t)}</li>
          ))}
        </ul>
      )}
    </aside>
  );
}

