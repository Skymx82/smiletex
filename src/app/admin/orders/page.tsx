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
                      <div className="mt-1">
                        <p className="text-sm font-medium">Personnalisation:</p>
                        <pre className="text-xs text-gray-900 mt-1">
                          {JSON.stringify(item.customization_data, null, 2)}
                        </pre>
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
