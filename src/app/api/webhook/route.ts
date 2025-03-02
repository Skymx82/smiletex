import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

// Cette fonction gère les webhooks Stripe pour mettre à jour le statut des commandes
export async function POST(request: Request) {
  const body = await request.text();
  const signature = headers().get('stripe-signature') as string;

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

  // Gérer les différents événements Stripe
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Mettre à jour le statut de la commande dans Supabase
      if (session.metadata?.userId && session.metadata.userId !== 'guest') {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'paid' })
          .eq('stripe_session_id', session.id);

        if (error) {
          console.error('Erreur lors de la mise à jour de la commande:', error);
        }

        // Mettre à jour le stock des produits
        if (session.metadata.orderItems) {
          const orderItems = JSON.parse(session.metadata.orderItems);
          
          for (const item of orderItems) {
            // Récupérer la variante actuelle
            const { data: variant, error: variantError } = await supabase
              .from('product_variants')
              .select('stock')
              .eq('id', item.variantId)
              .single();

            if (variantError) {
              console.error('Erreur lors de la récupération de la variante:', variantError);
              continue;
            }

            // Mettre à jour le stock
            const newStock = Math.max(0, variant.stock - item.quantity);
            const { error: updateError } = await supabase
              .from('product_variants')
              .update({ stock: newStock })
              .eq('id', item.variantId);

            if (updateError) {
              console.error('Erreur lors de la mise à jour du stock:', updateError);
            }
          }
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Mettre à jour le statut de la commande en cas d'échec
      const { error } = await supabase
        .from('orders')
        .update({ status: 'failed' })
        .eq('payment_intent', paymentIntent.id);

      if (error) {
        console.error('Erreur lors de la mise à jour de la commande échouée:', error);
      }
      break;

    default:
      console.log(`Événement non géré: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
