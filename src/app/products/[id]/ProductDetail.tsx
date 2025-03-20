'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProduct, useStockCheck, useCategories } from '@/hooks/useProducts';
import { useCartContext } from '@/components/CartProvider';
import CustomizationModal from '@/components/CustomizationModal';
import { SimpleProductCustomization } from '@/lib/customization';

// Type pour stocker les quantités par taille
type SizeQuantities = {
  [size: string]: number;
};

export default function ProductDetail({ id }: { id: string }) {
  const { product, loading, error } = useProduct(id);
  const { categories } = useCategories();
  const { addToCart } = useCartContext();
  const [selectedColor, setSelectedColor] = useState('');
  const [sizeQuantities, setSizeQuantities] = useState<SizeQuantities>({});
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [stockError, setStockError] = useState('');
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [showEmbeddedCustomization, setShowEmbeddedCustomization] = useState(false);
  const [customizationData, setCustomizationData] = useState<SimpleProductCustomization | null>(null);

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
      
      // Réinitialiser la personnalisation
      setCustomizationData(null);
      setShowEmbeddedCustomization(false);
      
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
  const handleAddToCartWithCustomization = async (customizationData: SimpleProductCustomization) => {
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
      
      // Réinitialiser la personnalisation
      setCustomizationData(null);
      setShowEmbeddedCustomization(false);
      
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Image du produit */}
            <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
              {/* Affichage de la catégorie en petit rectangle */}
              {product.category_id && (
                <div className="absolute top-4 left-4 z-10 bg-indigo-600 text-white text-xs font-medium px-2 py-1 rounded">
                  {(() => {
                    // Obtenir le nom de la catégorie à partir de l'ID
                    const category = categories.find(cat => cat.id === product.category_id);
                    return category ? category.name : 'Autre';
                  })()}
                </div>
              )}
              <Image
                src={product.image_url || '/images/placeholder.jpg'}
                alt={product.name}
                fill
                style={{ objectFit: 'cover' }}
                className="rounded-lg"
              />
            </div>
            
            {/* Informations du produit */}
            <div className="flex flex-col text-black">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl font-semibold mb-4">{product.base_price.toFixed(2)} €</p>

              <div className="mb-8">
                <h2 className="text-lg font-bold text-gray-800 mb-2">Description</h2>
                <p className="text-gray-700">{product.description}</p>
              </div>
              
              {/* Sélection de couleur */}
              {uniqueColors.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">Couleur</h2>
                  <div className="flex flex-wrap gap-2">
                    {uniqueColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        className={`px-4 py-2 border rounded-md transition-all ${
                          selectedColor === color
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'border-gray-300 text-gray-700 hover:border-indigo-500 hover:bg-indigo-50'
                        }`}
                        onClick={() => setSelectedColor(color)}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Sélection de taille avec quantités */}
              {uniqueSizes.length > 0 && selectedColor && (
                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-800 mb-2">Tailles</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {uniqueSizes.map((size) => {
                      // Trouver la variante pour cette taille et la couleur sélectionnée
                      const variant = product.variants?.find(
                        v => v.size === size && v.color === selectedColor
                      );
                      
                      // Si la variante n'existe pas ou est en rupture de stock, ne pas l'afficher
                      if (!variant || variant.stock_quantity <= 0) return null;
                      
                      return (
                        <div key={size} className="border border-gray-200 rounded-full p-1 hover:border-indigo-300 hover:bg-indigo-50 transition-all shadow-sm">
                          <div className="text-center">
                            <h3 className="text-sm font-bold text-gray-800">{size}</h3>
                          </div>
                          
                          <div className="flex items-center justify-between px-1">
                            <button
                              type="button"
                              className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                sizeQuantities[size] ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' : 'bg-gray-100 text-gray-400'
                              } transition-colors`}
                              onClick={() => decreaseQuantity(size)}
                              disabled={!sizeQuantities[size]}
                            >
                              <span className="text-xs font-bold">-</span>
                            </button>
                            
                            <div className="w-6 h-6 flex items-center justify-center text-center font-bold text-sm text-gray-800">
                              {sizeQuantities[size] || 0}
                            </div>
                            
                            <button
                              type="button"
                              className={`w-6 h-6 flex items-center justify-center rounded-full ${
                                variant.stock_quantity <= (sizeQuantities[size] || 0) 
                                  ? 'bg-gray-100 text-gray-400' 
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              } transition-colors`}
                              onClick={() => increaseQuantity(size)}
                              disabled={variant.stock_quantity <= (sizeQuantities[size] || 0)}
                            >
                              <span className="text-xs font-bold">+</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Résumé des sélections */}
              {totalItemsSelected > 0 && (
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h3 className="text-md font-bold text-indigo-800 mb-3">Votre sélection</h3>
                  <div className="text-gray-800">
                    {Object.entries(sizeQuantities)
                      .filter(([_, qty]) => qty > 0)
                      .map(([size, qty]) => (
                        <div key={size} className="flex justify-between py-1">
                          <span className="font-medium">{size}</span>
                          <span className="font-bold">{qty}x</span>
                        </div>
                      ))}
                    <div className="mt-3 pt-3 border-t border-indigo-200">
                      <div className="flex justify-between text-indigo-800 font-bold">
                        <span>Total</span>
                        <span>{totalItemsSelected} article(s)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Section de personnalisation intégrée */}
              <div className="mb-6 border border-indigo-200 rounded-lg overflow-hidden">
                <button 
                  onClick={() => setShowEmbeddedCustomization(!showEmbeddedCustomization)}
                  className={`w-full flex justify-between items-center p-4 ${customizationData ? 'bg-green-50 text-green-800 border-b border-green-200' : 'bg-indigo-50 text-indigo-800'} font-bold transition-colors duration-300`}
                >
                  <span className="flex items-center">
                    {customizationData && (
                      <svg 
                        className="w-5 h-5 mr-2 text-green-600" 
                        fill="currentColor" 
                        viewBox="0 0 20 20" 
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path 
                          fillRule="evenodd" 
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                    {customizationData ? 'Personnalisation enregistrée' : 'Personnaliser votre produit'}
                  </span>
                  <svg
                    className={`h-5 w-5 transition-transform ${showEmbeddedCustomization ? 'rotate-180' : ''}`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                {customizationData && !showEmbeddedCustomization && (
                  <div className="p-4 bg-green-50 border-b border-green-200 animate-fadeIn">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 mr-3">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          {customizationData.type === 'text' ? (
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
                        <h4 className="text-sm font-bold text-green-800">Type: {customizationData.type === 'text' ? 'Texte' : 'Image'}</h4>
                        <p className="text-sm text-green-700">Position: {customizationData.position.replace('-', ' ').charAt(0).toUpperCase() + customizationData.position.replace('-', ' ').slice(1)}</p>
                        {customizationData.type === 'text' && customizationData.texte && (
                          <p className="mt-1 text-sm font-medium text-green-800 bg-white p-1 rounded border border-green-200">"{customizationData.texte}"</p>
                        )}
                        <button 
                          onClick={() => setShowEmbeddedCustomization(true)}
                          className="mt-2 text-xs text-green-700 hover:text-green-900 underline"
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {showEmbeddedCustomization && (
                  <CustomizationModal
                    isOpen={true}
                    isEmbedded={true}
                    initialCustomization={customizationData}
                    onClose={() => setShowEmbeddedCustomization(false)}
                    onSave={(customization: SimpleProductCustomization) => {
                      setCustomizationData(customization);
                      setShowEmbeddedCustomization(false);
                    }}
                  />
                )}
              </div>
              
              {/* Boutons d'action */}
              <div className="mt-auto space-y-4">
                <button
                  type="button"
                  className={`w-full py-3 px-4 rounded-lg font-bold text-white transition-all ${
                    isAddingToCart || totalItemsSelected === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                  }`}
                  onClick={() => {
                    if (customizationData) {
                      handleAddToCartWithCustomization(customizationData);
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
                  ) : 'Ajouter au panier'}
                </button>

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
          
          {/* Informations supplémentaires */}
          <div className="mt-16">
            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations produit Smiletext</h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Matériaux</h3>
                  <p className="text-gray-600">
                    100% coton bio certifié, tissage de haute qualité pour une durabilité optimale.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Entretien</h3>
                  <p className="text-gray-600">
                    Lavage en machine à 30°C, ne pas utiliser d'eau de javel, séchage à basse température.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Livraison</h3>
                  <p className="text-gray-600">
                    Livraison standard en 3-5 jours ouvrables. Livraison express disponible.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Produits similaires */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Produits similaires</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3].filter(productId => productId.toString() !== id).map((productId) => (
                <Link key={productId} href={`/products/${productId}`}>
                  <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={`/images/product-${productId}.jpg`}
                        alt={`Produit similaire ${productId}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium">Produit similaire {productId}</h3>
                      <p className="text-gray-600 text-sm mt-1">À partir de 19,99 €</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
