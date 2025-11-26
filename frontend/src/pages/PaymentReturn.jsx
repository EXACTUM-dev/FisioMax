/**
 * @fileoverview Payment return page component.
 * Displays payment status after returning from Mercado Pago.
 * @version 1.0.1
 * @author EXACTUM-dev
 */

import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import PaymentService from '../services/paymentService';
import Button from '../atoms/button';

/**
 * Payment return page.
 * Handles the return flow from Mercado Pago.
 */
export default function PaymentReturn() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // Get payment_id from URL parameters
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');

        if (!paymentId) {
          setError('No se encontró información del pago');
          setLoading(false);
          return;
        }

        // Query payment status from backend
        const result = await PaymentService.getPaymentStatus(paymentId, getToken);
        setPaymentStatus(result);

        // Clear pending payment from session storage
        PaymentService.clearPendingPayment();

        setLoading(false);
      } catch (err) {
        setError('No se pudo verificar el estado del pago');
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [searchParams, getToken]);

  const getStatusInfo = () => {
    if (!paymentStatus?.payment) {
      return {
        title: 'Verificando pago...',
        message: '',
        color: 'text-gray-700',
        icon: '⏳',
      };
    }

    const status = paymentStatus.payment.status;

    switch (status) {
      case 'approved':
        return {
          title: '¡Pago aprobado!',
          message: 'Tu pago ha sido procesado exitosamente. Tu membresía será actualizada en breve.',
          color: 'text-green-600',
          icon: '✅',
        };
      case 'pending':
      case 'in_process':
        return {
          title: 'Pago pendiente',
          message: 'Tu pago está siendo procesado. Te notificaremos cuando se complete.',
          color: 'text-yellow-600',
          icon: '⏳',
        };
      case 'rejected':
        return {
          title: 'Pago rechazado',
          message: 'Tu pago no pudo ser procesado. Por favor, intenta nuevamente.',
          color: 'text-red-600',
          icon: '❌',
        };
      default:
        return {
          title: 'Estado desconocido',
          message: 'No pudimos determinar el estado de tu pago.',
          color: 'text-gray-600',
          icon: '❓',
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#CAD00F] mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button
            label="Volver al inicio"
            onClick={() => navigate('/')}
            variant="brand"
          />
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{statusInfo.icon}</div>
          <h1 className={`text-2xl font-bold ${statusInfo.color} mb-2`}>
            {statusInfo.title}
          </h1>
          <p className="text-gray-700">{statusInfo.message}</p>
        </div>

        {paymentStatus?.payment && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">ID de pago:</span>
              <span className="font-medium">{paymentStatus.payment.id}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Monto:</span>
              <span className="font-medium">
                ${paymentStatus.payment.transaction_amount} {paymentStatus.payment.currency_id}
              </span>
            </div>
            {paymentStatus.payment.payment_method_id && (
              <div className="flex justify-between">
                <span className="text-gray-600">Método de pago:</span>
                <span className="font-medium capitalize">
                  {paymentStatus.payment.payment_method_id}
                </span>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3">
          <Button
            label="Ver mi perfil"
            onClick={() => navigate('/profile')}
            variant="brand"
            className="w-full"
          />
          <Button
            label="Volver al inicio"
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
