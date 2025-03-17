'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import { CartItem } from '@/types/cart';
import Link from 'next/link';
import Image from 'next/image';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Chargement...</p>
      </div>
    </div>}>
      <CheckoutSuccess />
    </Suspense>
  );
}

function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const [orderDetails, setOrderDetails] = useState<{
    total: number;
    shippingCost: number;
    status: string;
    shippingAddress?: {
      name?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        postal_code?: string;
        country?: string;
      };
    };
  } | null>(null);

  useEffect(() => {
    const processOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!sessionId) {
          throw new Error('Session ID non trouvé');
        }

        // 1. Mettre à jour le statut de la commande
        const updateResponse = await fetch('/api/orders/update-status', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            sessionId,
            userId: user?.id // Inclure l'ID utilisateur
          }),
        });

        if (!updateResponse.ok) {
          const errorData = await updateResponse.json();
          throw new Error(errorData.error || 'Erreur lors de la mise à jour du statut');
        }

        // 2. Récupérer l'ID de la commande via l'API
        const response = await fetch(`/api/orders/session/${sessionId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Erreur lors de la récupération de la commande');
        }
        
        const orderId = data.orderId;

        if (!orderId) {
          throw new Error('ID de commande non trouvé');
        }

        // 3. Récupérer la commande avec l'ID
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .single();

        if (orderError || !order) {
          throw new Error('Commande non trouvée');
        }

        setOrderDetails({
          total: order.total_amount,
          shippingCost: order.shipping_cost || 4.99,
          status: order.status,
          shippingAddress: order.shipping_address
        });

        // 4. Récupérer les articles de la commande avec les détails des produits
        const { data: orderItems, error: itemsError } = await supabase
          .from('order_items')
          .select(`
            *,
            product:products(*),
            variant:product_variants(*)
          `)
          .eq('order_id', order.id);

        if (itemsError) throw itemsError;
        if (!orderItems || orderItems.length === 0) {
          throw new Error('Aucun article trouvé dans la commande');
        }

        // 5. Formater les articles pour l'affichage
        const formattedItems = orderItems.map(item => ({
          id: item.id,
          productId: item.product_id,
          variantId: item.product_variant_id,
          name: item.product?.name || '',
          price: item.price_per_unit,
          quantity: item.quantity,
          size: item.variant?.size || '',
          color: item.variant?.color || '',
          imageUrl: item.product?.image_url || '',
          customization: item.customization_data
        }));

        setOrderItems(formattedItems);
      } catch (error) {
        console.error('Erreur lors de la récupération de la commande:', error);
        setError(error instanceof Error ? error.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    processOrder();
  }, [sessionId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Traitement de votre commande...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-4">Une erreur est survenue</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="text-green-600 mb-4">
                <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Commande confirmée !</h1>
              <p className="mt-2 text-gray-600">
                Merci pour votre commande. Vous recevrez bientôt un email de confirmation.
              </p>
              <div className="mt-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium" 
                  style={{
                    backgroundColor: orderDetails?.status === 'completed' ? '#DEF7EC' : '#FDF6B2',
                    color: orderDetails?.status === 'completed' ? '#03543F' : '#723B13'
                  }}>
                  {orderDetails?.status === 'completed' ? 'Payée' : 'En cours de traitement'}
                </span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Récapitulatif de la commande</h2>
              
              <div className="space-y-6">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex items-center border-b border-gray-200 pb-4">
                    <div className="relative h-24 w-24 rounded overflow-hidden">
                      <Image
                        src={item.imageUrl || '/images/placeholder.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-6 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{item.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.size}, {item.color}
                      </p>
                      {item.customization && (
                        <p className="mt-1 text-sm text-gray-500">
                          Personnalisation : {item.customization.text}
                        </p>
                      )}
                      <div className="mt-2 flex justify-between">
                        <p className="text-sm text-gray-500">Quantité : {item.quantity}</p>
                        <p className="text-sm font-medium text-gray-900">
                          {(item.price * item.quantity).toFixed(2)} €
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                <div className="pt-4">
                  <div className="flex justify-between text-base">
                    <p className="text-gray-600">Sous-total</p>
                    <p className="font-medium text-gray-900">
                      {(orderDetails?.total ? orderDetails.total - (orderDetails.shippingCost || 0) : 0).toFixed(2)} €
                    </p>
                  </div>
                  <div className="flex justify-between text-base mt-2">
                    <p className="text-gray-600">Frais de livraison</p>
                    <p className="font-medium text-gray-900">{orderDetails?.shippingCost.toFixed(2)} €</p>
                  </div>
                  <div className="flex justify-between text-lg font-bold mt-4 pt-4 border-t border-gray-200">
                    <p className="text-gray-900">Total</p>
                    <p className="text-indigo-600">
                      {orderDetails?.total.toFixed(2)} €
                    </p>
                  </div>
                  {orderDetails?.shippingAddress && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Adresse de livraison</h3>
                      <p className="text-gray-600">{orderDetails.shippingAddress.name}</p>
                      <p className="text-gray-600">{orderDetails.shippingAddress.address?.line1}</p>
                      {orderDetails.shippingAddress.address?.line2 && (
                        <p className="text-gray-600">{orderDetails.shippingAddress.address.line2}</p>
                      )}
                      <p className="text-gray-600">
                        {orderDetails.shippingAddress.address?.postal_code} {orderDetails.shippingAddress.address?.city}
                      </p>
                      <p className="text-gray-600">{orderDetails.shippingAddress.address?.country}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center space-y-4">
              {user && (
                <Link
                  href="/account/orders"
                  className="inline-flex items-center px-6 py-3 border border-indigo-600 text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 mr-4"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Voir mes commandes
                </Link>
              )}
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
