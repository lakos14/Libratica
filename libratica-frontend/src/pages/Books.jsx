import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchAPI } from '../services/api';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    categoryId: '',
    minYear: '',
    maxYear: '',
    language: '',
    sortBy: 'title',
    sortOrder: 'asc',
  });
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);

  useEffect(() => {
    loadCategories();
    loadLanguages();
  }, []);

  useEffect(() => {
    loadBooks();
  }, [filters]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5102/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadLanguages = async () => {
    try {
      const response = await searchAPI.searchBooks({ query: '' });
      const uniqueLanguages = [...new Set(response.data.map(b => b.language).filter(Boolean))];
      setLanguages(uniqueLanguages);
    } catch (error) {
      console.error('Failed to load languages:', error);
    }
  };

  const loadBooks = async () => {
    try {
      setLoading(true);
      const params = {
        query: searchQuery || undefined,
        categoryId: filters.categoryId || undefined,
        minYear: filters.minYear || undefined,
        maxYear: filters.maxYear || undefined,
        language: filters.language || undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await searchAPI.searchBooks(params);
      setBooks(response.data);
    } catch (error) {
      console.error('Failed to load books:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadBooks();
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  if (loading && books.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Betöltés...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Könyvek böngészése</h1>

      {/* Keresés */}
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Keresés cím, szerző, ISBN alapján..."
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kategória</label>
            <select
              value={filters.categoryId}
              onChange={(e) => handleFilterChange('categoryId', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Összes</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Nyelv</label>
            <select
              value={filters.language}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Összes</option>
              {languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Min. év</label>
            <input
              type="number"
              placeholder="1900"
              value={filters.minYear}
              onChange={(e) => handleFilterChange('minYear', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Max. év</label>
            <input
              type="number"
              placeholder="2025"
              value={filters.maxYear}
              onChange={(e) => handleFilterChange('maxYear', e.target.value)}
              className="w-full px-4 py-2 border rounded-lg"
            />
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
              <option value="title-asc">Cím (A-Z)</option>
              <option value="title-desc">Cím (Z-A)</option>
              <option value="author-asc">Szerző (A-Z)</option>
              <option value="author-desc">Szerző (Z-A)</option>
              <option value="year-desc">Év (újabb)</option>
              <option value="year-asc">Év (régebbi)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Találatok száma */}
      <div className="mb-4 text-gray-600">
        <strong>{books.length}</strong> könyv találva
      </div>

      {/* Könyvek listája */}
      {books.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Nincs találat a keresési feltételeknek megfelelően
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <div
              key={book.id}
              className="border rounded-lg p-4 hover:shadow-xl transition"
            >
              <img
                src={book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
                alt={book.title}
                className="w-full h-64 object-cover rounded mb-4"
              />
              <h3 className="font-bold text-lg mb-2 line-clamp-2">{book.title}</h3>
              <p className="text-gray-600 mb-2 text-sm">{book.author}</p>
              
              <div className="text-xs text-gray-500 space-y-1 mb-4">
                {book.publisher && <div>📚 {book.publisher}</div>}
                {book.publicationYear && <div>📅 {book.publicationYear}</div>}
                {book.language && <div>🌐 {book.language}</div>}
                {book.pageCount && <div>📄 {book.pageCount} oldal</div>}
              </div>

              {book.categories && book.categories.length > 0 && (
                <div className="mb-4">
                  {book.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1 mb-1"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <Link
                to={`/listings?bookId=${book.id}`}
                className="block w-full bg-green-600 text-white text-center py-2 rounded hover:bg-green-700"
              >
                🛒 Hirdetések megtekintése
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Books;