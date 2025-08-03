'use client';

import { useState, useEffect } from 'react';
import Image, { ImageProps } from 'next/image';

interface RobustImageProps extends Omit<ImageProps, 'onError'> {
  fallbackSrc?: string;
  maxRetries?: number;
}

/**
 * Composant d'image robuste qui gère les erreurs de chargement
 * et affiche une image par défaut en cas d'échec
 */
export default function RobustImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.jpg',
  maxRetries = 1,
  ...props
}: RobustImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [retryCount, setRetryCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Réinitialiser l'état si src change
  useEffect(() => {
    setImgSrc(src);
    setRetryCount(0);
    setHasError(false);
  }, [src]);

  // Fonction pour gérer les erreurs de chargement d'image
  const handleError = () => {
    if (retryCount < maxRetries) {
      // Essayer de recharger l'image après un délai
      setTimeout(() => {
        setRetryCount(retryCount + 1);
        setImgSrc(src + '?retry=' + new Date().getTime());
      }, 1000);
    } else {
      // Après les tentatives, utiliser l'image par défaut
      setImgSrc(fallbackSrc);
      setHasError(true);
    }
  };

  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={handleError}
      style={{
        ...props.style,
        // Appliquer un style spécifique si l'image est en fallback
        ...(hasError && { objectFit: 'contain' as const }),
      }}
    />
  );
}
