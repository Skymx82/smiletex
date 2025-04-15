'use client';

import React, { useState, useEffect } from 'react';
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

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customization: ProductCustomization, price: number) => void;
  isEmbedded?: boolean;
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

export default function CustomizationModal({ isOpen, onClose, onSave, isEmbedded = false, initialCustomization = null, basePrice = 0 }: CustomizationModalProps) {
  // Initialisation d'une personnalisation vide
  const emptyCustomization: ProductCustomization = {
    customizations: []
  };
  
  // État pour stocker la personnalisation complète
  const [productCustomization, setProductCustomization] = useState<ProductCustomization>(initialCustomization || emptyCustomization);
  
  // État pour la face actuellement sélectionnée pour la prévisualisation (devant ou derrière)
  const [currentFace, setCurrentFace] = useState<Face>('devant');
  
  // États pour les personnalisations avant et arrière
  const [frontCustomization, setFrontCustomization] = useState<SingleCustomization>({
    type_impression: 'impression',
    position: 'devant-pec',
    texte: '',
    couleur_texte: '#000000',
    police: 'Arial',
    type: 'image',
    face: 'devant'
  });
  
  const [backCustomization, setBackCustomization] = useState<SingleCustomization>({
    type_impression: 'impression',
    position: 'dos-haut',
    texte: '',
    couleur_texte: '#000000',
    police: 'Arial',
    type: 'image',
    face: 'derriere'
  });
  
  // Helper pour obtenir la personnalisation actuelle en fonction de la face
  const getCurrentCustomization = (): SingleCustomization => {
    return currentFace === 'devant' ? frontCustomization : backCustomization;
  };
  
  // Vérifier si une face a une position sélectionnée
  const hasFrontPosition = (): boolean => {
    return !!frontCustomization.position;
  };
  
  const hasBackPosition = (): boolean => {
    return !!backCustomization.position;
  };
  
  // Helper pour mettre à jour la personnalisation actuelle
  const updateCurrentCustomization = (updates: Partial<SingleCustomization>) => {
    if (currentFace === 'devant') {
      setFrontCustomization(prev => ({ ...prev, ...updates }));
    } else {
      setBackCustomization(prev => ({ ...prev, ...updates }));
    }
  };

  const [selectedType, setSelectedType] = useState<'texte' | 'image'>('image');
  
  // État pour stocker le prix total des personnalisations
  const [customizationPrice, setCustomizationPrice] = useState<number>(0);
  
  // Initialiser avec les données existantes si disponibles
  useEffect(() => {
    if (initialCustomization) {
      setProductCustomization(initialCustomization);
      
      // Si des personnalisations existent déjà, charger les personnalisations avant et arrière
      if (initialCustomization.customizations && initialCustomization.customizations.length > 0) {
        const existingFrontCustomization = initialCustomization.customizations.find(c => c.face === 'devant');
        const existingBackCustomization = initialCustomization.customizations.find(c => c.face === 'derriere');
        
        if (existingFrontCustomization) {
          setFrontCustomization(existingFrontCustomization);
          setSelectedType(existingFrontCustomization.type === 'text' ? 'texte' : 'image');
        }
        
        if (existingBackCustomization) {
          setBackCustomization(existingBackCustomization);
          // Si seule la personnalisation arrière existe, utiliser son type
          if (!existingFrontCustomization) {
            setSelectedType(existingBackCustomization.type === 'text' ? 'texte' : 'image');
          }
        }
        
        // Définir la face actuelle pour la prévisualisation
        setCurrentFace(existingFrontCustomization ? 'devant' : (existingBackCustomization ? 'derriere' : 'devant'));
      }
      
      // Calculer le prix initial des personnalisations
      calculateCustomizationPrice(initialCustomization);
    }
  }, [initialCustomization]);
  
  // Fonction pour calculer le prix des personnalisations
  const calculateCustomizationPrice = (customization: ProductCustomization): number => {
    let totalPrice = 0;
    
    // Parcourir toutes les personnalisations
    customization.customizations.forEach(custom => {
      // Vérifier si la personnalisation est complète
      if (isSingleCustomizationComplete(custom) && custom.type_impression && custom.position) {
        // Obtenir le prix de base pour le type d'impression
        const typePrice = CUSTOMIZATION_PRICES.types[custom.type_impression as keyof typeof CUSTOMIZATION_PRICES.types] || 0;
        
        // Obtenir le multiplicateur pour la position
        const positionMultiplier = CUSTOMIZATION_PRICES.positions[custom.position as keyof typeof CUSTOMIZATION_PRICES.positions] || 1;
        
        // Calculer le prix pour cette personnalisation
        const customPrice = typePrice * positionMultiplier;
        
        // Ajouter au prix total
        totalPrice += customPrice;
      }
    });
    
    // Mettre à jour l'état du prix
    setCustomizationPrice(totalPrice);
    
    return totalPrice;
  };

  if (!isOpen && !isEmbedded) return null;

  // Fonction pour mettre à jour les personnalisations dans l'état global
  const updateCustomizations = () => {
    const updatedCustomizations = [];
    
    // Préparer la personnalisation avant si elle est complète
    if (frontCustomization.type_impression && frontCustomization.position) {
      let updatedFrontCustomization: SingleCustomization;
      
      if (frontCustomization.type === 'image' || (selectedType === 'image' && currentFace === 'devant')) {
        updatedFrontCustomization = {
          ...frontCustomization,
          texte: undefined,
          couleur_texte: undefined,
          police: undefined,
          type: 'image',
          face: 'devant'
        };
      } else {
        updatedFrontCustomization = {
          ...frontCustomization,
          image_url: undefined,
          type: 'text',
          face: 'devant'
        };
      }
      
      // S'assurer que tous les champs nécessaires sont présents
      if (updatedFrontCustomization.type === 'text' && !updatedFrontCustomization.texte) {
        updatedFrontCustomization.texte = '';
      }
      
      updatedCustomizations.push(updatedFrontCustomization);
    }
    
    // Préparer la personnalisation arrière si elle est complète
    if (backCustomization.type_impression && backCustomization.position) {
      let updatedBackCustomization: SingleCustomization;
      
      if (backCustomization.type === 'image' || (selectedType === 'image' && currentFace === 'derriere')) {
        updatedBackCustomization = {
          ...backCustomization,
          texte: undefined,
          couleur_texte: undefined,
          police: undefined,
          type: 'image',
          face: 'derriere'
        };
      } else {
        updatedBackCustomization = {
          ...backCustomization,
          image_url: undefined,
          type: 'text',
          face: 'derriere'
        };
      }
      
      // S'assurer que tous les champs nécessaires sont présents
      if (updatedBackCustomization.type === 'text' && !updatedBackCustomization.texte) {
        updatedBackCustomization.texte = '';
      }
      
      updatedCustomizations.push(updatedBackCustomization);
    }
    
    // Créer un nouvel objet de personnalisation pour le calcul du prix
    const updatedProductCustomization = {
      ...productCustomization,
      customizations: updatedCustomizations
    };
    
    // Mettre à jour l'état global
    setProductCustomization(updatedProductCustomization);
    
    // Calculer le nouveau prix
    calculateCustomizationPrice(updatedProductCustomization);
    
    console.log('Personnalisations mises à jour:', updatedCustomizations);
  };
  
  // Fonction pour changer la face affichée dans la prévisualisation
  const switchPreviewFace = (newFace: Face) => {
    // Mettre à jour la face pour la prévisualisation
    setCurrentFace(newFace);
  };
  
  // Fonction pour mettre à jour la position avant
  const updateFrontPosition = (position: string) => {
    // Vérifier si on clique sur la position déjà sélectionnée (pour décocher)
    if (frontCustomization.position === position) {
      // Désélectionner la position (mettre à undefined)
      setFrontCustomization(prev => ({
        ...prev,
        position: undefined as unknown as string // Type cast pour satisfaire TypeScript
      }));
    } else {
      // Mettre à jour la position avant
      setFrontCustomization(prev => ({ ...prev, position }));
    }
    
    // Passer à la prévisualisation avant
    setCurrentFace('devant');
    
    // Mettre à jour les personnalisations globales
    updateCustomizations();
  };
  
  // Fonction pour mettre à jour la position arrière
  const updateBackPosition = (position: string) => {
    // Vérifier si on clique sur la position déjà sélectionnée (pour décocher)
    if (backCustomization.position === position) {
      // Désélectionner la position (mettre à undefined)
      setBackCustomization(prev => ({
        ...prev,
        position: undefined as unknown as string // Type cast pour satisfaire TypeScript
      }));
    } else {
      // Mettre à jour la position arrière
      setBackCustomization(prev => ({ ...prev, position }));
    }
    
    // Passer à la prévisualisation arrière
    setCurrentFace('derriere');
    
    // Mettre à jour les personnalisations globales
    updateCustomizations();
  };
  
  const handleSave = () => {
    // Mettre à jour les personnalisations avant de sauvegarder
    updateCustomizations();
    
    // Filtrer pour ne garder que les personnalisations complètes
    const completeCustomizations = productCustomization.customizations.filter(custom => isSingleCustomizationComplete(custom));
    
    // Créer une nouvelle personnalisation avec seulement les faces complètes
    const finalProductCustomization: ProductCustomization = {
      ...productCustomization,
      customizations: completeCustomizations
    };
    
    // Calculer le prix final
    const finalPrice = calculateCustomizationPrice(finalProductCustomization);
    
    // Mettre à jour l'état global
    setProductCustomization(finalProductCustomization);
    
    // Envoyer la personnalisation avec le prix
    console.log('Sauvegarde des personnalisations:', finalProductCustomization, 'Prix:', finalPrice);
    onSave(finalProductCustomization, finalPrice);
    
    if (!isEmbedded) {
      onClose();
    }
  };

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
    return frontValid || backValid;
  };
  


  return (
    <div className={`${!isOpen && !isEmbedded ? 'hidden' : ''} ${isEmbedded ? 'bg-white w-full' : 'fixed inset-0 z-50 overflow-y-auto'}`}>
      {/* Overlay pour la version modale */}
      {!isEmbedded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
      )}

      <div className={isEmbedded ? '' : 'relative min-h-screen flex items-center justify-center p-4'}>
        <div className={isEmbedded ? '' : 'relative bg-white rounded-lg shadow-xl max-w-4xl w-full'}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="w-6"></div> {/* Élément vide pour maintenir l'alignement */}
            {!isEmbedded && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
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
                      className={`flex-1 py-2 px-3 text-center font-medium ${currentFace === 'devant' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'} ${!hasFrontPosition() ? 'opacity-50' : ''}`}
                      onClick={() => switchPreviewFace('devant')}
                      disabled={!hasFrontPosition()}
                    >
                      <span className="flex items-center justify-center text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                        </svg>
                        Voir Devant {!hasFrontPosition() && '(non sélectionné)'}
                      </span>
                    </button>
                    <button
                      className={`flex-1 py-2 px-3 text-center font-medium ${currentFace === 'derriere' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'} ${!hasBackPosition() ? 'opacity-50' : ''}`}
                      onClick={() => switchPreviewFace('derriere')}
                      disabled={!hasBackPosition()}
                    >
                      <span className="flex items-center justify-center text-sm">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                        </svg>
                        Voir Arrière {!hasBackPosition() && '(non sélectionné)'}
                      </span>
                    </button>
                  </div>
                </div>
                
                {/* Prévisualisation du t-shirt avec zone d'impression */}
                {(currentFace === 'devant' && hasFrontPosition()) || (currentFace === 'derriere' && hasBackPosition()) ? (
                  <TShirtZonePreview 
                    face={currentFace} 
                    position={getCurrentCustomization().position || ''} 
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
                    
                    {getCurrentCustomization().position && (
                      <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg w-full">
                        <span className="font-medium mr-2">Position:</span>
                        <span className="font-bold">
                          {getCurrentCustomization().position.split('-').map((word: string) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                      onClick={() => updateCurrentCustomization({ type_impression: 'impression' })}
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
                      onClick={() => updateCurrentCustomization({ type_impression: 'broderie' })}
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
                          <span className="text-xs text-gray-600">{backCustomization.position ? 'Position sélectionnée (cliquez pour désélectionner)' : 'Aucune position sélectionnée (cliquez pour sélectionner)'}</span>
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
                          <span className="text-xs text-gray-600">{backCustomization.position ? 'Position sélectionnée (cliquez pour désélectionner)' : 'Aucune position sélectionnée (cliquez pour sélectionner)'}</span>
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
                  </div>
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
                                    updateCurrentCustomization({ 
                                      image_url: base64String
                                    });
                                    console.log('Image chargée avec succès en base64');
                                  }
                                };
                                reader.onerror = () => {
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

          {/* Footer avec boutons */}
          <div className="p-4 border-t flex justify-end space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!isFormValid()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
