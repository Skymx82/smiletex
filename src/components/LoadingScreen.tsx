'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';

interface LoadingScreenProps {
  onLoadingComplete: () => void;
}

export default function LoadingScreen({ onLoadingComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Simulation du chargement avec progression
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Délai pour l'animation de sortie
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(onLoadingComplete, 500);
          }, 300);
          return 100;
        }
        // Progression plus rapide au début, puis ralentissement
        return prev + (prev < 70 ? Math.random() * 15 : Math.random() * 5);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [onLoadingComplete]);

  if (!isVisible || !mounted) return null;

  const loadingElement = (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-indigo-800 transition-opacity duration-500"
      style={{ 
        zIndex: 999999,
        opacity: progress >= 100 ? 0 : 1,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0
      }}
    >

      {/* Contenu principal */}
      <div className="relative z-10 text-center">
        {/* Nom de la marque */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          <span className="relative inline-block">
            Smiletex
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-white rounded-full"></span>
          </span>
        </h1>
        
        <p className="text-white/80 text-xl mb-12">
          Personnalisation textile de qualité
        </p>

        {/* Barre de progression épurée */}
        <div className="w-80 mx-auto mb-8">
          <div className="flex justify-between text-sm text-white/70 mb-3">
            <span>Chargement en cours</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1 overflow-hidden">
            <div 
              className="h-full bg-white rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Indicateur minimaliste */}
        <div className="flex justify-center space-x-1">
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1.5 h-1.5 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
  );

  // Utiliser un portail pour monter l'écran de chargement directement dans le body
  return typeof window !== 'undefined' ? createPortal(loadingElement, document.body) : null;
}
