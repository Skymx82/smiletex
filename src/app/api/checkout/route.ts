import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';

// Initialiser Stripe avec la clé secrète
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, userId, shippingDetails } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans le panier' },
        { status: 400 }
      );
    }

    // Créer les line items pour Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: `${item.name} (${item.size}, ${item.color})`,
          images: [item.imageUrl],
          metadata: {
            productId: item.productId,
            variantId: item.variantId,
            size: item.size,
            color: item.color,
          },
        },
        unit_amount: Math.round(item.price * 100), // Stripe utilise les centimes
      },
      quantity: item.quantity,
    }));

    // Ajouter les frais de livraison
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: 'Frais de livraison',
          description: 'Livraison standard',
        },
        unit_amount: 499, // 4.99€
      },
      quantity: 1,
    });

    // Créer une session de paiement Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'LU', 'CH'],
      },
      metadata: {
        userId: userId || 'guest',
        orderItems: JSON.stringify(items.map((item: any) => ({
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          price: item.price,
        }))),
        shippingDetails: shippingDetails ? JSON.stringify(shippingDetails) : '',
      },
    });

    // Si l'utilisateur est connecté, enregistrer la commande en attente dans Supabase
    if (userId) {
      const { error } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          status: 'pending',
          total_amount: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) + 4.99,
          shipping_address: shippingDetails ? JSON.stringify(shippingDetails) : null,
          payment_intent: session.payment_intent,
          stripe_session_id: session.id,
          items: items.map((item: any) => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            price: item.price,
          })),
        });

      if (error) {
        console.error('Erreur lors de l\'enregistrement de la commande:', error);
      }
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    );
  }
}
