import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'

  useEffect(() => {
    loadOrders();
  }, [activeTab]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const endpoint = activeTab === 'buyer' ? '/orders/purchases' : '/orders/sales';
      const response = await api.get(endpoint);
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a rendelések betöltésekor');
    } finally {
      setLoading(false);
    }
  };
  

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: newStatus });
      alert('Státusz sikeresen frissítve!');
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Hiba a státusz frissítésekor');
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: '⏳ Függőben',
      confirmed: '✓ Megerősítve',
      shipped: '🚚 Szállítás alatt',
      delivered: '✅ Kézbesítve',
      cancelled: '❌ Lemondva',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getConditionLabel = (condition) => {
    const labels = {
      mint: '⭐ Újszerű',
      excellent: '⭐ Kiváló',
      good: '👍 Jó',
      fair: '👌 Elfogadható',
      poor: '📦 Gyenge',
    };
    return labels[condition] || condition;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          Rendelések
        </h1>

        {/* Tab navigáció */}
        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'buyer'
                ? 'border-b-2'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={activeTab === 'buyer' ? { color: '#8b4513', borderColor: '#8b4513' } : {}}
          >
            🛒 Vásárlásaim
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`px-4 py-2 font-semibold ${
              activeTab === 'seller'
                ? 'border-b-2'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            style={activeTab === 'seller' ? { color: '#8b4513', borderColor: '#8b4513' } : {}}
          >
            💰 Eladásaim
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Rendelések lista */}
        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg">
              {activeTab === 'buyer' ? 'Még nincs vásárlásod' : 'Még nincs eladásod'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded p-4">
                {/* Rendelés fejléc */}
                <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
                  <div>
                    <h3 className="font-bold text-lg" style={{ color: '#8b4513' }}>
                      Rendelés #{order.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>

                {/* Rendelés tételek */}
                <div className="space-y-3 mb-4">
                  {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 bg-gray-50 rounded"
                  >
                    {/* Kép */}
                    {item.book?.coverImageUrl ? (
                      <img
                        src={item.book.coverImageUrl}
                        alt={item.book?.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-2xl">📚</span>
                      </div>
                    )}

                    {/* Részletek */}
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800">
                        {item.book?.title}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {item.book?.author}
                      </p>
                      <div className="flex gap-4 mt-2">
                        <span className="text-sm text-gray-700">
                          Mennyiség: {item.quantity} db
                        </span>
                        <span className="text-sm font-bold" style={{ color: '#8b4513' }}>
                          {item.priceAtPurchase?.toLocaleString('hu-HU')} Ft
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                </div>

                {/* Rendelés összesítő */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <div>
                    {activeTab === 'buyer' ? (
                      <p className="text-sm text-gray-600">
                        Eladó: <span className="font-medium">{order.seller?.username}</span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Vevő: <span className="font-medium">{order.buyer?.username}</span>
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Végösszeg:</p>
                    <p className="text-xl font-bold" style={{ color: '#8b4513' }}>
                      {order.totalAmount?.toLocaleString('hu-HU')} Ft
                    </p>
                  </div>
                </div>

                {/* Státusz frissítés (csak eladónak) */}
                {activeTab === 'seller' && order.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'confirmed')}
                      className="px-4 py-2 text-sm rounded text-white"
                      style={{ backgroundColor: '#8b4513' }}
                    >
                      ✓ Megerősítés
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                      className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      ❌ Lemondás
                    </button>
                  </div>
                )}

                {activeTab === 'seller' && order.status === 'confirmed' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'shipped')}
                      className="px-4 py-2 text-sm rounded text-white"
                      style={{ backgroundColor: '#8b4513' }}
                    >
                      🚚 Elküldve
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Orders;