import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useListings } from '../hooks';

function Home() {
  const { user } = useAuth();

  const { data, isLoading } = useListings({ page: 1, pageSize: 6, isAvailable: true });
  const recentListings = data?.items || [];

  const getConditionLabel = (condition) => {
    const labels = {
      mint: 'Újszerű',
      excellent: 'Kiváló',
      good: 'Jó',
      fair: 'Elfogadható',
      poor: 'Gyenge',
    };
    return labels[condition] || condition;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-4xl font-bold mb-3" style={{ color: '#8b4513' }}>
            Üdvözöllek a Libratica-ban!
          </h1>
          <p className="text-lg text-gray-600 mb-2">Használt könyvek piactere</p>
          <p className="text-sm text-gray-500 mb-6">Vásárolj és adj el könyveket egyszerűen</p>

          {!user && (
            <div className="flex justify-center gap-4">
              <Link
                to="/register"
                className="px-6 py-2 rounded text-white font-medium"
                style={{ backgroundColor: '#8b4513' }}
              >
                Regisztráció
              </Link>
              <Link
                to="/login"
                className="px-6 py-2 rounded border border-gray-300 text-gray-700 font-medium bg-white hover:bg-gray-50"
              >
                Bejelentkezés
              </Link>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold" style={{ color: '#8b4513' }}>
            Legújabb hirdetések
          </h2>
          <Link to="/listings" className="text-gray-600 hover:text-gray-800">
            Összes megtekintése →
          </Link>
        </div>

        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {recentListings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="bg-white border border-gray-200 rounded p-3 hover:border-gray-400 transition-colors"
              >
                {(() => {
                  const imgUrl = listing.images?.length > 0
                    ? `http://localhost:5102${listing.images[0]}`
                    : listing.book?.coverImageUrl;
                  return imgUrl ? (
                    <img src={imgUrl} alt={listing.book?.title} className="w-full h-40 sm:h-64 object-cover rounded mb-3" />
                  ) : (
                    <div className="w-full h-40 sm:h-64 bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📚</span>
                    </div>
                  );
                })()}
                <h3 className="font-bold text-gray-800 mb-1 text-sm">{listing.book?.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{listing.book?.author}</p>
                <div className="flex flex-col gap-1">
                  <span className="font-bold text-sm" style={{ color: '#8b4513' }}>
                    {listing.price?.toLocaleString('hu-HU')} Ft
                  </span>
                  <span className="text-xs text-gray-500">{getConditionLabel(listing.condition)}</span>
                  <span className="text-xs text-gray-500">
                    👤 {listing.seller?.username}
                    {listing.seller?.rating ? ` ⭐ ${listing.seller.rating.toFixed(1)}` : ''}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white border-t border-gray-200 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4">
              <div className="text-4xl mb-3">📚</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                Böngéssz könyvek között
              </h3>
              <p className="text-gray-600 text-sm">
                Több száz használt könyv közül válogathatsz kedvező árakon.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="text-4xl mb-3">💰</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                Adj el könyveket
              </h3>
              <p className="text-gray-600 text-sm">
                Hirdetéseket adhatsz fel egyszerűen, és eladhatod a könyveidet.
              </p>
            </div>

            <div className="text-center p-4">
              <div className="text-4xl mb-3">🛒</div>
              <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                Vásárolj egyszerűen
              </h3>
              <p className="text-gray-600 text-sm">
                Kosárba rakás, rendelés leadása, és kapcsolatfelvétel az eladóval.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
