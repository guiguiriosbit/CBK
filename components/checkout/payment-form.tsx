// components/checkout/payment-form.tsx
'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSuccess?: (transactionId: string) => void;
  onError?: (error: string) => void;
}

export function PaymentForm({ 
  amount, 
  currency = 'mxn',
  onSuccess,
  onError 
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required',
      });

      if (error) {
        const errorMessage = error.message || 'Error procesando el pago';
        setMessage({ type: 'error', text: errorMessage });
        onError?.(errorMessage);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage({ type: 'success', text: '¡Pago exitoso!' });
        // Pasar el payment intent ID como transactionId
        onSuccess?.(paymentIntent.id);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error inesperado';
      setMessage({ type: 'error', text: errorMessage });
      onError?.(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-lg border border-input bg-background p-4">
        <PaymentElement 
          options={{
            layout: 'tabs',
          }}
        />
      </div>
      
      {message && (
        <Alert variant={message.type === 'error' ? 'destructive' : 'default'}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <XCircle className="h-4 w-4" />
          )}
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Procesando pago...
          </>
        ) : (
          `Pagar ${new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency.toUpperCase(),
          }).format(amount)}`
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Al completar el pago, aceptas nuestros términos y condiciones
      </p>
    </form>
  );
}