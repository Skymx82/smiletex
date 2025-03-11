'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { ProductCustomization } from '@/lib/customization';
import { calculateCustomizationPrice } from '@/lib/customization';

// Type pour un élément du panier
export type CartItem = {
  id: string;
  productId: string;
  variantId?: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl: string;
  customization?: ProductCustomization;
};

// Type pour le contexte du panier
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string, size?: string, color?: string, customization?: ProductCustomization) => void;
  updateQuantity: (itemId: string, quantity: number, size?: string, color?: string, customization?: ProductCustomization) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  itemCount: number;
};

// Créer le contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte du panier
export const useCartContext = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCartContext doit être utilisé à l\'intérieur d\'un CartProvider');
  }
  return context;
};

// Générer une clé unique pour un élément du panier
const getCartItemKey = (item: CartItem): string => {
  let key = `${item.id}-${item.size || 'default'}-${item.color || 'default'}`;
  
  // Si l'élément a une personnalisation, ajouter un identifiant unique
  if (item.customization) {
    key += `-custom-${Date.now()}`;
  }
  
  return key;
};

// Vérifier si deux éléments du panier sont identiques (même produit, taille, couleur et sans personnalisation)
const areItemsEqual = (item1: CartItem, item2: CartItem): boolean => {
  // Si l'un des éléments a une personnalisation, ils ne sont jamais considérés comme identiques
  if (item1.customization || item2.customization) {
    return false;
  }
  
  return (
    item1.id === item2.id &&
    item1.size === item2.size &&
    item1.color === item2.color
  );
};

// Composant Provider
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);
  const [itemCount, setItemCount] = useState(0);

  // Charger le panier depuis le localStorage au chargement
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Erreur lors du chargement du panier:', error);
      }
    }
  }, []);

  // Mettre à jour le localStorage lorsque le panier change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Calculer le nombre total d'articles
    const count = cartItems.reduce((total, item) => total + item.quantity, 0);
    setCartCount(count);
    
    // Calculer le prix total
    const total = cartItems.reduce((sum, item) => {
      let itemPrice = item.price;
      
      // Ajouter le prix de la personnalisation si elle existe
      if (item.customization) {
        itemPrice += calculateCustomizationPrice(item.customization);
      }
      
      return sum + (itemPrice * item.quantity);
    }, 0);
    setCartTotal(total);
    
    // Calculer le nombre d'articles
    const items = cartItems.reduce((total, item) => total + 1, 0);
    setItemCount(items);
  }, [cartItems]);

  // Ajouter un article au panier
  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      // Chercher si l'article existe déjà dans le panier
      const existingItemIndex = prevItems.findIndex(
        prevItem => areItemsEqual(prevItem, item)
      );

      if (existingItemIndex >= 0) {
        // Si l'article existe, mettre à jour la quantité
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += item.quantity;
        return updatedItems;
      } else {
        // Sinon, ajouter le nouvel article
        return [...prevItems, { ...item }];
      }
    });
  };

  // Supprimer un article du panier
  const removeFromCart = (itemId: string, size?: string, color?: string, customization?: ProductCustomization) => {
    setCartItems(prevItems => {
      if (customization) {
        // Pour les articles personnalisés, supprimer l'article exact
        return prevItems.filter(item => 
          !(item.id === itemId && 
            item.size === size && 
            item.color === color && 
            item.customization === customization)
        );
      } else {
        // Pour les articles standard, supprimer en fonction de l'ID, de la taille et de la couleur
        return prevItems.filter(item => 
          !(item.id === itemId && 
            item.size === size && 
            item.color === color && 
            !item.customization)
        );
      }
    });
  };

  // Mettre à jour la quantité d'un article
  const updateQuantity = (itemId: string, quantity: number, size?: string, color?: string, customization?: ProductCustomization) => {
    setCartItems(prevItems => {
      return prevItems.map(item => {
        if (customization) {
          // Pour les articles personnalisés, mettre à jour l'article exact
          if (item.id === itemId && 
              item.size === size && 
              item.color === color && 
              item.customization === customization) {
            return { ...item, quantity };
          }
        } else {
          // Pour les articles standard, mettre à jour en fonction de l'ID, de la taille et de la couleur
          if (item.id === itemId && 
              item.size === size && 
              item.color === color && 
              !item.customization) {
            return { ...item, quantity };
          }
        }
        return item;
      });
    });
  };

  // Vider le panier
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
