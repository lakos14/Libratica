import React from 'react';
import { Link } from 'react-router-dom';
import { useRecommendations } from '../hooks';
import { BASE_URL } from '../services/api';

function Recommendations() {
  const { data, isLoading, isError } = useRecommendations();

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
            Hiba az ajánlások betöltésekor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#8b4513' }}>
          Ajánlott könyvek
        </h1>
        <p className="text-gray-600 mb-6">{data?.message}</p>

        {data?.basedOn === 'purchase_history' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-green-800">
              Ezeket az ajánlásokat a kívánságlistád alapján állítottuk össze
            </p>
          </div>
        )}

        {data?.basedOn === 'popularity' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              Vásárolj könyveket és személyre szabott ajánlásokat kapsz!
            </p>
          </div>
        )}

        {data?.recommendations?.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">Nincs elérhető ajánlás</p>
            <Link
              to="/listings"
              className="inline-block px-6 py-2 rounded text-white font-medium"
              style={{ backgroundColor: '#8b4513' }}
            >
              Hirdetések böngészése
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {data?.recommendations?.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="bg-white border border-gray-200 rounded p-3 hover:border-gray-400 transition-colors flex flex-col"
              >
                {(() => {
                  const imgUrl = listing.images?.length > 0
                    ? `${BASE_URL}${listing.images[0]}`
                    : listing.book?.coverImageUrl;
                  return imgUrl ? (
                    <img src={imgUrl} alt={listing.book?.title} className="w-full h-40 sm:h-64 object-cover rounded mb-3" />
                  ) : (
                    <div className="w-full h-40 sm:h-64 bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📚</span>
                    </div>
                  );
                })()}
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                  {listing.book?.title}
                </h3>
                <p className="text-xs text-gray-600 mb-1">
                  {listing.book?.author}
                </p>
                {listing.book?.categories?.length > 0 && (
                  <p className="text-xs text-gray-400 mb-2">
                    {listing.book.categories.join(', ')}
                  </p>
                )}
                <div className="mt-auto">
                  <p className="font-bold text-sm" style={{ color: '#8b4513' }}>
                    {listing.price?.toLocaleString('hu-HU')} Ft
                  </p>
                  <p className="text-xs text-gray-500">
                    {getConditionLabel(listing.condition)}
                  </p>
                  <p className="text-xs text-gray-500">
                    👤 {listing.seller?.username}
                    {listing.seller?.rating && ` ⭐ ${listing.seller.rating.toFixed(1)}`}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Recommendations;
