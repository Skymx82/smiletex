'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export default function DevisRapide() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: '',
    quantity: '',
    text: '',
    email: '',
    phone: '',
    name: ''
  });

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
    // Ici nous enverrons le devis par email plus tard
    alert("Votre demande de devis a été envoyée ! Nous vous contacterons très rapidement.");
    setStep(1);
    setFormData({
      type: '',
      quantity: '',
      text: '',
      email: '',
      phone: '',
      name: ''
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Devis Rapide
          </h1>
          <p className="text-xl text-gray-600">
            Obtenez un devis personnalisé en quelques clics
          </p>
        </div>

        {/* Barre de progression */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {['Produit', 'Personnalisation', 'Contact'].map((label, index) => (
              <div
                key={label}
                className={`text-sm font-medium ${
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

        {/* Étape 1: Choix du produit */}
        {step === 1 && (
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Quel type de produit souhaitez-vous personnaliser ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { type: 't-shirt', label: 'T-Shirt', image: '/images/t-shirt.jpg' },
                { type: 'sweatshirt', label: 'Sweat-shirt', image: '/images/sweatshirt.jpg' },
                { type: 'polo', label: 'Polo', image: '/images/polo.jpg' },
                { type: 'other', label: 'Autre', image: '/images/other.jpg' }
              ].map((product) => (
                <button
                  key={product.type}
                  onClick={() => {
                    setFormData({ ...formData, type: product.type });
                    handleNext();
                  }}
                  className={`p-4 border-2 rounded-lg transition-all duration-200 hover:border-indigo-600 hover:shadow-lg ${
                    formData.type === product.type ? 'border-indigo-600 bg-indigo-50' : 'border-gray-200'
                  }`}
                >
                  <div className="relative w-full pb-[100%] mb-4">
                    <Image
                      src={product.image}
                      alt={product.label}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain rounded-lg absolute inset-0 w-full h-full"
                      priority
                    />
                  </div>
                  <p className="text-lg font-medium text-gray-900 text-center">{product.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2: Personnalisation */}
        {step === 2 && (
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Détails de votre commande</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité souhaitée
                </label>
                <select
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
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
                  Texte ou logo à imprimer (optionnel)
                </label>
                <input
                  type="text"
                  name="text"
                  value={formData.text}
                  onChange={handleInputChange}
                  placeholder="Ex: Nom de votre entreprise"
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-between pt-6">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleNext}
                  disabled={!formData.quantity}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md text-base font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Étape 3: Contact */}
        {step === 3 && (
          <div className="bg-white shadow rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Vos coordonnées</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-between pt-6">
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 border border-gray-300 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white rounded-md text-base font-medium hover:bg-indigo-700"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
