import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBooksWithListings, useCategories, useAISearch } from '../hooks';
import { BASE_URL } from '../services/api';


function Books() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    author: '',
    minYear: '',
    maxYear: '',
    categoryId: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  const [aiQuery, setAiQuery] = useState('');
  const [aiSearching, setAiSearching] = useState(false);
  const aiSearch = useAISearch();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
      setDebouncedFilters(filters);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const { data: categories = [] } = useCategories();

  const { data, isLoading, isError, error } = useBooksWithListings({
    query: debouncedQuery || undefined,
    author: debouncedFilters.author || undefined,
    minYear: debouncedFilters.minYear || undefined,
    maxYear: debouncedFilters.maxYear || undefined,
    categoryId: debouncedFilters.categoryId || undefined,
    page: currentPage,
    pageSize,
  });

  const books = data?.items || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.totalCount || 0;

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiSearching(true);
    try {
      const params = await aiSearch.mutateAsync(aiQuery);

      const matchedCategory = categories.find(
        (c) => c.name.toLowerCase() === params.category?.toLowerCase()
      ) || categories.find(
        (c) => c.name.toLowerCase() === params.keywords?.toLowerCase()
      );

      const genericWords = ['könyv', 'könyvek', 'regény', 'regények', 'olcsó', 'drága', 'könyveket', 'regényt', 'krimit', 'krimik', 'sci-fit', 'fantasyt', 'könyvet', 'gyerekkönyvek', 'gyerekkönyvet', 'informatikát', 'történelmet', 'gyerek', 'gyerekkönyv'];
      const isKeywordACategory = categories.some(
        (c) => c.name.toLowerCase() === params.keywords?.toLowerCase()
      );
      const isKeywordGeneric = genericWords.some(
        (w) => w === params.keywords?.toLowerCase()
      );

      setFilters(prev => ({
        ...prev,
        author: isKeywordACategory || isKeywordGeneric ? '' : params.keywords || '',
        categoryId: matchedCategory?.id || '',
      }));
    } catch (err) {
    } finally {
      setAiSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      author: '',
      minYear: '',
      maxYear: '',
      categoryId: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          Könyvek böngészése
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-4">
          <p className="text-sm font-medium text-blue-800 mb-2">AI Keresés</p>
          <form onSubmit={handleAISearch} className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Pl: Fantasy regényt keresek sárkányokról..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            <button
              type="submit"
              disabled={aiSearching}
              className="px-4 py-2 text-white rounded disabled:bg-gray-400 whitespace-nowrap"
              style={{ backgroundColor: '#8b4513' }}
            >
              {aiSearching ? 'Keresés...' : 'AI Keresés'}
            </button>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kategória
              </label>
              <select
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              >
                <option value="">Összes kategória</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {(searchQuery || filters.author || filters.minYear || filters.maxYear || filters.categoryId) && (
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

        <div className="mb-4">
          <p className="text-gray-600">
            {isLoading ? 'Betöltés...' : `${totalCount} könyv találat`}
          </p>
        </div>

        {isError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error?.message || 'Hiba történt a könyvek betöltésekor'}
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )}

        {!isLoading && books.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {books.map((book) => (
              <Link
                key={book.id}
                to={`/listings?bookId=${book.id}`}
                className="bg-white border border-gray-200 rounded p-3 flex flex-col hover:border-gray-400 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {(() => {
                  const imgUrl = book.firstListingImage
                    ? `${BASE_URL}${JSON.parse(book.firstListingImage)[0]}`
                    : book.coverImageUrl;
                  return imgUrl ? (
                    <img src={imgUrl} alt={books.book?.title} className="w-full h-40 sm:h-64 object-cover rounded mb-3" />
                  ) : (
                    <div className="w-full h-40 sm:h-64 bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📚</span>
                    </div>
                  );
                })()}
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
              </Link>
            ))}
          </div>
        )}

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
                  className={`px-3 py-2 text-sm rounded border font-medium ${currentPage === p
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

        {!isLoading && books.length === 0 && (
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
