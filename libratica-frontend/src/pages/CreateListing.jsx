import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsAPI, booksAPI, searchAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateListing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [categories, setCategories] = useState([]);

  // Választható mód: meglévő könyv VAGY új könyv
  const [mode, setMode] = useState('new'); // 'new' vagy 'existing'
  const [selectedBook, setSelectedBook] = useState(null);

  // Könyv adatok (új könyv esetén)
  const [bookData, setBookData] = useState({
    title: '',
    author: '',
    isbn: '',
    publisher: '',
    publicationYear: '',
    language: 'magyar',
    description: '',
    coverImageUrl: '',
    pageCount: '',
    categoryIds: [],
  });

  const [formData, setFormData] = useState({
    condition: 'good',
    conditionDescription: '',
    price: '',
    currency: 'HUF',
    quantity: 1,
    location: '',
    images: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadCategories();
  }, [isAuthenticated, navigate]);

  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:5102/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const searchBooks = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearching(true);
      const response = await searchAPI.searchBooks({ query: searchQuery });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Failed to search books:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectExistingBook = (book) => {
    setSelectedBook(book);
    setMode('existing');
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleBookDataChange = (e) => {
    const { name, value } = e.target;
    setBookData({ ...bookData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleCategoryToggle = (categoryId) => {
    const currentIds = bookData.categoryIds;
    if (currentIds.includes(categoryId)) {
      setBookData({
        ...bookData,
        categoryIds: currentIds.filter(id => id !== categoryId)
      });
    } else {
      setBookData({
        ...bookData,
        categoryIds: [...currentIds, categoryId]
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Könyv validáció
    if (mode === 'new') {
      if (!bookData.title.trim()) {
        newErrors.title = 'Cím kötelező';
      }
      if (!bookData.author.trim()) {
        newErrors.author = 'Szerző kötelező';
      }
    } else {
      if (!selectedBook) {
        newErrors.book = 'Válassz ki egy könyvet';
      }
    }

    // Hirdetés validáció
    if (!formData.condition) {
      newErrors.condition = 'Állapot megadása kötelező';
    }

    if (!formData.price || parseFloat(formData.price) < 100) {
      newErrors.price = 'Az ár minimum 100 Ft lehet';
    }

    if (parseFloat(formData.price) > 1000000) {
      newErrors.price = 'Az ár maximum 1,000,000 Ft lehet';
    }

    if (formData.quantity < 1 || formData.quantity > 100) {
      newErrors.quantity = 'Mennyiség 1-100 között lehet';
    }

    if (formData.conditionDescription && formData.conditionDescription.length > 1000) {
      newErrors.conditionDescription = 'Maximum 1000 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      let bookId;

      // Ha új könyvet adunk meg, először létrehozzuk
      if (mode === 'new') {
        const bookSubmitData = {
          title: bookData.title,
          author: bookData.author,
          isbn: bookData.isbn || null,
          publisher: bookData.publisher || null,
          publicationYear: bookData.publicationYear ? parseInt(bookData.publicationYear) : null,
          language: bookData.language || null,
          description: bookData.description || null,
          coverImageUrl: bookData.coverImageUrl || null,
          pageCount: bookData.pageCount ? parseInt(bookData.pageCount) : null,
          categoryIds: bookData.categoryIds,
        };

        const bookResponse = await booksAPI.create(bookSubmitData);
        bookId = bookResponse.data.id;
      } else {
        // Meglévő könyv ID-ja
        bookId = selectedBook.id;
      }

      // Hirdetés létrehozása
      const submitData = {
        bookId: bookId,
        condition: formData.condition,
        conditionDescription: formData.conditionDescription || null,
        price: parseFloat(formData.price),
        currency: formData.currency,
        quantity: parseInt(formData.quantity),
        location: formData.location || null,
        images: formData.images.length > 0 ? formData.images : null,
      };

      await listingsAPI.create(submitData);
      alert('✅ Hirdetés sikeresen létrehozva!');
      navigate('/my-listings');
    } catch (error) {
      console.error('Failed to create listing:', error);
      alert(error.response?.data?.message || 'Hiba történt a hirdetés létrehozásakor');
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { value: 'mint', label: '⭐ Újszerű - Teljesen hibátlan, szinte sosem használt' },
    { value: 'excellent', label: '✨ Kiváló - Minimális használat nyoma, szinte hibátlan' },
    { value: 'good', label: '👍 Jó - Látható használat nyoma, de jó állapotban' },
    { value: 'fair', label: '👌 Elfogadható - Látható kopás, de olvasható' },
    { value: 'poor', label: '📖 Gyenge - Sok használat nyoma, de funkcionális' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('/my-listings')}
          className="text-[#8b4513] hover:text-[#654321] mb-4"
        >
          ← Vissza a hirdetéseimhez
        </button>
        <h1 className="text-4xl font-bold">Új hirdetés létrehozása</h1>
        <p className="text-gray-600 mt-2">Adj el egy könyvet a platformon</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Mód választás */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">1. Könyv megadása</h2>
          
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                mode === 'new'
                  ? 'bg-[#8b4513] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              ✍️ Új könyv megadása
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`flex-1 py-3 px-6 rounded-lg font-semibold transition ${
                mode === 'existing'
                  ? 'bg-[#8b4513] text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🔍 Meglévő könyv keresése
            </button>
          </div>

          {/* ÚJ KÖNYV MÓD */}
          {mode === 'new' && (
            <div className="space-y-4 border-t pt-6">
              <p className="text-sm text-gray-600 mb-4">
                Add meg a könyv alapvető adatait. Csak a cím és szerző kötelező.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Cím *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={bookData.title}
                    onChange={handleBookDataChange}
                    placeholder="A könyv címe"
                    maxLength="200"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                    required
                  />
                  {errors.title && (
                    <p className="text-red-600 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Szerző *
                  </label>
                  <input
                    type="text"
                    name="author"
                    value={bookData.author}
                    onChange={handleBookDataChange}
                    placeholder="Szerző neve"
                    maxLength="200"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                    required
                  />
                  {errors.author && (
                    <p className="text-red-600 text-sm mt-1">{errors.author}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    ISBN (opcionális)
                  </label>
                  <input
                    type="text"
                    name="isbn"
                    value={bookData.isbn}
                    onChange={handleBookDataChange}
                    placeholder="978-963-XXX-XXX-X"
                    maxLength="20"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kiadó (opcionális)
                  </label>
                  <input
                    type="text"
                    name="publisher"
                    value={bookData.publisher}
                    onChange={handleBookDataChange}
                    placeholder="Kiadó neve"
                    maxLength="200"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kiadás éve (opcionális)
                  </label>
                  <input
                    type="number"
                    name="publicationYear"
                    value={bookData.publicationYear}
                    onChange={handleBookDataChange}
                    placeholder="2020"
                    min="1000"
                    max="2100"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Nyelv
                  </label>
                  <input
                    type="text"
                    name="language"
                    value={bookData.language}
                    onChange={handleBookDataChange}
                    placeholder="magyar"
                    maxLength="50"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Oldalszám (opcionális)
                  </label>
                  <input
                    type="number"
                    name="pageCount"
                    value={bookData.pageCount}
                    onChange={handleBookDataChange}
                    placeholder="350"
                    min="1"
                    max="10000"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Borítókép URL (opcionális)
                  </label>
                  <input
                    type="url"
                    name="coverImageUrl"
                    value={bookData.coverImageUrl}
                    onChange={handleBookDataChange}
                    placeholder="https://..."
                    maxLength="500"
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Leírás (opcionális)
                </label>
                <textarea
                  name="description"
                  value={bookData.description}
                  onChange={handleBookDataChange}
                  placeholder="Rövid leírás a könyvről..."
                  rows="3"
                  maxLength="2000"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {bookData.description.length} / 2000 karakter
                </p>
              </div>

              {/* Kategóriák */}
              {categories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Kategóriák (opcionális)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => handleCategoryToggle(category.id)}
                        className={`px-3 py-1 rounded-full text-sm transition ${
                          bookData.categoryIds.includes(category.id)
                            ? 'bg-[#8b4513] text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MEGLÉVŐ KÖNYV MÓD */}
          {mode === 'existing' && (
            <div className="border-t pt-6">
              {!selectedBook ? (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Keress rá a könyvre
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), searchBooks())}
                      placeholder="Cím, szerző vagy ISBN..."
                      className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                    />
                    <button
                      type="button"
                      onClick={searchBooks}
                      disabled={searching}
                      className="bg-[#8b4513] text-white px-6 py-2 rounded-lg hover:bg-[#654321] disabled:bg-gray-400"
                    >
                      {searching ? '⏳' : '🔍'}
                    </button>
                  </div>

                  {errors.book && (
                    <p className="text-red-600 text-sm mt-1">{errors.book}</p>
                  )}

                  {/* Keresési eredmények */}
                  {searchResults.length > 0 && (
                    <div className="mt-4 border rounded-lg max-h-96 overflow-y-auto">
                      {searchResults.map((book) => (
                        <div
                          key={book.id}
                          onClick={() => selectExistingBook(book)}
                          className="flex gap-4 p-4 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                        >
                          <img
                            src={book.coverImageUrl || 'https://via.placeholder.com/60x90?text=📖'}
                            alt={book.title}
                            className="w-12 h-18 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-bold">{book.title}</h3>
                            <p className="text-sm text-gray-600">{book.author}</p>
                            {book.isbn && (
                              <p className="text-xs text-gray-500">ISBN: {book.isbn}</p>
                            )}
                          </div>
                          <button
                            type="button"
                            className="text-[#8b4513] hover:text-[#654321]"
                          >
                            Kiválaszt →
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {searchQuery && searchResults.length === 0 && !searching && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm mb-2">
                        Nem található könyv ezzel a keresőszóval.
                      </p>
                      <button
                        type="button"
                        onClick={() => setMode('new')}
                        className="text-[#8b4513] font-semibold hover:underline"
                      >
                        → Inkább add meg magad a könyv adatait
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-green-50">
                  <div className="flex gap-4">
                    <img
                      src={selectedBook.coverImageUrl || 'https://via.placeholder.com/80x120?text=📖'}
                      alt={selectedBook.title}
                      className="w-20 h-30 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold">{selectedBook.title}</h3>
                      <p className="text-gray-600">{selectedBook.author}</p>
                      {selectedBook.publisher && (
                        <p className="text-sm text-gray-500">📚 {selectedBook.publisher}</p>
                      )}
                      {selectedBook.publicationYear && (
                        <p className="text-sm text-gray-500">📅 {selectedBook.publicationYear}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBook(null)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ✗ Másik könyv
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Állapot */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">2. Állapot</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Állapot *
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
              required
            >
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.condition && (
              <p className="text-red-600 text-sm mt-1">{errors.condition}</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Részletes állapotleírás (opcionális)
            </label>
            <textarea
              name="conditionDescription"
              value={formData.conditionDescription}
              onChange={handleChange}
              placeholder="Pl: Minimális kopás a gerincen, egyébként hibátlan. Aláhúzások nincsenek."
              rows="3"
              maxLength="1000"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formData.conditionDescription.length} / 1000 karakter</span>
              {errors.conditionDescription && (
                <span className="text-red-600">{errors.conditionDescription}</span>
              )}
            </div>
          </div>
        </div>

{/* Ár és mennyiség */}
<div className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold mb-4">3. Ár és mennyiség</h2>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Ár input */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Ár * (100 - 1,000,000 Ft)
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          name="price"
          value={formData.price}
          onChange={handleChange}
          min="100"
          max="1000000"
          step="100"
          placeholder="2500"
          className="w-2/3 px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
          required
        />
        <select
          name="currency"
          value={formData.currency}
          onChange={handleChange}
          className="w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
        >
          <option value="HUF">HUF</option>
          <option value="EUR">EUR</option>
          <option value="USD">USD</option>
        </select>
      </div>
      {errors.price && (
        <p className="text-red-600 text-sm mt-1">{errors.price}</p>
      )}
    </div>

    {/* Mennyiség input */}
    <div>
      <label className="block text-sm font-medium mb-2">
        Mennyiség * (1-100 db)
      </label>
      <input
        type="number"
        name="quantity"
        value={formData.quantity}
        onChange={handleChange}
        min="1"
        max="100"
        placeholder="1"
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
        required
      />
      {errors.quantity && (
        <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
      )}
    </div>
  </div>
</div>

        {/* Helyszín */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">4. Átvételi helyszín</h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Helyszín (opcionális)
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Pl: Budapest, XIII. kerület vagy Debrecen"
              maxLength="200"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              A konkrét cím megadása nem kötelező. Város vagy kerület is elég.
            </p>
          </div>
        </div>

        {/* Submit gombok */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg hover:bg-gray-300 font-semibold"
          >
            Mégse
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
          >
            {loading ? 'Létrehozás...' : '✓ Hirdetés létrehozása'}
          </button>
        </div>
      </form>

      {/* Tippek */}
      <div className="mt-8 bg-gray-50 p-6 rounded-lg border border-gray-300">
        <h3 className="font-bold text-lg mb-3">💡 Tippek a sikeres hirdetéshez</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>✓ Légy őszinte az állapot leírásakor</li>
          <li>✓ Adj meg reális árat (nézz utána hasonló hirdetéseknek)</li>
          <li>✓ A részletes állapotleírás növeli a bizalmat</li>
          <li>✓ Helyszín megadásával gyorsabban találsz vevőt</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateListing;