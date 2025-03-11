import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    // Vérifier le statut de la session Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Le paiement n\'a pas été effectué' },
        { status: 400 }
      );
    }

    // Récupérer la commande via les métadonnées de la session
    const orderId = session.metadata?.orderId;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande non trouvé dans la session' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', orderId)
      .select()
      .single();

    if (orderError) {
      throw orderError;
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
