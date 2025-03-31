'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductCustomization, SingleCustomization, Face } from '@/types/customization';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customization: ProductCustomization) => void;
  isEmbedded?: boolean;
  initialCustomization?: ProductCustomization | null;
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

export default function CustomizationModal({ isOpen, onClose, onSave, isEmbedded = false, initialCustomization = null }: CustomizationModalProps) {
  // Initialisation d'une personnalisation vide
  const emptyCustomization: ProductCustomization = {
    customizations: []
  };
  
  // État pour stocker la personnalisation complète
  const [productCustomization, setProductCustomization] = useState<ProductCustomization>(initialCustomization || emptyCustomization);
  
  // État pour la face actuellement sélectionnée (devant ou derrière)
  const [currentFace, setCurrentFace] = useState<Face>('devant');
  
  // État pour la personnalisation de la face actuellement sélectionnée
  const [currentCustomization, setCurrentCustomization] = useState<SingleCustomization>({
    type_impression: '',
    position: 'devant-pec',
    texte: '',
    couleur_texte: '#000000',
    police: 'Arial',
    type: 'text',
    face: 'devant'
  });

  const [selectedType, setSelectedType] = useState<'texte' | 'image'>('texte');
  
  // Initialiser avec les données existantes si disponibles
  useEffect(() => {
    if (initialCustomization) {
      setProductCustomization(initialCustomization);
      
      // Si des personnalisations existent déjà, charger la première
      if (initialCustomization.customizations && initialCustomization.customizations.length > 0) {
        const frontCustomization = initialCustomization.customizations.find(c => c.face === 'devant');
        if (frontCustomization) {
          setCurrentCustomization(frontCustomization);
          setSelectedType(frontCustomization.type === 'text' ? 'texte' : 'image');
          setCurrentFace('devant');
        }
      }
    }
  }, [initialCustomization]);

  if (!isOpen && !isEmbedded) return null;

  // Fonction pour mettre à jour la personnalisation de la face actuelle
  const updateCurrentFaceCustomization = () => {
    // Vérifier si les champs obligatoires sont remplis
    if (!currentCustomization.type_impression || !currentCustomization.position) {
      console.warn('Tentative de mise à jour d\'une personnalisation incomplète');
      return;
    }

    // Préparer la personnalisation en fonction du type sélectionné
    let updatedCustomization: SingleCustomization;
    
    if (selectedType === 'image') {
      // Si on utilise une image, supprimer les champs de texte mais conserver les autres propriétés
      updatedCustomization = {
        ...currentCustomization,
        texte: undefined,
        couleur_texte: undefined,
        police: undefined,
        type: 'image',
        face: currentFace
      };
    } else {
      // Si on utilise du texte, supprimer le champ image_url mais conserver les autres propriétés
      updatedCustomization = {
        ...currentCustomization,
        image_url: undefined,
        type: 'text',
        face: currentFace
      };
    }
    
    // S'assurer que tous les champs nécessaires sont présents
    if (updatedCustomization.type === 'text' && !updatedCustomization.texte) {
      updatedCustomization.texte = '';
    }
    
    // Mettre à jour la liste des personnalisations
    const updatedCustomizations = [...productCustomization.customizations];
    
    // Trouver l'index de la personnalisation pour cette face, s'il existe
    const existingIndex = updatedCustomizations.findIndex(c => c.face === currentFace);
    
    if (existingIndex >= 0) {
      // Mettre à jour la personnalisation existante
      updatedCustomizations[existingIndex] = updatedCustomization;
    } else {
      // Ajouter une nouvelle personnalisation
      updatedCustomizations.push(updatedCustomization);
    }
    
    // Mettre à jour l'état global
    setProductCustomization({
      ...productCustomization,
      customizations: updatedCustomizations
    });
    
    console.log('Personnalisation mise à jour:', updatedCustomization);
  };
  
  // Fonction pour changer de face (devant/derrière)
  const switchFace = (newFace: Face) => {
    // Sauvegarder d'abord les modifications sur la face actuelle
    updateCurrentFaceCustomization();
    
    // Changer de face
    setCurrentFace(newFace);
    
    // Charger la personnalisation de la nouvelle face si elle existe
    const faceCustomization = productCustomization.customizations.find(c => c.face === newFace);
    
    if (faceCustomization) {
      // Charger la personnalisation existante
      setCurrentCustomization(faceCustomization);
      setSelectedType(faceCustomization.type === 'text' ? 'texte' : 'image');
    } else {
      // Vérifier si la face actuelle a une personnalisation pour copier ses paramètres
      const currentFaceCustomization = productCustomization.customizations.find(c => c.face === currentFace);
      
      if (currentFaceCustomization && currentFaceCustomization.type_impression) {
        // Copier les paramètres de la face actuelle pour la nouvelle face
        setCurrentCustomization({
          ...currentFaceCustomization,
          position: newFace === 'devant' ? 'devant-pec' : 'dos-haut',
          face: newFace
        });
        setSelectedType(currentFaceCustomization.type === 'text' ? 'texte' : 'image');
      } else {
        // Créer une nouvelle personnalisation vide pour cette face
        setCurrentCustomization({
          type_impression: '',
          position: newFace === 'devant' ? 'devant-pec' : 'dos-haut',
          texte: '',
          couleur_texte: '#000000',
          police: 'Arial',
          type: 'text',
          face: newFace
        });
        setSelectedType('texte');
      }
    }
  };
  
  const handleSave = () => {
    // Forcer la mise à jour de la personnalisation actuelle avant de sauvegarder
    if (currentCustomization.type_impression && currentCustomization.position) {
      // Préparer la personnalisation en fonction du type sélectionné
      let updatedCurrentCustomization: SingleCustomization;
      
      if (selectedType === 'image') {
        updatedCurrentCustomization = {
          ...currentCustomization,
          texte: undefined,
          couleur_texte: undefined,
          police: undefined,
          type: 'image',
          face: currentFace
        };
      } else {
        updatedCurrentCustomization = {
          ...currentCustomization,
          image_url: undefined,
          type: 'text',
          face: currentFace
        };
      }
      
      // Mettre à jour la liste des personnalisations pour la face actuelle
      let updatedCustomizations = [...productCustomization.customizations];
      const existingIndex = updatedCustomizations.findIndex(c => c.face === currentFace);
      
      if (existingIndex >= 0) {
        updatedCustomizations[existingIndex] = updatedCurrentCustomization;
      } else {
        updatedCustomizations.push(updatedCurrentCustomization);
      }
      
      // Nous ne créons plus automatiquement une personnalisation pour l'autre face
      // Le client peut choisir de personnaliser uniquement la face actuelle
      
      // Nous conservons uniquement les personnalisations qui ont été explicitement créées par l'utilisateur
      
      // Créer une nouvelle personnalisation complète avec les deux faces
      const finalProductCustomization: ProductCustomization = {
        ...productCustomization,
        customizations: updatedCustomizations
      };
      
      // Mettre à jour l'état global
      setProductCustomization(finalProductCustomization);
      
      // Envoyer la personnalisation complète
      console.log('Sauvegarde des personnalisations:', finalProductCustomization);
      onSave(finalProductCustomization);
    } else {
      // Aucune personnalisation valide, envoyer quand même l'état actuel
      console.log('Sauvegarde sans personnalisation valide:', productCustomization);
      onSave(productCustomization);
    }
    
    if (!isEmbedded) {
      onClose();
    }
  };

  const isFormValid = () => {
    return (
      currentCustomization.type_impression && 
      currentCustomization.position && 
      (selectedType === 'texte' ? currentCustomization.texte : currentCustomization.image_url)
    );
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
            <h2 className="text-xl font-bold text-gray-900">Personnalisation</h2>
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
                
                {/* Sélecteur de face (devant/derrière) */}
                <div className="mb-4 flex border rounded-lg overflow-hidden w-full max-w-xs">
                  <button
                    className={`flex-1 py-2 px-3 text-center font-medium ${currentFace === 'devant' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => switchFace('devant')}
                  >
                    <span className="flex items-center justify-center text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                      </svg>
                      Devant
                    </span>
                  </button>
                  <button
                    className={`flex-1 py-2 px-3 text-center font-medium ${currentFace === 'derriere' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                    onClick={() => switchFace('derriere')}
                  >
                    <span className="flex items-center justify-center text-sm">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                      </svg>
                      Derrière
                    </span>
                  </button>
                </div>
                
                {/* Prévisualisation du t-shirt avec zone d'impression */}
                <TShirtZonePreview 
                  face={currentFace} 
                  position={currentCustomization.position} 
                />
                
                {/* Informations sur la personnalisation actuelle */}
                <div className="mt-4 text-sm text-gray-600 w-full max-w-xs">
                  <div className="flex flex-col space-y-2 items-center justify-center">
                    <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg w-full">
                      <span className="font-medium mr-2">Type:</span> 
                      <span className="font-bold">
                        {currentCustomization.type_impression === 'broderie' ? 'Broderie' : 
                         currentCustomization.type_impression === 'flocage' ? 'Flocage' : 'Non sélectionné'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg w-full">
                      <span className="font-medium mr-2">Face:</span>
                      <span className="font-bold">
                        {currentFace === 'devant' ? 'Devant' : 'Derrière'}
                      </span>
                    </div>
                    
                    {currentCustomization.position && (
                      <div className="flex items-center justify-center px-3 py-2 bg-gray-100 rounded-lg w-full">
                        <span className="font-medium mr-2">Position:</span>
                        <span className="font-bold">
                          {currentCustomization.position.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
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
                      className={`relative overflow-hidden rounded-lg transition-all duration-200 ${currentCustomization.type_impression === 'broderie' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                      onClick={() => setCurrentCustomization({ ...currentCustomization, type_impression: 'broderie' })}
                    >
                      <div className="aspect-square w-full bg-gray-50 overflow-hidden relative">
                        <Image
                          src="/images/broderie.png"
                          alt="Broderie"
                          fill
                          className="object-cover"
                        />
                        {currentCustomization.type_impression === 'broderie' && (
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
                    
                    <button
                      className={`relative overflow-hidden rounded-lg transition-all duration-200 ${currentCustomization.type_impression === 'flocage' ? 'ring-2 ring-indigo-600 shadow-md' : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
                      onClick={() => setCurrentCustomization({ ...currentCustomization, type_impression: 'flocage' })}
                    >
                      <div className="aspect-square w-full bg-gray-50 overflow-hidden relative">
                        <Image
                          src="/images/flocage.jpg"
                          alt="Flocage"
                          fill
                          className="object-cover"
                        />
                        {currentCustomization.type_impression === 'flocage' && (
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
                          <span className="font-medium">Flocage</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Section 2: Position */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm">Position</h3>
                  
                  {currentFace === 'devant' ? (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={`p-2 border rounded-lg flex items-center ${currentCustomization.position === 'devant-pec' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-pec' })}
                      >
                        <div className="w-10 h-10 mr-2 flex items-center justify-center">
                          <Image
                            src="/images/positions/devant-pec.png"
                            alt="Pec Gauche"
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm">Pec Gauche</span>
                      </button>
                      <button
                        className={`p-2 border rounded-lg flex items-center ${currentCustomization.position === 'devant-pecs' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-pecs' })}
                      >
                        <div className="w-10 h-10 mr-2 flex items-center justify-center">
                          <Image
                            src="/images/positions/devant-pecs.png"
                            alt="Deux Pecs"
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm">Deux Pecs</span>
                      </button>
                      <button
                        className={`p-2 border rounded-lg flex items-center ${currentCustomization.position === 'devant-complet' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-complet' })}
                      >
                        <div className="w-10 h-10 mr-2 flex items-center justify-center">
                          <Image
                            src="/images/positions/devant-complet.png"
                            alt="Devant Complet"
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm">Devant</span>
                      </button>
                      <button
                        className={`p-2 border rounded-lg flex items-center ${currentCustomization.position === 'devant-centre' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-centre' })}
                      >
                        <div className="w-10 h-10 mr-2 flex items-center justify-center">
                          <Image
                            src="/images/positions/devant-centre.png"
                            alt="Centre"
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm">Centre</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        className={`p-2 border rounded-lg flex items-center ${currentCustomization.position === 'dos-haut' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'dos-haut' })}
                      >
                        <div className="w-10 h-10 mr-2 flex items-center justify-center">
                          <Image
                            src="/images/positions/dos-haut.png"
                            alt="Haut du Dos"
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm">Haut du Dos</span>
                      </button>
                      <button
                        className={`p-2 border rounded-lg flex items-center ${currentCustomization.position === 'dos-complet' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'dos-complet' })}
                      >
                        <div className="w-10 h-10 mr-2 flex items-center justify-center">
                          <Image
                            src="/images/positions/dos-complet.png"
                            alt="Dos Complet"
                            width={36}
                            height={36}
                            className="object-contain"
                          />
                        </div>
                        <span className="text-sm">Dos Complet</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Section 3: Contenu */}
                <div className="space-y-3">
                  <h3 className="font-bold text-gray-800 text-sm">Contenu</h3>
                  
                  <div className="flex gap-4 mb-4">
                    <button
                      className={`flex-1 p-2 border rounded ${selectedType === 'texte' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedType('texte')}
                    >
                      Texte
                    </button>
                    <button
                      className={`flex-1 p-2 border rounded ${selectedType === 'image' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                      onClick={() => setSelectedType('image')}
                    >
                      Image
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
                          value={currentCustomization.texte || ''}
                          onChange={(e) => setCurrentCustomization({ ...currentCustomization, texte: e.target.value })}
                          className="w-full p-2 border rounded-md"
                          placeholder="Entrez votre texte"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Couleur
                        </label>
                        <input
                          type="color"
                          value={currentCustomization.couleur_texte || '#000000'}
                          onChange={(e) => setCurrentCustomization({ ...currentCustomization, couleur_texte: e.target.value })}
                          className="w-full h-10 p-1 border rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Police
                        </label>
                        <select
                          value={currentCustomization.police || 'Arial'}
                          onChange={(e) => setCurrentCustomization({ ...currentCustomization, police: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="Arial">Arial</option>
                          <option value="Helvetica">Helvetica</option>
                          <option value="Times New Roman">Times New Roman</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Télécharger une image
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
                                    setCurrentCustomization({ 
                                      ...currentCustomization, 
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
                        />
                        
                        {currentCustomization.image_url && (
                          <div className="flex flex-col items-center mt-3">
                            <div className="relative h-32 w-32 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={currentCustomization.image_url} 
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
