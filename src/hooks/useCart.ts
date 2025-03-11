'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@supabase/auth-helpers-react';
import { 
  addToCart as addToCartUtil, 
  getCart as getCartUtil, 
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  clearCart as clearCartUtil,
  calculateCartTotal
} from '@/lib/cart';
import { CartItem, CartResponse } from '@/types/cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const user = useUser();

  // Initialiser le panier au chargement
  useEffect(() => {
    const initCart = async () => {
      try {
        const cartItems = await getCartUtil(user?.id);
        setCart(cartItems);
        setTotal(calculateCartTotal(cartItems));
      } catch (error) {
        console.error('Erreur lors de l\'initialisation du panier:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initCart();
  }, [user?.id]);

  // Ajouter un article au panier
  const addToCart = async (item: CartItem) => {
    try {
      const updatedCart = await addToCartUtil(item, user?.id);
      setCart(updatedCart);
      setTotal(calculateCartTotal(updatedCart));
      return updatedCart;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    }
  };

  // Supprimer un article du panier
  const removeFromCart = async (itemId: string) => {
    try {
      const updatedCart = await removeFromCartUtil(itemId, user?.id);
      setCart(updatedCart);
      setTotal(calculateCartTotal(updatedCart));
      return updatedCart;
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    }
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const updatedCart = await updateCartItemQuantityUtil(itemId, quantity, user?.id);
      setCart(updatedCart);
      setTotal(calculateCartTotal(updatedCart));
      return updatedCart;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la quantité:', error);
      throw error;
    }
  };

  // Vider le panier
  const clearCart = async () => {
    try {
      const emptyCart = await clearCartUtil(user?.id);
      setCart(emptyCart);
      setTotal(0);
      return emptyCart;
    } catch (error) {
      console.error('Erreur lors de la suppression du panier:', error);
      throw error;
    }
  };

  // Créer une session de paiement Stripe
  const createCheckoutSession = async (shippingDetails?: any): Promise<CartResponse> => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          userId: user?.id,
          shippingDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de la création de la session de paiement');
      }

      return data as CartResponse;
    } catch (error) {
      console.error('Erreur lors de la création de la session de paiement:', error);
      throw error;
    }
  };

  return {
    cart,
    isLoading,
    total,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    createCheckoutSession,
    itemCount: cart.reduce((count, item) => count + item.quantity, 0),
  };
}
