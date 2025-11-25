import React, { useState, useEffect } from 'react';
import { searchAPI, booksAPI } from '../services/api';
import { Link } from 'react-router-dom';

function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    author: '',
    minYear: '',
    maxYear: '',
  });

  useEffect(() => {
    loadBooks();
  }, []);

  // Debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBooks();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const loadBooks = async () => {
    setLoading(true);
    try {
      const params = {
        query: searchQuery || undefined,
        author: filters.author || undefined,
        minYear: filters.minYear || undefined,
        maxYear: filters.maxYear || undefined,
      };

      const response = await booksAPI.getWithAvailableListings(params);
      setBooks(response.data);
    } catch (error) {
      console.error('Hiba a könyvek betöltésekor:', error);
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
    setSearchQuery('');
    setFilters({
      author: '',
      minYear: '',
      maxYear: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          Könyvek böngészése
        </h1>

        {/* Keresés és szűrők */}
        <div className="bg-white border border-gray-200 rounded p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Keresés */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keresés
              </label>
              <input
                type="text"
                placeholder="Cím vagy szerző..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Szerző */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Szerző
              </label>
              <input
                type="text"
                name="author"
                placeholder="Szerző neve..."
                value={filters.author}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Min év */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. év
              </label>
              <input
                type="number"
                name="minYear"
                placeholder="pl. 2000"
                value={filters.minYear}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Max év */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max. év
              </label>
              <input
                type="number"
                name="maxYear"
                placeholder="pl. 2024"
                value={filters.maxYear}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>
          </div>

          {/* Szűrők törlése gomb */}
          {(searchQuery || filters.author || filters.minYear || filters.maxYear) && (
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
        <div className="mb-4">
          <p className="text-gray-600">
            {loading ? 'Betöltés...' : `${books.length} könyv találat`}
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {/* Könyvek grid */}
        {!loading && books.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="bg-white border border-gray-200 rounded p-3 flex flex-col"
              >
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    className="w-full h-64 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📚</span>
                  </div>
                )}
                <h3 className="font-bold text-gray-800 mb-1 text-sm line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-xs text-gray-600 mb-2">
                  {book.author}
                </p>
                {book.publicationYear && (
                  <p className="text-xs text-gray-500 mb-2">
                    📅 {book.publicationYear}
                  </p>
                )}
                <Link
                  to={`/listings?bookId=${book.id}`}
                  className="inline-block text-xs font-medium px-3 py-1 rounded text-white mt-auto"
                  style={{ backgroundColor: '#8b4513' }}
                >
                  Hirdetések megtekintése
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Nincs találat */}
        {!loading && books.length === 0 && (
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

export default Books;