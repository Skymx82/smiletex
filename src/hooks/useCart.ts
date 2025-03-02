'use client';

import { useState, useEffect } from 'react';
import { 
  CartItem, 
  addToCart as addToCartUtil, 
  getCart as getCartUtil, 
  removeFromCart as removeFromCartUtil,
  updateCartItemQuantity as updateCartItemQuantityUtil,
  clearCart as clearCartUtil,
  calculateCartTotal
} from '@/lib/cart';

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Initialiser le panier au chargement
  useEffect(() => {
    const initCart = () => {
      const cartItems = getCartUtil();
      setCart(cartItems);
      setTotal(calculateCartTotal(cartItems));
      setIsLoading(false);
    };

    initCart();
  }, []);

  // Ajouter un article au panier
  const addToCart = (item: CartItem) => {
    const updatedCart = addToCartUtil(item);
    setCart(updatedCart);
    setTotal(calculateCartTotal(updatedCart));
    return updatedCart;
  };

  // Supprimer un article du panier
  const removeFromCart = (itemId: string) => {
    const updatedCart = removeFromCartUtil(itemId);
    setCart(updatedCart);
    setTotal(calculateCartTotal(updatedCart));
    return updatedCart;
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = (itemId: string, quantity: number) => {
    const updatedCart = updateCartItemQuantityUtil(itemId, quantity);
    setCart(updatedCart);
    setTotal(calculateCartTotal(updatedCart));
    return updatedCart;
  };

  // Vider le panier
  const clearCart = () => {
    const emptyCart = clearCartUtil();
    setCart(emptyCart);
    setTotal(0);
    return emptyCart;
  };

  // Créer une session de paiement Stripe
  const createCheckoutSession = async (userId?: string, shippingDetails?: any) => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cart,
          userId,
          shippingDetails,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors de la création de la session de paiement');
      }

      return data;
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
