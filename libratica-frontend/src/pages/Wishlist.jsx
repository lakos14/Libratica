import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist, useAddToWishlist } from '../hooks';
import { BASE_URL, booksAPI, openLibraryAPI } from '../services/api';
import { toast } from 'react-toastify';

function Wishlist() {
  const { data: wishlist = [], isLoading, isError } = useWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToWishlist = useAddToWishlist();

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [adding, setAdding] = useState(false);

  const handleRemove = async (bookId) => {
    await removeFromWishlist.mutateAsync(bookId);
  };

  const searchOpenLibrary = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      let results;
      if (/^\d+$/.test(searchQuery.replace(/-/g, ''))) {
        const data = await openLibraryAPI.searchByISBN(searchQuery);
        results = data ? [{ isISBN: true, data, isbn: searchQuery }] : [];
      } else {
        const docs = await openLibraryAPI.searchByTitle(searchQuery);
        results = docs.map((doc) => ({ isISBN: false, data: doc }));
      }
      if (results.length === 0) toast.info('Nem található könyv');
      setSearchResults(results);
    } catch {
      toast.error('Hiba a keresés során');
    } finally {
      setSearching(false);
    }
  };

  const handleAddFromOpenLibrary = async (item) => {
    setAdding(true);
    try {
      let bookData;
      if (item.isISBN) {
        const d = item.data;
        bookData = {
          title: d.title || '',
          author: d.authors?.map((a) => a.name).join(', ') || '',
          isbn: item.isbn || null,
          publisher: d.publishers?.[0]?.name || null,
          publicationYear: d.publish_date ? parseInt(d.publish_date.slice(-4)) : null,
          coverImageUrl: d.cover?.large || d.cover?.medium || null,
          pageCount: d.number_of_pages || null,
          categoryIds: [],
        };
      } else {
        const d = item.data;
        bookData = {
          title: d.title || '',
          author: d.author_name?.join(', ') || '',
          isbn: d.isbn?.[0] || null,
          publisher: d.publisher?.[0] || null,
          publicationYear: d.first_publish_year || null,
          coverImageUrl: d.cover_i
            ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
            : null,
          pageCount: d.number_of_pages_median || null,
          categoryIds: [],
        };
      }

      const bookResponse = await booksAPI.create(bookData);
      const bookId = bookResponse.data.id;
      await addToWishlist.mutateAsync(bookId);
      setSearchResults([]);
      setSearchQuery('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba történt');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Hiba a kívánságlista betöltésekor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#8b4513' }}>
          Kívánságlistám
        </h1>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
          <p className="text-sm font-medium text-blue-800 mb-2">Könyv keresése és hozzáadása</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchOpenLibrary()}
              placeholder="ISBN vagy könyvcím..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
            />
            <button
              onClick={searchOpenLibrary}
              disabled={searching}
              className="px-4 py-2 text-white rounded disabled:bg-gray-400"
              style={{ backgroundColor: '#8b4513' }}
            >
              {searching ? '⏳' : '🔍'}
            </button>
          </div>

          {searchResults.length > 0 && (
            <div className="mt-3 border rounded-lg max-h-64 overflow-y-auto bg-white">
              {searchResults.map((item, index) => {
                const title = item.isISBN ? item.data.title : item.data.title;
                const author = item.isISBN
                  ? item.data.authors?.map((a) => a.name).join(', ')
                  : item.data.author_name?.join(', ');
                const cover = item.isISBN
                  ? item.data.cover?.medium
                  : item.data.cover_i
                    ? `https://covers.openlibrary.org/b/id/${item.data.cover_i}-S.jpg`
                    : null;
                const year = item.isISBN
                  ? item.data.publish_date?.slice(-4)
                  : item.data.first_publish_year;

                return (
                  <div
                    key={index}
                    onClick={() => !adding && handleAddFromOpenLibrary(item)}
                    className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  >
                    {cover ? (
                      <img src={cover} alt={title} className="w-10 h-14 object-cover rounded" />
                    ) : (
                      <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center">
                        <span className="text-gray-400 text-xs">📚</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{title}</p>
                      <p className="text-xs text-gray-600">{author}</p>
                      {year && <p className="text-xs text-gray-400">{year}</p>}
                    </div>
                    <span className="text-xs text-[#8b4513] font-medium self-center">
                      + Hozzáadás
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">A kívánságlistád üres</p>
            <Link
              to="/books"
              className="inline-block px-6 py-2 rounded text-white font-medium"
              style={{ backgroundColor: '#8b4513' }}
            >
              Könyvek böngészése
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {wishlist.map((item) => (
              <Link
                key={item.id}
                to={`/listings?bookId=${item.book?.id}`}
                className="bg-white border border-gray-200 rounded p-3 flex flex-col hover:border-gray-400 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {(() => {
                  const imgUrl = item.book?.firstListingImage
                    ? `${BASE_URL}${JSON.parse(item.book.firstListingImage)[0]}`
                    : item.book?.coverImageUrl;
                  return imgUrl ? (
                    <img src={imgUrl} alt={item.book.title} className="w-full h-48 object-cover rounded mb-3" />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 rounded mb-3 flex items-center justify-center">
                      <span className="text-gray-400 text-4xl">📚</span>
                    </div>
                  );
                })()}
                <span className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                  {item.book?.title}
                </span>
                <p className="text-xs text-gray-600 mb-2">{item.book?.author}</p>
                {item.book?.minPrice !== null && item.book?.minPrice !== undefined ? (
                  <p className="text-sm font-bold mb-2" style={{ color: '#8b4513' }}>
                    {item.book.minPrice.toLocaleString('hu-HU')} Ft-tól
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mb-2">Nincs elérhető hirdetés</p>
                )}
                <div className="flex gap-2 mt-auto">
                  <span
                    className="flex-1 text-center px-2 py-1 text-xs rounded text-white"
                    style={{ backgroundColor: '#8b4513' }}
                  >
                    Hirdetések
                  </span>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      await handleRemove(item.book?.id);
                    }}
                    disabled={removeFromWishlist.isPending}
                    className="px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                  >
                    {removeFromWishlist.isPending ? '...' : 'Törlés'}
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wishlist;