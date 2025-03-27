'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function AdminSchemaPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createRpcFunctions = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/products/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer Admin123`, // Utiliser le mot de passe admin défini dans .env.local
        },
        body: JSON.stringify({ action: 'create_rpc_functions' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Fonctions RPC créées avec succès');
      } else {
        setError(data.error || 'Erreur lors de la création des fonctions RPC');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addDeletedColumns = async () => {
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await fetch('/api/admin/products/schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer Admin123`, // Utiliser le mot de passe admin défini dans .env.local
        },
        body: JSON.stringify({ action: 'add_deleted_columns' }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Colonnes deleted ajoutées avec succès');
      } else {
        setError(data.error || 'Erreur lors de l\'ajout des colonnes deleted');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-black">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion du Schéma de Base de Données</h1>
        <Link href="/admin/products" className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">
          Retour aux produits
        </Link>
      </div>

      {message && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Fonctions RPC</h2>
          <p className="mb-4 text-gray-600">
            Créer les fonctions RPC nécessaires pour vérifier l'existence des colonnes et leur nullabilité.
            Ces fonctions sont utilisées pour la gestion de la suppression des produits.
          </p>
          <button
            onClick={createRpcFunctions}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Création en cours...' : 'Créer les fonctions RPC'}
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Colonnes "deleted"</h2>
          <p className="mb-4 text-gray-600">
            Ajouter une colonne "deleted" aux tables products et product_variants.
            Cette colonne permet de marquer les produits comme supprimés sans les supprimer réellement,
            ce qui préserve l'intégrité des commandes existantes.
          </p>
          <button
            onClick={addDeletedColumns}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Ajout en cours...' : 'Ajouter les colonnes deleted'}
          </button>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Pourquoi ces modifications ?</h2>
        <p className="mb-2 text-gray-700">
          Lorsqu'un produit est référencé dans des commandes existantes, il ne peut pas être supprimé directement
          sans violer les contraintes de clé étrangère de la base de données.
        </p>
        <p className="mb-2 text-gray-700">
          Pour résoudre ce problème, nous avons deux options :
        </p>
        <ol className="list-decimal pl-6 mb-4 space-y-2 text-gray-700">
          <li>
            <strong>Soft delete</strong> : Marquer les produits comme supprimés sans les supprimer réellement.
            C'est l'approche recommandée car elle préserve l'historique des commandes.
          </li>
          <li>
            <strong>Détacher les références</strong> : Mettre à null les références aux produits dans les commandes.
            Cette approche est moins recommandée car elle perd des informations importantes.
          </li>
        </ol>
        <p className="text-gray-700">
          Les fonctions RPC et les colonnes "deleted" permettent d'implémenter l'approche de soft delete,
          qui est la meilleure pratique pour gérer la suppression des produits référencés dans des commandes.
        </p>
      </div>
    </div>
  );
}
