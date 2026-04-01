import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCategories, useCreateListing } from '../hooks';
import { booksAPI, openLibraryAPI, imagesAPI } from '../services/api';
import { toast } from 'react-toastify';

const CreateListing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [googleSearchQuery, setGoogleSearchQuery] = useState('');
  const [googleSearching, setGoogleSearching] = useState(false);
  const [googleResults, setGoogleResults] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const { data: categories = [] } = useCategories();
  const createListing = useCreateListing();

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
    }
  }, [isAuthenticated, navigate]);

  const searchOpenLibrary = async () => {
    if (!googleSearchQuery.trim()) return;

    setGoogleSearching(true);
    try {
      let results;
      if (/^\d+$/.test(googleSearchQuery.replace(/-/g, ''))) {
        const data = await openLibraryAPI.searchByISBN(googleSearchQuery);
        results = data ? [{ isISBN: true, data, isbn: googleSearchQuery }] : [];
      } else {
        const docs = await openLibraryAPI.searchByTitle(googleSearchQuery);
        results = docs.map((doc) => ({ isISBN: false, data: doc }));
      }

      if (results.length === 0) {
        toast.info('Nem található könyv');
      }
      setGoogleResults(results);
    } catch (err) {
      toast.error('Hiba a keresés során');
    } finally {
      setGoogleSearching(false);
    }
  };

  const fillFromOpenLibrary = (item) => {
    if (item.isISBN) {
      const d = item.data;
      setBookData({
        ...bookData,
        title: d.title || '',
        author: d.authors?.map((a) => a.name).join(', ') || '',
        isbn: item.isbn || '',
        publisher: d.publishers?.[0]?.name || '',
        publicationYear: d.publish_date ? d.publish_date.slice(-4) : '',
        description: d.notes || '',
        coverImageUrl: d.cover?.large || d.cover?.medium || '',
        pageCount: d.number_of_pages || '',
      });
    } else {
      const d = item.data;
      setBookData({
        ...bookData,
        title: d.title || '',
        author: d.author_name?.join(', ') || '',
        isbn: d.isbn?.[0] || '',
        publisher: d.publisher?.[0] || '',
        publicationYear: d.first_publish_year?.toString() || '',
        coverImageUrl: d.cover_i
          ? `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`
          : '',
        pageCount: d.number_of_pages_median || '',
      });
    }
    setGoogleResults([]);
    setGoogleSearchQuery('');
    toast.success('Könyv adatai betöltve!');
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
        categoryIds: currentIds.filter((id) => id !== categoryId),
      });
    } else {
      setBookData({
        ...bookData,
        categoryIds: [...currentIds, categoryId],
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

    if (!bookData.title.trim()) newErrors.title = 'Cím kötelező';
    if (!bookData.author.trim()) newErrors.author = 'Szerző kötelező';
    if (!formData.condition) newErrors.condition = 'Állapot megadása kötelező';
    if (!formData.price || parseFloat(formData.price) < 100)
      newErrors.price = 'Az ár minimum 100 Ft lehet';
    if (parseFloat(formData.price) > 1000000)
      newErrors.price = 'Az ár maximum 1,000,000 Ft lehet';
    if (formData.quantity < 1 || formData.quantity > 100)
      newErrors.quantity = 'Mennyiség 1-100 között lehet';
    if (formData.conditionDescription && formData.conditionDescription.length > 1000)
      newErrors.conditionDescription = 'Maximum 1000 karakter';
    if (bookData.categoryIds.length === 0)
      newErrors.categoryIds = 'Legalább egy kategória kiválasztása kötelező';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);

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
      const bookId = bookResponse.data.id;

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

      await createListing.mutateAsync(submitData);
      toast.success('Hirdetés sikeresen létrehozva!');
      navigate('/my-listings');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Hiba történt a hirdetés létrehozásakor');
    } finally {
      setLoading(false);
    }
  };

  const conditionOptions = [
    { value: 'mint', label: 'Újszerű - Teljesen hibátlan, szinte sosem használt' },
    { value: 'excellent', label: 'Kiváló - Minimális használat nyoma, szinte hibátlan' },
    { value: 'good', label: 'Jó - Látható használat nyoma, de jó állapotban' },
    { value: 'fair', label: 'Elfogadható - Látható kopás, de olvasható' },
    { value: 'poor', label: 'Gyenge - Sok használat nyoma, de funkcionális' },
  ];

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 kép tölthető fel!');
      return;
    }

    setUploadingImage(true);
    try {
      const uploadedUrls = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append('file', file);
        const response = await imagesAPI.upload(fd);
        uploadedUrls.push(response.data.url);
      }
      setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] });
      toast.success('Kép(ek) sikeresen feltöltve!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba a feltöltés során');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageRemove = async (url) => {
    try {
      await imagesAPI.delete(url);
      setFormData({ ...formData, images: formData.images.filter((img) => img !== url) });
      toast.success('Kép eltávolítva!');
    } catch (err) {
      toast.error('Hiba a kép eltávolításakor');
    }
  };

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
      
      <p className="text-sm text-gray-500 mb-4">A * jelölt mezők kitöltése kötelező.</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">1. Könyv megadása</h2>

          <div className="space-y-4 border-t pt-6">
            <p className="text-sm text-gray-600 mb-4">
              Add meg a könyv alapvető adatait. Csak a cím és szerző kötelező.
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-medium text-blue-800 mb-2">
                Automatikus kitöltés Open Books alapján
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={googleSearchQuery}
                  onChange={(e) => setGoogleSearchQuery(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), searchOpenLibrary())
                  }
                  placeholder="ISBN vagy könyvcím..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                />
                <button
                  type="button"
                  onClick={searchOpenLibrary}
                  disabled={googleSearching}
                  className="px-4 py-2 text-white rounded disabled:bg-gray-400"
                  style={{ backgroundColor: '#8b4513' }}
                >
                  {googleSearching ? '⏳' : '🔍'}
                </button>
              </div>

              {googleResults.length > 0 && (
                <div className="mt-3 border rounded-lg max-h-64 overflow-y-auto bg-white">
                  {googleResults.map((item, index) => {
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
                        onClick={() => fillFromOpenLibrary(item)}
                        className="flex gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      >
                        {cover ? (
                          <img
                            src={cover}
                            alt={title}
                            className="w-10 h-14 object-cover rounded"
                          />
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Cím *</label>
                <input
                  type="text"
                  name="title"
                  value={bookData.title}
                  onChange={handleBookDataChange}
                  placeholder="A könyv címe"
                  maxLength="200"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                  required
                />
                {errors.title && <p className="text-red-600 text-sm mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Szerző *</label>
                <input
                  type="text"
                  name="author"
                  value={bookData.author}
                  onChange={handleBookDataChange}
                  placeholder="Szerző neve"
                  maxLength="200"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                  required
                />
                {errors.author && <p className="text-red-600 text-sm mt-1">{errors.author}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">ISBN (opcionális)</label>
                <input
                  type="text"
                  name="isbn"
                  value={bookData.isbn}
                  onChange={handleBookDataChange}
                  placeholder="978-963-XXX-XXX-X"
                  maxLength="20"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kiadó (opcionális)</label>
                <input
                  type="text"
                  name="publisher"
                  value={bookData.publisher}
                  onChange={handleBookDataChange}
                  placeholder="Kiadó neve"
                  maxLength="200"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kiadás éve (opcionális)</label>
                <input
                  type="number"
                  name="publicationYear"
                  value={bookData.publicationYear}
                  onChange={handleBookDataChange}
                  placeholder="2020"
                  min="1000"
                  max="2100"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Nyelv</label>
                <input
                  type="text"
                  name="language"
                  value={bookData.language}
                  onChange={handleBookDataChange}
                  placeholder="magyar"
                  maxLength="50"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Oldalszám (opcionális)</label>
                <input
                  type="number"
                  name="pageCount"
                  value={bookData.pageCount}
                  onChange={handleBookDataChange}
                  placeholder="350"
                  min="1"
                  max="10000"
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Leírás (opcionális)</label>
              <textarea
                name="description"
                value={bookData.description}
                onChange={handleBookDataChange}
                placeholder="Rövid leírás a könyvről..."
                rows="3"
                maxLength="2000"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {bookData.description.length} / 2000 karakter
              </p>
            </div>

            {categories.length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2">Kategória * (kötelező)</label>
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
                {errors.categoryIds && (
                  <p className="text-red-600 text-sm mt-1">{errors.categoryIds}</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">2. Állapot</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Állapot *</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
              required
            >
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.condition && <p className="text-red-600 text-sm mt-1">{errors.condition}</p>}
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
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formData.conditionDescription.length} / 1000 karakter</span>
              {errors.conditionDescription && (
                <span className="text-red-600">{errors.conditionDescription}</span>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">3. Ár és mennyiség</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Ár * (100 - 1,000,000 Ft)</label>
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
                <span className="px-4 py-2 bg-gray-100 border rounded-lg text-gray-700 flex items-center">
                  Ft
                </span>
              </div>
              {errors.price && <p className="text-red-600 text-sm mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mennyiség * (1-100 db)</label>
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
              {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">4. Átvételi helyszín</h2>

          <div>
            <label className="block text-sm font-medium mb-2">Helyszín (opcionális)</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Pl: Budapest, XIII. kerület vagy Debrecen"
              maxLength="200"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              A konkrét cím megadása nem kötelező. Város vagy kerület is elég.
            </p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">5. Képek (opcionális)</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Képek feltöltése (max. 5 db, max. 5MB/kép, JPG/PNG/WEBP)
            </label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              onChange={handleImageUpload}
              disabled={uploadingImage || formData.images.length >= 5}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500 disabled:bg-gray-100"
            />
            {uploadingImage && (
              <p className="text-sm text-gray-500 mt-1">Feltöltés folyamatban...</p>
            )}
          </div>

          {formData.images.length > 0 && (
            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
              {formData.images.map((url, index) => (
                <div key={index} className="relative">
                  <img
                    src={`http://localhost:5102${url}`}
                    alt={`Kép ${index + 1}`}
                    className="w-full h-24 object-cover rounded border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => handleImageRemove(url)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

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
            disabled={loading || createListing.isPending}
            className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-semibold"
          >
            {loading || createListing.isPending ? 'Létrehozás...' : 'Hirdetés létrehozása'}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-gray-300">
        <h3 className="font-bold text-lg mb-3">Tippek a sikeres hirdetéshez</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>- Légy őszinte az állapot leírásakor</li>
          <li>- Adj meg reális árat (nézz utána hasonló hirdetéseknek)</li>
          <li>- A részletes állapotleírás növeli a bizalmat</li>
          <li>- Helyszín megadásával gyorsabban találsz vevőt</li>
        </ul>
      </div>
    </div>
  );
};

export default CreateListing;
