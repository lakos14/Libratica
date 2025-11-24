import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { cartAPI } from '../services/api';

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkoutData, setCheckoutData] = useState({
    shippingAddress: '',
    paymentMethod: 'bank_transfer',
  });
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a kosár betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      await cartAPI.updateCartItem(itemId, { quantity: newQuantity });
      loadCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Hiba a mennyiség frissítésekor');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      await cartAPI.removeFromCart(itemId);
      loadCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Hiba a törléskor');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!checkoutData.shippingAddress.trim()) {
      alert('Kérlek add meg a szállítási címet!');
      return;
    }

    setIsCheckingOut(true);
    try {
      await api.post('/orders/checkout', checkoutData);
      alert('Rendelés sikeresen leadva!');
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'Hiba a rendelés leadásakor');
    } finally {
      setIsCheckingOut(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          🛒 Kosár
        </h1>

        {isEmpty ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">A kosarad üres</p>
            <button
              onClick={() => navigate('/listings')}
              className="px-6 py-2 rounded text-white font-medium"
              style={{ backgroundColor: '#8b4513' }}
            >
              Böngészés indítása
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bal oldal - Kosár tételek */}
            <div className="lg:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-gray-200 rounded p-4 flex gap-4"
                >
                  {/* Kép */}
                  {item.listing?.book?.coverImageUrl ? (
                    <img
                      src={item.listing.book.coverImageUrl}
                      alt={item.listing.book?.title}
                      className="w-20 h-28 object-cover rounded cursor-pointer"
                      onClick={() => navigate(`/listings/${item.listing.id}`)}
                    />
                  ) : (
                    <div className="w-20 h-28 bg-gray-200 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-3xl">📚</span>
                    </div>
                  )}

                  {/* Részletek */}
                  <div className="flex-1">
                    <h3
                      className="font-bold text-lg text-gray-800 cursor-pointer hover:underline"
                      onClick={() => navigate(`/listings/${item.listing.id}`)}
                    >
                      {item.listing?.book?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {item.listing?.book?.author}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {getConditionLabel(item.listing?.condition)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Eladó: {item.listing?.seller?.username}
                    </p>

                    {/* Ár és mennyiség */}
                    <div className="flex items-center gap-4 mt-3">
                      <span className="text-xl font-bold" style={{ color: '#8b4513' }}>
                        {item.listing?.price?.toLocaleString('hu-HU')} Ft
                      </span>

                      {/* Mennyiség választó */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-3 py-1 border border-gray-300 rounded">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 border border-gray-300 rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      {/* Törlés gomb */}
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="ml-auto px-3 py-1 text-sm rounded bg-red-600 text-white hover:bg-red-700"
                      >
                        🗑️ Eltávolítás
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Jobb oldal - Összesítő és checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white border border-gray-200 rounded p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#8b4513' }}>
                  Összesítés
                </h2>

                <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tételek száma:</span>
                    <span className="font-medium">
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)} db
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-lg font-bold">Végösszeg:</span>
                    <span className="text-2xl font-bold" style={{ color: '#8b4513' }}>
                      {cart.totalAmount?.toLocaleString('hu-HU')} Ft
                    </span>
                  </div>
                </div>

                {/* Checkout form */}
                <form onSubmit={handleCheckout} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Szállítási cím *
                    </label>
                    <textarea
                      value={checkoutData.shippingAddress}
                      onChange={(e) =>
                        setCheckoutData((prev) => ({
                          ...prev,
                          shippingAddress: e.target.value,
                        }))
                      }
                      placeholder="Cím, irányítószám, város..."
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                      rows="3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fizetési mód
                    </label>
                    <select
                      value={checkoutData.paymentMethod}
                      onChange={(e) =>
                        setCheckoutData((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                    >
                      <option value="bank_transfer">Banki átutalás</option>
                      <option value="cash_on_delivery">Utánvét</option>
                      <option value="card">Bankkártya</option>
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={isCheckingOut}
                    className="w-full px-6 py-3 rounded text-white font-semibold disabled:opacity-50"
                    style={{ backgroundColor: '#8b4513' }}
                  >
                    {isCheckingOut ? 'Rendelés leadása...' : '✓ Rendelés leadása'}
                  </button>
                </form>

                <p className="text-xs text-gray-500 mt-4 text-center">
                  A rendelés leadása után az eladó kapcsolatba fog veled lépni.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Cart;