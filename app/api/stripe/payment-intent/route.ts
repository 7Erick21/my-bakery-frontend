import { type NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/lib/auth/helpers';
import { stripe } from '@/lib/stripe/client';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orderId, saveCard } = await request.json();

  const supabase = await createClient();

  // Get order details
  const { data: order } = await supabase
    .from('orders')
    .select('id, total')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single();

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id, email, full_name')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile?.email ?? undefined,
      name: profile?.full_name ?? undefined,
      metadata: { supabase_user_id: user.id }
    });
    customerId = customer.id;

    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', user.id);
  }

  // Create PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100),
    currency: 'eur',
    customer: customerId,
    metadata: { order_id: orderId, user_id: user.id },
    ...(saveCard ? { setup_future_usage: 'on_session' } : {})
  });

  // stripe_payment_intent_id is saved by the webhook (payment_intent.succeeded)
  // which uses service role key to bypass RLS

  // Get saved payment methods if customer exists
  let paymentMethods: {
    id: string;
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  }[] = [];
  if (customerId) {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card'
    });
    paymentMethods = methods.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand ?? 'unknown',
      last4: pm.card?.last4 ?? '****',
      expMonth: pm.card?.exp_month ?? 0,
      expYear: pm.card?.exp_year ?? 0
    }));
  }

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentMethods
  });
}
