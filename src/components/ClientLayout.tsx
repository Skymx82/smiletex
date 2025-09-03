'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from './LoadingScreen';
import Footer from './layout/Footer';
import Header from './layout/Header';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier si le DOM est chargé
    if (document.readyState === 'complete') {
      // Si déjà chargé, attendre un peu pour l'effet visuel
      setTimeout(() => setIsLoading(false), 2000);
    } else {
      // Attendre que tout soit chargé
      const handleLoad = () => {
        setTimeout(() => setIsLoading(false), 500);
      };

      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, []);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  return (
    <>
      {isLoading && <LoadingScreen onLoadingComplete={handleLoadingComplete} />}
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </>
  );
}
