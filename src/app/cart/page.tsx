'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AuthModal from '@/components/AuthModal';
import AddressModal from '@/components/AddressModal';
import { fetchCustomerProfile } from '@/lib/supabase/services/userService';

export default function CartPage() {
  const { cart, isLoading, total, removeFromCart, updateQuantity, clearCart, createCheckoutSession } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [hasAddress, setHasAddress] = useState(false);
  const router = useRouter();
  const { user } = useAuth();
  
  const shippingCost = cart.length > 0 ? 4.99 : 0;
  const subtotal = total;
  const totalWithShipping = subtotal + shippingCost;

  // Vérifier si l'utilisateur a une adresse renseignée
  useEffect(() => {
    const checkUserAddress = async () => {
      if (user) {
        try {
          const profile = await fetchCustomerProfile(user.id);
          // Vérifier si les champs d'adresse obligatoires sont remplis
          if (profile && profile.address_line1 && profile.city && profile.postal_code) {
            setHasAddress(true);
          } else {
            setHasAddress(false);
          }
        } catch (error) {
          console.error('Erreur lors de la vérification de l\'adresse:', error);
          setHasAddress(false);
        }
      }
    };
    
    checkUserAddress();
  }, [user]);

  // Fonction pour procéder au paiement
  const handleCheckout = async () => {
    // Vérifier si l'utilisateur est connecté
    if (!user) {
      // Ouvrir le modal d'authentification si l'utilisateur n'est pas connecté
      setIsAuthModalOpen(true);
      return;
    }
    
    // Vérifier si l'utilisateur a une adresse renseignée
    if (!hasAddress) {
      // Ouvrir le modal d'adresse si l'utilisateur n'a pas d'adresse
      setIsAddressModalOpen(true);
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Créer une session de paiement Stripe
      const response = await createCheckoutSession();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Rediriger vers la page de paiement Stripe
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors du checkout:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Fonction appelée après une authentification réussie
  const handleAuthSuccess = async () => {
    setIsAuthModalOpen(false);
    
    // Vérifier si l'utilisateur a une adresse renseignée
    if (!hasAddress) {
      // Ouvrir le modal d'adresse si l'utilisateur n'a pas d'adresse
      setIsAddressModalOpen(true);
      return;
    }
    
    try {
      setIsProcessing(true);
      
      // Créer une session de paiement Stripe directement sans rappeler handleCheckout
      const response = await createCheckoutSession();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Rediriger vers la page de paiement Stripe
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors du checkout après authentification:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Fonction appelée après l'enregistrement réussi de l'adresse
  const handleAddressSuccess = async () => {
    setIsAddressModalOpen(false);
    setHasAddress(true);
    
    try {
      setIsProcessing(true);
      
      // Créer une session de paiement Stripe
      const response = await createCheckoutSession();
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      // Rediriger vers la page de paiement Stripe
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('URL de paiement non reçue');
      }
    } catch (error) {
      console.error('Erreur lors du checkout après enregistrement de l\'adresse:', error);
      alert(error instanceof Error ? error.message : 'Une erreur est survenue lors de la création de la session de paiement.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement de votre panier...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Votre Panier Smiletext</h1>
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-600 mb-6">Votre panier est vide</p>
          <Link href="/products" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded">
            Découvrir nos produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Votre Panier</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Liste des articles */}
          <div className="lg:col-span-3 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-5 border-b border-gray-200 bg-indigo-50">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-bold text-indigo-900">Articles ({cart.length})</h2>
                  <button 
                    onClick={clearCart}
                    className="text-sm text-red-600 hover:text-red-800 flex items-center transition-colors font-bold"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Vider le panier
                  </button>
                </div>
              </div>
              
              {/* Liste des produits */}
              {cart.map((item) => (
                <div key={item.id} className="border-b border-gray-200 last:border-0 p-4 sm:p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-start">
                    {/* Image du produit - Taille adaptée et centrée sur mobile */}
                    <div className="relative h-32 w-32 mx-auto sm:mx-0 sm:h-28 sm:w-28 rounded-lg overflow-hidden mb-4 sm:mb-0 sm:mr-5 flex-shrink-0 border border-gray-200 shadow-sm">
                      <Image
                        src={item.imageUrl || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      {/* Informations produit - Réorganisées pour mobile */}
                      <div className="flex flex-col sm:flex-row sm:justify-between">
                        <div className="text-center sm:text-left mb-2 sm:mb-0">
                          <h3 className="text-lg font-bold text-gray-900">{item.name}</h3>
                          <p className="mt-1 text-sm text-gray-800">
                            {item.color && item.size && (
                              <span className="font-semibold">
                                {item.color}, {item.size}
                              </span>
                            )}
                          </p>
                        </div>
                        <p className="text-lg font-bold text-indigo-700 text-center sm:text-right mb-4 sm:mb-0">{item.price.toFixed(2)} €</p>
                      </div>
                      
                      {/* Contrôles de quantité et bouton supprimer - Réorganisés pour mobile */}
                      <div className="mt-3 sm:mt-5 flex flex-col sm:flex-row justify-center sm:justify-between items-center space-y-4 sm:space-y-0">
                        <div className="flex items-center border-2 border-indigo-200 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            className="px-4 py-2 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            aria-label="Diminuer la quantité"
                          >
                            <span className="font-bold text-lg">-</span>
                          </button>
                          <span className="px-4 py-2 text-gray-900 font-bold text-lg border-l border-r border-indigo-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-4 py-2 text-indigo-700 hover:bg-indigo-100 transition-colors"
                            aria-label="Augmenter la quantité"
                          >
                            <span className="font-bold text-lg">+</span>
                          </button>
                        </div>
                        
                        <div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-base font-bold text-indigo-700 hover:text-indigo-900 transition-colors flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Résumé de la commande */}
          <div className="lg:col-span-1 order-1 lg:order-2 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-5 sticky top-6">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Résumé de la commande</h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <p className="text-gray-800 font-medium">Sous-total</p>
                  <p className="text-gray-900 font-bold">{subtotal.toFixed(2)} €</p>
                </div>
                
                <div className="flex justify-between">
                  <p className="text-gray-800 font-medium">Frais de livraison</p>
                  <p className="text-gray-900 font-bold">{shippingCost.toFixed(2)} €</p>
                </div>
                
                <div className="border-t-2 border-gray-200 pt-4 flex justify-between">
                  <p className="text-xl font-bold text-gray-900">Total</p>
                  <p className="text-xl font-bold text-indigo-700">{totalWithShipping.toFixed(2)} €</p>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full mt-6 py-4 px-4 rounded-lg font-bold text-lg text-white transition-all ${
                  isProcessing ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-700 hover:bg-indigo-800 shadow-lg hover:shadow-xl'
                }`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Traitement en cours...
                  </span>
                ) : (
                  'Procéder au paiement'
                )}
              </button>
              
              <div className="mt-6">
                <Link
                  href="/products"
                  className="flex items-center justify-center text-base font-bold text-indigo-700 hover:text-indigo-900 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continuer vos achats
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Modal d'authentification */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={handleAuthSuccess} 
      />
      
      {/* Modal d'adresse */}
      <AddressModal 
        isOpen={isAddressModalOpen} 
        onClose={() => setIsAddressModalOpen(false)} 
        onSuccess={handleAddressSuccess} 
      />
    </div>
  );
}
