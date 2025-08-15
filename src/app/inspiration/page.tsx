'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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

// Composant Modal pour afficher les images en plein écran
const FullScreenModal = ({ isOpen, onClose, inspiration }: { isOpen: boolean; onClose: () => void; inspiration: Inspiration | null }) => {
  if (!isOpen || !inspiration) return null;
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div 
            className="relative max-w-7xl max-h-[90vh] w-full h-full flex flex-col items-center justify-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={inspiration.image_url}
                alt={inspiration.title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <h3 className="text-white text-2xl font-bold drop-shadow-lg">{inspiration.title}</h3>
              {inspiration.description && (
                <p className="text-white text-lg mt-2 drop-shadow-lg">{inspiration.description}</p>
              )}
            </div>
            <button 
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              onClick={onClose}
              aria-label="Fermer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default function InspirationPage() {
  const [inspirations, setInspirations] = useState<Inspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

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
                className="relative aspect-square overflow-hidden rounded-xl shadow-lg group transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-200/50 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => {
                  setSelectedInspiration(inspiration);
                  setModalOpen(true);
                }}
              >
                <Image
                  src={inspiration.image_url}
                  alt={inspiration.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-white font-bold text-lg drop-shadow-md">
                    {inspiration.title}
                  </span>
                  {inspiration.description && (
                    <span className="text-white text-sm mt-1 drop-shadow-md font-medium">
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
      
      {/* Modal pour afficher l'image en plein écran */}
      <FullScreenModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        inspiration={selectedInspiration} 
      />
    </section>
  );
}
