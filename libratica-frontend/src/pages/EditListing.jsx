import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { listingsAPI, imagesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    condition: 'good',
    conditionDescription: '',
    price: '',
    quantity: 1,
    isAvailable: true,
    location: '',
    images: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadListing();
  }, [id, isAuthenticated, navigate]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const response = await listingsAPI.getById(id);
      const listingData = response.data;

      if (listingData.seller.id !== user?.id && user?.roleName !== 'admin') {
        toast.error('Nincs jogosultságod szerkeszteni ezt a hirdetést!');
        navigate('/my-listings');
        return;
      }

      setListing(listingData);

      setFormData({
        condition: listingData.condition,
        conditionDescription: listingData.conditionDescription || '',
        price: listingData.price.toString(),
        quantity: listingData.quantity,
        isAvailable: listingData.isAvailable,
        location: listingData.location || '',
        images: listingData.images || [],
      });
    } catch (error) {
      console.error('Failed to load listing:', error);
      toast.error('Hirdetés nem található');
      navigate('/my-listings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.condition) {
      newErrors.condition = 'Állapot megadása kötelező';
    }

    if (!formData.price || parseFloat(formData.price) < 100) {
      newErrors.price = 'Az ár minimum 100 Ft lehet';
    }

    if (parseFloat(formData.price) > 1000000) {
      newErrors.price = 'Az ár maximum 1,000,000 Ft lehet';
    }

    if (formData.quantity < 0 || formData.quantity > 100) {
      newErrors.quantity = 'Mennyiség 0-100 között lehet';
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
      setSaving(true);

      const submitData = {
        condition: formData.condition,
        conditionDescription: formData.conditionDescription || null,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        isAvailable: formData.isAvailable,
        location: formData.location || null,
        images: formData.images.length > 0 ? formData.images : null,
      };

      await listingsAPI.update(id, submitData);
      toast.success('Hirdetés sikeresen frissítve!');
      navigate('/my-listings');
    } catch (error) {
      console.error('Failed to update listing:', error);
      toast.error(error.response?.data?.message || 'Hiba történt a hirdetés frissítésekor');
    } finally {
      setSaving(false);
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
      setFormData({ ...formData, images: formData.images.filter(img => img !== url) });
      toast.success('Kép eltávolítva!');
    } catch (err) {
      toast.error('Hiba a kép eltávolításakor');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Betöltés...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Hirdetés nem található</h2>
        <button
          onClick={() => navigate('/my-listings')}
          className="bg-[#8b4513] text-white px-6 py-3 rounded-lg hover:bg-[#654321]"
        >
          Vissza a hirdetéseimhez
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <button
          onClick={() => navigate('/my-listings')}
          className="text-[#8b4513] hover:text-[#654321] mb-4"
        >
          ← Vissza a hirdetéseimhez
        </button>
        <h1 className="text-4xl font-bold">Hirdetés szerkesztése</h1>
        <p className="text-gray-600 mt-2">Módosítsd a hirdetés adatait</p>
      </div>

      <div className="bg-[#f5ebe0] border border-gray-200 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4 text-[#8b4513]">
          Könyv (nem szerkeszthető)
        </h2>
        <div className="flex gap-4">
          <img
            src={listing.book.coverImageUrl || 'https://placehold.co/80x120/e5e5e5/666?text=📖'}
            alt={listing.book.title}
            className="w-20 h-30 object-cover rounded"
          />
          <div className="flex-1">
            <h3 className="text-xl font-bold">{listing.book.title}</h3>
            <p className="text-gray-600">{listing.book.author}</p>
            {listing.book.publisher && (
              <p className="text-sm text-gray-500">📚 {listing.book.publisher}</p>
            )}
            {listing.book.publicationYear && (
              <p className="text-sm text-gray-500">📅 {listing.book.publicationYear}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          A könyv adatait nem lehet módosítani. Ha hibás, töröld a hirdetést és hozz létre újat.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold">Elérhetőség</h3>
              <p className="text-sm text-gray-600">
                Ha kikapcsolod, a hirdetés nem jelenik meg a böngészőkben
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-gray-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
              <span className="ml-3 text-sm font-medium text-gray-900">
                {formData.isAvailable ? 'Elérhető' : 'Inaktív'}
              </span>
            </label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">1. Állapot</h2>

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
              placeholder="Pl: Minimális kopás a gerincen, egyébként hibátlan."
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

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">2. Ár és mennyiség</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-2/3 px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
                  required
                />
                <span className="px-4 py-2 bg-gray-100 border rounded-lg text-gray-700 flex items-center">
                  Ft
                </span>
              </div>
              {errors.price && (
                <p className="text-red-600 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Mennyiség * (0-100 db)
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:outline-none focus:border-gray-500"
                required
              />
              {errors.quantity && (
                <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>
              )}
              {formData.quantity === 0 && (
                <p className="text-yellow-600 text-xs mt-1">
                  Ha 0 darab, érdemes inaktiválni a hirdetést
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">3. Átvételi helyszín</h2>

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
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">4. Képek</h2>

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
              <p className="text-sm text-gray-500 mt-1">⏳ Feltöltés folyamatban...</p>
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
            disabled={saving}
            className="flex-1 text-white py-3 rounded-lg disabled:bg-gray-400 font-semibold"
            style={{ backgroundColor: saving ? undefined : '#8b4513' }}
            onMouseEnter={(e) => !saving && (e.target.style.backgroundColor = '#654321')}
            onMouseLeave={(e) => !saving && (e.target.style.backgroundColor = '#8b4513')}
          >
            {saving ? 'Mentés...' : 'Módosítások mentése'}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h3 className="font-bold text-lg mb-3">Fontos tudnivalók</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>- A könyv adatait nem lehet módosítani (cím, szerző, stb.)</li>
          <li>- A hirdetés létrehozás időpontja nem változik</li>
          <li>- A megtekintések száma megmarad</li>
          <li>- Ha valaki már kosárba tette, az továbbra is benne lesz</li>
        </ul>
      </div>
    </div>
  );
};

export default EditListing;