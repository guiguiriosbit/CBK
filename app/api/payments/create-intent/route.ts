// app/api/payments/create-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY no está configurada en las variables de entorno');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verificar autenticación
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { amount, currency = 'mxn', description, metadata } = body;

    // Validaciones
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Crear Payment Intent en Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe usa centavos
      currency,
      description,
      receipt_email: user.email,
      metadata: {
        userId: user.id,
        userEmail: user.email!,
        ...metadata,
      },
    });

    // Guardar transacción en Supabase
    const { data: transaction, error: dbError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        order_id: metadata?.orderId || null,
        stripe_payment_intent_id: paymentIntent.id,
        amount,
        currency,
        status: 'pending',
        description,
        metadata: metadata || {},
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error guardando transacción:', dbError);
      return NextResponse.json(
        { error: 'Error guardando transacción' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      clientSecret: paymentIntent.client_secret,
      amount,
      currency,
    });

  } catch (error: any) {
    console.error('Error creando intención de pago:', error);
    return NextResponse.json(
      { error: error.message || 'Error procesando el pago' },
      { status: 500 }
    );
  }
}