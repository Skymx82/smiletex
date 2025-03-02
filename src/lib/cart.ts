// Types pour le panier
export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  imageUrl: string;
}

// Fonction pour ajouter un article au panier
export const addToCart = (item: CartItem) => {
  // Récupérer le panier actuel du localStorage
  const cart = getCart();
  
  // Vérifier si l'article existe déjà dans le panier (même produit, taille et couleur)
  const existingItemIndex = cart.findIndex(
    (cartItem) => 
      cartItem.productId === item.productId && 
      cartItem.size === item.size && 
      cartItem.color === item.color
  );

  if (existingItemIndex !== -1) {
    // Si l'article existe, augmenter la quantité
    cart[existingItemIndex].quantity += item.quantity;
  } else {
    // Sinon, ajouter le nouvel article
    cart.push(item);
  }

  // Sauvegarder le panier mis à jour
  saveCart(cart);
  return cart;
};

// Fonction pour récupérer le panier
export const getCart = (): CartItem[] => {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const cartString = localStorage.getItem('cart');
  return cartString ? JSON.parse(cartString) : [];
};

// Fonction pour sauvegarder le panier
export const saveCart = (cart: CartItem[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
};

// Fonction pour supprimer un article du panier
export const removeFromCart = (itemId: string) => {
  const cart = getCart();
  const updatedCart = cart.filter((item) => item.id !== itemId);
  saveCart(updatedCart);
  return updatedCart;
};

// Fonction pour mettre à jour la quantité d'un article
export const updateCartItemQuantity = (itemId: string, quantity: number) => {
  const cart = getCart();
  const updatedCart = cart.map((item) => {
    if (item.id === itemId) {
      return { ...item, quantity: Math.max(1, quantity) };
    }
    return item;
  });
  saveCart(updatedCart);
  return updatedCart;
};

// Fonction pour calculer le total du panier
export const calculateCartTotal = (cart: CartItem[]) => {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
};

// Fonction pour vider le panier
export const clearCart = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('cart');
  }
  return [];
};
