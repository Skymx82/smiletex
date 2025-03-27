'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/lib/products';
import { fetchAllProducts } from '@/lib/supabase/services/productService';
import { deleteProduct } from '@/lib/supabase/services/adminService';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Charger tous les produits au chargement de la page
  useEffect(() => {
    loadProducts();
  }, []);

  // Fonction pour charger les produits
  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllProducts();
      setProducts(data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des produits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour supprimer un produit
  const handleDeleteProduct = async (id: string) => {
    if (deleteConfirm !== id) {
      setDeleteConfirm(id);
      return;
    }

    try {
      setLoading(true);
      setError(null); // Réinitialiser les erreurs précédentes
      
      console.log(`Tentative de suppression du produit avec l'ID: ${id}`);
      
      // D'abord, s'assurer que les fonctions de suppression forcée sont disponibles
      try {
        const setupResponse = await fetch('/api/admin/products/force-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer Admin123`, // Utiliser le mot de passe admin défini dans .env.local
          },
        });
        
        if (!setupResponse.ok) {
          console.warn('Erreur lors de la création des fonctions de suppression forcée:', await setupResponse.text());
          // Continuer quand même
        }
      } catch (setupErr) {
        console.warn('Exception lors de la création des fonctions de suppression forcée:', setupErr);
        // Continuer quand même
      }
      
      // Essayer d'abord avec l'API sécurisée
      try {
        const response = await fetch('/api/admin/products/delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer Admin123`, // Utiliser le mot de passe admin défini dans .env.local
          },
          body: JSON.stringify({ id }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          console.log(`Produit ${id} supprimé avec succès via l'API`);
          // Recharger la liste des produits
          await loadProducts();
          return;
        } else {
          console.warn(`L'API a échoué avec l'erreur: ${data.error || 'Inconnue'}. Tentative avec la méthode de secours.`);
        }
      } catch (apiErr) {
        console.warn(`Erreur lors de l'appel à l'API de suppression:`, apiErr);
        // Continuer avec la méthode de secours
      }
      
      // Méthode de secours: utiliser la fonction directe
      const success = await deleteProduct(id);
      
      if (success) {
        console.log(`Produit ${id} supprimé avec succès via la méthode directe`);
        // Recharger la liste des produits
        await loadProducts();
      } else {
        console.error(`Échec de la suppression du produit ${id} - Toutes les méthodes ont échoué`);
        setError('Erreur lors de la suppression du produit. Veuillez réessayer ou contacter l\'administrateur.');
      }
    } catch (err) {
      console.error(`Exception lors de la suppression du produit ${id}:`, err);
      setError(`Erreur lors de la suppression du produit: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-black">Gestion des Produits</h1>
        <div className="flex space-x-3">
          <Link
            href="/admin/schema"
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors"
          >
            Gestion du schéma
          </Link>
          <Link
            href="/admin/products/add"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Ajouter un produit
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucun produit trouvé. Commencez par en ajouter un !
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                        {product.image_url ? (
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400">
                            No img
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.base_price.toFixed(2)} €</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.category_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        product.is_featured ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {product.is_featured ? 'En vedette' : 'Standard'}
                      </span>
                      {product.is_new && (
                        <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Nouveau
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/products/edit/${product.id}`}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Modifier
                      </Link>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className={`${
                          deleteConfirm === product.id
                            ? 'text-red-600 font-bold'
                            : 'text-gray-600 hover:text-red-900'
                        }`}
                      >
                        {deleteConfirm === product.id ? 'Confirmer' : 'Supprimer'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
