import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
  }

  try {
    // Récupérer la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer', 'payment_intent'],
    });

    // Récupérer la commande depuis Supabase
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', sessionId)
      .single();

    if (error) {
      console.error('Erreur lors de la récupération de la commande:', error);
      
      // Si la commande n'existe pas dans Supabase, retourner les informations de la session Stripe
      return NextResponse.json({
        id: session.id,
        created_at: new Date(session.created * 1000).toISOString(),
        status: session.payment_status === 'paid' ? 'paid' : 'pending',
        total_amount: session.amount_total ? session.amount_total / 100 : 0,
        shipping_address: session.shipping_details,
        items: session.line_items?.data.map(item => {
          // Récupérer les métadonnées de manière sécurisée
          let size = 'N/A';
          let color = 'N/A';
          let productId = 'N/A';
          
          try {
            // Utiliser une assertion de type avec as any pour éviter les erreurs de type
            const product = item.price?.product as any;
            if (product && product.metadata) {
              size = product.metadata.size || 'N/A';
              color = product.metadata.color || 'N/A';
              productId = product.metadata.productId || 'N/A';
            }
          } catch (e) {
            console.error('Erreur lors de l\'accès aux métadonnées du produit:', e);
          }
          
          return {
            name: item.description,
            quantity: item.quantity,
            price: item.amount_total ? item.amount_total / 100 / (item.quantity || 1) : 0,
            size,
            color,
            product_id: productId,
          };
        }),
      });
    }

    // Retourner les informations de la commande depuis Supabase
    return NextResponse.json(order);
  } catch (error) {
    console.error('Erreur lors de la récupération de la session Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des détails de la commande' },
      { status: 500 }
    );
  }
}
