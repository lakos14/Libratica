import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItemRow from './CartItemRow';

const SellerGroup = ({ seller, items, subtotal, onCheckout, onRemoveItem }) => {
  const [expanded, setExpanded] = useState(true);
  const navigate = useNavigate();
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-sm">
      {/* Eladó header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#8b4513] text-white rounded-full flex items-center justify-center text-xl font-bold">
            {seller.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-bold text-lg">{seller.username}</h3>
            <p className="text-sm text-gray-600">
              {items.length} tétel kosárban
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-gray-600 hover:text-gray-800 text-xl"
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>
      
      {/* Tételek */}
      {expanded && (
        <div className="space-y-3 mb-4">
          {items.map(item => (
            <CartItemRow 
              key={item.id} 
              item={item}
              onRemove={() => onRemoveItem(item.id)}
            />
          ))}
        </div>
      )}
      
      {/* Részösszeg és gombok */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t">
        <div>
          <span className="text-sm text-gray-600">Részösszeg:</span>
          <span className="ml-2 text-xl font-bold text-[#8b4513]">
            {subtotal.toLocaleString('hu-HU')} Ft
          </span>
        </div>
        
        <div>
        <button
            onClick={onCheckout}
            className="px-6 py-2 bg-[#8b4513] text-white rounded hover:bg-[#654321] transition font-semibold"
        >
            Megrendelem
        </button>
        </div>
      </div>
    </div>
  );
};

export default SellerGroup;