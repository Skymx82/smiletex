'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAllProducts, useCategories } from '@/hooks/useProducts';

export default function ProductsPage() {
  const { products, loading: productsLoading, error: productsError } = useAllProducts();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();
  const [sortBy, setSortBy] = useState('default');
  const [selectedCategory, setSelectedCategory] = useState('');

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
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nos Produits Smiletext</h1>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Découvrez notre gamme de produits personnalisables. Choisissez un article, 
            ajoutez votre design et créez un produit unique avec Smiletext.
          </p>
        </div>

        {/* Categories */}
        {categoriesLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Chargement des catégories...</p>
          </div>
        ) : categoriesError ? (
          <div className="text-center py-8 text-red-600">
            Une erreur est survenue lors du chargement des catégories.
          </div>
        ) : (
          <div className="mb-12">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Catégories</h2>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Bouton Tous */}
              <button 
                key="all"
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 ${!selectedCategory ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} rounded-md transition-colors duration-200 border ${!selectedCategory ? 'border-indigo-700' : 'border-gray-200'} hover:border-indigo-300`}
              >
                Tous
              </button>
              
              {/* Catégories principales avec menu déroulant */}
              {(() => {
                // Trouver toutes les catégories racines (sans parent)
                const rootCategories = categories.filter(cat => !cat.parent_id);
                
                return rootCategories.map(rootCat => {
                  // Trouver les sous-catégories pour cette catégorie racine
                  const childCategories = categories.filter(cat => cat.parent_id === rootCat.id);
                  
                  // Vérifier si cette catégorie ou l'une de ses sous-catégories est sélectionnée
                  const isSelected = selectedCategory === rootCat.id || 
                                     childCategories.some(child => child.id === selectedCategory);
                  
                  return (
                    <div key={rootCat.id} className="relative group z-10">
                      {/* Catégorie principale */}
                      <button 
                        onClick={() => setSelectedCategory(rootCat.id)}
                        className={`px-4 py-2 ${isSelected ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-800'} ${childCategories.length > 0 ? 'rounded-t-md' : 'rounded-md'} transition-colors duration-200 border ${isSelected ? 'border-indigo-700' : 'border-gray-200'} hover:border-indigo-300 flex items-center`}
                      >
                        <span>{rootCat.name}</span>
                        {childCategories.length > 0 && (
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                          </svg>
                        )}
                      </button>
                      
                      {/* Sous-catégories (visibles au survol) */}
                      {childCategories.length > 0 && (
                        <div className="absolute left-0 hidden group-hover:block min-w-full bg-white shadow-md rounded-b-md overflow-hidden z-20 border border-gray-200 border-t-0">
                          {childCategories.map(childCat => (
                            <button 
                              key={childCat.id} 
                              onClick={() => setSelectedCategory(childCat.id)}
                              className={`block w-full text-left px-4 py-2 whitespace-nowrap ${selectedCategory === childCat.id ? 'bg-indigo-50 text-indigo-700 font-medium' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}
                            >
                              {childCat.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Products */}
        {productsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Chargement des produits...</p>
          </div>
        ) : productsError ? (
          <div className="text-center py-8 text-red-600">
            Une erreur est survenue lors du chargement des produits.
          </div>
        ) : (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Tous les Produits</h2>
              <div>
                <select 
                  className="border border-gray-300 rounded-md py-2 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <div className="text-center py-12 text-gray-700">
                Aucun produit ne correspond à vos critères.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedProducts.map((product) => (
                  <div key={product.id} className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow text-black">
                    <Link href={`/products/${product.id}`}>
                      <div className="relative h-64">
                        <Image
                          src={product.image_url || '/images/placeholder.jpg'}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                        {product.is_featured && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
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
                        <h3 className="text-lg font-semibold mb-2 hover:text-indigo-600">{product.name}</h3>
                      </Link>
                      <p className="text-gray-700 mb-4">{product.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold">{product.base_price.toFixed(2)} €</span>
                        <Link 
                          href={`/products/${product.id}`} 
                          className="text-indigo-600 hover:text-indigo-800 font-medium"
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
  );
}
