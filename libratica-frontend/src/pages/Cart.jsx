import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';
import SellerGroup from '../components/cart/SellerGroup';
import CheckoutModal from '../components/cart/CheckoutModal';


const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [checkoutAll, setCheckoutAll] = useState(false);
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(null); // ÚJ
  const navigate = useNavigate();
  
  // Kosár betöltése
  useEffect(() => {
    loadCart();
  }, []);
  
  const loadCart = async () => {
    try {
      setLoading(true);
      const response = await api.get('/cart');
      setCart(response.data);
    } catch (error) {
      console.error('Hiba a kosár betöltésekor:', error);
      toast.error('Nem sikerült betölteni a kosarat');
    } finally {
      setLoading(false);
    }
  };
  
  // Eladónkénti csoportosítás
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
  
  // Törlés megerősítés megnyitása
  const handleRemoveItem = (cartItemId) => {
    setDeleteConfirmModal(cartItemId);
  };
  
  // Törlés végrehajtása
  const confirmRemoveItem = async () => {
    try {
      await api.delete(`/cart/items/${deleteConfirmModal}`);
      setDeleteConfirmModal(null);
      await loadCart();
    } catch (error) {
      console.error('Hiba a tétel törlésekor:', error);
      toast.error('Nem sikerült eltávolítani a tételt');
    }
  };
  
  // Egy eladónak checkout indítása
  const handleCheckoutSeller = (sellerId) => {
    setSelectedSeller(sellerId);
    setCheckoutAll(false);
    setCheckoutModalOpen(true);
  };
  
  // Összes eladónak checkout indítása
  const handleCheckoutAllSellers = () => {
    setSelectedSeller(null);
    setCheckoutAll(true);
    setCheckoutModalOpen(true);
  };
  
  // Checkout végrehajtása
  const handleCheckoutSubmit = async ({ shippingAddress, paymentMethod }) => {
    try {
      if (checkoutAll) {
        // Mindenkinek egyszerre
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
          
          // Kosárból törlés
          for (const item of group.items) {
            await api.delete(`/cart/items/${item.id}`);
          }
        }
        
        toast.success(`✅ ${sellerIds.length} rendelés sikeresen leadva!`);
        navigate('/orders');
        
      } else {
        // Egy eladónak
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
        
        // Kosárból törlés
        for (const item of group.items) {
          await api.delete(`/cart/items/${item.id}`);
        }
        
        toast.success(`✅ Rendelés leadva: ${group.seller.username}`);
        await loadCart();
      }
      
      setCheckoutModalOpen(false);
      
    } catch (error) {
      console.error('Checkout hiba:', error);
      toast.error(error.response?.data?.message || 'Hiba történt a rendelés leadásakor');
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Betöltés...</div>
      </div>
    );
  }
  
  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-xl text-gray-600 mb-4">🛒 A kosarad üres</p>
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
      <h1 className="text-3xl font-bold mb-6">🛒 Kosár</h1>
      
      {/* Eladónkénti csoportok */}
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
      
      {/* Összesítő */}
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
          ✅ Összes megrendelése ({sellerCount} eladónak)
        </button>
        
        <p className="text-xs text-gray-500 mt-2 text-center">
          {sellerCount} különböző rendelés jön létre
        </p>
      </div>
      
      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={checkoutModalOpen}
        onClose={() => setCheckoutModalOpen(false)}
        onSubmit={handleCheckoutSubmit}
        sellerName={selectedSeller ? groupedBySeller[selectedSeller]?.seller.username : null}
      />
      
      {/* Törlés megerősítő modal */}
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
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
              >
                Törlés
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;