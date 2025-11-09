import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartAPI, ordersAPI } from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer');

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      await cartAPI.updateCartItem(itemId, { quantity });
      loadCart(); // Reload cart
    } catch (error) {
      alert(error.response?.data?.message || 'Hiba történt');
    }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Biztosan eltávolítod a kosárból?')) return;

    try {
      await cartAPI.removeFromCart(itemId);
      loadCart(); // Reload cart
    } catch (error) {
      alert(error.response?.data?.message || 'Hiba történt');
    }
  };

  const clearCart = async () => {
    if (!window.confirm('Biztosan kiüríted a kosarat?')) return;

    try {
      await cartAPI.clearCart();
      loadCart(); // Reload cart
    } catch (error) {
      alert(error.response?.data?.message || 'Hiba történt');
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (!shippingAddress.trim()) {
      alert('Szállítási cím megadása kötelező!');
      return;
    }

    if (!cart || cart.items.length === 0) {
      alert('A kosár üres!');
      return;
    }

    try {
      setCheckingOut(true);
      await ordersAPI.checkout({
        shippingAddress,
        paymentMethod,
      });
      alert('Rendelés sikeresen leadva!');
      navigate('/orders');
    } catch (error) {
      alert(error.response?.data?.message || 'Hiba történt a rendelés leadásakor');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Betöltés...</div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Kosár</h1>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold mb-4">A kosarad üres</h2>
          <p className="text-gray-600 mb-8">Adj hozzá termékeket a kosárhoz!</p>
          <button
            onClick={() => navigate('/listings')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
          >
            Hirdetések böngészése
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Kosár ({cart.items.length} termék)</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-800"
        >
          🗑️ Kosár ürítése
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bal oldal - Termékek */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex gap-6">
                {/* Kép */}
                <img
                  src={item.listing.book.coverImageUrl || 'https://via.placeholder.com/100x150?text=No+Cover'}
                  alt={item.listing.book.title}
                  className="w-24 h-36 object-cover rounded"
                />

                {/* Részletek */}
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{item.listing.book.title}</h3>
                  <p className="text-gray-600 mb-2">{item.listing.book.author}</p>
                  <p className="text-sm text-gray-500 mb-2">
                    Eladó: {item.listing.seller.username}
                  </p>
                  <p className="text-sm text-gray-500">
                    Állapot: <span className="font-semibold">{item.listing.condition}</span>
                  </p>

                  {/* Mennyiség */}
                  <div className="flex items-center gap-4 mt-4">
                    <label className="text-sm">Mennyiség:</label>
                    <select
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                      className="px-3 py-1 border rounded"
                    >
                      {[...Array(Math.min(item.listing.quantity, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eltávolítás
                    </button>
                  </div>
                </div>

                {/* Ár */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {item.subtotal} {item.listing.currency}
                  </div>
                  <div className="text-sm text-gray-500">
                    {item.price} Ft × {item.quantity}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Jobb oldal - Összegzés + Rendelés */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h2 className="text-2xl font-bold mb-6">Rendelés összegzése</h2>

            {/* Összesítés */}
            <div className="space-y-2 mb-6 pb-6 border-b">
              <div className="flex justify-between">
                <span>Termékek ({cart.items.length}):</span>
                <span className="font-semibold">{cart.totalAmount} HUF</span>
              </div>
              <div className="flex justify-between">
                <span>Szállítás:</span>
                <span className="text-green-600">Megbeszélés szerint</span>
              </div>
            </div>

            {/* Végösszeg */}
            <div className="flex justify-between text-xl font-bold mb-6">
              <span>Végösszeg:</span>
              <span className="text-green-600">{cart.totalAmount} HUF</span>
            </div>

            {/* Rendelési form */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Szállítási cím *
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Pl: 1133 Budapest, Tündér utca 12. 3/15"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Fizetési mód
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="bank_transfer">Banki átutalás</option>
                  <option value="cash">Készpénz</option>
                  <option value="card">Bankkártya</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={checkingOut}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
              >
                {checkingOut ? 'Rendelés leadása...' : '✓ Rendelés leadása'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;