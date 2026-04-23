import React, { useState } from 'react';
import { useBookCollection, useAddToCollection, useRemoveFromCollection } from '../hooks';
import { openLibraryAPI, imagesAPI, BASE_URL } from '../services/api';
import { toast } from 'react-toastify';

function BookCollection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({
    title: '',
    author: '',
    publisher: '',
    publicationYear: '',
    coverImageUrl: '',
  });

  const { data: collection = [], isLoading, isError } = useBookCollection();
  const addToCollection = useAddToCollection();
  const removeFromCollection = useRemoveFromCollection();

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
        results = docs.map((doc) => ({ isISBN: false, data: doc }));
      }
      if (results.length === 0) toast.info('Nem található könyv');
      setSearchResults(results);
    } catch (err) {
      toast.error('Hiba a keresés során');
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (item) => {
    const title = item.isISBN ? item.data.title : item.data.title;
    const author = item.isISBN
      ? item.data.authors?.map((a) => a.name).join(', ')
      : item.data.author_name?.join(', ');
    const cover = item.isISBN
      ? item.data.cover?.large || item.data.cover?.medium
      : item.data.cover_i
        ? `https://covers.openlibrary.org/b/id/${item.data.cover_i}-L.jpg`
        : null;
    const publisher = item.isISBN
      ? item.data.publishers?.[0]?.name
      : item.data.publisher?.[0];
    const year = item.isISBN
      ? item.data.publish_date?.slice(-4)
      : item.data.first_publish_year?.toString();
    const uniqueId = item.isISBN
      ? `isbn_${item.isbn}`
      : `ol_${item.data.key?.replace('/works/', '')}`;

    try {
      await addToCollection.mutateAsync({
        openLibraryId: uniqueId,
        title,
        author: author || null,
        coverImageUrl: cover || null,
        publisher: publisher || null,
        publicationYear: year ? parseInt(year) : null,
      });
      setSearchResults([]);
      setSearchQuery('');
    } catch {
    }
  };

  const [uploadingCover, setUploadingCover] = useState(false);

  const handleCoverUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const response = await imagesAPI.upload(fd);
      setManualData({ ...manualData, coverImageUrl: `${BASE_URL}${response.data.url}` });
      toast.success('Kép feltöltve!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba a feltöltés során');
    } finally {
      setUploadingCover(false);
    }
  };

  const handleManualAdd = async () => {
    if (!manualData.title.trim() || !manualData.author.trim()) {
      toast.error('Cím és szerző megadása kötelező');
      return;
    }

    const uniqueId = `manual_${manualData.title.toLowerCase().replace(/\s+/g, '_')}_${manualData.author.toLowerCase().replace(/\s+/g, '_')}`;

    try {
      await addToCollection.mutateAsync({
        openLibraryId: uniqueId,
        title: manualData.title,
        author: manualData.author,
        coverImageUrl: manualData.coverImageUrl || null,
        publisher: manualData.publisher || null,
        publicationYear: manualData.publicationYear ? parseInt(manualData.publicationYear) : null,
      });
      setManualData({ title: '', author: '', publisher: '', publicationYear: '', coverImageUrl: '' });
      setShowManualForm(false);
    } catch {
    }
  };

  const handleRemove = async (id) => {
    await removeFromCollection.mutateAsync(id);
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
            Hiba a gyűjtemény betöltésekor
          </div>
        </div>
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
          <h2 className="text-lg font-bold mb-4">Könyv keresése és hozzáadása</h2>
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
                      disabled={addToCollection.isPending}
                      className="px-3 py-1 text-sm text-white rounded self-center disabled:bg-gray-400"
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

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Manuális hozzáadás</h2>
            <button
              onClick={() => setShowManualForm(!showManualForm)}
              className="px-3 py-1 text-sm text-white rounded"
              style={{ backgroundColor: '#8b4513' }}
            >
              {showManualForm ? 'Bezárás' : '+ Manuális hozzáadás'}
            </button>
          </div>

          {showManualForm && (
            <div className="space-y-3">
              <p className="text-sm text-gray-500">A * jelölt mezők kitöltése kötelező.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Cím *</label>
                  <input
                    type="text"
                    value={manualData.title}
                    onChange={(e) => setManualData({ ...manualData, title: e.target.value })}
                    placeholder="A könyv címe"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Szerző *</label>
                  <input
                    type="text"
                    value={manualData.author}
                    onChange={(e) => setManualData({ ...manualData, author: e.target.value })}
                    placeholder="Szerző neve"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kiadó (opcionális)</label>
                  <input
                    type="text"
                    value={manualData.publisher}
                    onChange={(e) => setManualData({ ...manualData, publisher: e.target.value })}
                    placeholder="Kiadó neve"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Kiadás éve (opcionális)</label>
                  <input
                    type="number"
                    value={manualData.publicationYear}
                    onChange={(e) => setManualData({ ...manualData, publicationYear: e.target.value })}
                    placeholder="2020"
                    min="1000"
                    max="2100"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Borítókép (opcionális)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleCoverUpload}
                    disabled={uploadingCover}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500 disabled:bg-gray-100"
                  />
                  {uploadingCover && <p className="text-sm text-gray-500 mt-1">Feltöltés folyamatban...</p>}
                  {manualData.coverImageUrl && (
                    <img src={manualData.coverImageUrl} alt="Borítókép előnézet" className="mt-2 h-24 object-cover rounded" />
                  )}
                </div>
              </div>
              <button
                onClick={handleManualAdd}
                disabled={addToCollection.isPending}
                className="w-full py-2 text-white rounded font-semibold disabled:bg-gray-400"
                style={{ backgroundColor: '#8b4513' }}
              >
                {addToCollection.isPending ? 'Hozzáadás...' : 'Hozzáadás a gyűjteményhez'}
              </button>
            </div>
          )}
        </div>

        {collection.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg">A gyűjteményed üres</p>
            <p className="text-gray-400 text-sm mt-2">
              Keress könyveket fent és add hozzá a gyűjteményedhez!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {collection.map((item, index) => (
              <div
                key={item.id !== 0 ? item.id : `purchased-${index}`}
                className="bg-white border border-gray-200 rounded p-3 flex flex-col"
              >
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
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-600 mb-1">{item.author}</p>
                {item.publicationYear && (
                  <p className="text-xs text-gray-400 mb-2">{item.publicationYear}</p>
                )}
                {item.source === 'manual' && (
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={removeFromCollection.isPending}
                    className="mt-auto px-2 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50"
                  >
                    Eltávolítás
                  </button>
                )}
                {item.source === 'purchased' && (
                  <p className="mt-auto text-xs text-green-600">✓ Megvásárolt</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BookCollection;