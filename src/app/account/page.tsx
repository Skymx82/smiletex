'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase/client';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchCustomerProfile, upsertCustomerProfile, CustomerProfile } from '@/lib/supabase/services/userService';

// Type pour les commandes
type Order = {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  items?: OrderItem[];
};

// Type pour les items de commande
type OrderItem = {
  id: string;
  product_id: string;
  quantity: number;
  price_per_unit: number;
  product?: {
    name: string;
    image_url: string;
  };
};

export default function Account() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address_line1: '',
    address_line2: '',
    city: '',
    postal_code: '',
    country: 'France'
  });

  // Récupérer le profil de l'utilisateur
  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          // Récupérer le profil depuis Supabase
          const customerProfile = await fetchCustomerProfile(user.id);
          
          if (customerProfile) {
            setProfile({
              first_name: customerProfile.first_name || '',
              last_name: customerProfile.last_name || '',
              email: user.email || '',
              phone: customerProfile.phone || '',
              address_line1: customerProfile.address_line1 || '',
              address_line2: customerProfile.address_line2 || '',
              city: customerProfile.city || '',
              postal_code: customerProfile.postal_code || '',
              country: customerProfile.country || 'France'
            });
          } else {
            // Si le profil n'existe pas encore, on initialise avec l'email
            setProfile(prev => ({ ...prev, email: user.email || '' }));
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
        }
      };
      
      fetchProfile();
      
      // Récupérer les commandes de l'utilisateur

      const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
          console.log('Fetching orders for user ID:', user.id);
          
          // Approche 1: Récupérer les commandes par user_id
          const { data: ordersData, error: ordersError } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          // Ne pas lancer d'erreur si aucune commande n'est trouvée
          if (ordersError && ordersError.code !== 'PGRST116') {
            console.log('Non-critical error fetching orders:', ordersError);
          }
          
          console.log('Orders found by user_id:', ordersData?.length || 0);
          
          // Approche 2: Si aucune commande n'est trouvée, essayons de récupérer les commandes via order_items
          let finalOrdersData = ordersData || [];
          
          if (!finalOrdersData.length) {
            console.log('No orders found by user_id, trying to find via order_items');
            
            // Récupérer les order_items associés à l'utilisateur
            const { data: orderItemsData, error: orderItemsError } = await supabase
              .from('order_items')
              .select('order_id')
              .eq('user_id', user.id);
              
            // Ne pas lancer d'erreur si aucun élément de commande n'est trouvé
            if (orderItemsError && orderItemsError.code !== 'PGRST116') {
              console.log('Non-critical error fetching order items:', orderItemsError);
            }
            
            if (orderItemsData && orderItemsData.length > 0) {
              console.log('Order items found:', orderItemsData.length);
              
              // Extraire les IDs de commande uniques
              const orderIds = [...new Set(orderItemsData.map(item => item.order_id))];
              
              // Récupérer les commandes associées à ces IDs
              const { data: relatedOrders, error: relatedOrdersError } = await supabase
                .from('orders')
                .select('*')
                .in('id', orderIds)
                .order('created_at', { ascending: false });
                
              // Ne pas lancer d'erreur si aucune commande associée n'est trouvée
              if (relatedOrdersError && relatedOrdersError.code !== 'PGRST116') {
                console.log('Non-critical error fetching related orders:', relatedOrdersError);
              }
              
              console.log('Related orders found:', relatedOrders?.length || 0);
              finalOrdersData = relatedOrders || [];
            }
          }

          // Pour chaque commande, récupérer les items
          if (finalOrdersData.length > 0) {
            console.log('Processing orders with items');
            const ordersWithItems = await Promise.all(finalOrdersData.map(async (order) => {
              const { data: orderItems, error: itemsError } = await supabase
                .from('order_items')
                .select(`
                  *,
                  product:products(name, image_url)
                `)
                .eq('order_id', order.id);

              // Ne pas lancer d'erreur si aucun élément de commande n'est trouvé
              if (itemsError && itemsError.code !== 'PGRST116') {
                console.log('Non-critical error fetching order items details:', itemsError);
              }

              return {
                ...order,
                items: orderItems || []
              };
            }));

            setOrders(ordersWithItems);
          } else {
            setOrders([]);
          }
        } catch (error) {
          console.error('Erreur lors de la récupération des commandes:', error);
          // En cas d'erreur, on définit simplement un tableau vide pour les commandes
          setOrders([]);
        } finally {
          setIsLoadingOrders(false);
        }
      };

      fetchOrders();
    }
  }, [user]);

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // Préparer les données du profil
      const customerProfile: CustomerProfile = {
        id: user.id,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        address_line1: profile.address_line1,
        address_line2: profile.address_line2,
        city: profile.city,
        postal_code: profile.postal_code,
        country: profile.country,
        updated_at: new Date().toISOString()
      };

      // Enregistrer dans Supabase
      const updatedProfile = await upsertCustomerProfile(customerProfile);
      
      if (!updatedProfile) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      // Mise à jour réussie
      setIsEditing(false);
    } catch (err: any) {
      console.error('Erreur lors de la sauvegarde du profil:', err);
      setError(err.message || 'Une erreur est survenue lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mon Compte</h1>
            <button
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Se déconnecter
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* Informations personnelles */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Informations personnelles</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-indigo-600 hover:text-indigo-700"
                >
                  {isEditing ? 'Annuler' : 'Modifier'}
                </button>
              </div>

              <form onSubmit={handleProfileUpdate}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                      type="text"
                      name="first_name"
                      value={profile.first_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      name="last_name"
                      value={profile.last_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={profile.phone || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Adresse ligne 1</label>
                    <input
                      type="text"
                      name="address_line1"
                      value={profile.address_line1 || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                      placeholder="Numéro et nom de rue"
                    />
                  </div>
                  
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Adresse ligne 2</label>
                    <input
                      type="text"
                      name="address_line2"
                      value={profile.address_line2 || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                      placeholder="Complément d'adresse (optionnel)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ville</label>
                    <input
                      type="text"
                      name="city"
                      value={profile.city || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Code postal</label>
                    <input
                      type="text"
                      name="postal_code"
                      value={profile.postal_code || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Pays</label>
                    <input
                      type="text"
                      name="country"
                      value={profile.country || ''}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`w-full sm:w-auto flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                        isSaving ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Historique des commandes */}
          <div className="bg-white shadow rounded-lg mb-8">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes commandes</h2>
              
              {isLoadingOrders ? (
                <div className="flex justify-center items-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : orders.length === 0 ? (
                <p className="text-gray-600">Vous n'avez pas encore passé de commande.</p>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="bg-gray-50 p-4 flex justify-between items-center">
                        <div>
                          <p className="text-sm text-gray-500">
                            Commande passée il y a {formatDistanceToNow(new Date(order.created_at), { locale: fr, addSuffix: false })}
                          </p>
                          <p className="text-sm font-medium">
                            Total: {order.total_amount.toFixed(2)} €
                          </p>
                        </div>
                        <div className="flex items-center">
                          <span 
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {order.status === 'completed' ? 'Terminée' :
                             order.status === 'processing' ? 'En traitement' :
                             order.status === 'pending' ? 'En attente' :
                             order.status}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Articles</h3>
                        <div className="space-y-4">
                          {order.items && order.items.map((item) => (
                            <div key={item.id} className="flex items-center">
                              {item.product?.image_url && (
                                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-md overflow-hidden mr-4">
                                  <img 
                                    src={item.product.image_url} 
                                    alt={item.product?.name || 'Produit'}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.product?.name || 'Produit'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  Quantité: {item.quantity} × {item.price_per_unit.toFixed(2)} €
                                </p>
                              </div>
                              <div className="ml-4">
                                <p className="text-sm font-medium text-gray-900">
                                  {(item.quantity * item.price_per_unit).toFixed(2)} €
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Designs sauvegardés */}
          <div className="bg-white shadow rounded-lg">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Mes designs sauvegardés</h2>
              <p className="text-gray-600">Vous n'avez pas encore de design sauvegardé.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
