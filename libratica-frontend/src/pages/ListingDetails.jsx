import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI, cartAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ListingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    try {
      const response = await listingsAPI.getById(id);
      setListing(response.data);
    } catch (error) {
      console.error('Failed to load listing:', error);
      alert('Hirdetés nem található');
      navigate('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      alert('Kérlek jelentkezz be a kosárba helyezéshez!');
      navigate('/login');
      return;
    }

    try {
      setAddingToCart(true);
      await cartAPI.addToCart({
        listingId: listing.id,
        quantity,
      });
      alert(`✅ ${quantity} db hozzáadva a kosárhoz!`);
    } catch (error) {
      alert(error.response?.data?.message || 'Hiba történt');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Betöltés...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Hirdetés nem található</h2>
        <button
          onClick={() => navigate('/listings')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Vissza a hirdetésekhez
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/listings')}
        className="text-blue-600 hover:text-blue-800 mb-6"
      >
        ← Vissza a hirdetésekhez
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Bal oldal - Kép */}
        <div>
          <img
            src={listing.book.coverImageUrl || 'https://via.placeholder.com/400x600?text=No+Cover'}
            alt={listing.book.title}
            className="w-full max-w-md mx-auto rounded-lg shadow-lg"
          />

          {listing.images && listing.images.length > 0 && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              {listing.images.map((img, index) => (
                <img
                  key={index}
                  src={img}
                  alt={`Kép ${index + 1}`}
                  className="w-full h-24 object-cover rounded cursor-pointer hover:opacity-75"
                />
              ))}
            </div>
          )}
        </div>

        {/* Jobb oldal - Részletek */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{listing.book.title}</h1>
          <p className="text-xl text-gray-600 mb-4">{listing.book.author}</p>

          {/* Ár */}
          <div className="bg-green-50 p-6 rounded-lg mb-6">
            <div className="text-4xl font-bold text-green-600 mb-2">
              {listing.price} {listing.currency}
            </div>
            <p className="text-gray-600">Elérhető: {listing.quantity} db</p>
          </div>

          {/* Állapot */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-2">Állapot</h3>
            <span className={`inline-block px-4 py-2 rounded text-sm ${
              listing.condition === 'mint' ? 'bg-green-100 text-green-800' :
              listing.condition === 'excellent' ? 'bg-blue-100 text-blue-800' :
              listing.condition === 'good' ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {listing.condition === 'mint' ? 'Újszerű' :
               listing.condition === 'excellent' ? 'Kiváló' :
               listing.condition === 'good' ? 'Jó' :
               listing.condition === 'fair' ? 'Elfogadható' : 'Gyenge'}
            </span>
            {listing.conditionDescription && (
              <p className="text-gray-600 mt-2">{listing.conditionDescription}</p>
            )}
          </div>

          {/* Mennyiség választó */}
          {listing.isAvailable && (
            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Mennyiség</label>
              <select
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value))}
                className="px-4 py-2 border rounded-lg"
              >
                {[...Array(Math.min(listing.quantity, 10))].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kosárba gomb */}
          {listing.isAvailable ? (
            <button
              onClick={handleAddToCart}
              disabled={addingToCart}
              className="w-full bg-blue-600 text-white py-4 rounded-lg text-lg font-bold hover:bg-blue-700 disabled:bg-gray-400 mb-4"
            >
              {addingToCart ? 'Hozzáadás...' : '🛒 Kosárba'}
            </button>
          ) : (
            <div className="w-full bg-red-100 text-red-800 py-4 rounded-lg text-center font-bold mb-4">
              ❌ Jelenleg nem elérhető
            </div>
          )}

          {/* Eladó info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-bold mb-2">Eladó</h3>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-200 rounded-full flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <p className="font-semibold">{listing.seller.username}</p>
                {listing.seller.rating && (
                  <p className="text-sm text-yellow-600">⭐ {listing.seller.rating.toFixed(1)}</p>
                )}
              </div>
            </div>
          </div>

          {/* Helyszín */}
          {listing.location && (
            <p className="text-gray-600 mb-2">📍 Helyszín: {listing.location}</p>
          )}
        </div>
      </div>

      {/* Könyv részletei */}
      <div className="mt-12 bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6">Könyv részletei</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {listing.book.isbn && (
            <div>
              <span className="font-bold">ISBN:</span> {listing.book.isbn}
            </div>
          )}
          {listing.book.publisher && (
            <div>
              <span className="font-bold">Kiadó:</span> {listing.book.publisher}
            </div>
          )}
          {listing.book.publicationYear && (
            <div>
              <span className="font-bold">Kiadás éve:</span> {listing.book.publicationYear}
            </div>
          )}
          {listing.book.language && (
            <div>
              <span className="font-bold">Nyelv:</span> {listing.book.language}
            </div>
          )}
          {listing.book.pageCount && (
            <div>
              <span className="font-bold">Oldalszám:</span> {listing.book.pageCount}
            </div>
          )}
        </div>

        {listing.book.description && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-2">Leírás</h3>
            <p className="text-gray-700">{listing.book.description}</p>
          </div>
        )}

        {listing.book.categories && listing.book.categories.length > 0 && (
          <div className="mt-6">
            <h3 className="font-bold text-lg mb-2">Kategóriák</h3>
            <div className="flex flex-wrap gap-2">
              {listing.book.categories.map((category) => (
                <span
                  key={category.id}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {category.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ListingDetails;