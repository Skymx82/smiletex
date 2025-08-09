import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');
    
    if (!signature) {
      throw new Error('No stripe signature found');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET as string
      );
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session;
        const orderId = session.metadata?.orderId;
        const userId = session.metadata?.userId;
        const shippingDetails = session.shipping_details;

        if (!orderId) {
          throw new Error('Order ID not found in session metadata');
        }

        // 1. Update shipping details but keep the status as 'unpaid'
        // La mise à jour du statut sera gérée par la page de succès
        const { error: orderError } = await supabase
          .from('orders')
          .update({
            shipping_address: {
              name: shippingDetails?.name,
              address: {
                line1: shippingDetails?.address?.line1,
                line2: shippingDetails?.address?.line2,
                city: shippingDetails?.address?.city,
                postal_code: shippingDetails?.address?.postal_code,
                country: shippingDetails?.address?.country,
              },
            },
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (orderError) {
          throw new Error(`Error updating order: ${orderError.message}`);
        }

        // 2. Clear user's cart if they are logged in
        if (userId && userId !== 'guest') {
          const { data: cart } = await supabase
            .from('carts')
            .select('id')
            .eq('user_id', userId)
            .single();

          if (cart) {
            // Supprimer d'abord les articles du panier
            await supabase
              .from('cart_items')
              .delete()
              .eq('cart_id', cart.id);

            // Puis supprimer le panier
            await supabase
              .from('carts')
              .delete()
              .eq('id', cart.id);
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        const { error } = await supabase
          .from('orders')
          .update({ 
            status: 'failed',
            updated_at: new Date().toISOString()
          })
          .eq('payment_intent_id', paymentIntent.id);

        if (error) {
          console.error('Error updating failed order:', error);
        }
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 500 }
    );
  }
}
