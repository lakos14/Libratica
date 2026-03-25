import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { cartAPI, reportsAPI } from '../services/api';
import { toast } from 'react-toastify';
import { wishlistAPI } from '../services/api';

function ListingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportLoading, setReportLoading] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    loadListing();
  }, [id]);

  const loadListing = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/listings/${id}`);
      setListing(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a hirdetés betöltésekor');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (listing && user) {
      checkWishlist();
    }
  }, [listing, user]);

  const checkWishlist = async () => {
    try {
      const response = await wishlistAPI.checkWishlist(listing.book?.id);
      setIsInWishlist(response.data.isInWishlist);
    } catch { }
  };

  const handleWishlist = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isInWishlist) {
        await wishlistAPI.removeFromWishlist(listing.book?.id);
        toast.success('Eltávolítva a kívánságlistából!');
        setIsInWishlist(false);
      } else {
        await wishlistAPI.addToWishlist(listing.book?.id);
        toast.success('Hozzáadva a kívánságlistához!');
        setIsInWishlist(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba történt');
    }
  };
  const handleAddToCart = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setAddingToCart(true);
    try {
      await cartAPI.addToCart({
        listingId: listing.id,
        quantity: quantity,
      });
      toast.success('Sikeresen hozzáadva a kosárhoz!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba a kosárba helyezéskor');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleReport = async () => {
    if (!reportReason.trim()) {
      toast.error('Az ok megadása kötelező!');
      return;
    }
    setReportLoading(true);
    try {
      await reportsAPI.createReport({
        listingId: listing.id,
        reason: reportReason,
      });
      toast.success('Jelentés elküldve, köszönjük!');
      setReportModal(false);
      setReportReason('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba a jelentés elküldésekor');
    } finally {
      setReportLoading(false);
    }
  };

  const getConditionLabel = (condition) => {
    const labels = {
      mint: 'Újszerű',
      excellent: 'Kiváló',
      good: 'Jó',
      fair: 'Elfogadható',
      poor: 'Gyenge',
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <p className="text-gray-600">Hirdetés nem található</p>
        </div>
      </div>
    );
  }

  const isOwnListing = user && listing.seller?.id === user.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-gray-600 hover:text-gray-800"
        >
          ← Vissza
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-200 rounded p-6 flex items-start justify-center">
            {listing.images?.length > 0 ? (
              <div className="w-full flex flex-col items-center justify-between h-full">
                <img
                  src={`http://localhost:5102${listing.images[selectedImage]}`}
                  alt={listing.book?.title}
                  className="max-w-full max-h-96 object-contain rounded"
                />
                {listing.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto mt-4">
                    {listing.images.map((img, index) => (
                      <img
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        src={`http://localhost:5102${img}`}
                        alt={`Kép ${index + 1}`}
                        className={`w-16 h-20 object-cover rounded cursor-pointer border-2 ${selectedImage === index
                            ? 'border-[#8b4513]'
                            : 'border-gray-200 hover:border-gray-400'
                          }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : listing.book?.coverImageUrl ? (
              <img
                src={listing.book.coverImageUrl}
                alt={listing.book?.title}
                className="max-w-full max-h-96 object-contain rounded"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded flex items-center justify-center">
                <span className="text-gray-400 text-6xl">📚</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded p-6">
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#8b4513' }}>
              {listing.book?.title}
            </h1>

            <p className="text-xl text-gray-600 mb-4">
              {listing.book?.author}
            </p>

            <div className="mb-6">
              <span className="text-4xl font-bold" style={{ color: '#8b4513' }}>
                {listing.price?.toLocaleString('hu-HU')} Ft
              </span>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-600">Állapot:</span>
              <span className="ml-2 text-lg font-medium">
                {getConditionLabel(listing.condition)}
              </span>
            </div>

            <div className="mb-4">
              <span className="text-sm text-gray-600">Elérhető mennyiség:</span>
              <span className="ml-2 text-lg font-medium">
                {listing.quantity} db
              </span>
            </div>

            {listing.location && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Helyszín:</span>
                <span className="ml-2 text-lg font-medium">
                  {listing.location}
                </span>
              </div>
            )}

            {listing.description && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                  Leírás
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>
            )}

            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                Eladó
              </h3>
              <p className="text-gray-700">
                <Link
                  to={`/users/${listing.seller?.username}`}
                  className="font-medium hover:underline"
                  style={{ color: '#8b4513' }}
                >
                  {listing.seller?.username}
                </Link>
                <span className="ml-2 text-sm text-gray-500">
                  {listing.seller?.rating
                    ? `⭐ ${listing.seller.rating.toFixed(1)}`
                    : '⭐ Még nincs értékelés'}
                </span>
              </p>
              <a
                href={`https://mail.google.com/mail/?view=cm&to=${listing.seller?.email}&su=Érdeklődés a hirdetésről: ${encodeURIComponent(listing.book?.title)}&body=Szia ${listing.seller?.username},%0A%0AÉrdeklődnék a következő hirdetésed iránt:%0A${encodeURIComponent(listing.book?.title)} - ${listing.price?.toLocaleString('hu-HU')} Ft%0A%0A`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-sm text-gray-600 hover:text-[#8b4513] border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
              >
                Kapcsolatfelvétel az eladóval
              </a>
            </div>

            {!isOwnListing && listing.isAvailable && user && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mennyiség
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={listing.quantity}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-24 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                  />
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="w-full px-6 py-3 rounded text-white font-semibold disabled:opacity-50"
                  style={{ backgroundColor: '#8b4513' }}
                >
                  {addingToCart ? 'Hozzáadás...' : 'Kosárba rakom'}
                </button>
                {user && (
                  <button
                    onClick={handleWishlist}
                    className="w-full px-6 py-3 rounded font-semibold border mt-2"
                    style={{
                      borderColor: '#8b4513',
                      color: isInWishlist ? 'white' : '#8b4513',
                      backgroundColor: isInWishlist ? '#8b4513' : 'white'
                    }}
                  >
                    {isInWishlist ? '❤️ Kívánságlistán van' : '🤍 Kívánságlistához adás'}
                  </button>
                )}
              </div>

            )}

            {isOwnListing && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="text-blue-800 text-sm">
                  Ez a te hirdetésed. Nem vásárolhatod meg a saját termékedet.
                </p>
              </div>
            )}

            {!user && (
              <div className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Jelentkezz be a vásárláshoz!
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="w-full px-6 py-3 rounded text-white font-semibold"
                  style={{ backgroundColor: '#8b4513' }}
                >
                  Bejelentkezés
                </button>
              </div>
            )}

            {!listing.isAvailable && (
              <div className="bg-gray-100 border border-gray-300 rounded p-4">
                <p className="text-gray-700 text-sm">
                  Ez a hirdetés jelenleg nem elérhető.
                </p>
              </div>
            )}
            {user && !isOwnListing && user.roleName !== 'admin' && (
              <div className="mt-4">
                <button
                  onClick={() => setReportModal(true)}
                  className="text-sm text-red-500 hover:text-red-700"
                >
                  Hirdetés jelentése
                </button>
              </div>
            )}

            {reportModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">Hirdetés jelentése</h3>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Válassz okot
                    </label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                    >
                      <option value="">Válassz...</option>
                      <option value="Hamis hirdetés">Hamis hirdetés</option>
                      <option value="Nem megfelelő tartalom">Nem megfelelő tartalom</option>
                      <option value="Spam">Spam</option>
                      <option value="Félrevezető ár">Félrevezető ár</option>
                      <option value="Egyéb">Egyéb</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setReportModal(false);
                        setReportReason('');
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Mégse
                    </button>
                    <button
                      onClick={handleReport}
                      disabled={reportLoading}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 font-semibold"
                    >
                      {reportLoading ? 'Küldés...' : 'Jelentés elküldése'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {listing.book && (
          <div className="mt-8 bg-white border border-gray-200 rounded p-6">
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#8b4513' }}>
              A könyvről
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {listing.book.isbn && (
                <div>
                  <span className="text-sm text-gray-600">ISBN:</span>
                  <span className="ml-2 font-medium">{listing.book.isbn}</span>
                </div>
              )}
              {listing.book.publicationYear && (
                <div>
                  <span className="text-sm text-gray-600">Kiadás éve:</span>
                  <span className="ml-2 font-medium">{listing.book.publicationYear}</span>
                </div>
              )}
              {listing.book.publisher && (
                <div>
                  <span className="text-sm text-gray-600">Kiadó:</span>
                  <span className="ml-2 font-medium">{listing.book.publisher}</span>
                </div>
              )}
              {listing.book.language && (
                <div>
                  <span className="text-sm text-gray-600">Nyelv:</span>
                  <span className="ml-2 font-medium">{listing.book.language}</span>
                </div>
              )}
              {listing.book.pageCount && (
                <div>
                  <span className="text-sm text-gray-600">Oldalszám:</span>
                  <span className="ml-2 font-medium">{listing.book.pageCount} oldal</span>
                </div>
              )}
              {listing.book.categories?.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Kategória:</span>
                  <span className="ml-2 font-medium">
                    {listing.book.categories.map(c => c.name).join(', ')}
                  </span>
                </div>
              )}
            </div>
            {listing.book.description && (
              <div className="mt-4">
                <h3 className="text-lg font-bold mb-2" style={{ color: '#8b4513' }}>
                  Leírás
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.book.description}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default ListingDetails;