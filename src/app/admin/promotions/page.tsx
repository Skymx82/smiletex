'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Stripe from 'stripe';

// Interface pour les coupons enrichis avec les codes promotionnels
interface EnrichedCoupon extends Stripe.Coupon {
  promotionCodes?: Array<{
    code: string;
    id: string;
  }>;
}

// Utilisons l'interface EnrichedCoupon au lieu de cette interface personnalisée
type Coupon = EnrichedCoupon;

export default function PromotionsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await fetch('/admin/promotions/api');
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des codes promo');
      }
      
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de charger les codes promo');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCoupon = async (couponId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce code promo ?')) {
      return;
    }

    try {
      const response = await fetch(`/admin/promotions/api/${couponId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la suppression du code promo');
      }

      toast.success('Code promo supprimé avec succès');
      fetchCoupons(); // Rafraîchir la liste
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Impossible de supprimer le code promo');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString('fr-FR');
  };

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.percent_off) {
      return `${coupon.percent_off}%`;
    } else if (coupon.amount_off) {
      return `${(coupon.amount_off / 100).toFixed(2)} ${coupon.currency?.toUpperCase() || 'EUR'}`;
    }
    return 'N/A';
  };

  const formatDuration = (coupon: Coupon) => {
    switch (coupon.duration) {
      case 'once':
        return 'Usage unique';
      case 'repeating':
        return `${coupon.duration_in_months} mois`;
      case 'forever':
        return 'Permanent';
      default:
        return coupon.duration;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 text-gray-800">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Codes Promo</h1>
        <button
          onClick={() => router.push('/admin/promotions/create')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Créer un code promo
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2">Chargement des codes promo...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">Aucun code promo trouvé</p>
          <p className="mt-2">
            Commencez par créer votre premier code promo en cliquant sur le bouton ci-dessus.
          </p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Réduction
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durée
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Créé le
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {coupon.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {coupon.promotionCodes && coupon.promotionCodes.length > 0 
                      ? coupon.promotionCodes.map((code: { code: string; id: string }) => code.code).join(', ')
                      : 'Aucun code'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="text-sm text-gray-900">{formatDiscount(coupon)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDuration(coupon)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(coupon.created)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${coupon.valid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {coupon.valid ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDeleteCoupon(coupon.id)}
                      className="text-red-600 hover:text-red-900 ml-4"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
