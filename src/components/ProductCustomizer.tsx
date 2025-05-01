'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { ProductCustomization, SingleCustomization, Face } from '@/types/customization';
import { isSingleCustomizationComplete, isCustomizationComplete } from '@/lib/customization';

// Définition des prix pour chaque type de personnalisation et position
const CUSTOMIZATION_PRICES = {
  // Prix par type d'impression
  types: {
    'broderie': 8.50,
    'impression': 5.00,
  },
  // Multiplicateurs de prix par position (certaines positions nécessitent plus de matériel/travail)
  positions: {
    'devant-pec': 1.0,    // Prix de base
    'devant-pecs': 1.5,   // 50% plus cher (plus grand)
    'devant-centre': 1.8, // 80% plus cher (plus grand)
    'devant-complet': 2.5, // 150% plus cher (beaucoup plus grand)
    'dos-haut': 1.2,      // 20% plus cher
    'dos-complet': 2.8,   // 180% plus cher (très grand)
  },
};

interface ProductCustomizerProps {
  onSave: (customization: ProductCustomization, price: number) => void;
  initialCustomization?: ProductCustomization | null;
  basePrice?: number;
}



// Composant de prévisualisation du t-shirt avec zone d'impression mise en évidence
const TShirtZonePreview = ({ 
  face, 
  position
}: { 
  face: Face, 
  position: string | undefined
}) => {
  if (!position) return null;
  
  // Vérifier si la position sélectionnée correspond à la face actuelle
  const isCurrentFacePosition = position.startsWith(face === 'derriere' ? 'dos' : 'devant');
  if (!isCurrentFacePosition) return null;
  
  // Image de base du t-shirt selon la face
  const tshirtImage = face === 'devant' 
    ? '/images/tshirt-front.png' 
    : '/images/tshirt-back.png';
  
  // Définir les zones avec leurs positions et dimensions
  const zones: Record<string, { name: string, style: React.CSSProperties }> = {
    'devant-pec': { 
      name: 'Pec Gauche', 
      style: { top: '22%', left: '30%', width: '60px', height: '60px', border: '2px dashed #3b82f6' }
    },
    'devant-pecs': { 
      name: 'Deux Pecs', 
      style: { top: '22%', left: '50%', transform: 'translateX(-50%)', width: '140px', height: '60px', border: '2px dashed #10b981' }
    },
    'devant-complet': { 
      name: 'Devant Complet', 
      style: { top: '30%', left: '50%', transform: 'translateX(-50%)', width: '180px', height: '180px', border: '2px dashed #8b5cf6' }
    },
    'devant-centre': { 
      name: 'Centre', 
      style: { top: '35%', left: '50%', transform: 'translateX(-50%)', width: '120px', height: '80px', border: '2px dashed #f59e0b' }
    },
    'dos-haut': { 
      name: 'Haut du Dos', 
      style: { top: '20%', left: '50%', transform: 'translateX(-50%)', width: '160px', height: '60px', border: '2px dashed #ef4444' }
    },
    'dos-complet': { 
      name: 'Dos Complet', 
      style: { top: '33%', left: '50%', transform: 'translateX(-50%)', width: '180px', height: '180px', border: '2px dashed #6366f1' }
    }
  };
  
  const zoneInfo = zones[position] || { 
    name: 'Zone personnalisée', 
    style: { top: '30%', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', border: '2px dashed #9ca3af' }
  };
  
  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="relative w-64 h-80">
        {/* Image de base du t-shirt */}
        <div className={`${face === 'devant' ? 'mt-4' : ''}`}>
          <Image
            src={tshirtImage}
            alt={`T-shirt ${face === 'devant' ? 'face avant' : 'face arrière'}`}
            width={250}
            height={300}
            className="object-contain"
          />
        </div>
        
        {/* Zone d'impression mise en évidence */}
        <div 
          className="absolute rounded-md flex items-center justify-center bg-white bg-opacity-20"
          style={zoneInfo.style}
        >
          <div className="text-xs font-bold text-center p-1 bg-white bg-opacity-70 rounded shadow-sm">
            {zoneInfo.name}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mt-2 font-medium">
        Zone d'impression sélectionnée
      </div>
    </div>
  );
};

export default function ProductCustomizer({ onSave, initialCustomization = null, basePrice = 0 }: ProductCustomizerProps) {
  console.log('Rendu du composant ProductCustomizer', { initialCustomization, basePrice });
  // Initialisation d'une personnalisation vide
  const emptyCustomization: ProductCustomization = {
    customizations: []
  };
  
  // État pour stocker la personnalisation complète
  const [productCustomization, setProductCustomization] = useState<ProductCustomization>(initialCustomization || emptyCustomization);
  
  // État pour la face actuellement sélectionnée pour la prévisualisation (devant ou derrière)
  const [currentFace, setCurrentFace] = useState<Face>('devant');
  
  // État initial des personnalisations
  const [frontCustomization, setFrontCustomization] = useState<SingleCustomization>({
    type: 'text',
    type_impression: 'impression', // Impression par défaut au lieu de broderie
    face: 'devant' // Pour rétro-compatibilité
  });
  
  const [backCustomization, setBackCustomization] = useState<SingleCustomization>({
    type: 'text',
    type_impression: 'impression', // Impression par défaut au lieu de broderie
    face: 'derriere' // Pour rétro-compatibilité
  });
  
  // Helper pour obtenir la personnalisation actuelle en fonction de la face
  const getCurrentCustomization = (): SingleCustomization => {
    return currentFace === 'devant' ? frontCustomization : backCustomization;
  };
  
  // Vérifier si la personnalisation avant est active
  const hasFrontCustomization = (): boolean => {
    return !!frontCustomization.position || !!frontCustomization.position_avant;
  };
  
  // Vérifier si la personnalisation arrière est active
  const hasBackCustomization = (): boolean => {
    return !!backCustomization.position || !!backCustomization.position_arriere;
  };
  
  // Fonction pour mettre à jour la personnalisation actuelle
  const updateCurrentCustomization = (updates: Partial<SingleCustomization>) => {
    // Créer une copie pour éviter les modifications directes de l'état
    const updatedValues = { ...updates };
    console.log('Mise à jour de la personnalisation:', updatedValues);
    
    if (currentFace === 'devant') {
      setFrontCustomization(prev => {
        const newState = { ...prev, ...updatedValues };
        console.log('Nouvelle personnalisation avant:', newState);
        return newState;
      });
    } else {
      setBackCustomization(prev => {
        const newState = { ...prev, ...updatedValues };
        console.log('Nouvelle personnalisation arrière:', newState);
        return newState;
      });
    }
    
    // Déclencher la mise à jour du prix après un court délai
    setTimeout(() => handleSaveOnly(), 50);
  };

  const [selectedType, setSelectedType] = useState<'texte' | 'image'>('image');
  
  // État pour stocker le prix total des personnalisations
  const [customizationPrice, setCustomizationPrice] = useState<number>(0);
  
  // Initialiser avec les données existantes si disponibles
  useEffect(() => {
    if (initialCustomization && initialCustomization.customizations) {
      console.log('Initialisation avec les données existantes:', initialCustomization);
      setProductCustomization(initialCustomization);
      
      // Si des personnalisations existent déjà, charger les personnalisations avant et arrière
      const frontCustom = initialCustomization.customizations.find(c => c.face === 'devant');
      const backCustom = initialCustomization.customizations.find(c => c.face === 'derriere');
      
      if (frontCustom) {
        console.log('Personnalisation avant trouvée:', frontCustom);
        setFrontCustomization(frontCustom);
        // Définir le type sélectionné en fonction de la personnalisation existante
        if (frontCustom.type === 'text') {
          setSelectedType('texte');
        } else {
          setSelectedType('image');
        }
        // Définir la face actuelle comme étant devant
        setCurrentFace('devant');
      }
      
      if (backCustom) {
        console.log('Personnalisation arrière trouvée:', backCustom);
        setBackCustomization(backCustom);
        // Si pas de personnalisation avant, utiliser le type de la personnalisation arrière
        if (!frontCustom) {
          if (backCustom.type === 'text') {
            setSelectedType('texte');
          } else {
            setSelectedType('image');
          }
          // Définir la face actuelle comme étant derrière
          setCurrentFace('derriere');
        }
      }
      
      // Calculer le prix initial
      const initialPrice = calculateCustomizationPrice(initialCustomization);
      setCustomizationPrice(initialPrice);
    }
  }, [initialCustomization]);

  // Fonction pour calculer le prix des personnalisations
  const calculateCustomizationPrice = (customization: ProductCustomization): number => {
    let totalPrice = 0;
    
    // Parcourir toutes les personnalisations
    customization.customizations.forEach(custom => {
      if (custom.type_impression) {
        // Prix de base pour le type d'impression (appliqué une seule fois)
        const baseTypePrice = CUSTOMIZATION_PRICES.types[custom.type_impression as keyof typeof CUSTOMIZATION_PRICES.types] || 0;
        
        // Calculer le multiplicateur total pour toutes les positions
        let totalMultiplier = 0;
        
        // Multiplicateur pour la position avant
        if (custom.position_avant) {
          const positionMultiplier = CUSTOMIZATION_PRICES.positions[custom.position_avant as keyof typeof CUSTOMIZATION_PRICES.positions] || 1;
          totalMultiplier += positionMultiplier;
          console.log(`Multiplicateur pour position avant ${custom.position_avant}: ${positionMultiplier}`);
        }
        
        // Multiplicateur pour la position arrière
        if (custom.position_arriere) {
          const positionMultiplier = CUSTOMIZATION_PRICES.positions[custom.position_arriere as keyof typeof CUSTOMIZATION_PRICES.positions] || 1;
          totalMultiplier += positionMultiplier;
          console.log(`Multiplicateur pour position arrière ${custom.position_arriere}: ${positionMultiplier}`);
        }
        
        // Appliquer une réduction de 30% sur le multiplicateur total si les deux faces sont personnalisées
        if (custom.position_avant && custom.position_arriere) {
          totalMultiplier = totalMultiplier * 0.7; // Réduction de 30%
          console.log(`Réduction appliquée pour personnalisation recto-verso: -30%`);
        }
        
        // Calculer le prix final pour cette personnalisation
        const customPrice = baseTypePrice * totalMultiplier;
        console.log(`Prix calculé: ${baseTypePrice}€ (base) x ${totalMultiplier} (multiplicateur) = ${customPrice}€`);
        
        // Ajouter au prix total
        totalPrice += customPrice;
      }
    });
    
    // Mettre à jour l'état du prix
    setCustomizationPrice(totalPrice);
    
    return totalPrice;
  };
  
  // Fonction pour sauvegarder les personnalisations (définie avec useCallback pour éviter les références circulaires)
  const handleSaveOnly = useCallback(() => {
    console.log('Début de la sauvegarde des personnalisations');
    console.log('État actuel - Front:', frontCustomization, 'Back:', backCustomization);
    
    // Créer un seul objet de personnalisation avec toutes les informations
    // Utiliser le type et le type d'impression communs aux deux faces
    const type = selectedType === 'texte' ? 'text' : 'image';
    const type_impression = frontCustomization.type_impression || backCustomization.type_impression || 'impression';
    
    // Créer l'objet de personnalisation unique
    const singleCustomization: SingleCustomization = {
      // Informations communes
      type,
      type_impression,
      
      // Positions avant et arrière
      position_avant: frontCustomization.position || undefined,
      position_arriere: backCustomization.position || undefined,
      
      // Informations spécifiques au type
      texte: type === 'text' ? (frontCustomization.texte || backCustomization.texte || '') : undefined,
      couleur_texte: type === 'text' ? (frontCustomization.couleur_texte || backCustomization.couleur_texte || '#000000') : undefined,
      police: type === 'text' ? (frontCustomization.police || backCustomization.police || 'Arial') : undefined,
      image_url: type === 'image' ? (frontCustomization.image_url || backCustomization.image_url) : undefined,
    };
    
    // Vérifier si au moins une position est sélectionnée
    const hasPosition = singleCustomization.position_avant || singleCustomization.position_arriere;
    
    // Créer la liste des personnalisations (dans ce cas, une seule)
    const updatedCustomizations = [];
    
    // Ajouter la personnalisation si au moins une position est sélectionnée
    if (hasPosition) {
      updatedCustomizations.push(singleCustomization);
    }
    
    // Créer l'objet final de personnalisation
    const finalProductCustomization: ProductCustomization = {
      customizations: updatedCustomizations
    };
    
    // Calculer le prix en fonction des positions sélectionnées
    // Utiliser un prix de base unique pour le type d'impression, quel que soit le nombre de positions
    let totalPrice = 0;
    
    // Prix de base pour le type d'impression (appliqué une seule fois)
    const baseTypePrice = type_impression ? CUSTOMIZATION_PRICES.types[type_impression as keyof typeof CUSTOMIZATION_PRICES.types] || 0 : 0;
    
    // Calculer le multiplicateur total pour toutes les positions
    let totalMultiplier = 0;
    
    // Multiplicateur pour la position avant
    if (singleCustomization.position_avant) {
      const positionMultiplier = CUSTOMIZATION_PRICES.positions[singleCustomization.position_avant as keyof typeof CUSTOMIZATION_PRICES.positions] || 1;
      totalMultiplier += positionMultiplier;
      console.log(`Multiplicateur pour position avant ${singleCustomization.position_avant}: ${positionMultiplier}`);
    }
    
    // Multiplicateur pour la position arrière
    if (singleCustomization.position_arriere) {
      const positionMultiplier = CUSTOMIZATION_PRICES.positions[singleCustomization.position_arriere as keyof typeof CUSTOMIZATION_PRICES.positions] || 1;
      totalMultiplier += positionMultiplier;
      console.log(`Multiplicateur pour position arrière ${singleCustomization.position_arriere}: ${positionMultiplier}`);
    }
    
    // Appliquer une réduction de 30% sur le multiplicateur total si les deux faces sont personnalisées
    if (singleCustomization.position_avant && singleCustomization.position_arriere) {
      totalMultiplier = totalMultiplier * 0.7; // Réduction de 30%
      console.log(`Réduction appliquée pour personnalisation recto-verso: -30%`);
    }
    
    // Calculer le prix final
    totalPrice = baseTypePrice * totalMultiplier;
    console.log(`Prix final: ${baseTypePrice}€ (base) x ${totalMultiplier} (multiplicateur) = ${totalPrice}€`);
    
    // Mettre à jour l'état global
    setProductCustomization(finalProductCustomization);
    setCustomizationPrice(totalPrice);
    
    // Envoyer la personnalisation avec le prix
    console.log('Sauvegarde des personnalisations terminée:', finalProductCustomization, 'Prix:', totalPrice);
    onSave(finalProductCustomization, totalPrice);
  }, [frontCustomization, backCustomization, selectedType, onSave]);
  
  // Effet pour déclencher la sauvegarde lorsque les personnalisations changent
  useEffect(() => {
    // Ne pas déclencher lors du premier rendu
    if (frontCustomization !== initialCustomization?.customizations?.find(c => c.face === 'devant') ||
        backCustomization !== initialCustomization?.customizations?.find(c => c.face === 'derriere')) {
      console.log('Personnalisations modifiées, déclenchement de la sauvegarde automatique');
      // Utiliser un délai pour éviter les sauvegardes trop fréquentes
      const saveTimer = setTimeout(() => {
        handleSaveOnly();
      }, 500);
      
      // Nettoyer le timer si le composant est démonté ou si les personnalisations changent à nouveau
      return () => clearTimeout(saveTimer);
    }
  }, [frontCustomization, backCustomization, handleSaveOnly, initialCustomization]);

  // Fonction pour mettre à jour le texte sur les deux faces
  const updateTexte = (texte: string) => {
    // Mettre à jour le texte pour la face actuelle
    if (currentFace === 'devant') {
      setFrontCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    } else {
      setBackCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    }
    
    // Synchroniser le texte sur l'autre face si elle a une position sélectionnée
    if (currentFace === 'devant' && backCustomization.position) {
      setBackCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    } else if (currentFace === 'derriere' && frontCustomization.position) {
      setFrontCustomization(prev => ({
        ...prev,
        texte,
        type: 'text',
        image_url: undefined
      }));
    }
    
    // Mettre à jour le type sélectionné
    setSelectedType('texte');
    
    // Déclencher la mise à jour des personnalisations
    setTimeout(() => handleSaveOnly(), 50);
  };

  const switchPreviewFace = (newFace: Face) => {
    // Mettre à jour la face pour la prévisualisation
    setCurrentFace(newFace);
  };
  
  // Fonction pour mettre à jour la couleur du texte sur les deux faces
  const updateCouleurTexte = (couleur: string) => {
    // Mettre à jour la couleur pour la face actuelle
    if (currentFace === 'devant') {
      setFrontCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    } else {
      setBackCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    }
    
    // Synchroniser la couleur sur l'autre face si elle a une position sélectionnée et un texte
    if (currentFace === 'devant' && backCustomization.position && backCustomization.texte) {
      setBackCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    } else if (currentFace === 'derriere' && frontCustomization.position && frontCustomization.texte) {
      setFrontCustomization(prev => ({
        ...prev,
        couleur_texte: couleur
      }));
    }
    
    // Déclencher la mise à jour des personnalisations
    setTimeout(() => handleSaveOnly(), 50);
  };

  // Fonction pour mettre à jour le type d'impression sur les deux faces
  const updateImpression = (type: string) => {
    console.log(`Mise à jour du type d'impression: ${type}`);
    
    // Mettre à jour le type d'impression pour la face actuelle
    if (currentFace === 'devant') {
      setFrontCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    } else {
      setBackCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    }
    
    // Synchroniser le type d'impression sur l'autre face si elle a une position sélectionnée
    if (currentFace === 'devant' && (backCustomization.position || backCustomization.position_arriere)) {
      setBackCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    } else if (currentFace === 'derriere' && (frontCustomization.position || frontCustomization.position_avant)) {
      setFrontCustomization(prev => ({
        ...prev,
        type_impression: type
      }));
    }
    
    // Déclencher immédiatement la mise à jour des personnalisations pour mettre à jour le prix
    handleSaveOnly();
  };

  // Fonction pour mettre à jour la position avant
  const updateFrontPosition = (position: string) => {
    console.log('Mise à jour de la position avant:', position);
    // Vérifier si on clique sur la position déjà sélectionnée (pour décocher)
    if (frontCustomization.position === position) {
      // Désélectionner la position (mettre à undefined)
      setFrontCustomization(prev => {
        const newState = {
          ...prev,
          position: undefined as unknown as string, // Type cast pour satisfaire TypeScript
          position_avant: undefined
        };
        console.log('Position avant désélectionnée:', newState);
        return newState;
      });
    } else {
      // Mettre à jour la position avant et synchroniser le type d'impression et le type avec la face arrière
      setFrontCustomization(prev => {
        // Utiliser le type d'impression et le type de la face arrière si disponible
        const type_impression = backCustomization.type_impression || prev.type_impression;
        const type = backCustomization.type || prev.type;
        
        // Synchroniser les informations d'image ou de texte
        let updatedState = { 
          ...prev, 
          position, // Pour rétro-compatibilité
          position_avant: position,
          type_impression,
          type
        };
        
        // Si le type est 'image' et que la face arrière a une image, la copier
        if (type === 'image' && backCustomization.image_url) {
          updatedState.image_url = backCustomization.image_url;
          updatedState.texte = undefined;
          updatedState.couleur_texte = undefined;
          updatedState.police = undefined;
        } 
        // Si le type est 'text' et que la face arrière a du texte, le copier
        else if (type === 'text' && backCustomization.texte) {
          updatedState.texte = backCustomization.texte;
          updatedState.couleur_texte = backCustomization.couleur_texte;
          updatedState.police = backCustomization.police;
          updatedState.image_url = undefined;
        }
        
        console.log('Nouvelle position avant avec synchronisation:', updatedState);
        return updatedState;
      });
    }
    
    // Passer à la prévisualisation avant sans changer la face si on est déjà sur cette face
    if (currentFace !== 'devant') {
      setCurrentFace('devant');
    }
  };

  // Fonction pour mettre à jour la position arrière
  const updateBackPosition = (position: string) => {
    console.log('Mise à jour de la position arrière:', position);
    // Vérifier si on clique sur la position déjà sélectionnée (pour décocher)
    if (backCustomization.position === position) {
      // Désélectionner la position (mettre à undefined)
      setBackCustomization(prev => {
        const newState = {
          ...prev,
          position: undefined as unknown as string, // Type cast pour satisfaire TypeScript
          position_arriere: undefined
        };
        console.log('Position arrière désélectionnée:', newState);
        return newState;
      });
    } else {
      // Mettre à jour la position arrière et synchroniser le type d'impression et le type avec la face avant
      setBackCustomization(prev => {
        // Utiliser le type d'impression et le type de la face avant si disponible
        const type_impression = frontCustomization.type_impression || prev.type_impression;
        const type = frontCustomization.type || prev.type;
        
        // Synchroniser les informations d'image ou de texte
        let updatedState = { 
          ...prev, 
          position, // Pour rétro-compatibilité
          position_arriere: position,
          type_impression,
          type
        };
        
        // Si le type est 'image' et que la face avant a une image, la copier
        if (type === 'image' && frontCustomization.image_url) {
          updatedState.image_url = frontCustomization.image_url;
          updatedState.texte = undefined;
          updatedState.couleur_texte = undefined;
          updatedState.police = undefined;
        } 
        // Si le type est 'text' et que la face avant a du texte, le copier
        else if (type === 'text' && frontCustomization.texte) {
          updatedState.texte = frontCustomization.texte;
          updatedState.couleur_texte = frontCustomization.couleur_texte;
          updatedState.police = frontCustomization.police;
          updatedState.image_url = undefined;
        }
        
        console.log('Nouvelle position arrière avec synchronisation:', updatedState);
        return updatedState;
      });
    }
    
    // Passer à la prévisualisation arrière sans changer la face si on est déjà sur cette face
    if (currentFace !== 'derriere') {
      setCurrentFace('derriere');
    }
    
    // Appeler handleSaveOnly après la mise à jour pour recalculer le prix
    // Utiliser un setTimeout pour s'assurer que l'état a été mis à jour
    setTimeout(() => {
      console.log('Appel de handleSaveOnly après mise à jour de la position arrière');
      handleSaveOnly();
    }, 50);
  };
  

  
  // Cette fonction n'est plus nécessaire car nous n'avons plus besoin de fermer le composant
  // Nous utilisons uniquement handleSaveOnly maintenant

  const isFormValid = () => {
    const frontValid = isSingleCustomizationComplete({
      ...frontCustomization,
      type: selectedType === 'texte' ? 'text' : 'image'
    });
    
    const backValid = isSingleCustomizationComplete({
      ...backCustomization,
      type: selectedType === 'texte' ? 'text' : 'image'
    });
    
    // Le formulaire est valide si au moins une des personnalisations est complète
    const isValid = frontValid || backValid;
    console.log('Validation du formulaire:', { frontValid, backValid, isValid });
    return isValid;
  };
  


  return (
    <div className="bg-white w-full rounded-md border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-center p-4 border-b bg-gray-50">
        <h2 className="text-lg font-medium text-gray-900">Personnalisez votre produit</h2>
      </div>

      {/* Contenu principal */}
      <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Colonne de gauche: Prévisualisation */}
              <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                <h3 className="font-bold text-gray-800 text-sm mb-4">Prévisualisation</h3>
                
                {/* Boutons pour changer la face de prévisualisation */}
                <div className="mb-4 flex items-center justify-center w-full max-w-xs">
                  <div className="flex border rounded-lg overflow-hidden w-full">
                    <button
                      className={`flex-1 py-2 px-3 text-center font-medium ${currentFace === 'devant' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'} ${!hasFrontCustomization() ? 'opacity-50' : ''}`}
                      onClick={() => switchPreviewFace('devant')}
                      disabled={!hasFrontCustomization()}
                    >
                      <span className="flex items-center justify-center text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                        </svg>
                        Voir Devant {!hasFrontCustomization() && '(non sélectionné)'}
                      </span>
                    </button>
                    <button
                      className={`flex-1 py-2 px-3 text-center font-medium ${currentFace === 'derriere' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'} ${!hasBackCustomization() ? 'opacity-50' : ''}`}
                      onClick={() => switchPreviewFace('derriere')}
                      disabled={!hasBackCustomization()}
                    >
                      <span className="flex items-center justify-center text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                        Voir Arrière {!hasBackCustomization() && '(non sélectionné)'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Prévisualisation du t-shirt avec zone d'impression */}
                {(currentFace === 'devant' && hasFrontCustomization()) || (currentFace === 'derriere' && hasBackCustomization()) ? (
                  <TShirtZonePreview 
                    face={currentFace} 
                    position={currentFace === 'devant' 
                      ? (frontCustomization.position_avant || frontCustomization.position || '') 
                      : (backCustomization.position_arriere || backCustomization.position || '')
                    } 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg h-80 w-64">
                    <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-center">
                      {currentFace === 'devant' ? 'Aucune position avant sélectionnée' : 'Aucune position arrière sélectionnée'}
                    </p>
                    <p className="text-gray-400 text-sm text-center mt-2">
                      Cliquez sur une position pour la sélectionner
                    </p>
                  </div>
                )}
                
                {/* Informations sur la personnalisation actuelle */}
                <div className="mt-4 text-sm text-gray-600 w-full max-w-xs">
                  <div className="flex flex-col space-y-2 items-center justify-center">
                    <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg w-full">
                      <span className="font-medium mr-2">Type:</span> 
                      <span className="font-bold">
                        {getCurrentCustomization().type_impression === 'broderie' ? 'Broderie' : 
                         getCurrentCustomization().type_impression === 'impression' ? 'Impression' : 'Non sélectionné'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg w-full">
                      <span className="font-medium mr-2">Face:</span>
                      <span className="font-bold">
                        {currentFace === 'devant' ? 'Devant' : 'Derrière'}
                      </span>
                    </div>
                    
                    {(currentFace === 'devant' ? (frontCustomization?.position_avant || frontCustomization?.position) : (backCustomization?.position_arriere || backCustomization?.position)) && (
                      <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg w-full">
                        <span className="font-medium mr-2">Position:</span>
                        <span className="font-bold">
                          {currentFace === 'devant' 
                            ? ((frontCustomization?.position_avant || frontCustomization?.position) ? (frontCustomization?.position_avant || frontCustomization?.position || '').split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Non sélectionnée')
                            : ((backCustomization?.position_arriere || backCustomization?.position) ? (backCustomization?.position_arriere || backCustomization?.position || '').split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 'Non sélectionnée')
                          }
                        </span>
                      </div>
                    )}
                    
                    {/* Affichage du prix de personnalisation */}
                    <div className="flex items-center justify-center px-3 py-2 bg-indigo-100 rounded-lg w-full">
                      <span className="font-medium mr-2">Prix supplémentaire:</span>
                      <span className="font-bold text-indigo-700">
                        {customizationPrice.toFixed(2)} €
                      </span>
                      {!isFormValid() && customizationPrice > 0 && (
                        <span className="ml-2 text-xs text-gray-500">(appliqué seulement si complet)</span>
                      )}
                    </div>
                    
                    {basePrice > 0 && (
                      <div className="flex items-center justify-center px-3 py-2 bg-green-100 rounded-lg w-full">
                        <span className="font-medium mr-2">Prix total:</span>
                        <span className="font-bold text-green-700">
                          {(basePrice + customizationPrice).toFixed(2)} €
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Colonne de droite: Options de personnalisation */}
              <div className="space-y-6">
                {/* Section 1: Type d'impression */}
                <div>
                  <h3 className="font-bold text-gray-800 text-sm mb-3">Type d'impression</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      className={`relative overflow-hidden rounded-lg transition-all duration-200 ${getCurrentCustomization().type_impression === 'impression' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                      onClick={() => updateImpression('impression')}
                    >
                      <div className="aspect-square w-full bg-gray-50 overflow-hidden relative">
                        <Image
                          src="/images/flocage.jpg"
                          alt="Impression"
                          fill
                          className="object-cover"
                        />
                        {getCurrentCustomization().type_impression === 'impression' && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white text-center border-t">
                        <div className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                          </svg>
                          <span className="font-medium">Impression</span>
                        </div>
                      </div>
                    </button>
                    
                    <button
                      className={`relative overflow-hidden rounded-lg transition-all duration-200 ${getCurrentCustomization().type_impression === 'broderie' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                      onClick={() => updateImpression('broderie')}
                    >
                      <div className="aspect-square w-full bg-gray-50 overflow-hidden relative">
                        <Image
                          src="/images/broderie.png"
                          alt="Broderie"
                          fill
                          className="object-cover"
                        />
                        {getCurrentCustomization().type_impression === 'broderie' && (
                          <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="p-2 bg-white text-center border-t">
                        <div className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span className="font-medium">Broderie</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: Position */}
                <div>
                  <h3 className="font-bold text-gray-800 text-sm mb-3">Position</h3>
                  
                  <div className="mb-3 pb-2 border-b border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Position Avant</h4>
                  
                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                      <div className="col-span-2 mb-1">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 ${backCustomization.position ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-xs text-gray-600">{backCustomization.position ? 'Cliquez pour désélectionner' : 'Cliquez pour sélectionner'}</span>
                        </div>
                      </div>
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 ${frontCustomization.position === 'devant-pec' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-pec')}
                      >
                        <div className="aspect-square w-full max-w-[100px] mx-auto bg-gray-50 overflow-hidden relative">
                          <Image
                            src="/images/positions/devant-pec.png"
                            alt="Pec Gauche"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-pec' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Pec Gauche</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 ${frontCustomization.position === 'devant-pecs' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-pecs')}
                      >
                        <div className="aspect-square w-full max-w-[80px] mx-auto bg-gray-50 overflow-hidden relative">
                          <Image
                            src="/images/positions/devant-pecs.png"
                            alt="Deux Pecs"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-pecs' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Deux Pecs</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 ${frontCustomization.position === 'devant-complet' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-complet')}
                      >
                        <div className="aspect-square w-full max-w-[80px] mx-auto bg-gray-50 overflow-hidden relative">
                          <Image
                            src="/images/positions/devant-complet.png"
                            alt="Devant Complet"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-complet' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Devant</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 ${frontCustomization.position === 'devant-centre' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateFrontPosition('devant-centre')}
                      >
                        <div className="aspect-square w-full max-w-[80px] mx-auto bg-gray-50 overflow-hidden relative">
                          <Image
                            src="/images/positions/devant-centre.png"
                            alt="Centre"
                            fill
                            className="object-contain p-1"
                          />
                          {frontCustomization.position === 'devant-centre' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Centre</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-xs font-semibold text-gray-600 mb-2">Position Arrière</h4>
                    <div className="grid grid-cols-2 gap-2 max-w-md mx-auto">
                      <div className="col-span-2 mb-1">
                        <div className="flex items-center">
                          <div className={`h-3 w-3 rounded-full mr-2 ${backCustomization.position ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className="text-xs text-gray-600">{backCustomization.position ? 'Cliquez pour désélectionner' : 'Cliquez pour sélectionner'}</span>
                        </div>
                      </div>
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 ${backCustomization.position === 'dos-haut' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateBackPosition('dos-haut')}
                      >
                        <div className="aspect-square w-full max-w-[80px] mx-auto bg-gray-50 overflow-hidden relative">
                          <Image
                            src="/images/positions/dos-haut.png"
                            alt="Haut du Dos"
                            fill
                            className="object-contain p-1"
                          />
                          {backCustomization.position === 'dos-haut' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Haut du Dos</span>
                          </div>
                        </div>
                      </button>
                      
                      <button
                        className={`relative overflow-hidden rounded-lg transition-all duration-200 ${backCustomization.position === 'dos-complet' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                        onClick={() => updateBackPosition('dos-complet')}
                      >
                        <div className="aspect-square w-full max-w-[80px] mx-auto bg-gray-50 overflow-hidden relative">
                          <Image
                            src="/images/positions/dos-complet.png"
                            alt="Dos Complet"
                            fill
                            className="object-contain p-1"
                          />
                          {backCustomization.position === 'dos-complet' && (
                            <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1 shadow-md z-10">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="p-1 bg-white text-center border-t text-sm">
                          <div className="flex items-center justify-center">
                            <svg className="w-4 h-4 mr-1 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            <span className="font-medium">Dos Complet</span>
                          </div>
                        </div>
                      </button>
                    </div>
                
                {/* Section 3: Contenu */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm">Contenu</h3>
                  
                  <div className="flex gap-4 mb-4">
                    <button
                      className={`flex-1 p-2 border rounded ${selectedType === 'image' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedType('image')}
                    >
                      Image
                    </button>
                    <button
                      className={`flex-1 p-2 border rounded ${selectedType === 'texte' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedType('texte')}
                    >
                      Texte
                    </button>
                  </div>

                  {selectedType === 'texte' ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Votre texte
                        </label>
                        <input
                          type="text"
                          value={getCurrentCustomization().texte || ''}
                          onChange={(e) => updateCurrentCustomization({ texte: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          placeholder="Entrez votre texte"
                          style={{ fontFamily: getCurrentCustomization().police || 'Arial' }}
                        />
                        {getCurrentCustomization().texte && (
                          <div className="mt-2 p-3 border border-gray-200 rounded-md bg-white">
                            <p 
                              className="text-center" 
                              style={{ 
                                fontFamily: getCurrentCustomization().police || 'Arial',
                                color: getCurrentCustomization().couleur_texte || '#000000',
                                fontSize: '18px'
                              }}
                            >
                              {getCurrentCustomization().texte}
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Couleur
                        </label>
                        <input
                          type="color"
                          value={getCurrentCustomization().couleur_texte || '#000000'}
                          onChange={(e) => updateCurrentCustomization({ couleur_texte: e.target.value })}
                          className="w-full h-10 p-1 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Police
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => updateCurrentCustomization({ police: 'Arial' })}
                            className={`p-3 border ${getCurrentCustomization().police === 'Arial' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-300'} rounded-lg transition-all hover:border-indigo-400`}
                          >
                            <p style={{ fontFamily: 'Arial' }} className="text-center font-medium">
                              Arial
                            </p>
                            <p style={{ fontFamily: 'Arial' }} className="text-xs text-gray-500 mt-1">
                              ABCDEFG abcdefg
                            </p>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => updateCurrentCustomization({ police: 'Helvetica' })}
                            className={`p-3 border ${getCurrentCustomization().police === 'Helvetica' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-300'} rounded-lg transition-all hover:border-indigo-400`}
                          >
                            <p style={{ fontFamily: 'Helvetica' }} className="text-center font-medium">
                              Helvetica
                            </p>
                            <p style={{ fontFamily: 'Helvetica' }} className="text-xs text-gray-500 mt-1">
                              ABCDEFG abcdefg
                            </p>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => updateCurrentCustomization({ police: 'Times New Roman' })}
                            className={`p-3 border ${getCurrentCustomization().police === 'Times New Roman' ? 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600' : 'border-gray-300'} rounded-lg transition-all hover:border-indigo-400`}
                          >
                            <p style={{ fontFamily: '"Times New Roman"' }} className="text-center font-medium">
                              Times New Roman
                            </p>
                            <p style={{ fontFamily: '"Times New Roman"' }} className="text-xs text-gray-500 mt-1">
                              ABCDEFG abcdefg
                            </p>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {currentFace === 'devant' ? 'Choisir l\'image devant' : 'Choisir l\'image derrière'}
                      </label>
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              console.log('Fichier sélectionné:', file.name, file.size);
                              try {
                                // Vérifier la taille du fichier (max 5 Mo)
                                const maxSize = 5 * 1024 * 1024; // 5 Mo en octets
                                if (file.size > maxSize) {
                                  throw new Error(`L'image est trop volumineuse. Taille maximale: 5 Mo`);
                                }
                                
                                // Convertir le fichier en base64 pour stockage permanent
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    // Stocker directement le base64 comme valeur de image_url
                                    const base64String = event.target.result as string;
                                    console.log('Image convertie en base64, longueur:', base64String.length);
                                    updateCurrentCustomization({ 
                                      image_url: base64String,
                                      type: 'image' // S'assurer que le type est correctement défini
                                    });
                                    // Forcer la sauvegarde après le chargement de l'image
                                    setTimeout(() => {
                                      console.log('Forcer la sauvegarde après chargement d\'image');
                                      handleSaveOnly();
                                    }, 300);
                                  }
                                };
                                reader.onerror = (error) => {
                                  console.error('Erreur FileReader:', error);
                                  alert('Erreur lors de la lecture du fichier. Veuillez réessayer.');
                                };
                                reader.readAsDataURL(file);
                              } catch (error) {
                                // Récupérer le message d'erreur
                                const errorMessage = error instanceof Error 
                                  ? error.message 
                                  : 'Erreur inconnue lors du chargement';
                                
                                console.error('Erreur lors du chargement de l\'image:', error);
                                alert(`Erreur: ${errorMessage}`);
                              }
                            }
                          }}
                          className="w-full p-2 border rounded-md"
                          title={currentFace === 'devant' ? 'Choisir l\'image devant' : 'Choisir l\'image derrière'}
                        />
                        
                        {getCurrentCustomization().image_url && (
                          <div className="flex flex-col items-center mt-3">
                            <div className="relative h-32 w-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={getCurrentCustomization().image_url} 
                                alt="Aperçu de l'image" 
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <p className="text-xs text-green-600 mt-1">Image prête à être utilisée</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
