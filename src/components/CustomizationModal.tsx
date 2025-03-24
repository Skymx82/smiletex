'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProductCustomization, SingleCustomization, Face } from '@/types/customization';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customization: ProductCustomization) => void;
  isEmbedded?: boolean; // Indique si le composant est intégré directement dans la page
  initialCustomization?: ProductCustomization | null; // Personnalisation initiale pour l'édition
}

export default function CustomizationModal({ isOpen, onClose, onSave, isEmbedded = false, initialCustomization = null }: CustomizationModalProps) {
  // Initialisation d'une personnalisation vide
  const emptyCustomization: ProductCustomization = {
    customizations: []
  };
  
  // État pour stocker la personnalisation complète
  const [productCustomization, setProductCustomization] = useState<ProductCustomization>(emptyCustomization);
  
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
  const [step, setStep] = useState(1); // Gardé pour la version modale
  
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
    // Préparer la personnalisation en fonction du type sélectionné
    let updatedCustomization: SingleCustomization;
    
    if (selectedType === 'image') {
      // Si on utilise une image, supprimer les champs de texte
      const { texte, couleur_texte, police, ...rest } = currentCustomization;
      updatedCustomization = {
        ...rest,
        type: 'image',
        face: currentFace
      };
    } else {
      // Si on utilise du texte, supprimer le champ image_url
      const { image_url, ...rest } = currentCustomization;
      updatedCustomization = {
        ...rest,
        type: 'text',
        face: currentFace
      };
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
      // Créer une nouvelle personnalisation pour cette face
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
  };
  
  const handleSave = () => {
    // Sauvegarder d'abord les modifications sur la face actuelle
    updateCurrentFaceCustomization();
    
    // Envoyer la personnalisation complète
    onSave(productCustomization);
    
    if (!isEmbedded) {
      onClose();
    }
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleSave();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isFormValid = () => {
    return (
      currentCustomization.type_impression && 
      currentCustomization.position && 
      (selectedType === 'texte' ? currentCustomization.texte : currentCustomization.image_url)
    );
  };
  
  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !currentCustomization.type_impression;
      case 2:
        return !currentCustomization.position;
      case 3:
        if (selectedType === 'texte') {
          return !currentCustomization.texte;
        } else {
          return !currentCustomization.image_url;
        }
      default:
        return false;
    }
  };

  // Si le composant est intégré, on utilise un style différent qui montre toutes les options sur un seul écran
  if (isEmbedded) {
    return (
      <div className="bg-white w-full">
        {/* Sélecteur de face (devant/derrière) */}
        <div className="mb-4 flex border rounded-lg overflow-hidden">
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${currentFace === 'devant' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => switchFace('devant')}
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
              </svg>
              Devant
            </span>
          </button>
          <button
            className={`flex-1 py-3 px-4 text-center font-medium ${currentFace === 'derriere' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => switchFace('derriere')}
          >
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
              </svg>
              Derrière
            </span>
          </button>
        </div>
        <div className="p-4 grid grid-cols-1 gap-6">
          {/* Section 1: Type d'impression */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-sm">Type d'impression</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.type_impression === 'broderie' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                onClick={() => setCurrentCustomization({ ...currentCustomization, type_impression: 'broderie' })}
              >
                <div className="w-8 h-8 mb-1 flex items-center justify-center">
                  <Image
                    src="/images/broderie.png"
                    alt="Broderie"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium">Broderie</span>
              </button>
              <button
                className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.type_impression === 'flocage' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                onClick={() => setCurrentCustomization({ ...currentCustomization, type_impression: 'flocage' })}
              >
                <div className="w-8 h-8 mb-1 flex items-center justify-center">
                  <Image
                    src="/images/flocage.jpg"
                    alt="Flocage"
                    width={30}
                    height={30}
                    className="object-contain"
                  />
                </div>
                <span className="text-xs font-medium">Flocage</span>
              </button>
            </div>
          </div>

          {/* Section 2: Position */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-sm">Position</h3>
            
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Devant</h4>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.position === 'devant-pec' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-pec' })}
                  >
                    <div className="w-8 h-8 mb-1 flex items-center justify-center">
                      <Image
                        src="/images/positions/devant-pec.png"
                        alt="Pec Gauche"
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium">Pec Gauche</span>
                  </button>
                  <button
                    className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.position === 'devant-pecs' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-pecs' })}
                  >
                    <div className="w-8 h-8 mb-1 flex items-center justify-center">
                      <Image
                        src="/images/positions/devant-pecs.png"
                        alt="Deux Pecs"
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium">Deux Pecs</span>
                  </button>
                  <button
                    className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.position === 'devant-complet' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-complet' })}
                  >
                    <div className="w-8 h-8 mb-1 flex items-center justify-center">
                      <Image
                        src="/images/positions/devant-complet.png"
                        alt="Devant Complet"
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium">Devant</span>
                  </button>
                  <button
                    className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.position === 'devant-centre' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'devant-centre' })}
                  >
                    <div className="w-8 h-8 mb-1 flex items-center justify-center">
                      <Image
                        src="/images/positions/devant-pecs.png"
                        alt="Centre"
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium">Centre</span>
                  </button>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-700 mb-1">Dos</h4>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.position === 'dos-haut' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'dos-haut' })}
                  >
                    <div className="w-8 h-8 mb-1 flex items-center justify-center">
                      <Image
                        src="/images/positions/dos-haut.png"
                        alt="Haut du Dos"
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium">Haut</span>
                  </button>
                  <button
                    className={`p-2 border rounded-lg flex flex-col items-center ${currentCustomization.position === 'dos-complet' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                    onClick={() => setCurrentCustomization({ ...currentCustomization, position: 'dos-complet' })}
                  >
                    <div className="w-8 h-8 mb-1 flex items-center justify-center">
                      <Image
                        src="/images/positions/dos-complet.png"
                        alt="Dos Complet"
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    </div>
                    <span className="text-xs font-medium">Complet</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Contenu */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 text-sm">Type de contenu</h3>
            <div className="flex gap-2 mb-2">
              <button
                className={`flex-1 p-2 border rounded text-sm ${selectedType === 'texte' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                onClick={() => setSelectedType('texte')}
              >
                Texte
              </button>
              <button
                className={`flex-1 p-2 border rounded text-sm ${selectedType === 'image' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'}`}
                onClick={() => setSelectedType('image')}
              >
                Image
              </button>
            </div>
            
            {selectedType === 'texte' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Votre texte
                  </label>
                  <input
                    type="text"
                    value={currentCustomization.texte || ''}
                    onChange={(e) => setCurrentCustomization({ ...currentCustomization, texte: e.target.value })}
                    className="w-full p-2 border rounded-md text-sm"
                    placeholder="Entrez votre texte"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Couleur
                    </label>
                    <input
                      type="color"
                      value={currentCustomization.couleur_texte || '#000000'}
                      onChange={(e) => setCurrentCustomization({ ...currentCustomization, couleur_texte: e.target.value })}
                      className="w-full h-8 p-1 border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Police
                    </label>
                    <select
                      value={currentCustomization.police || 'Arial'}
                      onChange={(e) => setCurrentCustomization({ ...currentCustomization, police: e.target.value })}
                      className="w-full p-2 border rounded-md text-sm"
                    >
                      <option value="Arial">Arial</option>
                      <option value="Helvetica">Helvetica</option>
                      <option value="Times New Roman">Times New Roman</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Télécharger une image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const tempUrl = URL.createObjectURL(file);
                      setCurrentCustomization({ ...currentCustomization, image_url: tempUrl });
                    }
                  }}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer avec bouton de sauvegarde */}
        <div className="flex justify-end p-3 border-t">
          <button
            onClick={handleSave}
            disabled={!isFormValid()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Enregistrer
          </button>
        </div>
      </div>
    );
  }
  
  // Version modale (originale)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-xl font-bold text-gray-900">
              {step === 1 && "Type d'impression"}
              {step === 2 && "Position"}
              {step === 3 && "Personnalisation"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Étape 1: Type d'impression */}
            {step === 1 && (
              <div className="space-y-4">
                <button
                  className={`w-full p-4 border rounded-lg ${
                    currentCustomization.type_impression === 'broderie'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setCurrentCustomization({ ...currentCustomization, type_impression: 'broderie' })}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <h3 className="font-bold text-lg mb-2">Broderie</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">✓ Résistant aux lavages fréquents</p>
                        <p className="text-sm text-gray-900">✓ Aspect haut de gamme et professionnel</p>
                        <p className="text-sm text-gray-900">✓ Idéal pour les logos d'entreprise</p>
                        <p className="text-sm text-gray-900">✓ Dure plusieurs années</p>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">Recommandé pour : Uniformes, polos, casquettes</p>
                    </div>
                    <div className="w-24 h-24 border rounded-lg flex items-center justify-center ml-4">
                      <Image
                        src="/images/broderie.png"
                        alt="Exemple de broderie sur textile"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </button>
                <button
                  className={`w-full p-4 border rounded-lg ${
                    currentCustomization.type_impression === 'flocage'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setCurrentCustomization({ ...currentCustomization, type_impression: 'flocage' })}
                >
                  <div className="flex justify-between items-start">
                    <div className="text-left">
                      <h3 className="font-bold text-lg mb-2">Flocage</h3>
                      <div className="space-y-2">
                        <p className="text-sm text-gray-900">✓ Excellent rapport qualité-prix</p>
                        <p className="text-sm text-gray-900">✓ Rendu mat et doux au toucher</p>
                        <p className="text-sm text-gray-900">✓ Parfait pour les designs colorés</p>
                        <p className="text-sm text-gray-900">✓ Application rapide</p>
                      </div>
                      <p className="mt-3 text-sm text-gray-600">Recommandé pour : T-shirts, sweats, textiles sportifs</p>
                    </div>
                    <div className="w-24 h-24 border rounded-lg flex items-center justify-center ml-4">
                      <Image
                        src="/images/flocage.jpg"
                        alt="Exemple de flocage sur textile"
                        width={80}
                        height={80}
                        className="object-contain"
                      />
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Étape 2: Position */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold mb-3">Devant</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'devant-pec', label: 'Pec Gauche', alt: 'Petit logo sur le pec gauche, style professionnel' },
                      { id: 'devant-pecs', label: 'Deux Pecs', alt: 'Texte ou logo étendu sur la largeur des pecs' },
                      { id: 'devant-complet', label: 'Devant Complet', alt: 'Design qui prend tout le devant du t-shirt' }
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        className={`w-full p-4 border rounded-lg ${
                          currentCustomization.position === pos.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: pos.id })}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-left">{pos.label}</h3>
                            <p className="text-sm text-gray-900 text-left mt-1">{pos.alt}</p>
                          </div>
                          <div className="w-20 h-20 border rounded-lg flex items-center justify-center">
                            <Image
                              src={`/images/positions/${pos.id}.png`}
                              alt={pos.alt}
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-bold mb-3">Dos</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {[
                      { id: 'dos-haut', label: 'Haut du Dos', alt: 'Bande en haut du dos, parfait pour les noms' },
                      { id: 'dos-complet', label: 'Dos Complet', alt: 'Design qui prend tout le dos du t-shirt' }
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        className={`w-full p-4 border rounded-lg ${
                          currentCustomization.position === pos.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setCurrentCustomization({ ...currentCustomization, position: pos.id })}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-left">{pos.label}</h3>
                            <p className="text-sm text-gray-900 text-left mt-1">{pos.alt}</p>
                          </div>
                          <div className="w-20 h-20 border rounded-lg flex items-center justify-center">
                            <Image
                              src={`/images/positions/${pos.id}.png`}
                              alt={pos.alt}
                              width={64}
                              height={64}
                              className="object-contain"
                            />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3: Contenu */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex gap-4 mb-4">
                  <button
                    className={`flex-1 p-2 border rounded ${
                      selectedType === 'texte' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                    }`}
                    onClick={() => setSelectedType('texte')}
                  >
                    Texte
                  </button>
                  <button
                    className={`flex-1 p-2 border rounded ${
                      selectedType === 'image' ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                    }`}
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
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // Dans un vrai projet, vous devriez uploader l'image vers votre serveur/stockage
                          // et utiliser l'URL retournée
                          const tempUrl = URL.createObjectURL(file);
                          setCurrentCustomization({ ...currentCustomization, image_url: tempUrl });
                        }
                      }}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-between p-4 border-t">
            <button
              onClick={step === 1 ? onClose : handleBack}
              className="px-4 py-2 text-gray-700 hover:text-gray-900"
            >
              {step === 1 ? 'Annuler' : 'Retour'}
            </button>
            <button
              onClick={handleNext}
              disabled={isNextDisabled()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {step === 3 ? 'Terminer' : 'Suivant'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
