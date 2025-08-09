import { supabase } from './supabase/client';
import { CartItem, Cart } from '@/types/cart';

// Fonction pour obtenir l'ID du panier actuel
export const getCurrentCartId = async (userId?: string): Promise<string | null> => {
  if (userId) {
    const { data: cart } = await supabase
      .from('carts')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    return cart?.id || null;
  }
  return null;
};

// Fonction pour créer un nouveau panier
export const createCart = async (userId?: string) => {
  const { data: cart, error } = await supabase
    .from('carts')
    .insert({
      user_id: userId,
      session_id: !userId ? crypto.randomUUID() : null
    })
    .select()
    .single();

  if (error) throw error;
  return cart;
};

// Fonction pour ajouter un article au panier
export const addToCart = async (item: CartItem, userId?: string) => {
  // Sauvegarder dans le localStorage pour les utilisateurs non connectés
  const localCart = await getLocalCart();
  const existingItemIndex = localCart.findIndex(
    (cartItem: CartItem) => 
      cartItem.productId === item.productId && 
      cartItem.size === item.size && 
      cartItem.color === item.color &&
      JSON.stringify(cartItem.customization) === JSON.stringify(item.customization)
  );

  if (existingItemIndex !== -1) {
    localCart[existingItemIndex].quantity += item.quantity;
  } else {
    localCart.push(item);
  }
  saveCart(localCart);

  // Si l'utilisateur est connecté, synchroniser avec Supabase
  if (userId) {
    try {
      let cartId = await getCurrentCartId(userId);
      if (!cartId) {
        const cart = await createCart(userId);
        cartId = cart.id;
      }

      // Vérifier si l'article existe déjà dans le panier Supabase
      const { data: existingItems } = await supabase
        .from('cart_items')
        .select('*')
        .eq('cart_id', cartId)
        .eq('product_id', item.productId)
        .eq('product_variant_id', item.variantId);

      if (existingItems && existingItems.length > 0) {
        // Mettre à jour la quantité
        await supabase
          .from('cart_items')
          .update({ quantity: existingItems[0].quantity + item.quantity })
          .eq('id', existingItems[0].id);
      } else {
        // Ajouter le nouvel article
        await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: item.productId,
            product_variant_id: item.variantId,
            quantity: item.quantity,
            customization_data: item.customization || null
          });
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation avec Supabase:', error);
    }
  }

  return localCart;
};

// Fonction pour récupérer le panier local
export const getLocalCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const cartString = localStorage.getItem('cart');
  return cartString ? JSON.parse(cartString) : [];
};

// Fonction pour récupérer le panier
export const getCart = async (userId?: string): Promise<CartItem[]> => {

  // Si l'utilisateur n'est pas connecté, retourner le panier local
  if (!userId) return getLocalCart();

  try {
    // Récupérer le panier depuis Supabase
    let cartId = await getCurrentCartId(userId);
    if (!cartId) {
      const cart = await createCart(userId);
      cartId = cart.id;
    }

    const { data: cartItems, error } = await supabase
      .from('cart_items')
      .select(`
        *,
        product:products(*),
        variant:product_variants(*)
      `)
      .eq('cart_id', cartId);

    if (error) throw error;

    // Convertir les items Supabase en format CartItem
    const items: CartItem[] = cartItems.map((item: any) => ({
      id: item.id,
      productId: item.product_id,
      variantId: item.product_variant_id,
      name: item.product.name,
      price: item.variant.price || item.product.base_price,
      quantity: item.quantity,
      size: item.variant.size,
      color: item.variant.color,
      imageUrl: item.product.image_url,
      customization: item.customization_data
    }));

    // Mettre à jour le localStorage avec les données de Supabase
    saveCart(items);
    return items;
  } catch (error) {
    console.error('Erreur lors de la récupération du panier:', error);
    return getLocalCart();
  }
};

// Fonction pour sauvegarder le panier
export const saveCart = (cart: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
    // Déclencher un événement personnalisé pour notifier les autres composants
    const event = new CustomEvent('cartUpdated', { detail: cart });
    window.dispatchEvent(event);
  }
};

// Fonction pour supprimer un article du panier
export const removeFromCart = async (itemId: string, userId?: string) => {
  // Mettre à jour le localStorage
  const localCart = await getLocalCart();
  const updatedCart = localCart.filter((item: CartItem) => item.id !== itemId);
  
  // Enregistrer le panier mis à jour et déclencher l'événement
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Déclencher explicitement l'événement pour notifier les composants
    const event = new CustomEvent('cartUpdated', { detail: updatedCart });
    window.dispatchEvent(event);
    
    // Log pour débogage
    console.log('Cart updated after removal:', updatedCart);
  }

  // Si l'utilisateur est connecté, supprimer de Supabase
  if (userId) {
    try {
      await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
    }
  }

  return updatedCart;
};

// Fonction pour mettre à jour la quantité d'un article
export const updateCartItemQuantity = async (itemId: string, quantity: number, userId?: string) => {
  // Mettre à jour le localStorage
  const localCart = await getLocalCart();
  const updatedCart = localCart.map((item: CartItem) => {
    if (item.id === itemId) {
      return { ...item, quantity: Math.max(1, quantity) };
    }
    return item;
  });
  
  // Enregistrer le panier mis à jour et déclencher l'événement
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Déclencher explicitement l'événement pour notifier les composants
    const event = new CustomEvent('cartUpdated', { detail: updatedCart });
    window.dispatchEvent(event);
    
    // Log pour débogage
    console.log('Cart updated after quantity change:', updatedCart);
  }

  // Si l'utilisateur est connecté, mettre à jour dans Supabase
  if (userId) {
    try {
      await supabase
        .from('cart_items')
        .update({ quantity: Math.max(1, quantity) })
        .eq('id', itemId);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
    }
  }

  return updatedCart;
};

// Fonction pour calculer le total du panier
export const calculateCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Fonction pour vider le panier
export const clearCart = async (userId?: string) => {
  // Vider complètement le localStorage
  if (typeof window !== 'undefined') {
    // D'abord supprimer la clé pour s'assurer qu'aucune donnée ne persiste
    localStorage.removeItem('cart');
    // Puis définir un tableau vide
    localStorage.setItem('cart', JSON.stringify([]));
    
    // Déclencher explicitement l'événement pour notifier les composants
    // avec un tableau vide pour indiquer que le panier est vide
    const event = new CustomEvent('cartUpdated', { detail: [] });
    window.dispatchEvent(event);
    
    // Log pour débogage
    console.log('Cart completely cleared from cart.ts');
  }

  // Si l'utilisateur est connecté, vider le panier dans Supabase
  if (userId) {
    try {
      const cartId = await getCurrentCartId(userId);
      if (cartId) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('cart_id', cartId);
        console.log('Supabase cart items deleted for cart ID:', cartId);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
    }
  }

  return [];
};
