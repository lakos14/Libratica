import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useCart, useRemoveFromCart, useCheckout } from '../hooks';
import api from '../services/api';
import SellerGroup from '../components/cart/SellerGroup';
import CheckoutModal from '../components/cart/CheckoutModal';

const Cart = () => {
  const navigate = useNavigate();
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [checkoutAll, setCheckoutAll] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null);

  const { data: cart, isLoading, isError } = useCart();
  const removeFromCart = useRemoveFromCart();
  const checkout = useCheckout();

  const groupedBySeller = useMemo(() => {
    if (!cart?.items || cart.items.length === 0) return {};

    return cart.items.reduce((acc, item) => {
      const sellerId = item.listing.seller.id;

      if (!acc[sellerId]) {
        acc[sellerId] = {
          seller: item.listing.seller,
          items: [],
          subtotal: 0
        };
      }

      acc[sellerId].items.push(item);
      acc[sellerId].subtotal += item.price * item.quantity;

      return acc;
    }, {});
  }, [cart]);

  const handleRemoveItem = (cartItemId) => {
    setDeleteConfirmModal(cartItemId);
  };

  const confirmRemoveItem = async () => {
    await removeFromCart.mutateAsync(deleteConfirmModal);
    setDeleteConfirmModal(null);
  };

  const handleCheckoutSeller = (sellerId) => {
    setSelectedSeller(sellerId);
    setCheckoutAll(false);
    setCheckoutModalOpen(true);
  };

  const handleCheckoutAllSellers = () => {
    setSelectedSeller(null);
    setCheckoutAll(true);
    setCheckoutModalOpen(true);
  };

  const handleCheckoutSubmit = async ({ shippingAddress, paymentMethod }) => {
    try {
      if (checkoutAll) {
        const sellerIds = Object.keys(groupedBySeller);

        for (const sellerId of sellerIds) {
          const group = groupedBySeller[sellerId];

          await api.post('/orders/checkout', {
            sellerId: parseInt(sellerId),
            items: group.items.map(item => ({
              listingId: item.listing.id,
              quantity: item.quantity,
              price: item.price
            })),
            shippingAddress,
            paymentMethod
          });

          for (const item of group.items) {
            await api.delete(`/cart/items/${item.id}`);
          }
        }

        toast.success(`${sellerIds.length} rendelés sikeresen leadva!`);
        navigate('/orders');

      } else {
        const group = groupedBySeller[selectedSeller];

        await api.post('/orders/checkout', {
          sellerId: parseInt(selectedSeller),
          items: group.items.map(item => ({
            listingId: item.listing.id,
            quantity: item.quantity,
            price: item.price
          })),
          shippingAddress,
          paymentMethod
        });

        for (const item of group.items) {
          await api.delete(`/cart/items/${item.id}`);
        }

        toast.success(`Rendelés leadva: ${group.seller.username}`);
      }

      setCheckoutModalOpen(false);

    } catch (error) {
      console.error('Checkout hiba:', error);
      toast.error(error.response?.data?.message || 'Hiba történt a rendelés leadásakor');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Kosár betöltése...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Nem sikerült betölteni a kosarat
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">A kosarad üres</p>
          <button
            onClick={() => navigate('/listings')}
            className="px-6 py-3 bg-[#8b4513] text-white rounded-lg hover:bg-[#654321] transition"
          >
            Böngészés a hirdetések között
          </button>
        </div>
      </div>
    );
  }

  const sellerCount = Object.keys(groupedBySeller).length;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kosár</h1>

      <div className="mb-6">
        {Object.entries(groupedBySeller).map(([sellerId, group]) => (
          <SellerGroup
            key={sellerId}
            seller={group.seller}
            items={group.items}
            subtotal={group.subtotal}
            onCheckout={() => handleCheckoutSeller(sellerId)}
            onRemoveItem={handleRemoveItem}
          />
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xl font-bold">Végösszeg:</span>
          <span className="text-2xl font-bold text-[#8b4513]">
            {cart.totalAmount?.toLocaleString('hu-HU')} Ft
          </span>
        </div>

        <button
          onClick={handleCheckoutAllSellers}
          className="w-full py-3 bg-[#8b4513] text-white rounded-lg font-semibold hover:bg-[#654321] transition"
        >
          Összes megrendelése ({sellerCount} eladónak)
        </button>

        <p className="text-xs text-gray-500 mt-2 text-center">
          {sellerCount} különböző rendelés jön létre
        </p>
      </div>

      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSubmit={handleCheckoutSubmit}
        sellerName={selectedSeller ? groupedBySeller[selectedSeller]?.seller.username : null}
      />

      {deleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold mb-4">Megerősítés</h3>
            <p className="text-gray-600 mb-6">
              Biztosan eltávolítod ezt a tételt a kosárból?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmModal(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Mégse
              </button>
              <button
                onClick={confirmRemoveItem}
                disabled={removeFromCart.isPending}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition disabled:bg-gray-400"
              >
                {removeFromCart.isPending ? 'Törlés...' : 'Törlés'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
