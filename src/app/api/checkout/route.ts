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
    
    // Variables pour le type de livraison
    const hasUrgentShipping = items.some(item => item.shippingType === 'urgent');
    const hasFastShipping = items.some(item => item.shippingType === 'fast');
    
    console.log('Checkout request body:', { items: items.length, userId });

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

    // Déterminer le type de livraison et les frais associés
    const getShippingCost = () => {
      if (items.length === 0) return { cost: 0, name: 'Frais de livraison', unit_amount: 0 };
      
      // Vérifier si au moins un article a un type de livraison spécifique
      const hasUrgentShipping = items.some(item => item.shippingType === 'urgent');
      const hasFastShipping = items.some(item => item.shippingType === 'fast');
      
      if (hasUrgentShipping) {
        return { 
          cost: 14.99, 
          name: 'Livraison express (1 semaine)',
          unit_amount: 1499
        };
      }
      if (hasFastShipping) {
        return { 
          cost: 9.99, 
          name: 'Livraison prioritaire (2 semaines)',
          unit_amount: 999
        };
      }
      return { 
        cost: 4.99, 
        name: 'Livraison classique (3 semaines)',
        unit_amount: 499
      };
    };
    
    const shippingInfo = getShippingCost();
    
    // Ajouter les frais de livraison
    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: {
          name: shippingInfo.name,
        },
        unit_amount: shippingInfo.unit_amount,
      },
      quantity: 1,
    });

    // Créer une commande non payée dans Supabase
    const orderData = {
      user_id: userId || null,
      status: 'unpaid',
      total_amount: items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0) + shippingInfo.cost,
      shipping_cost: shippingInfo.cost,
      shipping_type: hasUrgentShipping ? 'urgent' : hasFastShipping ? 'fast' : 'normal'
    };
    
    console.log('Creating order with data:', orderData);
    
    const { data: unpaidOrder, error: orderError } = await supabase
      .from('orders')
      .insert(orderData)
      .select()
      .single();
      
    console.log('Created unpaid order:', unpaidOrder);
    console.log('Order error:', orderError);

    if (orderError) throw orderError;

    // Créer les items de la commande
    const orderItems = items.map((item: CartItem) => ({
      order_id: unpaidOrder.id,
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

    // Créer une session de paiement Stripe avec une apparence personnalisée
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cart`,
      locale: 'fr',
      shipping_address_collection: {
        allowed_countries: ['FR', 'BE', 'LU', 'CH'],
      },
      custom_text: {
        shipping_address: {
          message: 'Nous livrons en France, Belgique, Luxembourg et Suisse uniquement.',
        },
        submit: {
          message: 'Nous traiterons votre commande dès réception du paiement. Pour toute question, contactez-nous au 06 41 32 35 04.',
        },
      },
      metadata: {
        orderId: unpaidOrder.id,
        userId: userId || 'guest'
      },
      payment_intent_data: {
        description: 'Commande Smiletex - Vêtements personnalisés',
        receipt_email: body.email,
      },
      customer_creation: 'always',
      // Personnalisation de l'apparence
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      // Utiliser les options standard de Stripe pour la personnalisation
      allow_promotion_codes: true,
    });

    // Mettre à jour la commande avec l'ID de la session
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ 
        payment_intent_id: session.payment_intent,
        user_id: userId || null // S'assurer que l'ID utilisateur est bien enregistré
      })
      .eq('id', unpaidOrder.id)
      .select();
      
    console.log('Updated order with payment intent:', updatedOrder);
    console.log('Update error:', updateError);

    return NextResponse.json({ 
      orderId: unpaidOrder.id,
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
