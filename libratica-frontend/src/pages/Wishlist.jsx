import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist } from '../hooks';
import { BASE_URL } from '../services/api';

function Wishlist() {
  const { data: wishlist = [], isLoading, isError } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  const handleRemove = async (bookId) => {
    await removeFromWishlist.mutateAsync(bookId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Hiba a kívánságlista betöltésekor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          Kívánságlistám
        </h1>

        {wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">A kívánságlistád üres</p>
            <Link
              to="/books"
              className="inline-block px-6 py-2 rounded text-white font-medium"
              style={{ backgroundColor: '#8b4513' }}
            >
              Könyvek böngészése
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {wishlist.map((item) => (
              <Link
                key={item.id}
                to={`/listings?bookId=${item.book?.id}`}
                className="bg-white border border-gray-200 rounded p-3 flex flex-col hover:border-gray-400 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {(() => {
                  const imgUrl = item.book?.firstListingImage
                    ? `${BASE_URL}${JSON.parse(item.book.firstListingImage)[0]}`
                    : item.book?.coverImageUrl;
                  return imgUrl ? (
                    <img src={imgUrl} alt={item.book.title} className="w-full h-48 object-cover rounded mb-3" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📚</span>
                    </div>
                  );
                })()}

                <span className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                  {item.book?.title}
                </span>
                <p className="text-xs text-gray-600 mb-2">
                  {item.book?.author}
                </p>

                {item.book?.minPrice ? (
                  <p className="text-sm font-bold mb-2" style={{ color: '#8b4513' }}>
                    {item.book.minPrice.toLocaleString('hu-HU')} Ft-tól
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mb-2">Nincs elérhető hirdetés</p>
                )}

                <div className="flex gap-2 mt-auto">
                  <span
                    className="flex-1 text-center px-2 py-1 text-xs rounded text-white"
                    style={{ backgroundColor: '#8b4513' }}
                  >
                    Hirdetések
                  </span>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleRemove(item.book?.id);
                    }}
                    disabled={removeFromWishlist.isPending}
                    className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                  >
                    {removeFromWishlist.isPending ? '...' : 'Törlés'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;
