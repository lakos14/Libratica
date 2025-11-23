import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { searchAPI } from '../services/api';

const Listings = () => {
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: '',
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const bookIdFromUrl = searchParams.get('bookId');

  // Debounced effect - csak 500ms után hív
  useEffect(() => {
    const timer = setTimeout(() => {
      loadListings();
    }, 500); // 500ms késleltetés

    return () => clearTimeout(timer); // Cleanup
  }, [filters, bookIdFromUrl]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const params = {
        query: searchQuery || undefined,
        bookId: bookIdFromUrl ? parseInt(bookIdFromUrl) : undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        condition: filters.condition || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      console.log('📦 Listings params:', params);

      const response = await searchAPI.searchListings(params);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadListings();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  if (loading && listings.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        {bookIdFromUrl ? 'Hirdetések ehhez a könyvhöz' : 'Hirdetések böngészése'}
      </h1>

      {/* Keresés */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Keresés cím, szerző alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700"
          >
            🔍 Keresés
          </button>
        </div>
      </form>

      {/* Szűrők */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h3 className="text-xl font-bold mb-4">Szűrők</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Min. ár (Ft)</label>
            <input
              type="number"
              placeholder="0"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max. ár (Ft)</label>
            <input
              type="number"
              placeholder="10000"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Állapot</label>
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Összes</option>
              <option value="mint">Újszerű</option>
              <option value="excellent">Kiváló</option>
              <option value="good">Jó</option>
              <option value="fair">Elfogadható</option>
              <option value="poor">Gyenge</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Rendezés</label>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-');
                setFilters({ ...filters, sortBy, sortOrder });
              }}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="date-desc">Legújabb</option>
              <option value="date-asc">Legrégebbi</option>
              <option value="price-asc">Ár növekvő</option>
              <option value="price-desc">Ár csökkenő</option>
              <option value="views-desc">Legnépszerűbb</option>
            </select>
          </div>
        </div>
      </div>

      {/* Találatok száma */}
      <div className="mb-4 text-gray-600">
        <strong>{listings.length}</strong> hirdetés találva
      </div>

      {/* Hirdetések listája */}
      {listings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nincs találat a keresési feltételeknek megfelelően
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              to={`/listings/${listing.id}`}
              className="border rounded-lg p-4 hover:shadow-xl transition"
            >
              <img
                src={listing.book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
                alt={listing.book.title}
                className="w-full h-64 object-cover rounded mb-4"
              />
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{listing.book.title}</h3>
              <p className="text-gray-600 mb-2 text-sm">{listing.book.author}</p>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xl font-bold text-green-600">
                  {listing.price} {listing.currency}
                </span>
                <span className={`text-xs px-2 py-1 rounded ${
                  listing.condition === 'mint' ? 'bg-green-100 text-green-800' :
                  listing.condition === 'excellent' ? 'bg-blue-100 text-blue-800' :
                  listing.condition === 'good' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {listing.condition}
                </span>
              </div>
              <p className="text-xs text-gray-500">📍 {listing.location || 'Nincs megadva'}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Listings;