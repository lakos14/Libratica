import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listingsAPI, searchAPI } from '../services/api';

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 12;
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    query: '',
    bookId: searchParams.get('bookId') || '',
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: '',
  });

  useEffect(() => {
    const bookIdFromUrl = searchParams.get('bookId');
    if (bookIdFromUrl && bookIdFromUrl !== filters.bookId) {
      setFilters((prev) => ({
        ...prev,
        bookId: bookIdFromUrl,
      }));
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadListings();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentPage, filters]);
  

  const loadListings = async () => {
    setLoading(true);
    try {
      const response = await searchAPI.searchListings({
        query: filters.query || undefined,
        bookId: filters.bookId || undefined,
        minPrice: filters.minPrice || undefined,
        maxPrice: filters.maxPrice || undefined,
        condition: filters.condition || undefined,
        location: filters.location || undefined,
        isAvailable: true,
        page: currentPage,
        pageSize,
      });
      setListings(response.data.items);
      setTotalPages(response.data.totalPages);
      setTotalCount(response.data.totalCount);
    } catch (error) {
      console.error('Hiba a hirdetések betöltésekor:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      bookId: '',
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          Hirdetések böngészése
        </h1>

        {/* Keresés és szűrők */}
        <div className="bg-white border border-gray-200 rounded p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {/* Keresés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keresés
              </label>
              <input
                type="text"
                name="query"
                placeholder="Könyv címe..."
                value={filters.query}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Min ár */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. ár (Ft)
              </label>
              <input
                type="number"
                name="minPrice"
                placeholder="pl. 1000"
                value={filters.minPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Max ár */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max. ár (Ft)
              </label>
              <input
                type="number"
                name="maxPrice"
                placeholder="pl. 5000"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Állapot */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Állapot
              </label>
              <select
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              >
                <option value="">Összes</option>
                <option value="mint">⭐ Újszerű</option>
                <option value="excellent">⭐ Kiváló</option>
                <option value="good">👍 Jó</option>
                <option value="fair">👌 Elfogadható</option>
                <option value="poor">📦 Gyenge</option>
              </select>
            </div>

            {/* Helyszín */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Helyszín
              </label>
              <input
                type="text"
                name="location"
                placeholder="Város..."
                value={filters.location}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Szűrők törlése gomb */}
          {(filters.query || filters.minPrice || filters.maxPrice || filters.condition || filters.location) && (
            <div className="mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
              >
                Szűrők törlése
              </button>
            </div>
          )}
        </div>

        {/* Találatok száma */}
        <p className="text-gray-600">
          {loading ? 'Betöltés...' : `${totalCount} hirdetés találat`}
        </p>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Hirdetések grid */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                onClick={() => navigate(`/listings/${listing.id}`)}
                className="bg-white border border-gray-200 rounded p-3 cursor-pointer hover:border-gray-400 transition-colors flex flex-col"
              >
              {listing.images?.length > 0 ? (
                <img
                  src={`http://localhost:5102${listing.images[0]}`}
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
                <p className="text-xs text-gray-600 mb-2">
                  {listing.book?.author}
                </p>
                <div className="flex flex-col gap-1 mt-auto">
                  <span className="font-bold text-sm" style={{ color: '#8b4513' }}>
                    {listing.price?.toLocaleString('hu-HU')} Ft
                  </span>
                  <span className="text-xs text-gray-500">
                    {getConditionLabel(listing.condition)}
                  </span>
                  {listing.location && (
                    <span className="text-xs text-gray-500">
                      📍 {listing.location}
                    </span>
                  )}
                  <span className="text-xs text-gray-500">
                    👤 {listing.seller?.username}
                    {listing.seller?.rating 
                      ? ` ⭐ ${listing.seller.rating.toFixed(1)}`
                      : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              «
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              ‹
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .reduce((acc, p, idx, arr) => {
                if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
              }, [])
              .map((p, idx) => p === '...' ? (
                <span key={`dots-${idx}`} className="px-2 py-2 text-sm text-gray-500">...</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setCurrentPage(p)}
                  className={`px-3 py-2 text-sm rounded border font-medium ${
                    currentPage === p
                      ? 'text-white border-transparent'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  style={currentPage === p ? { backgroundColor: '#8b4513' } : {}}
                >
                  {p}
                </button>
              ))}

            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              ›
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
            >
              »
            </button>
          </div>
        )}

        {/* Nincs találat */}
        {!loading && listings.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Nincs találat</p>
            <p className="text-gray-400 text-sm mt-2">
              Próbálj meg más keresési feltételeket használni
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Listings;