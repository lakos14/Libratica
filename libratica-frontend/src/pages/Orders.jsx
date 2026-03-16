import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { reviewsAPI } from '../services/api';

function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' or 'seller'
  const [reviewModal, setReviewModal] = useState(null); // { orderId, reviewedUsername }
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewedOrders, setReviewedOrders] = useState([]); // orderId-k amiket már értékeltél

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
      await loadReviewedOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a rendelések betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const loadReviewedOrders = async (orders) => {
    const reviewed = [];
    for (const order of orders) {
      try {
        const response = await reviewsAPI.getOrderReviews(order.id);
        const alreadyReviewed = response.data.some(r => r.reviewer.id === user?.id);
        if (alreadyReviewed) reviewed.push(order.id);
      } catch {}
    }
    setReviewedOrders(reviewed);
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

  const handleRejectOrder = async (orderId) => {
  if (!window.confirm('Biztosan elutasítod ezt a rendelést?')) {
    return;
  }

  try {
    await api.post(`/orders/${orderId}/reject`);
    alert('Rendelés sikeresen elutasítva!');
    loadOrders();
  } catch (err) {
    alert(err.response?.data?.message || 'Hiba a rendelés elutasításakor');
  }
};

const handleSubmitReview = async () => {
  setReviewLoading(true);
  try {
    await reviewsAPI.createReview({
      orderId: reviewModal.orderId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });
    alert('Értékelés elküldve!');
    setReviewModal(null);
    setReviewData({ rating: 5, comment: '' });
    loadOrders();
  } catch (err) {
    alert(err.response?.data?.message || 'Hiba az értékelés elküldésekor');
  } finally {
    setReviewLoading(false);
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
                      ✅ Elfogadom
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order.id)}
                      className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                    >
                      ❌ Elutasítom
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
                      📦 Elküldtem
                    </button>
                  </div>
                )}

                {activeTab === 'seller' && order.status === 'shipped' && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleStatusUpdate(order.id, 'delivered')}
                      className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                    >
                      ✅ Kézbesítve
                    </button>
                  </div>
                )}
                {/* Értékelés gomb - vevőnek */}
                {activeTab === 'buyer' && order.status === 'delivered' && !reviewedOrders.includes(order.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setReviewModal({ 
                        orderId: order.id, 
                        reviewedUsername: order.seller?.username 
                      })}
                      className="px-4 py-2 text-sm rounded text-white"
                      style={{ backgroundColor: '#8b4513' }}
                    >
                      ⭐ Eladó értékelése
                    </button>
                  </div>
                )}

                {/* Értékelés gomb - eladónak */}
                {activeTab === 'seller' && order.status === 'delivered' && !reviewedOrders.includes(order.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setReviewModal({ 
                        orderId: order.id, 
                        reviewedUsername: order.buyer?.username 
                      })}
                      className="px-4 py-2 text-sm rounded text-white"
                      style={{ backgroundColor: '#8b4513' }}
                    >
                      ⭐ Vevő értékelése
                    </button>
                  </div>
                )}
                {activeTab === 'buyer' && order.status === 'delivered' && reviewedOrders.includes(order.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-green-600">✓ Már értékelted ezt a rendelést</p>
                  </div>
                )}

                {activeTab === 'seller' && order.status === 'delivered' && reviewedOrders.includes(order.id) && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-green-600">✓ Már értékelted ezt a rendelést</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Review modal */}
      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Értékelés: {reviewModal.reviewedUsername}
            </h3>

            {/* Csillagok */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Értékelés
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {star <= reviewData.rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-1">{reviewData.rating}/5 csillag</p>
            </div>

            {/* Megjegyzés */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Megjegyzés (opcionális)
              </label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                placeholder="Írd le a tapasztalatod..."
                rows="3"
                maxLength="1000"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Gombok */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setReviewModal(null);
                  setReviewData({ rating: 5, comment: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Mégse
              </button>
              <button
                onClick={handleSubmitReview}
                disabled={reviewLoading}
                className="flex-1 px-4 py-2 text-white rounded disabled:bg-gray-400 font-semibold"
                style={{ backgroundColor: '#8b4513' }}
              >
                {reviewLoading ? 'Küldés...' : 'Értékelés elküldése'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;