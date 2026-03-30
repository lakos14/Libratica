import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  usePurchases,
  useSales,
  useUpdateOrderStatus,
  useRejectOrder,
  useCreateReview,
  useOrderReviews,
} from '../hooks';
import { toast } from 'react-toastify';

function Orders() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('buyer');
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const { data: purchases = [], isLoading: purchasesLoading } = usePurchases();
  const { data: sales = [], isLoading: salesLoading } = useSales();
  const updateStatus = useUpdateOrderStatus();
  const rejectOrder = useRejectOrder();
  const createReview = useCreateReview();

  const orders = activeTab === 'buyer' ? purchases : sales;
  const isLoading = activeTab === 'buyer' ? purchasesLoading : salesLoading;

  const handleStatusUpdate = async (orderId, newStatus) => {
    await updateStatus.mutateAsync({ orderId, status: newStatus });
  };

  const handleRejectOrder = async (orderId) => {
    if (!window.confirm('Biztosan elutasítod ezt a rendelést?')) return;
    await rejectOrder.mutateAsync(orderId);
  };

  const handleSubmitReview = async () => {
    await createReview.mutateAsync({
      orderId: reviewModal.orderId,
      rating: reviewData.rating,
      comment: reviewData.comment,
    });
    setReviewModal(null);
    setReviewData({ rating: 5, comment: '' });
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Függőben',
      confirmed: 'Megerősítve',
      shipped: 'Szállítás alatt',
      delivered: 'Kézbesítve',
      cancelled: 'Lemondva',
      rejected: 'Elutasítva',
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
      rejected: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    return date.toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Budapest',
    });
  };

  if (isLoading) {
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

        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('buyer')}
            className={`px-4 py-2 font-semibold ${activeTab === 'buyer' ? 'border-b-2' : 'text-gray-600 hover:text-gray-800'
              }`}
            style={activeTab === 'buyer' ? { color: '#8b4513', borderColor: '#8b4513' } : {}}
          >
            Vásárlásaim
          </button>
          <button
            onClick={() => setActiveTab('seller')}
            className={`px-4 py-2 font-semibold ${activeTab === 'seller' ? 'border-b-2' : 'text-gray-600 hover:text-gray-800'
              }`}
            style={activeTab === 'seller' ? { color: '#8b4513', borderColor: '#8b4513' } : {}}
          >
            Eladásaim
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg">
              {activeTab === 'buyer' ? 'Még nincs vásárlásod' : 'Még nincs eladásod'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                activeTab={activeTab}
                user={user}
                onStatusUpdate={handleStatusUpdate}
                onReject={handleRejectOrder}
                onReview={(orderId, reviewedUsername) =>
                  setReviewModal({ orderId, reviewedUsername })
                }
                getStatusLabel={getStatusLabel}
                getStatusColor={getStatusColor}
                formatDate={formatDate}
                isUpdating={updateStatus.isPending || rejectOrder.isPending}
              />
            ))}
          </div>
        )}
      </div>

      {reviewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              Értékelés: {reviewModal.reviewedUsername}
            </h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Értékelés</label>
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
                disabled={createReview.isPending}
                className="flex-1 px-4 py-2 text-white rounded disabled:bg-gray-400 font-semibold"
                style={{ backgroundColor: '#8b4513' }}
              >
                {createReview.isPending ? 'Küldés...' : 'Értékelés elküldése'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderCard({
  order,
  activeTab,
  user,
  onStatusUpdate,
  onReject,
  onReview,
  getStatusLabel,
  getStatusColor,
  formatDate,
  isUpdating,
}) {
  const { data: orderReviews = [] } = useOrderReviews(order.id);
  const alreadyReviewed = orderReviews.some((r) => r.reviewer?.id === user?.id);

  return (
    <div className="bg-white border border-gray-200 rounded p-4">
      <div className="flex justify-between items-start mb-4 pb-4 border-b border-gray-200">
        <div>
          <h3 className="font-bold text-lg" style={{ color: '#8b4513' }}>
            Rendelés #{order.id}
          </h3>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <span
          className={`inline-block px-3 py-1 rounded text-sm font-medium ${getStatusColor(
            order.status
          )}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {order.items?.map((item) => (
          <div key={item.id} className="flex gap-4 p-3 bg-gray-50 rounded">
            {(() => {
              const imgUrl = item.images?.length > 0
                ? `http://localhost:5102${item.images[0]}`
                : item.book?.coverImageUrl;
              return imgUrl ? (
                <img
                  src={imgUrl}
                  alt={item.book?.title}
                  className="w-16 h-20 object-cover rounded"
                />
              ) : (
                <div className="w-16 h-20 bg-gray-200 rounded flex items-center justify-center">
                  <span className="text-gray-400 text-2xl">📚</span>
                </div>
              );
            })()}
            <div className="flex-1">
              <h4 className="font-bold text-sm text-gray-800">{item.book?.title}</h4>
              <p className="text-xs text-gray-600">{item.book?.author}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-sm text-gray-700">Mennyiség: {item.quantity} db</span>
                <span className="text-sm font-bold" style={{ color: '#8b4513' }}>
                  {item.priceAtPurchase?.toLocaleString('hu-HU')} Ft
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

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

      {activeTab === 'seller' && order.status === 'pending' && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => onStatusUpdate(order.id, 'confirmed')}
            disabled={isUpdating}
            className="px-4 py-2 text-sm rounded text-white disabled:bg-gray-400"
            style={{ backgroundColor: '#8b4513' }}
          >
            Elfogadom
          </button>
          <button
            onClick={() => onReject(order.id)}
            disabled={isUpdating}
            className="px-4 py-2 text-sm rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
          >
            Elutasítom
          </button>
        </div>
      )}

      {activeTab === 'seller' && order.status === 'confirmed' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onStatusUpdate(order.id, 'shipped')}
            disabled={isUpdating}
            className="px-4 py-2 text-sm rounded text-white disabled:bg-gray-400"
            style={{ backgroundColor: '#8b4513' }}
          >
            Elküldtem
          </button>
        </div>
      )}

      {activeTab === 'seller' && order.status === 'shipped' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onStatusUpdate(order.id, 'delivered')}
            disabled={isUpdating}
            className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400"
          >
            Kézbesítve
          </button>
        </div>
      )}

      {activeTab === 'buyer' && order.status === 'delivered' && !alreadyReviewed && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onReview(order.id, order.seller?.username)}
            className="px-4 py-2 text-sm rounded text-white"
            style={{ backgroundColor: '#8b4513' }}
          >
            ⭐ Eladó értékelése
          </button>
        </div>
      )}

      {activeTab === 'seller' && order.status === 'delivered' && !alreadyReviewed && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={() => onReview(order.id, order.buyer?.username)}
            className="px-4 py-2 text-sm rounded text-white"
            style={{ backgroundColor: '#8b4513' }}
          >
            ⭐ Vevő értékelése
          </button>
        </div>
      )}

      {order.status === 'delivered' && alreadyReviewed && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-green-600">✓ Már értékelted ezt a rendelést</p>
        </div>
      )}
    </div>
  );
}

export default Orders;
