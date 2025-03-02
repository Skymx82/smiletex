'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
export type CartItem = {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  imageUrl?: string;
  customization?: {
    text?: string;
    textColor?: string;
    font?: string;
    imageUrl?: string;
    position?: { x: number; y: number };
    scale?: number;
    rotation?: number;
  };
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemsCount: number;
  subtotal: number;
  getGroupedItems: () => { [productId: string]: CartItem[] };
  getGroupedItemsBySize: () => { [productId: string]: { [size: string]: CartItem[] } };
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error('Failed to parse cart from localStorage', error);
        }
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = (newItem: CartItem) => {
    setItems((prevItems) => {
      // Check if item already exists with the same ID, variant, and customization
      const existingItemIndex = prevItems.findIndex(
        (item) => 
          item.productId === newItem.productId && 
          item.variantId === newItem.variantId &&
          JSON.stringify(item.customization) === JSON.stringify(newItem.customization)
      );

      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        return updatedItems;
      } else {
        // Add new item
        return [...prevItems, { ...newItem, id: newItem.id || crypto.randomUUID() }];
      }
    });
  };

  const addItems = (newItems: CartItem[]) => {
    if (!newItems || newItems.length === 0) return;
    
    setItems((prevItems) => {
      const updatedItems = [...prevItems];
      
      newItems.forEach(newItem => {
        // Check if item already exists with the same ID, variant, and customization
        const existingItemIndex = updatedItems.findIndex(
          (item) => 
            item.productId === newItem.productId && 
            item.variantId === newItem.variantId &&
            item.size === newItem.size &&
            item.color === newItem.color &&
            JSON.stringify(item.customization) === JSON.stringify(newItem.customization)
        );

        if (existingItemIndex !== -1) {
          // Update quantity if item exists
          updatedItems[existingItemIndex].quantity += newItem.quantity;
        } else {
          // Add new item
          updatedItems.push({ ...newItem, id: newItem.id || crypto.randomUUID() });
        }
      });
      
      return updatedItems;
    });
  };

  const removeItem = (id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Group items by product ID for displaying multiple variants of the same product
  const getGroupedItems = () => {
    const groupedItems: { [productId: string]: CartItem[] } = {};
    
    items.forEach(item => {
      if (!groupedItems[item.productId]) {
        groupedItems[item.productId] = [];
      }
      groupedItems[item.productId].push(item);
    });
    
    return groupedItems;
  };

  // Group items by product ID and size for displaying multiple variants of the same product
  const getGroupedItemsBySize = () => {
    const groupedItems: { [productId: string]: { [size: string]: CartItem[] } } = {};
    
    items.forEach(item => {
      if (!groupedItems[item.productId]) {
        groupedItems[item.productId] = {};
      }
      
      const size = item.size || 'default';
      
      if (!groupedItems[item.productId][size]) {
        groupedItems[item.productId][size] = [];
      }
      
      groupedItems[item.productId][size].push(item);
    });
    
    return groupedItems;
  };

  // Calculate total number of items
  const itemsCount = items.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        addItems,
        removeItem,
        updateQuantity,
        clearCart,
        itemsCount,
        subtotal,
        getGroupedItems,
        getGroupedItemsBySize,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
