import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID manquant' },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session.metadata?.orderId) {
      return NextResponse.json(
        { error: 'ID de commande non trouvé dans la session' },
        { status: 404 }
      );
    }

    return NextResponse.json({ orderId: session.metadata.orderId });
  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de la session' },
      { status: 500 }
    );
  }
}
