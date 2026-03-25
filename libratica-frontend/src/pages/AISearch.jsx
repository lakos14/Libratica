import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiAPI, searchAPI } from '../services/api';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';

function AISearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [listings, setListings] = useState([]);
  const [aiParams, setAiParams] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error('Írj be egy keresési feltételt!');
      return;
    }

    setLoading(true);
    setResults(null);
    setListings([]);

    try {
      // 1. AI elemzi a keresést
      const aiResponse = await aiAPI.search(query);
      const params = aiResponse.data;
      setAiParams(params);

      // 2. Hirdetések lekérése az AI által visszaadott paraméterekkel
      // Ha az AI nem ismert fel semmit, használjuk az eredeti query-t

      const listingsResponse = await searchAPI.searchListings({
        query: params.keywords || query,
        minPrice: params.minPrice || undefined,
        maxPrice: params.maxPrice || undefined,
        condition: params.condition || undefined,
        isAvailable: true,
      });

      if (listingsResponse.data.items.length === 0 && params.keywords) {
        const fallbackResponse = await searchAPI.searchListings({
          query: query,
          minPrice: params.minPrice || undefined,
          maxPrice: params.maxPrice || undefined,
          condition: params.condition || undefined,
          isAvailable: true,
        });
        setListings(fallbackResponse.data.items);
      } else {
        setListings(listingsResponse.data.items);
      }

      setResults(true); 
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba a keresés során');
    } finally {
      setLoading(false);
    }
  };

  const getConditionLabel = (condition) => {
    const labels = {
      mint: '⭐ Újszerű',
      excellent: '✨ Kiváló',
      good: '👍 Jó',
      fair: '👌 Elfogadható',
      poor: '📦 Gyenge',
    };
    return labels[condition] || condition;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#8b4513' }}>
          AI Könyvkereső
        </h1>
        <p className="text-gray-600 mb-8">
          Írd le természetes nyelven milyen könyvet keresel, és az AI megtalálja neked!
        </p>

        {/* Keresőmező */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mit keresel?
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Pl: Ismeretterjesztő könyvet keresek az űrkutatásról, könnyen érthető formában. Lehetőleg jó állapotban és nem túl drágán."
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500 mb-4"
            />

            {/* Példák */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Példák:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  'Fantasy regényt keresek sárkányokról',
                  'Olcsó programozás könyv kezdőknek',
                  'Krimi thriller jó állapotban',
                  'Gyerekkönyv 6-10 éveseknek',
                ].map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setQuery(example)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded text-white font-semibold disabled:bg-gray-400"
              style={{ backgroundColor: loading ? undefined : '#8b4513' }}
            >
              {loading ? '🤖 AI elemzi a keresést...' : '🔍 Keresés AI-val'}
            </button>
          </div>
        </form>

        {/* AI által felismert paraméterek */}
        {aiParams && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm font-medium text-blue-800 mb-2">
              🤖 Az AI ezt ismerte fel a keresésedből:
            </p>
            <div className="flex flex-wrap gap-2">
              {aiParams.keywords && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  🔍 Kulcsszavak: {aiParams.keywords}
                </span>
              )}
              {aiParams.category && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  📚 Kategória: {aiParams.category}
                </span>
              )}
              {aiParams.minPrice && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  💰 Min. ár: {aiParams.minPrice} Ft
                </span>
              )}
              {aiParams.maxPrice && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  💰 Max. ár: {aiParams.maxPrice} Ft
                </span>
              )}
              {aiParams.condition && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  📦 Állapot: {getConditionLabel(aiParams.condition)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Találatok */}
        {results && (
          <div>
            <h2 className="text-xl font-bold mb-4" style={{ color: '#8b4513' }}>
              Találatok ({listings.length})
            </h2>

            {listings.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded p-8 text-center">
                <p className="text-gray-500 text-lg mb-2">Nincs találat</p>
                <p className="text-gray-400 text-sm">
                  Próbálj meg más leírást használni
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((listing) => (
                  <Link
                    key={listing.id}
                    to={`/listings/${listing.id}`}
                    className="bg-white border border-gray-200 rounded p-3 hover:border-gray-400 transition-colors flex flex-col"
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
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                      {listing.book?.title}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {listing.book?.author}
                    </p>
                    <div className="mt-auto">
                      <p className="font-bold text-sm" style={{ color: '#8b4513' }}>
                        {listing.price?.toLocaleString('hu-HU')} Ft
                      </p>
                      <p className="text-xs text-gray-500">
                        {getConditionLabel(listing.condition)}
                      </p>
                      <p className="text-xs text-gray-500">
                        👤 {listing.seller?.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AISearch;