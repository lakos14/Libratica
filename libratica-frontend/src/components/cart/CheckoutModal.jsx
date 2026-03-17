import React, { useState } from 'react';
import { toast } from 'react-toastify';

const CheckoutModal = ({ isOpen, onClose, onSubmit, sellerName }) => {
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  if (!isOpen) return null;
  
  const handleSubmit = () => {
    if (!shippingAddress.trim()) {
      toast.warning('Kérlek add meg a szállítási címet!');
      return;
    }
    onSubmit({ shippingAddress, paymentMethod });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">
          Rendelés véglegesítése
        </h2>
        
        {sellerName && (
          <p className="text-gray-600 mb-4">
            Eladó: <span className="font-semibold">{sellerName}</span>
          </p>
        )}
        
        {/* Szállítási cím */}
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2">
            Szállítási cím *
          </label>
          <textarea
            value={shippingAddress}
            onChange={(e) => setShippingAddress(e.target.value)}
            placeholder="Név&#10;Irányítószám Város&#10;Utca, házszám"
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
            rows="4"
          />
        </div>
        
        {/* Fizetési mód */}
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Fizetési mód
          </label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
          >
            <option value="cash">Készpénz (átvételkor)</option>
            <option value="transfer">Banki átutalás</option>
          </select>
        </div>
        
        {/* Gombok */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
          >
            Mégse
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[#8b4513] text-white rounded hover:bg-[#654321] transition font-semibold"
          >
            Rendelés leadása
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;