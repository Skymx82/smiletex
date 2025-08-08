'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

interface Inspiration {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  created_at: string;
  active: boolean;
}

export default function AdminInspirationsPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchInspirations = async () => {
      try {
        const response = await fetch('/api/admin/inspirations');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des inspirations');
        }
        const data = await response.json();
        setInspirations(data.inspirations);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Impossible de charger les inspirations');
      } finally {
        setLoading(false);
      }
    };

    fetchInspirations();
  }, []);

  const toggleActive = async (id: string, currentActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/inspirations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour');
      }

      setInspirations(inspirations.map(inspiration => 
        inspiration.id === id 
          ? { ...inspiration, active: !currentActive } 
          : inspiration
      ));

      toast.success(`Inspiration ${!currentActive ? 'activée' : 'désactivée'}`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de mettre à jour l\'inspiration');
    }
  };

  const deleteInspiration = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette inspiration ?')) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/inspirations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }

      setInspirations(inspirations.filter(inspiration => inspiration.id !== id));
      toast.success('Inspiration supprimée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de supprimer l\'inspiration');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Gestion des Inspirations</h1>
        <Link href="/admin/inspirations/create" className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
          Ajouter une inspiration
        </Link>
      </div>

      {inspirations.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">Aucune inspiration disponible. Commencez par en ajouter une !</p>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Titre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inspirations.map((inspiration) => (
                <tr key={inspiration.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="relative h-16 w-16">
                      <Image
                        src={inspiration.image_url}
                        alt={inspiration.title}
                        fill
                        sizes="64px"
                        className="object-cover rounded"
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{inspiration.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {inspiration.description || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      inspiration.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {inspiration.active ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => toggleActive(inspiration.id, inspiration.active)}
                      className={`mr-2 ${
                        inspiration.active 
                          ? 'text-yellow-600 hover:text-yellow-900' 
                          : 'text-green-600 hover:text-green-900'
                      }`}
                    >
                      {inspiration.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <Link 
                      href={`/admin/inspirations/edit/${inspiration.id}`}
                      className="text-indigo-600 hover:text-indigo-900 mr-2"
                    >
                      Modifier
                    </Link>
                    <button
                      onClick={() => deleteInspiration(inspiration.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
