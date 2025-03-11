'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { ProductCustomization } from '@/lib/customization';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customization: ProductCustomization) => void;
}

export default function CustomizationModal({ isOpen, onClose, onSave }: CustomizationModalProps) {
  const [step, setStep] = useState(1);
  const [customization, setCustomization] = useState<ProductCustomization>({
    type_impression: '',
    position: '',
    texte: '',
    couleur_texte: '#000000',
    police: 'Arial'
  });

  const [selectedType, setSelectedType] = useState<'texte' | 'image'>('texte');

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // Si on utilise une image, supprimer les champs de texte
      if (selectedType === 'image') {
        const { texte, couleur_texte, police, ...rest } = customization;
        onSave(rest);
      } else {
        // Si on utilise du texte, supprimer le champ image_url
        const { image_url, ...rest } = customization;
        onSave(rest);
      }
      onClose();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const isNextDisabled = () => {
    switch (step) {
      case 1:
        return !customization.type_impression;
      case 2:
        return !customization.position;
      case 3:
        if (selectedType === 'texte') {
          return !customization.texte;
        } else {
          return !customization.image_url;
        }
      default:
        return false;
    }
  };

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
                    customization.type_impression === 'broderie'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setCustomization({ ...customization, type_impression: 'broderie' })}
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
                    customization.type_impression === 'flocage'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setCustomization({ ...customization, type_impression: 'flocage' })}
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
                          customization.position === pos.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setCustomization({ ...customization, position: pos.id })}
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
                          customization.position === pos.id
                            ? 'border-indigo-600 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setCustomization({ ...customization, position: pos.id })}
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
                        value={customization.texte || ''}
                        onChange={(e) => setCustomization({ ...customization, texte: e.target.value })}
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
                        value={customization.couleur_texte || '#000000'}
                        onChange={(e) => setCustomization({ ...customization, couleur_texte: e.target.value })}
                        className="w-full h-10 p-1 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Police
                      </label>
                      <select
                        value={customization.police || 'Arial'}
                        onChange={(e) => setCustomization({ ...customization, police: e.target.value })}
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
                          setCustomization({ ...customization, image_url: tempUrl });
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
