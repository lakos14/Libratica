import React from 'react';
import { Link } from 'react-router-dom';

const CartItemRow = ({ item, onRemove }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded">
      <Link to={`/listings/${item.listing?.id}`}>
        <div className="w-16 h-20 bg-gray-200 rounded flex-shrink-0 overflow-hidden">
          {(() => {
            const imgUrl = item.listing?.images?.length > 0
              ? `http://localhost:5102${item.listing.images[0]}`
              : item.listing?.book?.coverImageUrl;
            return imgUrl ? (
              <img
                src={imgUrl}
                alt={item.listing.book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                📚
              </div>
            );
          })()}
        </div>
      </Link>

      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-gray-900 text-sm truncate">
          {item.listing?.book?.title || 'Ismeretlen könyv'}
        </h4>
        <p className="text-xs text-gray-600 truncate">
          {item.listing?.book?.author || 'Ismeretlen szerző'}
        </p>
        <p className="text-xs text-gray-500">
          Mennyiség: {item.quantity} db
        </p>
      </div>

      <div className="text-right flex-shrink-0">
        <p className="font-bold text-[#8b4513]">
          {(item.price * item.quantity).toLocaleString('hu-HU')} Ft
        </p>
        <p className="text-xs text-gray-500">
          {item.price.toLocaleString('hu-HU')} Ft / db
        </p>
      </div>

      <button
        onClick={onRemove}
        className="text-red-500 hover:text-red-700 text-l"
        title="Eltávolítás"
      >
        Törlés
      </button>
    </div>
  );
};

export default CartItemRow;