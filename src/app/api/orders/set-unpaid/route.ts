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
    const { orderId, userId } = requestBody;
    
    console.log('Set-unpaid request body:', requestBody);

    if (!orderId) {
      return NextResponse.json(
        { error: 'ID de commande manquant' },
        { status: 400 }
      );
    }

    // Mettre à jour le statut de la commande à "unpaid"
    const updateData: { status: string; user_id?: string } = { status: 'unpaid' };
    
    // Ajouter l'ID utilisateur si fourni
    if (userId) {
      updateData.user_id = userId;
    }
    
    console.log('Updating order to unpaid:', updateData);
    
    // Mettre à jour la commande
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .select()
      .single();
    
    console.log('Updated order to unpaid:', order);
    
    if (orderError) {
      throw orderError;
    }

    return NextResponse.json({ 
      success: true,
      order
    });
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut:', error);
    return NextResponse.json(
      { error: error.message || 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
