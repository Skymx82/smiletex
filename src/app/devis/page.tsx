'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiCheckCircle, FiClock, FiShield, FiTruck } from 'react-icons/fi';

export default function DevisRapide() {
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  // Définir le type pour un produit
  type Product = {
    type: string;
    label: string;
    image: string;
  };

  // Définir le type pour formData
  type FormDataType = {
    selectedProducts: Product[];
    quantity: string;
    text: string;
    email: string;
    phone: string;
    name: string;
    company: string;
    deadline: string;
    specifications: string;
    entityType: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    selectedProducts: [], // Array pour stocker plusieurs produits sélectionnés
    quantity: '',
    text: '',
    email: '',
    phone: '',
    name: '',
    company: '',
    deadline: '',
    specifications: '',
    entityType: ''
  });
  
  // Types d'entités pour le formulaire
  const entityTypes = [
    { id: 'entreprise', label: 'Entreprise' },
    { id: 'association', label: 'Association' },
    { id: 'particulier', label: 'Particulier' },
    { id: 'ecole', label: 'École/Université' },
    { id: 'autre', label: 'Autre' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/send-devis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        setFormSubmitted(true);
        setStep(1);
        setFormData({
          selectedProducts: [],
          quantity: '',
          text: '',
          email: '',
          phone: '',
          name: '',
          company: '',
          deadline: '',
          specifications: '',
          entityType: ''
        });
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      alert("Une erreur est survenue lors de l'envoi du devis. Veuillez réessayer.");
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-4 sm:px-6 lg:px-8 text-black relative overflow-hidden">
      {/* Éléments graphiques abstraits */}
      <div className="absolute left-0 top-1/4 w-72 h-72 rounded-full bg-[#FCEB14] opacity-5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute right-0 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute left-1/3 bottom-1/2 w-48 h-48 rounded-full bg-indigo-300 opacity-5 blur-3xl animate-pulse-slow"></div>
      
      <div className="max-w-3xl mx-auto relative z-10">
        {formSubmitted ? (
          <div className="bg-white shadow-lg rounded-xl p-8 text-center border border-gray-100">
            <div className="flex justify-center mb-6 relative">
              <div className="absolute -z-10 w-32 h-32 bg-green-100 rounded-full opacity-60 blur-xl"></div>
              <div className="bg-green-50 rounded-full p-4 shadow-sm">
                <FiCheckCircle className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              <span className="relative inline-block">
                Demande envoyée avec succès !
                <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full"></span>
              </span>
            </h2>
            <p className="text-xl text-gray-600 mb-6">
              Merci pour votre demande de devis. Notre équipe vous contactera dans les 24 heures avec une proposition personnalisée.
            </p>
            <button
              onClick={() => setFormSubmitted(false)}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-base font-medium hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent w-1/2 blur-xl transform transition-transform duration-500 ease-out translate-x-[-200%] group-hover:translate-x-[200%]"></div>
              <span className="relative z-10 flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Faire une nouvelle demande
              </span>
              <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="inline-block mb-3 bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-semibold tracking-wide shadow-sm">
                DEVIS PERSONNALISÉ
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                <span className="relative inline-block">
                  Demande de devis
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full transform scale-x-100"></span>
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Obtenez un devis personnalisé pour vos besoins en quelques clics
              </p>
            </div>

        {/* Barre de progression interactive */}
        <div className="mb-6">
          <div className="grid grid-cols-3 gap-4 mb-4">
            {['Produit', 'Personnalisation', 'Contact'].map((label, index) => {
              // Déterminer si l'étape est accessible (on peut cliquer sur les étapes précédentes ou l'étape actuelle)
              const isAccessible = index + 1 <= step;
              // Déterminer si c'est l'étape active
              const isActive = step === index + 1;
              // Déterminer si l'étape est complétée
              const isCompleted = step > index + 1;
              // Déterminer le style en fonction de l'état
              const textStyle = isActive ? 'text-indigo-600 font-semibold' : 
                                isAccessible ? 'text-indigo-600' : 'text-gray-400';
              const barStyle = isActive ? 'bg-indigo-600' : 
                              isCompleted ? 'bg-indigo-600' : 'bg-gray-200';
              
              return (
                <div key={label} className="flex flex-col items-center">
                  {/* Étape avec numéro */}
                  <button
                    onClick={() => isAccessible ? setStep(index + 1) : null}
                    disabled={!isAccessible}
                    className={`text-sm flex items-center mb-2 ${isAccessible ? 'cursor-pointer hover:opacity-90' : 'cursor-not-allowed'}`}
                  >
                    <span className={`inline-flex items-center justify-center h-5 w-5 rounded-full mr-1 text-xs ${isActive ? 'bg-indigo-600 text-white' : isAccessible ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-200 text-gray-500'}`}>
                      {index + 1}
                    </span>
                    <span className={textStyle}>{label}</span>
                  </button>
                  
                  {/* Barre de progression */}
                  <div 
                    className={`h-2 rounded-md w-full transition-all duration-300 ${barStyle}`}
                    onClick={() => isAccessible ? setStep(index + 1) : null}
                    style={{ cursor: isAccessible ? 'pointer' : 'not-allowed' }}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Étape 1: Choix du type de produit */}
        {step === 1 && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Sélectionnez un ou plusieurs produits à personnaliser</h2>
            
            {/* Types de produits (sélection multiple) */}
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Vous pouvez sélectionner plusieurs articles pour votre devis</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { type: 't-shirt', label: 'T-Shirt', image: '/images/t-shirt.jpg' },
                  { type: 'sweatshirt', label: 'Sweat-shirt', image: '/images/sweatshirt.jpg' },
                  { type: 'polo', label: 'Polo', image: '/images/polo.jpg' },
                  { type: 'pantalon', label: 'Pantalon', image: '/images/pantalon.png' },
                  { type: 'casquette', label: 'Casquette', image: '/images/casquette.png' },
                  { type: 'other', label: 'Autre produit', image: '/images/other.jpg' },
                  { type: 'tote-bag', label: 'Tote bag', image: '/images/tote-bag.jpg' },
                  { type: 'veste', label: 'Veste softshell', image: '/images/veste.jpg' },
                  { type: 'workwear', label: 'Vêtements de travail', image: '/images/workwear.jpg' }
                ].map((product) => {
                  // Vérifier si le produit est sélectionné
                  const isSelected = formData.selectedProducts.some(p => p.type === product.type);
                  
                  return (
                    <button
                      key={product.type}
                      type="button"
                      onClick={() => {
                        // Logique de sélection/désélection multiple
                        if (isSelected) {
                          // Si déjà sélectionné, retirer de la liste
                          const updatedProducts = formData.selectedProducts.filter(p => p.type !== product.type);
                          setFormData(prevState => ({
                            ...prevState,
                            selectedProducts: updatedProducts
                          }));
                        } else {
                          // Sinon, ajouter à la liste
                          setFormData(prevState => ({
                            ...prevState,
                            selectedProducts: [...prevState.selectedProducts, product]
                          }));
                        }
                      }}
                      className={`p-3 border rounded-xl transition-all duration-300 shadow-sm hover:shadow-md ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200 transform scale-[1.02]' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="relative w-full pb-[80%] mb-2">
                        <Image
                          src={product.image}
                          alt={product.label}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-contain rounded-md absolute inset-0 w-full h-full"
                          priority
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 bg-indigo-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                            ✓
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-center">{product.label}</p>
                    </button>
                  );
                })}
              </div>
            </div>
            

            

            
            <div className="mt-6">
              <button
                onClick={handleNext}
                disabled={formData.selectedProducts.length === 0 && !formData.specifications}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-base font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Étape 2: Type d'entité et détails */}
        {step === 2 && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Détails de votre projet</h2>
            <div className="space-y-4">
              {/* Type d'entité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vous êtes : <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {entityTypes.map((entity) => (
                    <button
                      key={entity.id}
                      type="button"
                      onClick={() => setFormData(prevState => ({ ...prevState, entityType: entity.id }))}
                      className={`py-3 px-4 border-2 rounded-lg text-base font-medium transition-colors ${
                        formData.entityType === entity.id 
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-700 shadow-sm' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400'
                      }`}
                    >
                      {entity.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité souhaitée <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  >
                    <option value="">Sélectionnez une quantité</option>
                    <option value="1-10">1 à 10</option>
                    <option value="11-50">11 à 50</option>
                    <option value="51-100">51 à 100</option>
                    <option value="100+">Plus de 100</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Délai de livraison
                  </label>
                  <select
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sélectionnez un délai</option>
                    <option value="classique">Livraison classique : 3 semaines</option>
                    <option value="prioritaire">Livraison prioritaire : 2 semaines</option>
                    <option value="express">Livraison express : 1 semaine (ou moins)</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Texte ou logo à imprimer
                </label>
                <input
                  type="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Ex: Nom de votre entreprise, slogan..."
                  className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              {formData.specifications && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Détails supplémentaires
                  </label>
                  <textarea
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleInputChange as any}
                    placeholder="Précisez vos besoins..."
                    rows={2}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              )}
              
              <div className="flex justify-between pt-4">
                <button
                  onClick={handleBack}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-300 hover:border-gray-400"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Retour
                  </span>
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.quantity || !formData.entityType}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent w-1/2 blur-xl transform transition-transform duration-500 ease-out translate-x-[-200%] group-hover:translate-x-[200%]"></div>
                  <span className="relative z-10 flex items-center justify-center">
                    Suivant
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3: Contact */}
        {step === 3 && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-4 border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Vos coordonnées</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    placeholder="Votre nom"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                
                {(formData.entityType === 'entreprise' || formData.entityType === 'association' || formData.entityType === 'ecole') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {formData.entityType === 'entreprise' ? 'Entreprise' : 
                       formData.entityType === 'association' ? 'Association' : 'Établissement'} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      required
                      placeholder={`Nom de votre ${formData.entityType === 'entreprise' ? 'entreprise' : 
                                   formData.entityType === 'association' ? 'association' : 'établissement'}`}
                      className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    />
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    placeholder="votre@email.com"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    placeholder="06 12 34 56 78"
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>
              
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 shadow-sm">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="privacy"
                      name="privacy"
                      type="checkbox"
                      required
                      className="h-5 w-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 focus:ring-offset-2"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="privacy" className="font-medium text-gray-700">
                      J'accepte que mes données soient utilisées pour me recontacter <span className="text-red-500">*</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-4 py-3 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-all duration-300 hover:border-gray-400"
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Retour
                  </span>
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl text-sm font-medium hover:from-indigo-700 hover:to-indigo-800 shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent w-1/2 blur-xl transform transition-transform duration-500 ease-out translate-x-[-200%] group-hover:translate-x-[200%]"></div>
                  <span className="relative z-10 flex items-center justify-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                    </svg>
                    Envoyer la demande
                  </span>
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
                </button>
              </div>
            </form>
          </div>
        )}
          </>
        )}
      </div>
    </div>
  );
}
