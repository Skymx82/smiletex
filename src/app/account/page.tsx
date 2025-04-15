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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 text-black relative overflow-hidden">
      {/* Éléments graphiques abstraits */}
      <div className="absolute left-0 top-1/4 w-72 h-72 rounded-full bg-[#FCEB14] opacity-5 blur-3xl animate-pulse-slow"></div>
      <div className="absolute right-0 bottom-1/4 w-64 h-64 rounded-full bg-indigo-200 opacity-10 blur-3xl animate-pulse-slow"></div>
      <div className="absolute left-1/3 bottom-1/2 w-48 h-48 rounded-full bg-indigo-300 opacity-5 blur-3xl animate-pulse-slow"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <div className="inline-block mb-2 bg-indigo-100 text-indigo-800 px-4 py-1 rounded-full text-sm font-semibold tracking-wide shadow-sm">
                ESPACE CLIENT
              </div>
              <h1 className="text-3xl font-bold text-gray-900">
                <span className="relative inline-block">
                  Mon Compte
                  <span className="absolute -bottom-1 left-0 w-full h-1 bg-[#FCEB14] rounded-full transform scale-x-100"></span>
                </span>
              </h1>
            </div>
            <button
              onClick={async () => {
                await signOut();
                router.push('/');
              }}
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                </svg>
                Se déconnecter
              </span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full bg-red-100/50"></div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Informations personnelles */}
          <div className="bg-white shadow-lg rounded-xl mb-8 border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Informations personnelles
                </h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`flex items-center px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isEditing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'}`}
                >
                  {isEditing ? (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Annuler
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                      </svg>
                      Modifier
                    </>
                  )}
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      disabled
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm bg-gray-50 p-2.5"
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
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
                      className="mt-1 block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-[#FCEB14] p-2.5 disabled:bg-gray-50 transition-all duration-300 focus:bg-white"
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className={`w-full sm:w-auto flex justify-center py-2.5 px-5 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-[1.01] active:scale-[0.98] relative overflow-hidden group ${
                        isSaving ? 'opacity-75 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent w-1/2 blur-xl transform transition-transform duration-500 ease-out translate-x-[-200%] group-hover:translate-x-[200%]"></div>
                      <span className="relative z-10 flex items-center">
                        {isSaving ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enregistrement...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Enregistrer les modifications
                          </>
                        )}
                      </span>
                      <span className="absolute bottom-0 left-0 w-full h-1 bg-[#FCEB14] transform transition-transform duration-300 ease-out translate-y-full group-hover:translate-y-0"></span>
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Historique des commandes */}
          <div className="bg-white shadow-lg rounded-xl mb-8 border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                </svg>
                Mes commandes
              </h2>
              
              {isLoadingOrders ? (
                <div className="flex justify-center items-center py-8">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full bg-indigo-100"></div>
                    </div>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 px-4">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                  </svg>
                  <p className="text-gray-600 mb-2">Vous n'avez pas encore passé de commande.</p>
                  <Link href="/products" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center">
                    <span>Découvrir nos produits</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                    </svg>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                      <div className="bg-gray-50 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
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
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                              order.status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                              order.status === 'processing' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
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
                                <div className="flex-shrink-0 h-16 w-16 bg-gray-100 rounded-xl overflow-hidden mr-4 border border-gray-200 shadow-sm">
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
          <div className="bg-white shadow-lg rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                Mes designs sauvegardés
              </h2>
              <div className="text-center py-8 px-4">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <p className="text-gray-600 mb-2">Vous n'avez pas encore de design sauvegardé.</p>
                <Link href="/products" className="text-indigo-600 hover:text-indigo-700 font-medium inline-flex items-center">
                  <span>Personnaliser un produit</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
