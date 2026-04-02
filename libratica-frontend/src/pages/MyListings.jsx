import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMyListings, useDeleteListing } from '../hooks';
import { toast } from 'react-toastify';
import { BASE_URL } from '../services/api';

function MyListings() {
  const navigate = useNavigate();

  const { data: listings = [], isLoading, isError } = useMyListings();
  const deleteListing = useDeleteListing();

  const handleDelete = async (id) => {
    if (!window.confirm('Biztosan törölni szeretnéd ezt a hirdetést?')) return;
    await deleteListing.mutateAsync(id);
    toast.success('Hirdetés sikeresen törölve!');
  };

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
            Hiba a hirdetések betöltésekor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <h1 className="text-3xl font-bold" style={{ color: '#8b4513' }}>
            Saját hirdetéseim
          </h1>
          <Link
            to="/listings/create"
            className="px-4 py-2 rounded text-white font-medium whitespace-nowrap"
            style={{ backgroundColor: '#8b4513' }}
          >
            + Új hirdetés
          </Link>
        </div>
        {listings.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">Még nincs hirdetésed</p>
            <Link
              to="/listings/create"
              className="inline-block px-6 py-2 rounded text-white font-medium"
              style={{ backgroundColor: '#8b4513' }}
            >
              Első hirdetés létrehozása
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => navigate(`/edit-listing/${listing.id}`)}
                className="bg-white border border-gray-200 rounded p-4 flex flex-col cursor-pointer hover:border-gray-400 transition-colors"
              >
                {listing.images?.length > 0 ? (
                  <img
                    src={`${BASE_URL}${listing.images[0]}`}
                    alt={listing.book?.title}
                    className="w-full h-64 object-cover rounded mb-3"
                  />
                ) : listing.book?.coverImageUrl ? (
                  <img
                    src={listing.book.coverImageUrl}
                    alt={listing.book?.title}
                    className="w-full h-64 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📚</span>
                  </div>
                )}

                <h3 className="font-bold text-gray-800 mb-1 text-sm line-clamp-2">
                  {listing.book?.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">{listing.book?.author}</p>

                <div className="flex flex-col gap-1 mb-3">
                  <span className="font-bold text-sm" style={{ color: '#8b4513' }}>
                    {listing.price?.toLocaleString('hu-HU')} Ft
                  </span>
                  <span className="text-xs text-gray-500">
                    {getConditionLabel(listing.condition)}
                  </span>
                  <span className="text-xs text-gray-500">{listing.quantity} db</span>
                  {listing.location && (
                    <span className="text-xs text-gray-500">{listing.location}</span>
                  )}
                </div>

                <div className="mb-3">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${listing.isAvailable
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                      }`}
                  >
                    {listing.isAvailable ? 'Elérhető' : 'Nem elérhető'}
                  </span>
                </div>

                <div className="flex gap-2 mt-auto">
                  <button
                    onClick={() => navigate(`/listings/${listing.id}`)}
                    className="flex-1 px-3 py-2 text-xs rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Megtekintés
                  </button>
                  <button
                    onClick={() => navigate(`/edit-listing/${listing.id}`)}
                    className="flex-1 px-3 py-2 text-xs rounded text-white"
                    style={{ backgroundColor: '#8b4513' }}
                  >
                    Szerkesztés
                  </button>
                  <button
                    onClick={() => handleDelete(listing.id)}
                    disabled={deleteListing.isPending}
                    className="px-3 py-2 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400"
                  >
                    {deleteListing.isPending ? '...' : 'Törlés'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyListings;
