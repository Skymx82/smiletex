'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { FiCheckCircle, FiClock, FiShield, FiTruck } from 'react-icons/fi';

export default function DevisRapide() {
  const [step, setStep] = useState(1);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
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
          type: '',
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-black">
      <div className="max-w-3xl mx-auto">
        {formSubmitted ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <FiCheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Demande envoyée avec succès !</h2>
            <p className="text-xl text-gray-600 mb-6">
              Merci pour votre demande de devis. Notre équipe vous contactera dans les 24 heures avec une proposition personnalisée.
            </p>
            <button
              onClick={() => setFormSubmitted(false)}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md text-base font-medium hover:bg-indigo-700"
            >
              Faire une nouvelle demande
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Demande de devis
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Obtenez un devis personnalisé pour vos besoins en quelques clics
              </p>
            </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 text-xl">
            {['Produit', 'Personnalisation', 'Contact'].map((label, index) => (
              <div
                key={label}
                className={`text-xl font-medium ${
                  step > index + 1 ? 'text-indigo-600' : step === index + 1 ? 'text-indigo-600' : 'text-gray-500'
                }`}
              >
                {label}
              </div>
            ))}
          </div>
          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
            <div
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600 transition-all duration-500"
              style={{ width: `${((step - 1) / 2) * 100}%` }}
            />
          </div>
        </div>

        {/* Étape 1: Choix du type de produit */}
        {step === 1 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Quel produit souhaitez-vous personnaliser ?</h2>
            
            {/* Type de produit */}
            <div className="mb-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[
                  { type: 't-shirt', label: 'T-Shirt', image: '/images/t-shirt.jpg' },
                  { type: 'sweatshirt', label: 'Sweat-shirt', image: '/images/sweatshirt.jpg' },
                  { type: 'polo', label: 'Polo', image: '/images/polo.jpg' },
                  { type: 'pantalon', label: 'Pantalon', image: '/images/pantalon.png' },
                  { type: 'casquette', label: 'Casquette', image: '/images/casquette.png' },
                  { type: 'other', label: 'Autre produit', image: '/images/other.jpg' }
                ].map((product) => (
                  <button
                    key={product.type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type: product.type })}
                    className={`p-3 border rounded-lg transition-colors ${
                      formData.type === product.type 
                        ? 'border-indigo-500 bg-indigo-50' 
                        : 'border-gray-200 hover:border-gray-300'
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
                    </div>
                    <p className="text-sm font-medium text-center">{product.label}</p>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Produit non listé */}
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Vous ne trouvez pas votre produit ?</p>
              <textarea
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange as any}
                placeholder="Décrivez le produit que vous souhaitez personnaliser..."
                rows={2}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              />
            </div>
            
            <div className="mt-6">
              <button
                onClick={handleNext}
                disabled={!formData.type && !formData.specifications}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-base font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continuer
              </button>
            </div>
          </div>
        )}

        {/* Étape 2: Type d'entité et détails */}
        {step === 2 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Détails de votre projet</h2>
            <div className="space-y-5">
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
                      onClick={() => setFormData({ ...formData, entityType: entity.id })}
                      className={`py-2 px-3 border rounded-md text-sm font-medium transition-colors ${
                        formData.entityType === entity.id 
                          ? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
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
                    Délai souhaité
                  </label>
                  <select
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Sélectionnez un délai</option>
                    <option value="standard">Standard (2-3 semaines)</option>
                    <option value="urgent">Urgent (1 semaine)</option>
                    <option value="tres-urgent">Très urgent (3-5 jours)</option>
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.quantity || !formData.entityType}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3: Contact */}
        {step === 3 && (
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Vos coordonnées</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
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
              
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="privacy"
                      name="privacy"
                      type="checkbox"
                      required
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
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
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Envoyer la demande
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
