'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import StatusSelector from '@/components/admin/StatusSelector';

interface CustomerProfile {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  postal_code: string;
  country: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  shipping_cost: number;
  shipping_address: any;
  user_id: string;
  customer_profile?: CustomerProfile;
  items: Array<{
    id: string;
    product: {
      name: string;
      image_url: string;
    };
    quantity: number;
    price_per_unit: number;
    customization_data: any;
  }>;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items (
            id,
            quantity,
            price_per_unit,
            customization_data,
            product:products (
              name,
              image_url
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Récupérer les profils clients pour chaque commande
      const ordersWithProfiles = await Promise.all((orders || []).map(async (order) => {
        if (order.user_id) {
          const { data: profile, error: profileError } = await supabase
            .from('customer_profiles')
            .select('*')
            .eq('id', order.user_id)
            .single();
          
          if (!profileError && profile) {
            return { ...order, customer_profile: profile };
          }
        }
        return order;
      }));
      
      setOrders(ordersWithProfiles || []);
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Rafraîchir les commandes
      fetchOrders();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 text-black">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Commandes</h1>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                ID Commande
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-900 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id.slice(0, 8)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {order.total_amount.toFixed(2)}€
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <StatusSelector
                    currentStatus={order.status}
                    onChange={(newStatus) => updateOrderStatus(order.id, newStatus)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal des détails de la commande */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Détails de la commande #{selectedOrder.id.slice(0, 8)}</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-900 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h3 className="font-semibold mb-2">Informations de livraison</h3>
                {selectedOrder.customer_profile ? (
                  <div className="text-sm text-gray-900">
                    <p><span className="font-medium">Nom:</span> {selectedOrder.customer_profile.first_name} {selectedOrder.customer_profile.last_name}</p>
                    <p><span className="font-medium">Téléphone:</span> {selectedOrder.customer_profile.phone || 'Non renseigné'}</p>
                    <p><span className="font-medium">Adresse:</span> {selectedOrder.customer_profile.address_line1}</p>
                    {selectedOrder.customer_profile.address_line2 && <p>{selectedOrder.customer_profile.address_line2}</p>}
                    <p>{selectedOrder.customer_profile.postal_code} {selectedOrder.customer_profile.city}</p>
                    <p>{selectedOrder.customer_profile.country}</p>
                  </div>
                ) : selectedOrder.shipping_address ? (
                  <div className="text-sm text-gray-900">
                    <p>{selectedOrder.shipping_address.name}</p>
                    <p>{selectedOrder.shipping_address.address?.line1}</p>
                    <p>{selectedOrder.shipping_address.address?.line2}</p>
                    <p>{selectedOrder.shipping_address.address?.postal_code} {selectedOrder.shipping_address.address?.city}</p>
                    <p>{selectedOrder.shipping_address.address?.country}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-900">Aucune adresse de livraison</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2">Résumé</h3>
                <div className="text-sm text-gray-900">
                  <p>Date: {formatDate(selectedOrder.created_at)}</p>
                  <p>Statut: <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span></p>
                  <p>Frais de livraison: {selectedOrder.shipping_cost.toFixed(2)}€</p>
                  <p className="font-semibold">Total: {selectedOrder.total_amount.toFixed(2)}€</p>
                  
                  {/* Actions rapides pour la commande */}
                  <div className="mt-4">
                    <h4 className="font-semibold mb-2">Actions</h4>
                    <div className="flex space-x-2">
                      {selectedOrder.status === 'processing' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(selectedOrder.id, 'shipped');
                          }}
                          className="px-3 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Marquer comme envoyée
                        </button>
                      )}
                      {selectedOrder.status === 'shipped' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            updateOrderStatus(selectedOrder.id, 'completed');
                          }}
                          className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 transition-colors flex items-center"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Marquer comme terminée
                        </button>
                      )}
                      <StatusSelector
                        currentStatus={selectedOrder.status}
                        onChange={(newStatus) => {
                          updateOrderStatus(selectedOrder.id, newStatus);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <h3 className="font-semibold mb-2">Articles commandés</h3>
            <div className="space-y-4">
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                  <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                    {item.product.image_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.image_url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-gray-900">
                      Quantité: {item.quantity} × {item.price_per_unit.toFixed(2)}€
                    </p>
                    {item.customization_data && (
                      <div className="mt-2 bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-md border border-indigo-200 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-bold flex items-center text-indigo-800">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
                            </svg>
                            INSTRUCTIONS DE PERSONNALISATION
                          </p>
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">À réaliser</span>
                        </div>
                        
                        {/* Résumé rapide des personnalisations */}
                        <div className="bg-white p-2 rounded-md border border-indigo-100 mb-3 text-xs">
                          <p className="font-semibold text-gray-700 mb-1">Résumé:</p>
                          <ul className="list-disc pl-4 space-y-1">
                            {item.customization_data.customizations && item.customization_data.customizations.map((c: any, i: number) => (
                              <li key={`summary-${i}`}>
                                <span className="font-medium">{c.face === 'devant' ? 'Devant' : 'Derrière'}</span>: 
                                {c.type === 'text' ? 
                                  <span>Texte "{c.texte}" en {c.type_impression || 'impression'}</span> : 
                                  <span>Image en {c.type_impression || 'impression'}</span>
                                }
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        {item.customization_data.customizations && item.customization_data.customizations.map((customization: any, index: number) => {
                          // Déterminer les icônes et couleurs en fonction du type de personnalisation
                          const isText = customization.type === 'text';
                          const isFront = customization.face === 'devant';
                          
                          // Icônes pour le type de personnalisation
                          const typeIcon = isText ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                          );
                          
                          // Icônes pour la face (devant/derrière)
                          const faceIcon = isFront ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                          );
                          
                          return (
                            <div key={index} className="mb-3 last:mb-0 bg-white p-3 rounded-lg border-l-4 border border-indigo-200 shadow-sm"
                                 style={{ borderLeftColor: isFront ? '#4f46e5' : '#7e22ce' }}>
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                  <div className={`p-1.5 rounded-full mr-2 ${isFront ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                                    {faceIcon}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm">
                                      {isFront ? 'FACE AVANT' : 'FACE ARRIÈRE'}
                                    </p>
                                    <p className="text-xs text-gray-600">
                                      Position: {customization.position.replace(/-/g, ' ').replace(/(^\w|\s\w)/g, (m: string) => m.toUpperCase())}
                                    </p>
                                  </div>
                                </div>
                                <div className={`px-2 py-1 rounded-md text-xs font-medium ${isText ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'}`}>
                                  <div className="flex items-center">
                                    {typeIcon}
                                    <span className="ml-1">{isText ? 'TEXTE' : 'IMAGE'}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 p-2 rounded-md border border-gray-200 mb-2">
                                <div className="flex items-center mb-1">
                                  <svg className="w-4 h-4 text-indigo-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                  </svg>
                                  <p className="text-xs font-semibold text-indigo-800">TECHNIQUE</p>
                                </div>
                                <p className="text-sm font-medium bg-white p-1.5 rounded border border-gray-200 text-center">
                                  {customization.type_impression || 'Impression standard'}
                                </p>
                              </div>
                              
                              {isText && customization.texte && (
                                <div className="bg-gray-50 p-2 rounded-md border border-gray-200 mb-2">
                                  <div className="flex items-center mb-1">
                                    <svg className="w-4 h-4 text-indigo-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                                    </svg>
                                    <p className="text-xs font-semibold text-indigo-800">TEXTE À IMPRIMER</p>
                                  </div>
                                  <div className="bg-white p-2 rounded border border-gray-200 text-center">
                                    <p className="text-base" style={{ 
                                      color: customization.couleur_texte || '#000000',
                                      fontFamily: customization.police || 'inherit',
                                      fontWeight: 'bold'
                                    }}>
                                      {customization.texte}
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
                                    {customization.police && (
                                      <div>
                                        <p className="font-medium text-gray-700">Police:</p>
                                        <p className="bg-white p-1 rounded border border-gray-200 text-center">
                                          {customization.police}
                                        </p>
                                      </div>
                                    )}
                                    
                                    {customization.couleur_texte && (
                                      <div>
                                        <p className="font-medium text-gray-700">Couleur:</p>
                                        <div className="flex items-center bg-white p-1 rounded border border-gray-200">
                                          <div 
                                            className="w-4 h-4 rounded-full border border-gray-300 mr-1" 
                                            style={{ backgroundColor: customization.couleur_texte }}
                                          ></div>
                                          <span>{customization.couleur_texte}</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}
                              
                              {!isText && customization.image_url && (
                                <div className="bg-gray-50 p-2 rounded-md border border-gray-200">
                                  <div className="flex items-center mb-1">
                                    <svg className="w-4 h-4 text-indigo-600 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                    </svg>
                                    <p className="text-xs font-semibold text-indigo-800">IMAGE À IMPRIMER</p>
                                  </div>
                                  <div className="flex justify-center bg-white p-2 rounded border border-gray-200">
                                    <div className="h-24 w-24 bg-gray-100 rounded-md overflow-hidden">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img 
                                        src={customization.image_url.startsWith('data:') 
                                          ? customization.image_url 
                                          : customization.image_url.startsWith('blob:') 
                                            ? '/images/placeholder.jpg' // Fallback pour les URLs blob qui ne sont plus valides
                                            : customization.image_url
                                        } 
                                        alt="Personnalisation" 
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  </div>
                                  
                                  {/* Bouton de téléchargement */}
                                  <div className="flex justify-center mt-2">
                                    <a
                                      href={customization.image_url.startsWith('data:') ? customization.image_url : '#'}
                                      download={`personnalisation-${item.id}-${index}.png`}
                                      className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center ${customization.image_url.startsWith('data:') ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                                      onClick={(e) => {
                                        if (!customization.image_url.startsWith('data:')) {
                                          e.preventDefault();
                                          alert('Cette image ne peut pas être téléchargée. Format non supporté.');
                                        }
                                      }}
                                    >
                                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                      </svg>
                                      Télécharger l'image
                                    </a>
                                  </div>
                                </div>
                              )}
                              
                              <div className="mt-2 pt-2 border-t border-gray-200">
                                <p className="text-xs font-medium text-gray-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                                  </svg>
                                  Instructions: {isText ? 'Imprimer ce texte' : 'Imprimer cette image'} sur la {isFront ? 'face avant' : 'face arrière'} du produit à la position indiquée.
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{(item.quantity * item.price_per_unit).toFixed(2)}€</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
