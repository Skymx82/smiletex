'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface CouponFormData {
  name: string;
  code: string;
  percent_off: string;
  amount_off: string;
  currency: string;
  duration: string;
  duration_in_months: string;
  discount_type: 'percent' | 'amount';
}

export default function CreateCouponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>({
    name: '',
    code: '',
    percent_off: '',
    amount_off: '',
    currency: 'eur',
    duration: 'once',
    duration_in_months: '1',
    discount_type: 'percent'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Préparer les données à envoyer
      const couponData: any = {
        name: formData.name,
        code: formData.code.toUpperCase().trim(),
        duration: formData.duration,
        discount_type: formData.discount_type
      };
      
      // Ajouter les champs spécifiques selon le type de réduction
      if (formData.discount_type === 'percent') {
        couponData.percent_off = parseFloat(formData.percent_off);
      } else {
        couponData.amount_off = Math.round(parseFloat(formData.amount_off) * 100); // Convertir en centimes
        couponData.currency = formData.currency;
      }
      
      // Ajouter duration_in_months si nécessaire
      if (formData.duration === 'repeating') {
        couponData.duration_in_months = parseInt(formData.duration_in_months);
      }
      
      const response = await fetch('/admin/promotions/api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(couponData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.details || 'Erreur lors de la création du code promo');
      }
      
      toast.success('Code promo créé avec succès');
      router.push('/admin/promotions');
    } catch (error: any) {
      console.error('Erreur:', error);
      toast.error(error.message || 'Impossible de créer le code promo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="mr-4 text-indigo-600 hover:text-indigo-800"
        >
          &larr; Retour
        </button>
        <h1 className="text-2xl font-bold">Créer un code promo</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nom du code promo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Un nom descriptif pour identifier ce code promo (ex: "Soldes d'été 2025")
            </p>
          </div>
          
          <div className="mb-4">
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Code promo
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 uppercase"
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              Le code que les clients saisiront pour bénéficier de la réduction (ex: "SOLDES25")
            </p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de réduction
            </label>
            <div className="flex space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="discount_type"
                  value="percent"
                  checked={formData.discount_type === 'percent'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2">Pourcentage (%)</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="discount_type"
                  value="amount"
                  checked={formData.discount_type === 'amount'}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <span className="ml-2">Montant fixe</span>
              </label>
            </div>
          </div>

          {formData.discount_type === 'percent' ? (
            <div className="mb-4">
              <label htmlFor="percent_off" className="block text-sm font-medium text-gray-700 mb-1">
                Pourcentage de réduction
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="percent_off"
                  name="percent_off"
                  value={formData.percent_off}
                  onChange={handleChange}
                  min="1"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">%</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="amount_off" className="block text-sm font-medium text-gray-700 mb-1">
                  Montant de la réduction
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    id="amount_off"
                    name="amount_off"
                    value={formData.amount_off}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
                  Devise
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="eur">EUR (€)</option>
                  <option value="usd">USD ($)</option>
                  <option value="gbp">GBP (£)</option>
                </select>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
              Durée de validité
            </label>
            <select
              id="duration"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="once">Usage unique</option>
              <option value="repeating">Durée limitée</option>
              <option value="forever">Permanent</option>
            </select>
          </div>

          {formData.duration === 'repeating' && (
            <div className="mb-4">
              <label htmlFor="duration_in_months" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de mois
              </label>
              <input
                type="number"
                id="duration_in_months"
                name="duration_in_months"
                value={formData.duration_in_months}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="mr-4 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Création en cours...' : 'Créer le code promo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
