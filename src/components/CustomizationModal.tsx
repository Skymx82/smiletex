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
                  <h3 className="font-bold">Broderie</h3>
                  <p className="text-sm text-gray-500">Résistant et élégant</p>
                </button>
                <button
                  className={`w-full p-4 border rounded-lg ${
                    customization.type_impression === 'flocage'
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-indigo-300'
                  }`}
                  onClick={() => setCustomization({ ...customization, type_impression: 'flocage' })}
                >
                  <h3 className="font-bold">Flocage</h3>
                  <p className="text-sm text-gray-500">Durable et économique</p>
                </button>
              </div>
            )}

            {/* Étape 2: Position */}
            {step === 2 && (
              <div className="space-y-4">
                {['haut', 'centre', 'bas'].map((pos) => (
                  <button
                    key={pos}
                    className={`w-full p-4 border rounded-lg ${
                      customization.position === pos
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                    onClick={() => setCustomization({ ...customization, position: pos })}
                  >
                    <h3 className="font-bold capitalize">{pos}</h3>
                  </button>
                ))}
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
