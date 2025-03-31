import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { sendOrderConfirmationEmail } from '@/lib/email/mailer';

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
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['customer_details'],
    });
    
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
    const updateData: { status: string; user_id?: string } = { status: 'pending' };
    
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

    // Récupérer les détails de la commande pour l'email
    try {
      // Récupérer les articles de la commande
      const { data: orderItems } = await supabase
        .from('order_items')
        .select(`
          *,
          product:products(name, image_url)
        `)
        .eq('order_id', orderId);

      // Récupérer les informations de l'utilisateur
      let userEmail = '';
      let customerName = '';

      console.log('Récupération des informations utilisateur pour l\'ID:', order.user_id);

      if (order.user_id) {
        // Récupérer l'email de l'utilisateur depuis la table auth.users
        const { data: userData, error: userError } = await supabase.auth
          .admin
          .getUserById(order.user_id);

        if (userError) {
          console.error('Erreur lors de la récupération de l\'utilisateur:', userError);
        }

        if (userData?.user?.email) {
          userEmail = userData.user.email;
          console.log('Email utilisateur trouvé:', userEmail);
        } else {
          console.log('Aucun email trouvé dans auth.users, tentative avec la table users');
          // Essayer avec la table users si elle existe
          const { data: userRecord, error: userRecordError } = await supabase
            .from('users')
            .select('email')
            .eq('id', order.user_id)
            .single();

          if (userRecordError) {
            console.error('Erreur lors de la récupération depuis users:', userRecordError);
          }

          if (userRecord?.email) {
            userEmail = userRecord.email;
            console.log('Email utilisateur trouvé dans la table users:', userEmail);
          }
        }

        // Récupérer le profil client
        const { data: profile, error: profileError } = await supabase
          .from('customer_profiles')
          .select('first_name, last_name, email')
          .eq('id', order.user_id)
          .single();

        if (profileError) {
          console.error('Erreur lors de la récupération du profil client:', profileError);
        }

        if (profile) {
          customerName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          console.log('Nom du client trouvé:', customerName);
          
          // Si nous n'avons toujours pas d'email, essayer avec celui du profil
          if (!userEmail && profile.email) {
            userEmail = profile.email;
            console.log('Email trouvé dans le profil client:', userEmail);
          }
        }
      }
      
      // Si nous n'avons toujours pas d'email, essayer de le récupérer depuis les métadonnées de la session Stripe
      if (!userEmail && session.customer_details?.email) {
        userEmail = session.customer_details.email;
        console.log('Email récupéré depuis Stripe:', userEmail);
        
        // Si nous n'avons pas de nom client, utiliser celui de Stripe
        if (!customerName && session.customer_details?.name) {
          customerName = session.customer_details.name;
          console.log('Nom du client récupéré depuis Stripe:', customerName);
        }
      }

      // Si nous avons un email utilisateur, envoyer l'email de confirmation
      if (userEmail) {
        try {
          const formattedItems = orderItems?.map(item => ({
            name: item.product?.name || 'Produit',
            quantity: item.quantity,
            price: item.price_per_unit,
            size: item.variant?.size,
            color: item.variant?.color,
          })) || [];

          console.log('Envoi de l\'email de confirmation à:', userEmail);
          console.log('Articles formatés:', JSON.stringify(formattedItems, null, 2));

          const emailResult = await sendOrderConfirmationEmail(userEmail, {
            orderId: orderId,
            items: formattedItems,
            total: order.total_amount,
            shippingCost: order.shipping_cost || 4.99,
            customerName: customerName || undefined,
          });

          if (emailResult) {
            console.log('Email de confirmation envoyé avec succès à:', userEmail);
          } else {
            console.error('Erreur lors de l\'envoi de l\'email de confirmation');
          }
        } catch (emailSendError) {
          console.error('Exception lors de l\'envoi de l\'email:', emailSendError);
        }
      } else {
        console.log('Pas d\'email utilisateur trouvé pour envoyer la confirmation');
      }
    } catch (emailError) {
      // Ne pas bloquer le processus si l'envoi d'email échoue
      console.error('Erreur lors de l\'envoi de l\'email de confirmation:', emailError);
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
