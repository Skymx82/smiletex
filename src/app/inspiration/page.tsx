'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface Inspiration {
  id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
}

// Composant pour les courbes souriantes (repris de la page d'accueil)
const SmileCurve = ({ className, color = "text-white", rotate = false }: { className: string; color?: string; rotate?: boolean }) => (
  <svg 
    viewBox="0 0 1200 120" 
    preserveAspectRatio="none" 
    className={`${className} ${color} ${rotate ? 'transform rotate-180' : ''}`}
  >
    <path 
      d="M0,120 L1200,120 L1200,60 C1000,100 800,120 600,80 C400,40 200,60 0,80 L0,120 Z" 
      fill="currentColor" 
    />
  </svg>
);

export default function InspirationPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInspirations() {
      try {
        const response = await fetch('/api/inspirations');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des inspirations');
        }
        const data = await response.json();
        // Vérifier si data est un objet avec une propriété inspirations ou directement un tableau
        if (data && Array.isArray(data.inspirations)) {
          setInspirations(data.inspirations);
        } else if (Array.isArray(data)) {
          setInspirations(data);
        } else {
          console.error('Format de données inattendu:', data);
          setInspirations([]);
        }
      } catch (error) {
        console.error('Erreur:', error);
        toast.error('Impossible de charger les inspirations');
      } finally {
        setLoading(false);
      }
    }

    fetchInspirations();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-gray-50">
      {/* Éléments graphiques abstraits */}
      <div className="absolute left-0 top-1/3 w-64 h-64 rounded-full bg-indigo-200 opacity-5 blur-3xl"></div>
      <div className="absolute right-0 bottom-1/4 w-72 h-72 rounded-full bg-indigo-200 opacity-10 blur-3xl"></div>
      <div className="absolute left-1/4 right-1/4 top-1/3 h-32 border-b-8 border-indigo-200 opacity-5 rounded-b-full"></div>
      
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            <span className="relative inline-block">
              Nos
            </span>
            <span className="relative inline-block text-indigo-600 ml-2">
              inspirations
              <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
            </span>
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Découvrez nos créations et laissez-vous inspirer pour votre prochain projet personnalisé.
          </p>
        </div>
        
        {inspirations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500">Aucune inspiration disponible pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {inspirations.map((inspiration, index) => (
              <motion.div 
                key={inspiration.id}
                className="relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Image
                  src={inspiration.image_url}
                  alt={inspiration.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-white font-medium text-lg">
                    {inspiration.title}
                  </span>
                  {inspiration.description && (
                    <span className="text-white/80 text-sm mt-1">
                      {inspiration.description}
                    </span>
                  )}
                </div>
                {/* Forme abstraite de sourire */}
                <div className="absolute -left-4 -top-4 w-16 h-16 rounded-br-full border-4 border-indigo-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="absolute -right-4 -bottom-4 w-16 h-16 rounded-tl-full border-4 border-indigo-200 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
