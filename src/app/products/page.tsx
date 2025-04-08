'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAllProducts, useCategories } from '@/hooks/useProducts';
import { useSearchParams } from 'next/navigation';

// Composant qui utilise useSearchParams
function ProductsContent() {
  const { products, loading: productsLoading, error: productsError } = useAllProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [sortBy, setSortBy] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const searchParams = useSearchParams();

  // Récupérer le paramètre de catégorie depuis l'URL
  useEffect(() => {
    if (searchParams) {
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
      }
    }
  }, [searchParams]);

  // Fonction pour trier les produits
  const getSortedProducts = () => {
    if (!products) return [];
    
    let filteredProducts = [...products];
    
    // Filtrer par catégorie si une catégorie est sélectionnée
    if (selectedCategory) {
      // Trouver toutes les sous-catégories de la catégorie sélectionnée
      const childCategories = categories.filter(cat => cat.parent_id === selectedCategory).map(cat => cat.id);
      
      // Inclure les produits de la catégorie sélectionnée ET de ses sous-catégories
      filteredProducts = filteredProducts.filter(p => 
        p.category_id === selectedCategory || childCategories.includes(p.category_id)
      );
    }
    
    // Trier les produits
    switch (sortBy) {
      case 'price_asc':
        return filteredProducts.sort((a, b) => a.base_price - b.base_price);
      case 'price_desc':
        return filteredProducts.sort((a, b) => b.base_price - a.base_price);
      case 'newest':
        return filteredProducts.filter(p => p.is_new).concat(filteredProducts.filter(p => !p.is_new));
      default:
        return filteredProducts;
    }
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero section */}
        <div className="text-center mb-12 relative">
          {/* Éléments graphiques abstraits évoquant le sourire */}
          <div className="absolute -top-8 left-1/4 w-64 h-64 rounded-full bg-[#FCEB14] opacity-5 blur-3xl"></div>
          <div className="absolute -bottom-8 right-1/4 w-56 h-56 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
          <div className="absolute -bottom-16 left-1/3 right-1/3 h-24 border-b-2 border-[#FCEB14] opacity-10 rounded-b-full"></div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4 relative inline-block">
            Nos Produits
            <span className="relative ml-2 text-indigo-700">
              Smiletex
              <svg className="absolute -bottom-2 left-0 w-full" height="6" viewBox="0 0 100 6" preserveAspectRatio="none">
                <path d="M0,6 C25,2 50,-1 75,2 C87,4 95,5 100,6 L0,6 Z" fill="#FCEB14" />
              </svg>
            </span>
          </h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto relative z-10">
            Découvrez notre gamme de produits personnalisables. Choisissez un article, 
            ajoutez votre design et créez un produit unique avec smiletex.
          </p>
        </div>

        {/* Layout principal avec catégories à gauche et produits à droite */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar des catégories - à gauche */}
          <div className="lg:w-1/4">
            <div className="sticky top-24 bg-white p-4 rounded-lg border border-gray-200 shadow-sm overflow-hidden">
              {/* Élément graphique subtil */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-[#FCEB14] to-indigo-700 opacity-50"></div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Catégories</h2>
              
              {categoriesLoading ? (
                <div className="py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 border-r-2 border-r-[#FCEB14] mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-700 text-center">Chargement...</p>
                </div>
              ) : categoriesError ? (
                <div className="py-4 text-red-600 text-sm">
                  Une erreur est survenue lors du chargement des catégories.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Bouton Tous */}
                  <button 
                    key="all"
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 relative overflow-hidden ${!selectedCategory ? 'bg-indigo-600 text-white font-medium' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
                  >
                    <span className="relative z-10">Tous les produits</span>
                    {!selectedCategory && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FCEB14] opacity-70"></span>}
                  </button>
                  
                  {/* Catégories principales avec sous-catégories */}
                  {(() => {
                    // Trouver toutes les catégories racines (sans parent)
                    const rootCategories = categories.filter(cat => !cat.parent_id);
                    
                    return rootCategories.map(rootCat => {
                      // Trouver les sous-catégories pour cette catégorie racine
                      const childCategories = categories.filter(cat => cat.parent_id === rootCat.id);
                      
                      // Vérifier si cette catégorie est dans la liste des catégories dépliées
                      const isExpanded = expandedCategories.includes(rootCat.id);
                      
                      // Fonction pour gérer le clic sur une catégorie parent
                      const handleCategoryClick = (e: React.MouseEvent) => {
                        e.preventDefault();
                        e.stopPropagation();
                        
                        // Si la catégorie a des enfants, on bascule son état d'expansion
                        if (childCategories.length > 0) {
                          setExpandedCategories(prev => 
                            prev.includes(rootCat.id)
                              ? prev.filter(id => id !== rootCat.id)
                              : [...prev, rootCat.id]
                          );
                        }
                        
                        // Dans tous les cas, on sélectionne la catégorie pour filtrer les produits
                        setSelectedCategory(rootCat.id);
                      };
                      
                      return (
                        <div key={rootCat.id} className="space-y-1">
                          {/* Catégorie principale */}
                          <button 
                            onClick={handleCategoryClick}
                            className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 flex items-center justify-between relative overflow-hidden ${selectedCategory === rootCat.id ? 'bg-indigo-600 text-white font-medium' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
                          >
                            <span className="relative z-10">{rootCat.name}</span>
                            {selectedCategory === rootCat.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FCEB14] opacity-70"></span>}
                            {childCategories.length > 0 && (
                              <svg 
                                className={`w-4 h-4 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24" 
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            )}
                          </button>
                          
                          {/* Sous-catégories - affichées uniquement si la catégorie parent est dépliée */}
                          {childCategories.length > 0 && isExpanded && (
                            <div className="pl-4 space-y-1">
                              {childCategories.map(childCat => (
                                <button 
                                  key={childCat.id} 
                                  onClick={() => setSelectedCategory(childCat.id)}
                                  className={`w-full text-left px-4 py-2 rounded-md transition-all duration-200 text-sm relative overflow-hidden ${selectedCategory === childCat.id ? 'bg-indigo-100 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'}`}
                                >
                                  <span className="relative z-10">{childCat.name}</span>
                                  {selectedCategory === childCat.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FCEB14] opacity-50"></span>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>

          {/* Section des produits - à droite */}
          <div className="lg:w-3/4">
            {productsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 border-r-2 border-r-[#FCEB14] mx-auto"></div>
                <p className="mt-4 text-gray-700">Chargement des produits...</p>
              </div>
            ) : productsError ? (
              <div className="text-center py-8 text-red-600">
                Une erreur est survenue lors du chargement des produits.
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 relative inline-block">
                    {selectedCategory ? 
                      categories.find(c => c.id === selectedCategory)?.name || 'Produits filtrés' : 
                      'Tous les Produits'}
                    <div className="absolute -bottom-2 left-0 w-1/2 h-1 bg-[#FCEB14] opacity-40 rounded-full"></div>
                  </h2>
                  <div>
                    <select 
                      className="border border-gray-300 rounded-md py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-[#FCEB14] transition-colors duration-200"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Trier par</option>
                      <option value="price_asc">Prix croissant</option>
                      <option value="price_desc">Prix décroissant</option>
                      <option value="newest">Nouveautés</option>
                    </select>
                  </div>
                </div>

                {sortedProducts.length === 0 ? (
                  <div className="text-center py-12 text-gray-700 bg-gray-50 rounded-lg relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-[#FCEB14] to-indigo-700 opacity-30"></div>
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-12 border-b-2 border-[#FCEB14] opacity-10 rounded-b-full"></div>
                    <p className="relative z-10">Aucun produit ne correspond à vos critères.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {sortedProducts.map((product) => (
                      <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 text-black hover:translate-y-[-4px] group relative">
                        {/* Élément graphique subtil */}
                        <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#FCEB14] opacity-0 group-hover:opacity-40 transition-opacity duration-300 rounded-full"></div>
                        <Link href={`/products/${product.id}`}>
                          <div className="relative h-64">
                            <Image
                              src={product.image_url || '/images/placeholder.jpg'}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                            {product.is_featured && (
                              <div className="absolute top-2 right-2 bg-[#FCEB14] text-black text-xs font-bold px-2 py-1 rounded shadow-sm">
                                Populaire
                              </div>
                            )}
                            {product.is_new && (
                              <div className="absolute top-2 left-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded">
                                Nouveau
                              </div>
                            )}
                          </div>
                        </Link>
                        <div className="p-6">
                          <Link href={`/products/${product.id}`}>
                            <h3 className="text-lg font-semibold mb-2 hover:text-indigo-600 group-hover:text-indigo-600 transition-colors duration-300">{product.name}</h3>
                          </Link>
                          <p className="text-gray-700 mb-4">{product.description}</p>
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-bold">À partir de {product.base_price.toFixed(2)} €</span>
                            <Link 
                              href={`/products/${product.id}`} 
                              className="text-indigo-600 hover:text-indigo-800 font-medium relative inline-block group-hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#FCEB14] after:transition-all after:duration-300"
                            >
                              Personnaliser
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Composant principal avec Suspense
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-4">Chargement des produits...</div>}>
      <ProductsContent />
    </Suspense>
  );
}
