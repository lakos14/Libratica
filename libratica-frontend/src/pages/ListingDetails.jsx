import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api, { cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a hirdetés betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.addToCart({
        listingId: listing.id,
        quantity: quantity,
      });
      alert('Sikeresen hozzáadva a kosárhoz!');
    } catch (err) {
      alert(err.response?.data?.message || 'Hiba a kosárba helyezéskor');
    } finally {
      setAddingToCart(false);
    }
  };

  const getConditionLabel = (condition) => {
    const labels = {
      mint: '⭐ Újszerű',
      excellent: '⭐ Kiváló',
      good: '👍 Jó',
      fair: '👌 Elfogadható',
      poor: '📦 Gyenge',
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Hirdetés nem található</p>
        </div>
      </div>
    );
  }

  const isOwnListing = user && listing.seller?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Vissza gomb */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          ← Vissza
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bal oldal - Kép */}
          <div className="bg-white border border-gray-200 rounded p-6 flex items-center justify-center">
            {listing.book?.coverImageUrl ? (
              <img
                src={listing.book.coverImageUrl}
                alt={listing.book?.title}
                className="max-w-full max-h-96 object-contain rounded"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-6xl">📚</span>
              </div>
            )}
          </div>

          {/* Jobb oldal - Részletek */}
          <div className="bg-white border border-gray-200 rounded p-6">
            {/* Könyv cím */}
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#8b4513' }}>
              {listing.book?.title}
            </h1>

            {/* Szerző */}
            <p className="text-xl text-gray-600 mb-4">
              {listing.book?.author}
            </p>

            {/* Ár */}
            <div className="mb-6">
              <span className="text-4xl font-bold" style={{ color: '#8b4513' }}>
                {listing.price?.toLocaleString('hu-HU')} Ft
              </span>
            </div>

            {/* Állapot */}
            <div className="mb-4">
              <span className="text-sm text-gray-600">Állapot:</span>
              <span className="ml-2 text-lg font-medium">
                {getConditionLabel(listing.condition)}
              </span>
            </div>

            {/* Mennyiség */}
            <div className="mb-4">
              <span className="text-sm text-gray-600">Elérhető mennyiség:</span>
              <span className="ml-2 text-lg font-medium">
                {listing.quantity} db
              </span>
            </div>

            {/* Helyszín */}
            {listing.location && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Helyszín:</span>
                <span className="ml-2 text-lg font-medium">
                  📍 {listing.location}
                </span>
              </div>
            )}

            {/* Leírás */}
            {listing.description && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                  Leírás
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            {/* Eladó */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                Eladó
              </h3>
              <p className="text-gray-700">
                <span className="font-medium">{listing.seller?.username}</span>
                <span className="ml-2 text-sm text-gray-500">
                  {listing.seller?.rating 
                    ? `⭐ ${listing.seller.rating.toFixed(1)}`
                    : '⭐ Még nincs értékelés'}
                </span>
              </p>
            </div>

            {/* Kosárba rakás */}
            {!isOwnListing && listing.isAvailable && user && (
              <div className="space-y-4">
                {/* Mennyiség választó */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mennyiség
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={listing.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  />
                </div>

                {/* Kosárba gomb */}
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full px-6 py-3 rounded text-white font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#8b4513' }}
                >
                  {addingToCart ? 'Hozzáadás...' : '🛒 Kosárba rakom'}
                </button>
              </div>
            )}

            {/* Saját hirdetés */}
            {isOwnListing && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-blue-800 text-sm">
                  Ez a te hirdetésed. Nem vásárolhatod meg a saját termékedet.
                </p>
              </div>
            )}

            {/* Nincs bejelentkezve */}
            {!user && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Jelentkezz be a vásárláshoz!
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 rounded text-white font-semibold"
                  style={{ backgroundColor: '#8b4513' }}
                >
                  Bejelentkezés
                </button>
              </div>
            )}

            {/* Nem elérhető */}
            {!listing.isAvailable && (
              <div className="bg-gray-100 border border-gray-300 rounded p-4">
                <p className="text-gray-700 text-sm">
                  Ez a hirdetés jelenleg nem elérhető.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Könyv részletei (opcionális) */}
        {listing.book && (
          <div className="mt-8 bg-white border border-gray-200 rounded p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#8b4513' }}>
              A könyvről
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.book.isbn && (
                <div>
                  <span className="text-sm text-gray-600">ISBN:</span>
                  <span className="ml-2 font-medium">{listing.book.isbn}</span>
                </div>
              )}
              {listing.book.publicationYear && (
                <div>
                  <span className="text-sm text-gray-600">Kiadás éve:</span>
                  <span className="ml-2 font-medium">{listing.book.publicationYear}</span>
                </div>
              )}
              {listing.book.publisher && (
                <div>
                  <span className="text-sm text-gray-600">Kiadó:</span>
                  <span className="ml-2 font-medium">{listing.book.publisher}</span>
                </div>
              )}
              {listing.book.language && (
                <div>
                  <span className="text-sm text-gray-600">Nyelv:</span>
                  <span className="ml-2 font-medium">{listing.book.language}</span>
                </div>
              )}
            </div>
            {listing.book.description && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                  Leírás
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.book.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingDetails;