'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProduct, useStockCheck, useCategories, useAllProducts } from '@/hooks/useProducts';
import { useCartContext } from '@/components/CartProvider';
import CustomizationModal from '@/components/CustomizationModal';
import { ProductCustomization } from '@/types/customization';
import { Product } from '@/lib/products';
import { isCustomizationComplete } from '@/lib/customization';

// Fonction pour obtenir une description du grammage
function getGrammageDescription(gsm: number): string {
  if (gsm < 140) {
    return "Tissu léger, parfait pour les t-shirts d'été et vêtements fins.";
  } else if (gsm >= 140 && gsm < 180) {
    return "Grammage standard offrant un bon équilibre entre confort et durabilité.";
  } else if (gsm >= 180 && gsm < 220) {
    return "Tissu de qualité supérieure, durable et confortable pour un usage quotidien.";
  } else {
    return "Textile épais et robuste, idéal pour les sweatshirts et vêtements d'hiver.";
  }
}

// Type pour stocker les quantités par taille
type SizeQuantities = {
  [size: string]: number;
};

export default function ProductDetail({ id }: { id: string }) {
  const { product, loading, error } = useProduct(id);
  const { categories } = useCategories();
  const { products } = useAllProducts();
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const { addToCart } = useCartContext();
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [stockError, setStockError] = useState('');
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  // Personnalisation toujours visible par défaut
  const [showEmbeddedCustomization, setShowEmbeddedCustomization] = useState(true);
  const [customizationData, setCustomizationData] = useState<ProductCustomization | null>(null);
  // État pour stocker le prix supplémentaire dû aux personnalisations
  const [customizationPrice, setCustomizationPrice] = useState<number>(0);
  // État pour la modale de confirmation
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  // État pour suivre si la personnalisation a été modifiée mais pas enregistrée
  const [isCustomizationModified, setIsCustomizationModified] = useState(false);

  // Récupérer les produits similaires (même catégorie, mais pas le même produit)
  useEffect(() => {
    if (product && products && products.length > 0) {
      // Filtrer les produits de la même catégorie, mais pas le produit actuel
      const similar = products
        .filter(p => p.category_id === product.category_id && p.id !== product.id)
        .slice(0, 3); // Limiter à 3 produits similaires
      
      setSimilarProducts(similar);
    }
  }, [product, products]);

  // Sélectionner automatiquement la première couleur disponible
  useEffect(() => {
    if (product && product.variants && product.variants.length > 0) {
      // Obtenir les couleurs uniques
      const uniqueColors = [...new Set(product.variants.map(v => v.color))];
      
      // Sélectionner la première couleur
      if (uniqueColors.length > 0 && !selectedColor) {
        setSelectedColor(uniqueColors[0]);
      }
      
      // Initialiser les quantités à 0 pour toutes les tailles
      if (product.variants.length > 0) {
        const uniqueSizes = [...new Set(product.variants.map(v => v.size))];
        const initialSizeQuantities: SizeQuantities = {};
        uniqueSizes.forEach(size => {
          initialSizeQuantities[size] = 0;
        });
        setSizeQuantities(initialSizeQuantities);
      }
    }
  }, [product, selectedColor]);

  // Fonction pour augmenter la quantité d'une taille
  const increaseQuantity = (size: string) => {
    // Vérifier le stock disponible
    const variant = product?.variants?.find(
      v => v.size === size && v.color === selectedColor
    );
    
    if (!variant) return;
    
    const currentQuantity = sizeQuantities[size] || 0;
    
    // Vérifier si on peut augmenter la quantité
    if (currentQuantity < variant.stock_quantity) {
      setSizeQuantities(prev => ({
        ...prev,
        [size]: currentQuantity + 1
      }));
      setStockError('');
    } else {
      setStockError(`Stock insuffisant pour la taille ${size}. Maximum: ${variant.stock_quantity}`);
    }
  };

  // Fonction pour diminuer la quantité d'une taille
  const decreaseQuantity = (size: string) => {
    const currentQuantity = sizeQuantities[size] || 0;
    
    if (currentQuantity > 0) {
      setSizeQuantities(prev => ({
        ...prev,
        [size]: currentQuantity - 1
      }));
      setStockError('');
    }
  };

  // Fonction pour ajouter au panier
  const handleAddToCart = async () => {
    try {
      setIsAddingToCart(true);
      setStockError('');

      // Vérifier les stocks avant d'ajouter au panier
      for (const [size, quantity] of Object.entries(sizeQuantities)) {
        if (quantity > 0) {
          const variant = product?.variants?.find(
            v => v.size === size && v.color === selectedColor
          );

          if (variant) {
            if (variant.stock_quantity < quantity) {
              setStockError(`Stock insuffisant pour la taille ${size}. Disponible: ${variant.stock_quantity}`);
              return;
            }
          }
        }
      }

      // Ajouter chaque taille sélectionnée au panier
      for (const [size, quantity] of Object.entries(sizeQuantities)) {
        if (quantity > 0) {
          const variant = product?.variants?.find(
            v => v.size === size && v.color === selectedColor
          );

          if (variant && product) {
            // Créer un ID unique pour cet élément du panier
            const cartItemId = `${product.id}-${variant.id}-${Date.now()}`;
            
            addToCart({
              id: cartItemId,
              productId: product.id,
              variantId: variant.id,
              name: product.name,
              price: product.base_price + (variant.price_adjustment || 0),
              quantity: quantity,
              size: size,
              color: selectedColor,
              imageUrl: product.image_url || '/images/placeholder.jpg'
            });
          }
        }
      }

      // Réinitialiser les quantités
      const resetQuantities: SizeQuantities = {};
      Object.keys(sizeQuantities).forEach(size => {
        resetQuantities[size] = 0;
      });
      setSizeQuantities(resetQuantities);
      
      // Conserver la personnalisation et garder le panneau d'édition ouvert
      // pour permettre de la modifier immédiatement
      setShowEmbeddedCustomization(true);
      
      setAddedToCart(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setStockError('Une erreur est survenue lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };
  
  // Fonction pour ajouter au panier avec personnalisation
  const handleAddToCartWithCustomization = async (customizationData: ProductCustomization, price: number) => {
    // Mettre à jour le prix de personnalisation
    setCustomizationPrice(price);
    try {
      setIsAddingToCart(true);
      setStockError('');

      // Vérifier les stocks avant d'ajouter au panier
      for (const [size, quantity] of Object.entries(sizeQuantities)) {
        if (quantity > 0) {
          const variant = product?.variants?.find(
            v => v.size === size && v.color === selectedColor
          );

          if (variant) {
            if (variant.stock_quantity < quantity) {
              setStockError(`Stock insuffisant pour la taille ${size}. Disponible: ${variant.stock_quantity}`);
              return;
            }
          }
        }
      }

      // Ajouter chaque taille sélectionnée au panier avec personnalisation
      for (const [size, quantity] of Object.entries(sizeQuantities)) {
        if (quantity > 0) {
          const variant = product?.variants?.find(
            v => v.size === size && v.color === selectedColor
          );

          if (variant && product) {
            // Créer un ID unique pour cet élément du panier
            const cartItemId = `${product.id}-${variant.id}-${Date.now()}`;
            
            // Vérifier si la personnalisation est complète pour appliquer le prix
            const isPersonnalisationComplete = customizationData ? isCustomizationComplete(customizationData) : false;
            
            // Calculer le prix unitaire avec remise par quantité
            const { discountedPrice } = getQuantityDiscount(totalItemsSelected);
            const basePrice = discountPercent > 0 ? discountedPrice : product.base_price;
            
            // N'ajouter le prix de personnalisation que si elle est complète
            const finalPrice = basePrice + (variant.price_adjustment || 0) + 
                              (isPersonnalisationComplete ? customizationPrice : 0);
            
            addToCart({
              id: cartItemId,
              productId: product.id,
              variantId: variant.id,
              name: product.name,
              price: finalPrice,
              quantity: quantity,
              size: size,
              color: selectedColor,
              imageUrl: product.image_url || '/images/placeholder.jpg',
              customization: customizationData
            });
          }
        }
      }

      // Réinitialiser les quantités
      const resetQuantities: SizeQuantities = {};
      Object.keys(sizeQuantities).forEach(size => {
        resetQuantities[size] = 0;
      });
      setSizeQuantities(resetQuantities);
      
      // Conserver la personnalisation et garder le panneau d'édition ouvert
      // pour permettre de la modifier immédiatement
      setShowEmbeddedCustomization(true);
      
      setAddedToCart(true);
      
      // Masquer le message de succès après 3 secondes
      setTimeout(() => {
        setAddedToCart(false);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setStockError('Une erreur est survenue lors de l\'ajout au panier');
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Calculer le nombre total d'articles sélectionnés
  const totalItemsSelected = Object.values(sizeQuantities).reduce((sum, qty) => sum + qty, 0);
  
  // Calculer la remise en fonction de la quantité
  const getQuantityDiscount = (quantity: number): { discountPercent: number, discountedPrice: number } => {
    let discountPercent = 0;
    
    if (quantity >= 50) {
      discountPercent = 15; // 15% de remise pour 50 articles ou plus
    } else if (quantity >= 25) {
      discountPercent = 10; // 10% de remise pour 25 articles ou plus
    } else if (quantity >= 10) {
      discountPercent = 5; // 5% de remise pour 10 articles ou plus
    }
    
    const discountedPrice = product ? product.base_price * (1 - discountPercent / 100) : 0;
    
    return { discountPercent, discountedPrice };
  };
  
  // Obtenir la remise actuelle
  const { discountPercent, discountedPrice } = getQuantityDiscount(totalItemsSelected);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="w-full min-h-screen bg-white p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center justify-center">
          <p className="text-red-600">Erreur lors du chargement du produit. Veuillez réessayer plus tard.</p>
        </div>
      </div>
    );
  }

  // Extraire les tailles et couleurs uniques des variantes
  const uniqueSizes = [...new Set(product.variants?.map(v => v.size) || [])];
  const uniqueColors = [...new Set(product.variants?.map(v => v.color) || [])];

  return (
    <div className="w-full min-h-screen bg-white text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg overflow-hidden">
          <div className="relative md:flex md:gap-8">
            {/* Colonne de gauche fixe avec l'image */}
            <div className="md:w-2/5 lg:w-2/5 relative md:h-screen">
              <div className="sticky top-0 md:top-8 left-0 pt-4 md:pt-0">
                <div className="relative h-96 md:h-[70vh] max-h-[600px] rounded-lg overflow-hidden">
                  {/* Affichage de la catégorie en petit rectangle */}
                  {product.category_id && (
                    <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-md group hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300">
                      <span className="relative">
                        {(() => {
                          // Obtenir le nom de la catégorie à partir de l'ID
                          const category = categories.find(cat => cat.id === product.category_id);
                          return category ? category.name : 'Autre';
                        })()}
                      </span>
                    </div>
                  )}
                  <Image
                    src={product.image_url || '/images/placeholder.jpg'}
                    alt={product.name}
                    fill
                    style={{ objectFit: 'cover' }}
                    className="rounded-lg"
                    priority
                  />
                  
                  {/* Badge de personnalisation */}
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-md flex items-center group hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 cursor-pointer">
                    <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                    </svg>
                    <span className="relative">Personnalisable
                    </span>
                  </div>
                </div>
                
                {/* Prix et description - Au-dessus des informations supplémentaires */}
                <div className="mt-4 pt-2">
                  <h1 className="text-2xl font-bold mb-2 relative inline-block">
                    {product.name}
                    <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
                  </h1>
                  {/* Affichage du prix avec personnalisation */}
                  <div className="text-lg font-semibold text-indigo-700 mb-3 mt-4">
                    <div className="text-xl font-bold text-gray-900">
                      {(() => {
                        // Vérifier si la personnalisation est complète
                        const isPersonnalisationComplete = customizationData ? isCustomizationComplete(customizationData) : false;
                        
                        // N'ajouter le prix que si la personnalisation est complète
                        return (product.base_price + (isPersonnalisationComplete ? customizationPrice : 0)).toFixed(2);
                      })()} €
                    </div>
                    {customizationPrice > 0 && (
                      <div className="flex flex-col mt-1">
                        <p className="text-sm text-gray-700">
                          Prix de base: {product.base_price.toFixed(2)} €
                        </p>
                        <p className="text-sm text-indigo-600 font-medium">
                          + Personnalisation: {customizationPrice.toFixed(2)} €
                          {(() => {
                            // Vérifier si la personnalisation est complète
                            const isPersonnalisationComplete = customizationData ? isCustomizationComplete(customizationData) : false;
                            
                            // Afficher un message si la personnalisation n'est pas complète
                            return !isPersonnalisationComplete ? 
                              <span className="ml-2 text-xs text-gray-500">(appliqué seulement si complet)</span> : null;
                          })()} 
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-gray-500 mt-1">Prix TTC</p>
                  </div>
                  
                  <div className="mb-4">
                    <h2 className="text-md font-bold text-gray-800 mb-1">Description</h2>
                    <p className="text-sm text-gray-700">{product.description}</p>
                  </div>
                </div>
                
                {/* Informations supplémentaires - Maintenant sous l'image */}
                <div className="mt-4 border-t border-gray-200 pt-4">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 relative inline-block">
                    Informations produit
                    <span className="ml-1 relative inline-block text-indigo-600">
                      smiletex
                      <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                        <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
                      </svg>
                    </span>
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-md font-semibold mb-1">Grammage</h3>
                      <p className="text-sm text-gray-600">
                        {product.weight_gsm ? (
                          <>
                            <span className="font-bold">{product.weight_gsm} g/m²</span> - {getGrammageDescription(product.weight_gsm)}
                          </>
                        ) : '100% coton bio certifié, tissage de haute qualité pour une durabilité optimale.'}
                      </p>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold mb-1">Entretien</h3>
                      <p className="text-sm text-gray-600">
                        Lavage en machine à 30°C, ne pas utiliser d'eau de javel, séchage à basse température.
                      </p>
                    </div>

                    <div>
                      <h3 className="text-md font-semibold mb-1">Livraison</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>Livraison classique : 3 semaines</li>
                        <li>Livraison prioritaire : 2 semaines</li>
                        <li>Livraison express : 1 semaine (ou moins)</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Informations du produit - Colonne de droite qui défile */}
            <div className="flex flex-col text-black md:w-3/5 lg:w-3/5 mt-8 md:mt-0">
              
              {/* Carte unifiée pour personnalisation, couleur et taille */}
              <div className="mb-6 border border-indigo-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-indigo-200/50">
                {/* En-tête de la carte */}
                <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 border-b border-indigo-100 relative overflow-hidden">
                  {/* Éléments graphiques abstraits */}
                  <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-[#FCEB14] opacity-5 blur-xl"></div>
                  <div className="absolute left-1/4 bottom-0 w-16 h-16 rounded-full bg-indigo-300 opacity-10 blur-lg"></div>
                  
                  <h2 className="text-xl font-bold text-indigo-800 relative inline-block">
                    Configuration du produit
                    <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                  </h2>
                  <p className="text-sm text-indigo-600 mt-1">Personnalisez votre article selon vos préférences</p>
                </div>
                
                {/* Contenu de la carte avec onglets */}
                <div className="p-4 bg-white">
                  {/* Section 1: Couleur */}
                  {uniqueColors.length > 0 && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        <span className="relative">
                          Couleur
                          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {uniqueColors.map((color) => {
                          // Vérifier si la couleur est un code hexadécimal valide
                          const isHexColor = /^#[0-9A-F]{6}$/i.test(color);
                          
                          return (
                            <button
                              key={color}
                              type="button"
                              className={`p-2 transition-all ${
                                selectedColor === color
                                  ? 'scale-110 transform'
                                  : ''
                              }`}
                              onClick={() => setSelectedColor(color)}
                              title={color}
                            >
                              {isHexColor ? (
                                <div 
                                  className={`w-10 h-10 rounded-full border-2 ${selectedColor === color ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300 hover:border-indigo-400'}`} 
                                  style={{ backgroundColor: color }}
                                />
                              ) : (
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100 border-2 ${selectedColor === color ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300 hover:border-indigo-400'}`}>
                                  <span className={`text-xs ${selectedColor === color ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>
                                    {color.substring(0, 3)}
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Section 2: Personnalisation (emplacement/technique) */}
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                        <span className="relative">
                          Emplacement & Technique
                          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                        </span>
                      </h3>
                      {customizationData && customizationData.customizations && customizationData.customizations.length > 0 && !showEmbeddedCustomization && (
                        <button 
                          onClick={() => setShowEmbeddedCustomization(true)}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          Modifier
                        </button>
                      )}
                    </div>
                    
                    {customizationData && customizationData.customizations && customizationData.customizations.length > 0 && !showEmbeddedCustomization && (
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-fadeIn cursor-pointer" onClick={() => setShowEmbeddedCustomization(true)}>
                        {customizationData.customizations.map((customization, index) => (
                          <div key={index} className="flex items-start mb-4 last:mb-0">
                            <div className="flex-shrink-0 mr-3">
                              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                {customization.type === 'text' ? (
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                  {customization.face === 'devant' ? 'Devant' : 'Derrière'}
                                </span>
                                <h4 className="text-sm font-bold text-green-800">Type: {customization.type === 'text' ? 'Texte' : 'Image'}</h4>
                              </div>
                              <p className="text-sm text-green-700">Position: {customization.position.replace('-', ' ').charAt(0).toUpperCase() + customization.position.replace('-', ' ').slice(1)}</p>
                              {customization.type === 'text' && customization.texte && (
                                <p className="mt-1 text-sm font-medium text-green-800 bg-white p-1 rounded border border-green-200">"{customization.texte}"</p>
                              )}
                            </div>
                          </div>
                        ))}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation(); // Empêcher le déclenchement du onClick du parent
                            setShowEmbeddedCustomization(true);
                          }}
                          className="mt-2 px-3 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          Modifier
                        </button>
                      </div>
                    )}
                    
                    {showEmbeddedCustomization && (
                      <CustomizationModal
                        isOpen={true}
                        isEmbedded={true}
                        initialCustomization={customizationData}
                        onClose={() => {
                          if (customizationData) {
                            setShowEmbeddedCustomization(false);
                          }
                        }}
                        onSave={(customization: ProductCustomization, price: number) => {
                          setCustomizationData(customization);
                          setCustomizationPrice(price);
                          setShowEmbeddedCustomization(false);
                        }}
                        basePrice={product?.base_price || 0}
                      />
                    )}
                  </div>
                  
                  {/* Section 3: Taille et Quantité */}
                  {uniqueSizes.length > 0 && selectedColor && (
                    <div className="mb-6 pb-6 border-b border-gray-200">
                      <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span className="relative">
                          Taille et Quantité
                          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                        </span>
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                        {uniqueSizes.map((size) => {
                          // Trouver la variante pour cette taille et la couleur sélectionnée
                          const variant = product.variants?.find(
                            v => v.size === size && v.color === selectedColor
                          );
                          
                          // Si la variante n'existe pas ou est en rupture de stock, ne pas l'afficher
                          if (!variant || variant.stock_quantity <= 0) return null;
                          
                          return (
                            <div key={size} className="border border-gray-200 rounded-lg p-2 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm">
                              <div className="text-center mb-2">
                                <h3 className="text-md font-bold text-gray-800">{size}</h3>
                              </div>
                              
                              <div className="flex items-center justify-between px-1">
                                <button
                                  type="button"
                                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                    sizeQuantities[size] ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-400'
                                  } transition-colors`}
                                  onClick={() => decreaseQuantity(size)}
                                  disabled={!sizeQuantities[size]}
                                >
                                  <span className="text-sm font-bold">-</span>
                                </button>
                                
                                <div className="flex items-center justify-center">
                                  <input 
                                    type="number" 
                                    className="w-12 h-8 text-center font-bold text-sm text-gray-800 border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500" 
                                    value={sizeQuantities[size] || 0}
                                    min="0"
                                    max={variant.stock_quantity}
                                    onChange={(e) => {
                                      const newValue = parseInt(e.target.value) || 0;
                                      if (newValue >= 0 && newValue <= variant.stock_quantity) {
                                        setSizeQuantities(prev => ({
                                          ...prev,
                                          [size]: newValue
                                        }));
                                        setStockError('');
                                      } else if (newValue > variant.stock_quantity) {
                                        setStockError(`Stock insuffisant pour la taille ${size}. Maximum: ${variant.stock_quantity}`);
                                      }
                                    }}
                                  />
                                </div>
                                
                                <button
                                  type="button"
                                  className={`w-8 h-8 flex items-center justify-center rounded-full ${
                                    variant.stock_quantity <= (sizeQuantities[size] || 0) 
                                      ? 'bg-gray-100 text-gray-400' 
                                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                  } transition-colors`}
                                  onClick={() => increaseQuantity(size)}
                                  disabled={variant.stock_quantity <= (sizeQuantities[size] || 0)}
                                >
                                  <span className="text-sm font-bold">+</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* Section 4: Délai de livraison */}
                  <div className="mb-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                      <svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="relative">
                        Délai de livraison
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                      </span>
                    </h3>
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">Délai de livraison standard :</p>
                          <p className="text-sm text-blue-700 mt-2 font-bold">Livraison classique : 3 semaines</p>
                          <p className="text-xs text-blue-600 mt-2">Les délais peuvent varier en fonction de la quantité commandée et de la complexité de la personnalisation.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Résumé des sélections et prix total */}
              {totalItemsSelected > 0 && (
                <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-indigo-100 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden transform transition-all duration-300 hover:shadow-md hover:shadow-indigo-200/50">
                  {/* Éléments graphiques abstraits */}
                  <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-[#FCEB14] opacity-5 blur-xl"></div>
                  <div className="absolute left-1/4 bottom-0 w-16 h-16 rounded-full bg-indigo-300 opacity-10 blur-lg"></div>
                  
                  <h3 className="text-lg font-bold text-indigo-800 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    <span className="relative">
                      Votre sélection
                      <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                    </span>
                  </h3>
                  
                  {/* Articles sélectionnés */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Articles</h4>
                    <div className="space-y-1 text-gray-800">
                      {Object.entries(sizeQuantities)
                        .filter(([_, qty]) => qty > 0)
                        .map(([size, qty]) => (
                          <div key={size} className="flex justify-between py-1 border-b border-indigo-100 last:border-0">
                            <span className="font-medium">{product.name} - {size}</span>
                            <span className="font-bold">{qty}x</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Détails du prix */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Détails du prix</h4>
                    <div className="space-y-2 text-gray-800">
                      <div className="flex justify-between items-center">
                        <span>Prix unitaire:</span>
                        <span className="font-medium">
                          {discountPercent > 0 ? (
                            <>
                              <span className="line-through text-gray-400 mr-2">{product.base_price.toFixed(2)} €</span>
                              <span className="text-green-600">{discountedPrice.toFixed(2)} €</span>
                              <span className="ml-1 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">-{discountPercent}%</span>
                            </>
                          ) : (
                            <>{product.base_price.toFixed(2)} €</>
                          )}
                        </span>
                      </div>
                      
                      {(() => {
                        // Vérifier si la personnalisation est complète
                        const isPersonnalisationComplete = customizationData ? isCustomizationComplete(customizationData) : false;
                        
                        return isPersonnalisationComplete && customizationPrice > 0 ? (
                          <div className="flex justify-between items-center text-indigo-700">
                            <span>Personnalisation:</span>
                            <span className="font-medium">+{customizationPrice.toFixed(2)} €</span>
                          </div>
                        ) : customizationPrice > 0 ? (
                          <div className="flex justify-between items-center text-gray-500">
                            <span>Personnalisation (incomplète):</span>
                            <span className="font-medium">(+{customizationPrice.toFixed(2)} €)</span>
                          </div>
                        ) : null;
                      })()}
                      
                      <div className="flex justify-between items-center">
                        <span>Quantité totale:</span>
                        <span className="font-medium">{totalItemsSelected} article(s)</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Total */}
                  <div className="mt-4 pt-3 border-t border-indigo-200">
                    <div className="flex justify-between items-center text-lg font-bold text-indigo-900">
                      <span className="relative">
                        Total à payer:
                        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                      </span>
                      <span className="text-xl">
                        {(() => {
                          // Vérifier si la personnalisation est complète
                          const isPersonnalisationComplete = customizationData ? isCustomizationComplete(customizationData) : false;
                          const priceWithCustomization = isPersonnalisationComplete ? customizationPrice : 0;
                          
                          // Calculer le prix total avec remise par quantité
                          const unitPrice = discountPercent > 0 ? discountedPrice : product.base_price;
                          const totalPrice = (unitPrice + priceWithCustomization) * totalItemsSelected;
                          return totalPrice.toFixed(2);
                        })()} €
                      </span>
                    </div>
                    
                    {/* Affichage des paliers de remise */}
                    {totalItemsSelected > 0 && (
                      <div className="mt-3 pt-3 border-t border-indigo-100">
                        <h4 className="text-sm font-semibold text-indigo-800 mb-2 relative inline-block">
                          Remises par quantité
                          <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
                        </h4>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className={`p-2 rounded-lg text-center ${totalItemsSelected >= 10 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            <div className="font-bold">10+ articles</div>
                            <div>-5% sur le prix unitaire</div>
                          </div>
                          <div className={`p-2 rounded-lg text-center ${totalItemsSelected >= 25 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            <div className="font-bold">25+ articles</div>
                            <div>-10% sur le prix unitaire</div>
                          </div>
                          <div className={`p-2 rounded-lg text-center ${totalItemsSelected >= 50 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                            <div className="font-bold">50+ articles</div>
                            <div>-15% sur le prix unitaire</div>
                          </div>
                        </div>
                        {totalItemsSelected > 0 && totalItemsSelected < 10 && (
                          <div className="mt-2 text-sm text-indigo-600 font-medium text-center">
                            Ajoutez {10 - totalItemsSelected} article(s) de plus pour obtenir une remise de 5% !
                          </div>
                        )}
                        {totalItemsSelected >= 10 && totalItemsSelected < 25 && (
                          <div className="mt-2 text-sm text-indigo-600 font-medium text-center">
                            Ajoutez {25 - totalItemsSelected} article(s) de plus pour obtenir une remise de 10% !
                          </div>
                        )}
                        {totalItemsSelected >= 25 && totalItemsSelected < 50 && (
                          <div className="mt-2 text-sm text-indigo-600 font-medium text-center">
                            Ajoutez {50 - totalItemsSelected} article(s) de plus pour obtenir une remise de 15% !
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Boutons d'action */}
              <div className="mt-auto space-y-4">
                <button
                  type="button"
                  className={`w-full py-3 px-4 rounded-xl font-bold text-white transition-all relative overflow-hidden group ${
                    isAddingToCart || totalItemsSelected === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : customizationData 
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg'
                        : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => {
                    // Vérifier si l'éditeur de personnalisation est ouvert mais que les modifications n'ont pas été enregistrées
                    if (showEmbeddedCustomization) {
                      // Afficher la modale de confirmation
                      setShowConfirmationModal(true);
                    } else if (customizationData) {
                      handleAddToCartWithCustomization(customizationData, customizationPrice);
                    } else {
                      handleAddToCart();
                    }
                  }}
                  disabled={isAddingToCart || totalItemsSelected === 0}
                >
                  {isAddingToCart ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Ajout en cours...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center relative z-10">
                      {customizationData && (
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                        </svg>
                      )}
                      {customizationData ? 'Ajouter au panier avec personnalisation' : 'Ajouter au panier'}
                    </span>
                  )}
                </button>
                
                {/* Bouton pour accéder au panier - toujours visible */}
                <Link href="/cart" className="block w-full py-2.5 px-4 bg-white border border-indigo-600 text-indigo-600 hover:bg-indigo-50 text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md text-center relative overflow-hidden group">
                  <div className="flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                    Voir mon panier
                  </div>
                </Link>

                {/* Modal de personnalisation */}
                <CustomizationModal
                  isOpen={isCustomizationModalOpen}
                  onClose={() => setIsCustomizationModalOpen(false)}
                  onSave={async (customization: ProductCustomization) => {
                    try {
                      // Vérifier qu'une couleur est sélectionnée
                      if (!selectedColor) {
                        setStockError('Veuillez sélectionner une couleur');
                        return;
                      }

                      // Vérifier qu'au moins une taille est sélectionnée
                      const selectedSizesWithQuantities = Object.entries(sizeQuantities)
                        .filter(([_, quantity]) => quantity > 0);

                      if (selectedSizesWithQuantities.length === 0) {
                        setStockError('Veuillez sélectionner au moins une taille et sa quantité');
                        return;
                      }

                      // Ajouter au panier pour chaque taille sélectionnée
                      for (const [size, quantity] of selectedSizesWithQuantities) {
                        const variant = product.variants?.find(
                          v => v.size === size && v.color === selectedColor
                        );

                        if (variant) {
                          const cartItemId = `${product.id}-${variant.id}-${Date.now()}-${size}`;
                          
                          addToCart({
                            id: cartItemId,
                            productId: product.id,
                            variantId: variant.id,
                            name: product.name,
                            price: product.base_price + (variant.price_adjustment || 0),
                            quantity: quantity,
                            size: size,
                            color: selectedColor,
                            imageUrl: product.image_url || '/images/placeholder.jpg',
                            customization: customization
                          });
                        }
                      }

                      // Réinitialiser les quantités
                      const resetQuantities: SizeQuantities = {};
                      Object.keys(sizeQuantities).forEach(size => {
                        resetQuantities[size] = 0;
                      });
                      setSizeQuantities(resetQuantities);

                      setAddedToCart(true);
                      setTimeout(() => {
                        setAddedToCart(false);
                      }, 3000);
                      
                      setIsCustomizationModalOpen(false);
                    } catch (error) {
                      console.error('Erreur lors de la personnalisation:', error);
                      setStockError('Une erreur est survenue lors de l\'ajout au panier');
                    }
                  }}
                />
              </div>

              {stockError && (
                <p className="mt-2 text-sm font-medium text-red-600 bg-red-50 p-2 rounded-md">{stockError}</p>
              )}

              {addedToCart && (
                <div className="mt-2 p-3 bg-green-100 text-green-800 rounded-md text-sm font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Produit ajouté au panier !
                </div>
              )}
            </div>
          </div>
          
          {/* Section d'informations supplémentaires déplacée sous l'image dans la colonne de gauche */}
        </div>
      </div>
      
      {/* Section des produits similaires */}
      {similarProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-8 border-t border-gray-200 relative overflow-hidden">
          {/* Éléments graphiques abstraits */}
          <div className="absolute left-0 top-1/3 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
          <div className="absolute right-0 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-8 relative inline-block">
            Produits
            <span className="ml-2 relative inline-block text-indigo-600">
              similaires
              <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
              </svg>
            </span>
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Ligne courbe évoquant un sourire */}
            <div className="absolute -top-8 left-1/4 right-1/4 h-16 border-t-4 border-[#FCEB14] opacity-10 rounded-t-full"></div>
            
            {similarProducts.map((similarProduct) => (
              <Link 
                key={similarProduct.id} 
                href={`/products/${similarProduct.id}`}
                className="group"
              >
                <div className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 hover:shadow-indigo-200/50">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={similarProduct.image_url || '/images/placeholder.jpg'}
                      alt={similarProduct.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-0 right-0 bg-[#FCEB14] text-indigo-800 font-bold py-1 px-3 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Découvrir
                    </div>
                  </div>
                  <div className="p-4 relative">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{similarProduct.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{similarProduct.description}</p>
                    <p className="text-indigo-600 font-bold mt-2">{similarProduct.base_price.toFixed(2)} €</p>
                    <div className="mt-4 h-0.5 w-12 bg-[#FCEB14] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:w-24"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Modale de confirmation pour l'ajout au panier sans enregistrer la personnalisation */}
      {showConfirmationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Overlay sombre */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            {/* Centrer la modale */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            {/* Contenu de la modale */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Personnalisation non enregistrée
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Vous n'avez pas enregistré votre personnalisation. Si vous continuez, les modifications en cours ne seront pas appliquées à votre produit.
                      </p>
                      <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                        <p className="text-sm text-amber-800">
                          Pour enregistrer votre personnalisation, cliquez sur le bouton "Enregistrer" dans l'éditeur de personnalisation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button 
                  type="button" 
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowConfirmationModal(false);
                    if (customizationData) {
                      handleAddToCartWithCustomization(customizationData, customizationPrice);
                    } else {
                      handleAddToCart();
                    }
                  }}
                >
                  Continuer sans enregistrer
                </button>
                <button 
                  type="button" 
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowConfirmationModal(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
