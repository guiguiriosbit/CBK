// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Variables de entorno de Supabase no están configuradas');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-12-15.clover',
});

// Cliente de Supabase con service role para webhooks
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    // Manejar eventos de Stripe
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Actualizar transacción
        await supabase
          .from('transactions')
          .update({
            status: 'succeeded',
            completed_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        // Actualizar pedido si existe
        const userId = paymentIntent.metadata.userId;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'paid',
              status: 'processing',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId)
            .eq('user_id', userId);
        }
        
        console.log('✅ Payment succeeded:', paymentIntent.id);
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Actualizar transacción
        await supabase
          .from('transactions')
          .update({
            status: 'failed',
            failed_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent_id', paymentIntent.id);

        // Actualizar pedido si existe
        const orderId = paymentIntent.metadata.orderId;
        if (orderId) {
          await supabase
            .from('orders')
            .update({
              payment_status: 'failed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', orderId);
        }
        
        console.log('❌ Payment failed:', paymentIntent.id);
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        
        if (charge.payment_intent) {
          const paymentIntentId = charge.payment_intent as string;
          
          // Obtener la transacción para obtener el orderId
          const { data: transaction } = await supabase
            .from('transactions')
            .select('order_id')
            .eq('stripe_payment_intent_id', paymentIntentId)
            .single();

          // Actualizar transacción
          await supabase
            .from('transactions')
            .update({
              status: 'refunded',
              refunded_at: new Date().toISOString(),
            })
            .eq('stripe_payment_intent_id', paymentIntentId);

          // Actualizar pedido si existe
          if (transaction?.order_id) {
            await supabase
              .from('orders')
              .update({
                payment_status: 'refunded',
                updated_at: new Date().toISOString(),
              })
              .eq('id', transaction.order_id);
          }
        }
        
        console.log('💰 Charge refunded:', charge.id);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}