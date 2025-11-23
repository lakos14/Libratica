import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const MyListings = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  loadListings();
}, []);

  const loadListings = async () => {
    try {
      const response = await listingsAPI.getMyListings();
      setListings(response.data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Biztosan törlöd: ${title}?`)) return;

    try {
      await listingsAPI.delete(id);
      alert('Hirdetés törölve!');
      loadListings();
    } catch (error) {
      alert(error.response?.data?.message || 'Hiba történt a törlés során');
    }
  };

  const toggleAvailability = async (id, currentStatus) => {
    try {
      await listingsAPI.update(id, { isAvailable: !currentStatus });
      loadListings();
    } catch (error) {
      alert(error.response?.data?.message || 'Hiba történt');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Hirdetéseim ({listings.length})</h1>
        <button
          onClick={() => navigate('/listings/create')}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          + Új hirdetés
        </button>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-4">Még nincs hirdetésed</h2>
          <p className="text-gray-600 mb-8">Hozz létre az első hirdetésedet!</p>
          <button
            onClick={() => navigate('/listings/create')}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
          >
            Új hirdetés létrehozása
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex gap-6">
                {/* Kép */}
                <img
                  src={listing.book.coverImageUrl || 'https://via.placeholder.com/100x150?text=No+Cover'}
                  alt={listing.book.title}
                  className="w-24 h-36 object-cover rounded"
                />

                {/* Részletek */}
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold">{listing.book.title}</h3>
                      <p className="text-gray-600">{listing.book.author}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        {listing.price} {listing.currency}
                      </div>
                      <div className={`text-sm px-3 py-1 rounded inline-block mt-2 ${
                        listing.isAvailable 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {listing.isAvailable ? '✓ Elérhető' : '✗ Nem elérhető'}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                    <div>Állapot: <span className="font-semibold">{listing.condition}</span></div>
                    <div>Készlet: <span className="font-semibold">{listing.quantity} db</span></div>
                    <div>Helyszín: <span className="font-semibold">{listing.location || 'N/A'}</span></div>
                  </div>

                  {listing.conditionDescription && (
                    <p className="text-sm text-gray-600 mb-4">
                      {listing.conditionDescription}
                    </p>
                  )}

                  {/* Műveletek */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => navigate(`/listings/${listing.id}/edit`)}
                      className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 text-sm"
                    >
                      ✏️ Szerkesztés
                    </button>
                    <button
                      onClick={() => toggleAvailability(listing.id, listing.isAvailable)}
                      className={`px-4 py-2 rounded text-sm ${
                        listing.isAvailable
                          ? 'bg-orange-600 text-white hover:bg-orange-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}
                    >
                      {listing.isAvailable ? '⏸️ Inaktiválás' : '▶️ Aktiválás'}
                    </button>
                    <button
                      onClick={() => handleDelete(listing.id, listing.book.title)}
                      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
                    >
                      🗑️ Törlés
                    </button>
                  </div>

                  {/* Időbélyegek */}
                  <div className="mt-4 text-xs text-gray-500">
                    Létrehozva: {new Date(listing.createdAt).toLocaleDateString('hu-HU')} | 
                    Frissítve: {new Date(listing.updatedAt).toLocaleDateString('hu-HU')}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;