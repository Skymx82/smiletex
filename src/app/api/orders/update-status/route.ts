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
    const requestBody = await request.json();
    const { sessionId, userId: userIdFromRequest } = requestBody;
    
    console.log('Request body:', requestBody);
    console.log('User ID from request:', userIdFromRequest);

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
    const userIdFromStripe = session.metadata?.userId;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande non trouvé dans la session' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la commande et l'ID utilisateur si nécessaire
    const updateData: { status: string; user_id?: string } = { status: 'completed' };
    
    console.log('Order ID:', orderId);
    console.log('User ID from Stripe:', userIdFromStripe);
    
    // Priorité 1: Utiliser l'ID utilisateur envoyé depuis la page de succès
    if (userIdFromRequest) {
      console.log('Using user ID from request:', userIdFromRequest);
      updateData.user_id = userIdFromRequest;
    }
    // Priorité 2: Utiliser l'ID utilisateur des métadonnées de la session Stripe
    else if (userIdFromStripe && userIdFromStripe !== 'guest') {
      console.log('Using user ID from Stripe:', userIdFromStripe);
      updateData.user_id = userIdFromStripe;
    }
    
    // Récupérer d'abord la commande pour vérifier si l'ID utilisateur est déjà défini
    const { data: existingOrder } = await supabase
      .from('orders')
      .select('user_id')
      .eq('id', orderId)
      .single();
    
    console.log('Existing order:', existingOrder);
    
    // Assurer que l'ID utilisateur est défini si la commande existe mais n'a pas d'ID utilisateur
    if (existingOrder && !existingOrder.user_id && updateData.user_id) {
      console.log('Setting user ID for order:', updateData.user_id);
    }
    // Ne pas écraser un ID utilisateur existant si aucun nouvel ID n'est fourni
    else if (existingOrder?.user_id && !updateData.user_id) {
      console.log('Not overwriting existing user ID:', existingOrder.user_id);
      delete updateData.user_id;
    }
    // Si la commande a déjà un ID utilisateur différent, le conserver
    else if (existingOrder?.user_id && updateData.user_id && existingOrder.user_id !== updateData.user_id) {
      console.log('Keeping existing user ID:', existingOrder.user_id, 'instead of', updateData.user_id);
      updateData.user_id = existingOrder.user_id;
    }
    
    console.log('Update data:', updateData);
    
    // Mettre à jour la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    console.log('Updated order:', order);
    console.log('Order error:', orderError);

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
