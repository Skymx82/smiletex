import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase/client';
import { CartItem } from '@/types/cart';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-02-24.acacia',
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, userId }: { items: CartItem[]; userId?: string } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans le panier' },
        { status: 400 }
      );
    }

    // 1. Créer ou récupérer le panier
    let cartId: string;
    if (userId) {
      // Vérifier si un panier existe déjà
      const { data: existingCart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (existingCart) {
        cartId = existingCart.id;
        // Supprimer les anciens items
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId);
      } else {
        // Créer un nouveau panier
        const { data: newCart, error: cartError } = await supabase
          .from('carts')
          .insert({
            user_id: userId,
          })
          .select()
          .single();

        if (cartError) throw cartError;
        cartId = newCart.id;
      }
    } else {
      // Créer un panier pour un utilisateur non connecté
      const { data: newCart, error: cartError } = await supabase
        .from('carts')
        .insert({
          session_id: crypto.randomUUID()
        })
        .select()
        .single();

      if (cartError) throw cartError;
      cartId = newCart.id;
    }

    // 2. Sauvegarder les articles du panier
    const cartItems = items.map((item: any) => ({
      cart_id: cartId,
      product_id: item.productId,
      product_variant_id: item.variantId,
      quantity: item.quantity,
      customization_data: item.customization || null
    }));

    const { error: cartItemsError } = await supabase
      .from('cart_items')
      .insert(cartItems);

    if (cartItemsError) throw cartItemsError;

    // Créer les line items pour Stripe
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.name,
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
        },
        unit_amount: 499, // 4.99€
      },
      quantity: 1,
    });

    // Créer une commande en attente dans Supabase
    const { data: pendingOrder, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId || null,
        status: 'pending',
        total_amount: items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0) + 4.99,
        shipping_cost: 4.99
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // Créer les items de la commande
    const orderItems = items.map((item: CartItem) => ({
      order_id: pendingOrder.id,
      product_id: item.productId,
      product_variant_id: item.variantId,
      quantity: item.quantity,
      price_per_unit: item.price,
      customization_data: item.customization
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (orderItemsError) throw orderItemsError;

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
        orderId: pendingOrder.id,
        userId: userId || 'guest'
      },
    });

    // Mettre à jour la commande avec l'ID de la session
    await supabase
      .from('orders')
      .update({ payment_intent_id: session.payment_intent })
      .eq('id', pendingOrder.id);

    return NextResponse.json({ 
      orderId: pendingOrder.id,
      url: session.url 
    });
  } catch (error) {
    console.error('Erreur lors du processus de checkout:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Une erreur est survenue' },
      { status: 500 }
    );
  }
}
