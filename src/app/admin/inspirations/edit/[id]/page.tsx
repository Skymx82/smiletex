'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface InspirationPageProps {
  params: {
    id: string;
  };
}

export default function EditInspirationPage({ params }: InspirationPageProps) {
  const router = useRouter();
  const { id } = params;
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    const fetchInspiration = async () => {
      try {
        const response = await fetch(`/api/admin/inspirations/${id}`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération de l\'inspiration');
        }
        
        const data = await response.json();
        const inspiration = data.inspiration;
        
        setTitle(inspiration.title);
        setDescription(inspiration.description || '');
        setImageUrl(inspiration.image_url);
        setPreviewUrl(inspiration.image_url);
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Impossible de charger l\'inspiration');
        router.push('/admin/inspirations');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInspiration();
  }, [id, router]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    try {
      // Créer un URL de prévisualisation
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Préparer le formulaire pour l'upload
      const formData = new FormData();
      formData.append('file', file);
      // Utiliser le bucket par défaut 'uploads' qui est déjà configuré

      // Envoyer le fichier au serveur
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de l\'image');
      }

      const data = await response.json();
      setImageUrl(data.url);
      toast.success('Image téléchargée avec succès');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de télécharger l\'image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error('Le titre est requis');
      return;
    }

    if (!imageUrl) {
      toast.error('Une image est requise');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/inspirations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description.trim() || null,
          image_url: imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour de l\'inspiration');
      }

      toast.success('Inspiration mise à jour avec succès');
      router.push('/admin/inspirations');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de mettre à jour l\'inspiration');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
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
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Modifier l'inspiration</h1>
        
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 text-sm font-bold mb-2">
              Titre *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Titre de l'inspiration"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Description de l'inspiration (optionnel)"
              rows={4}
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="image" className="block text-gray-700 text-sm font-bold mb-2">
              Image *
            </label>
            <input
              type="file"
              id="image"
              onChange={handleImageUpload}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              accept="image/*"
              disabled={isUploading}
            />
            {isUploading && (
              <div className="mt-2 text-sm text-gray-500">
                Téléchargement en cours...
              </div>
            )}
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Image actuelle :</p>
                <img 
                  src={previewUrl} 
                  alt="Aperçu" 
                  className="h-40 object-contain border rounded"
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => router.push('/admin/inspirations')}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className={`bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                (isSubmitting || isUploading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Mise à jour en cours...' : 'Mettre à jour'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
