// components/checkout/checkout-wrapper.tsx
'use client';

import { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { PaymentForm } from './payment-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, XCircle } from 'lucide-react';

// Validar que la clave de Stripe esté configurada
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY no está configurada');
}

const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

interface CheckoutWrapperProps {
  amount: number;
  currency?: string;
  description?: string;
  metadata?: Record<string, any>;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function CheckoutWrapper({
  amount,
  currency = 'mxn',
  description,
  metadata,
  onSuccess,
  onError,
}: CheckoutWrapperProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar que Stripe esté configurado
    if (!stripePublishableKey) {
      setError('Stripe no está configurado. Por favor, configura NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en tus variables de entorno.');
      setLoading(false);
      onError?.('Stripe no está configurado');
      return;
    }

    async function createPaymentIntent() {
      try {
        const response = await fetch('/api/payments/create-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency,
            description,
            metadata,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMessage = data.error || 'Error creando intención de pago';
          console.error('Error del servidor:', errorMessage);
          throw new Error(errorMessage);
        }

        if (!data.clientSecret) {
          throw new Error('No se recibió clientSecret del servidor');
        }

        setClientSecret(data.clientSecret);
      } catch (err: any) {
        console.error('Error creando payment intent:', err);
        const errorMessage = err.message || 'Error desconocido al crear la intención de pago';
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    createPaymentIntent();
  }, [amount, currency, description, metadata, onError, stripePublishableKey]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Preparando checkout...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-semibold text-lg mb-2">Error al cargar el checkout</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!clientSecret) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p>No se pudo inicializar el formulario de pago</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stripePromise) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-destructive">
            <XCircle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-semibold text-lg mb-2">Stripe no está configurado</p>
            <p className="text-sm text-muted-foreground">
              Por favor, configura NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en tu archivo .env.local
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const appearance = {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: 'hsl(var(--primary))',
      colorBackground: 'hsl(var(--background))',
      colorText: 'hsl(var(--foreground))',
      colorDanger: 'hsl(var(--destructive))',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Información de pago</CardTitle>
        <CardDescription>
          Ingresa los datos de tu tarjeta para completar la compra de forma segura
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance,
            locale: 'es',
          }}
        >
          <PaymentForm
            amount={amount}
            currency={currency}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </CardContent>
    </Card>
  );
}