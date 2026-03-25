import React, { useState, useEffect } from 'react';
import { bookCollectionAPI, openLibraryAPI } from '../services/api';
import { toast } from 'react-toastify';

function BookCollection() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      const response = await bookCollectionAPI.getCollection();
      setCollection(response.data);
    } catch (err) {
      toast.error('Hiba a gyűjtemény betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      let results;
      if (/^\d+$/.test(searchQuery.replace(/-/g, ''))) {
        const data = await openLibraryAPI.searchByISBN(searchQuery);
        results = data ? [{ isISBN: true, data, isbn: searchQuery }] : [];
      } else {
        const docs = await openLibraryAPI.searchByTitle(searchQuery);
        results = docs.map(doc => ({ isISBN: false, data: doc }));
      }

      if (results.length === 0) {
        toast.info('Nem található könyv');
      }
      setSearchResults(results);
    } catch (err) {
      toast.error('Hiba a keresés során');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (item) => {
    try {
      const title = item.isISBN ? item.data.title : item.data.title;
      const author = item.isISBN
        ? item.data.authors?.map(a => a.name).join(', ')
        : item.data.author_name?.join(', ');
      const cover = item.isISBN
        ? item.data.cover?.large || item.data.cover?.medium
        : item.data.cover_i ? `https://covers.openlibrary.org/b/id/${item.data.cover_i}-L.jpg` : null;
      const publisher = item.isISBN
        ? item.data.publishers?.[0]?.name
        : item.data.publisher?.[0];
      const year = item.isISBN
        ? item.data.publish_date?.slice(-4)
        : item.data.first_publish_year?.toString();
      const googleBooksId = item.isISBN
        ? `isbn_${item.isbn}`
        : `ol_${item.data.key?.replace('/works/', '')}`;

      await bookCollectionAPI.addToCollection({
        googleBooksId,
        title,
        author: author || null,
        coverImageUrl: cover || null,
        publisher: publisher || null,
        publicationYear: year ? parseInt(year) : null,
      });
      toast.success('Könyv hozzáadva a gyűjteményhez!');
      setSearchResults([]);
      setSearchQuery('');
      loadCollection();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba történt');
    }
  };

  const handleRemove = async (id) => {
    try {
      await bookCollectionAPI.removeFromCollection(id);
      toast.success('Könyv eltávolítva a gyűjteményből!');
      loadCollection();
    } catch (err) {
      toast.error('Hiba az eltávolításkor');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          Könyvgyűjteményem
        </h1>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Könyv hozzáadása</h2>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
              placeholder="Keress könyvet cím vagy ISBN alapján..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={searchBooks}
              disabled={searching}
              className="px-4 py-2 text-white rounded disabled:bg-gray-400"
              style={{ backgroundColor: '#8b4513' }}
            >
              {searching ? '⏳' : 'Keresés'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="border rounded-lg max-h-72 overflow-y-auto">
              {searchResults.map((item, index) => {
                const title = item.isISBN ? item.data.title : item.data.title;
                const author = item.isISBN
                  ? item.data.authors?.map(a => a.name).join(', ')
                  : item.data.author_name?.join(', ');
                const cover = item.isISBN
                  ? item.data.cover?.medium
                  : item.data.cover_i ? `https://covers.openlibrary.org/b/id/${item.data.cover_i}-S.jpg` : null;
                const year = item.isISBN
                  ? item.data.publish_date?.slice(-4)
                  : item.data.first_publish_year;

                return (
                  <div key={index} className="flex gap-3 p-3 border-b last:border-b-0 hover:bg-gray-50">
                    {cover ? (
                      <img src={cover} alt={title} className="w-10 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-xs text-gray-400">📚</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs text-gray-600">{author}</p>
                      {year && <p className="text-xs text-gray-400">{year}</p>}
                    </div>
                    <button
                      onClick={() => handleAdd(item)}
                      className="px-3 py-1 text-sm text-white rounded self-center"
                      style={{ backgroundColor: '#8b4513' }}
                    >
                      + Hozzáadás
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {collection.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg">A gyűjteményed üres</p>
            <p className="text-gray-400 text-sm mt-2">Keress könyveket fent és add hozzá a gyűjteményedhez!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {collection.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded p-3 flex flex-col">
                {item.coverImageUrl ? (
                  <img
                    src={item.coverImageUrl}
                    alt={item.title}
                    className="w-full h-48 object-cover rounded mb-3"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center">
                    <span className="text-gray-400 text-4xl">📚</span>
                  </div>
                )}
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                  {item.title}
                </h3>
                <p className="text-xs text-gray-600 mb-1">{item.author}</p>
                {item.publicationYear && (
                  <p className="text-xs text-gray-400 mb-2">{item.publicationYear}</p>
                )}
                <button
                  onClick={() => handleRemove(item.id)}
                  className="mt-auto px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Eltávolítás
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCollection;