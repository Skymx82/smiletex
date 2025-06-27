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
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchParams = useSearchParams();

  // Récupérer le paramètre de catégorie depuis l'URL
  useEffect(() => {
    if (searchParams) {
      const categoryParam = searchParams.get('category');
      if (categoryParam) {
        setSelectedCategory(categoryParam);
        
        // Si la catégorie a un parent, on l'ajoute aux catégories dépliées
        const category = categories.find(cat => cat.id === categoryParam);
        if (category?.parent_id) {
          setExpandedCategories(prev => [
            ...prev.filter(id => id !== category.parent_id),
            category.parent_id as string
          ]);
        }
      }
    }
  }, [searchParams, categories]);

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
  
  // Fonction pour obtenir le nom de la catégorie sélectionnée avec son chemin complet
  const getSelectedCategoryPath = () => {
    if (!selectedCategory || !categories.length) return 'Tous les Produits';
    
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return 'Produits filtrés';
    
    if (category.parent_id) {
      const parentCategory = categories.find(c => c.id === category.parent_id);
      if (parentCategory) {
        return `${parentCategory.name} > ${category.name}`;
      }
    }
    
    return category.name;
  };

  const sortedProducts = getSortedProducts();

  return (
    <div className="bg-gray-50 min-h-screen text-black">
      {/* Hero section avec fond dégradé */}
      <div className="relative bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        {/* Éléments graphiques abstraits - responsive */}
        <div className="absolute left-0 top-0 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full bg-indigo-100 opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute right-0 top-1/4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 rounded-full bg-indigo-200 opacity-10 blur-3xl translate-x-1/3"></div>
        <div className="absolute bottom-0 left-1/4 right-1/4 h-16 sm:h-24 md:h-32 border-b-2 sm:border-b-4 border-indigo-300 opacity-10 rounded-b-full"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 relative">
          <div className="text-center mb-6 sm:mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6 relative inline-block">
              <span className="relative block sm:inline-block">
                Nos Produits
              </span>
              <span className="block sm:inline-block sm:ml-3 text-indigo-600 mt-1 sm:mt-0">Smiletex</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 max-w-3xl mx-auto mt-3 sm:mt-4 md:mt-6 relative z-10 px-2">
              Découvrez notre gamme de produits personnalisables de haute qualité.
              <span className="hidden sm:inline"> Choisissez un article, ajoutez votre design et créez un produit unique qui vous ressemble.</span>
            </p>
          </div>
        </div>
      </div>
      
      {/* Layout principal avec catégories à gauche et produits à droite */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-8">
        {/* Bouton pour afficher/masquer les filtres sur mobile */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="w-full flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-gray-200"
          >
            <span className="font-medium text-gray-800 flex items-center">
              <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"></path>
              </svg>
              Filtrer par catégorie {selectedCategory && `(${getSelectedCategoryPath()})`}
            </span>
            <svg className={`w-5 h-5 text-gray-500 transition-transform ${mobileFiltersOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar des catégories - à gauche */}
          <div className={`lg:w-1/4 ${mobileFiltersOpen ? 'block' : 'hidden lg:block'} transition-all duration-300`}>
            <div className="lg:sticky lg:top-24 bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Éléments graphiques */}
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-[#FCEB14] to-indigo-700 opacity-50"></div>
              <div className="absolute right-0 bottom-0 w-32 h-32 rounded-full bg-[#FCEB14] opacity-5 blur-xl"></div>
              
              <h2 className="text-xl font-bold text-gray-900 mb-6 relative inline-block">
                Catégories
                <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#FCEB14] rounded-full"></span>
              </h2>
              
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
                    className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 relative overflow-hidden ${!selectedCategory ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-sm' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
                  >
                    <span className="relative z-10 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                      </svg>
                      Tous les produits
                    </span>
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
                            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-300 flex items-center justify-between relative overflow-hidden ${selectedCategory === rootCat.id ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium shadow-sm' : 'bg-gray-50 text-gray-800 hover:bg-gray-100'}`}
                          >
                            <span className="relative z-10 flex items-center">
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path>
                              </svg>
                              {rootCat.name}
                            </span>
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
                                  className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-300 text-sm relative overflow-hidden ${selectedCategory === childCat.id ? 'bg-indigo-100 text-indigo-700 font-medium shadow-sm' : 'text-gray-700 hover:bg-gray-100 hover:text-indigo-600'}`}
                                >
                                  <span className="relative z-10 flex items-center">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                    </svg>
                                    {childCat.name}
                                  </span>
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

          {/* Grille de produits - à droite */}
          <div className="lg:w-3/4 w-full transition-all duration-300">
            {productsLoading ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-indigo-600 border-r-2 border-r-[#FCEB14] mx-auto"></div>
                <p className="mt-6 text-gray-700 font-medium">Chargement des produits...</p>
              </div>
            ) : productsError ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p className="mt-4 text-red-600 font-medium">Une erreur est survenue lors du chargement des produits.</p>
              </div>
            ) : (
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-8 gap-4 w-full">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 relative inline-block">
                      {getSelectedCategoryPath()}
                      <div className="absolute -bottom-2 left-0 w-full h-1 bg-indigo-500 opacity-40 rounded-full"></div>
                    </h2>
                    <p className="text-gray-600 mt-2">{sortedProducts.length} produit{sortedProducts.length > 1 ? 's' : ''} trouvé{sortedProducts.length > 1 ? 's' : ''}</p>
                  </div>
                  <div className="relative">
                    <select 
                      className="appearance-none bg-white border border-gray-300 rounded-lg py-3 pl-4 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:border-indigo-300 transition-colors duration-200 shadow-sm"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <option value="default">Trier par défaut</option>
                      <option value="price_asc">Prix croissant</option>
                      <option value="price_desc">Prix décroissant</option>
                      <option value="newest">Nouveautés</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </div>
                  </div>
                </div>

                {sortedProducts.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-[#FCEB14] to-indigo-700 opacity-30"></div>
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-12 border-b-2 border-[#FCEB14] opacity-10 rounded-b-full"></div>
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <p className="text-gray-700 text-lg font-medium">Aucun produit ne correspond à vos critères.</p>
                    <button 
                      onClick={() => setSelectedCategory('')}
                      className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                      </svg>
                      Voir tous les produits
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {sortedProducts.map((product) => (
                      <div 
                        key={product.id} 
                        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:translate-y-[-4px] group relative flex flex-col h-full"
                        onMouseEnter={() => setHoveredProduct(product.id)}
                        onMouseLeave={() => setHoveredProduct(null)}
                      >
                        {/* Élément graphique subtil */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-indigo-700 opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
                        
                        <Link href={`/products/${product.id}`} className="block relative h-44 sm:h-52 md:h-64 overflow-hidden">
                          <Image
                            src={product.image_url || '/images/placeholder.jpg'}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          {product.is_featured && (
                            <div className="absolute top-3 right-3 bg-indigo-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                              Populaire
                            </div>
                          )}
                          {product.is_new && (
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-green-600 to-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-md">
                              Nouveau
                            </div>
                          )}
                          {hoveredProduct === product.id && (
                            <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              <span className="bg-white text-indigo-700 font-bold py-2 px-4 rounded-lg shadow-md transform transition-transform duration-300 group-hover:scale-105">
                                Voir le produit
                              </span>
                            </div>
                          )}
                        </Link>
                        
                        <div className="p-3 sm:p-4 md:p-6 relative flex-grow flex flex-col">
                          <Link href={`/products/${product.id}`}>
                            <h3 className="text-lg font-semibold mb-2 group-hover:text-indigo-600 transition-colors duration-300">{product.name}</h3>
                          </Link>
                          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-4 line-clamp-2 flex-grow">{product.description}</p>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-auto">
                            <span className="text-base sm:text-lg font-bold text-indigo-700">À partir de {product.base_price.toFixed(2)} €</span>
                            <Link 
                              href={`/products/${product.id}`} 
                              className="text-indigo-600 hover:text-indigo-800 font-medium px-2 sm:px-3 py-1 rounded-lg hover:bg-indigo-50 transition-colors duration-300 flex items-center text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
                            >
                              Personnaliser
                              <svg className="w-4 h-4 ml-1 transform transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                              </svg>
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 border-r-2 border-r-[#FCEB14]"></div>
      <p className="ml-3 text-gray-700">Chargement...</p>
    </div>}>
      <ProductsContent />
    </Suspense>
  );
}
