import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ordersAPI } from '../services/api';

const Orders = () => {
  const [activeTab, setActiveTab] = useState('purchases');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const response = activeTab === 'purchases' 
        ? await ordersAPI.getPurchases()
        : await ordersAPI.getSales();
      setOrders(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba történt a rendelések betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'Függőben',
      confirmed: 'Megerősítve',
      shipped: 'Szállítás alatt',
      delivered: 'Kézbesítve',
      cancelled: 'Lemondva'
    };
    return statusMap[status] || status;
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Biztosan lemondod a rendelést?')) return;

    try {
      await ordersAPI.cancelOrder(orderId);
      fetchOrders();
      alert('Rendelés sikeresen lemondva!');
    } catch (err) {
      alert(err.response?.data?.message || 'Hiba történt a lemondás során');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      fetchOrders();
      alert('Státusz frissítve!');
    } catch (err) {
      alert(err.response?.data?.message || 'Hiba történt a státusz frissítése során');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Rendeléseim</h1>

      {/* Tabok */}
      <div className="flex border-b mb-6">
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'purchases'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('purchases')}
        >
          Vásárlásaim
        </button>
        <button
          className={`px-6 py-3 font-medium ${
            activeTab === 'sales'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sales')}
        >
          Eladásaim
        </button>
      </div>

      {/* Tartalom */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Betöltés...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">
            {activeTab === 'purchases' 
              ? 'Még nem vásároltál semmit.' 
              : 'Még nem adtál el semmit.'}
          </p>
          <Link
            to="/listings"
            className="mt-4 inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Hirdetések böngészése
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition">
              {/* Rendelés fejléc */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Rendelés #{order.id}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {activeTab === 'purchases' ? (
                      <>Eladó: <span className="font-medium">{order.seller.username}</span></>
                    ) : (
                      <>Vevő: <span className="font-medium">{order.buyer.username}</span></>
                    )}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              {/* Tételek */}
              <div className="space-y-2 mb-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-2 border-t">
                    <div className="flex items-center space-x-3">
                      {item.book.coverImageUrl && (
                        <img
                          src={item.book.coverImageUrl}
                          alt={item.book.title}
                          className="w-12 h-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.book.title}</p>
                        <p className="text-sm text-gray-600">{item.book.author}</p>
                        <p className="text-xs text-gray-500">Mennyiség: {item.quantity} db</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.priceAtPurchase.toLocaleString('hu-HU')} Ft</p>
                      <p className="text-sm text-gray-600">
                        Összesen: {item.subtotal.toLocaleString('hu-HU')} Ft
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Végösszeg és műveletek */}
              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-xl font-bold">
                  Végösszeg: {order.totalAmount.toLocaleString('hu-HU')} Ft
                </div>
                <div className="flex space-x-2">
                  {activeTab === 'purchases' && order.status === 'pending' && (
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      Lemondás
                    </button>
                  )}
                  {activeTab === 'sales' && order.status !== 'cancelled' && order.status !== 'delivered' && (
                    <select
                      className="border rounded px-3 py-2"
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                    >
                      <option value="pending">Függőben</option>
                      <option value="confirmed">Megerősítve</option>
                      <option value="shipped">Szállítás alatt</option>
                      <option value="delivered">Kézbesítve</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Szállítási cím */}
              {order.shippingAddress && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Szállítási cím:</span> {order.shippingAddress}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;