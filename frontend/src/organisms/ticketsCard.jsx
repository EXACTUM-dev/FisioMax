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
 * Extract receipt URL from webhook response.
 * @param {Object} webhookData - Response webhook data from Mercado Pago.
 * @returns {string|null} Receipt URL or null if not available.
 */
const getReceiptUrl = (webhookData) => {
  if (!webhookData) return null;

  // Try to get the external resource URL (receipt PDF)
  const receiptUrl = webhookData.transaction_details?.external_resource_url;

  // Also check for point_of_interaction data (alternative location)
  const alternativeUrl = webhookData.point_of_interaction?.transaction_data?.ticket_url;

  return receiptUrl || alternativeUrl || null;
};

/**
 * Downloads the receipt PDF by fetching and creating a blob.
 * @param {string} url - Receipt URL.
 * @param {string} filename - Suggested filename for download.
 * @return {Promise<void>}
 */
const handleDownloadReceipt = async (url, filename) => {
  if (!url) return;

  try {
    // Fetch the file as a blob
    const response = await fetch(url);
    const blob = await response.blob();

    // Create a temporary URL for the blob
    const blobUrl = window.URL.createObjectURL(blob);

    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error descargando comprobante:', error);
    // Fallback: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  }
};

/**
 * Displays user's payment tickets in a card layout with pagination.
 * @param {!Object} props - Component props.
 * @param {!Array<!Object>} props.tickets - Array of ticket objects.
 * @return {!JSX.Element} Tickets card component.
 */
export default function TicketsCard({ tickets = [] }) {
  const [currentPage, setCurrentPage] = React.useState(0);
  const TICKETS_PER_PAGE = 2;

  // Debug: Log tickets to see response_webhook data
  React.useEffect(() => {
    if (tickets.length > 0) {
      console.log('=== TICKETS DEBUG ===');
      console.log('Total tickets:', tickets.length);

      tickets.forEach((ticket, index) => {
        console.log(`\n--- Ticket ${index + 1} (Folio: ${ticket.folio}) ---`);
        console.log('Has response_webhook:', !!ticket.response_webhook);
        console.log('response_webhook type:', typeof ticket.response_webhook);

        if (ticket.response_webhook) {
          const url = getReceiptUrl(ticket.response_webhook);
          console.log('✅ Receipt URL extracted:', url);
          console.log('transaction_details:', ticket.response_webhook.transaction_details);
          console.log('point_of_interaction:', ticket.response_webhook.point_of_interaction);
        } else {
          console.log('❌ No response_webhook data - buttons will NOT show');
        }
      });
      console.log('=== END TICKETS DEBUG ===\n');
    } else {
      console.log('No tickets found');
    }
  }, [tickets]);

  // Calculate pagination
  const totalPages = Math.ceil(tickets.length / TICKETS_PER_PAGE);
  const startIndex = currentPage * TICKETS_PER_PAGE;
  const endIndex = startIndex + TICKETS_PER_PAGE;
  const visibleTickets = tickets.slice(startIndex, endIndex);

  const canGoUp = currentPage > 0;
  const canGoDown = currentPage < totalPages - 1;

  const handlePrevious = () => {
    if (canGoUp) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (canGoDown) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <aside className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm max-w-md w-full">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold">Tickets de pago</h3>
        {tickets.length > 0 && (
          <span className="text-xs text-slate-500">
            {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
          </span>
        )}
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          <img src={cash} alt="cash" className="mx-auto mb-3 w-12 h-12 object-contain" />
          <div className="font-medium">Aún no tienes tickets</div>
          <div className="text-sm text-slate-500">Tus tickets de pago aparecerán aquí</div>
        </div>
      ) : (
        <>
          {/* Navigation buttons - Top */}
          {tickets.length > TICKETS_PER_PAGE && (
            <div className="flex justify-center mb-3">
              <button
                onClick={handlePrevious}
                disabled={!canGoUp}
                className={`p-2 rounded-md transition-colors ${canGoUp
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                aria-label="Ver tickets anteriores"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </button>
            </div>
          )}

          {/* Tickets display */}
          <div className="space-y-3">
            {visibleTickets.map((ticket) => (
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
                    className={`px-2 py-1 rounded text-xs font-medium ${ticket.membershipPaymentStatus === 'Pagado'
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

                {/* Receipt buttons */}
                {getReceiptUrl(ticket.response_webhook) && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Comprobante:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-green-600 font-medium">Disponible</span>
                        <button
                          onClick={() => window.open(getReceiptUrl(ticket.response_webhook), '_blank', 'noopener,noreferrer')}
                          className="text-blue-600 hover:text-blue-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer"
                          title="Ver comprobante"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDownloadReceipt(
                            getReceiptUrl(ticket.response_webhook),
                            `comprobante_${ticket.folio}.pdf`
                          )}
                          className="text-slate-600 hover:text-slate-800 hover:scale-110 text-sm font-medium transition-all duration-200 cursor-pointer"
                          title="Descargar comprobante"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Navigation buttons - Bottom */}
          {tickets.length > TICKETS_PER_PAGE && (
            <div className="flex justify-center mt-3">
              <button
                onClick={handleNext}
                disabled={!canGoDown}
                className={`p-2 rounded-md transition-colors ${canGoDown
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer'
                  : 'bg-slate-50 text-slate-300 cursor-not-allowed'
                  }`}
                aria-label="Ver tickets siguientes"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          )}

          {/* Page indicator */}
          {tickets.length > TICKETS_PER_PAGE && (
            <div className="text-center mt-2">
              <span className="text-xs text-slate-500">
                Página {currentPage + 1} de {totalPages}
              </span>
            </div>
          )}
        </>
      )}
    </aside>
  );
}


