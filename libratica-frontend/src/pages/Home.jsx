import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { searchAPI } from '../services/api';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await searchAPI.searchListings({ 
        isAvailable: true,
        sortBy: 'date',
        sortOrder: 'desc'
      });
      setListings(response.data.slice(0, 6));
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-2xl">Betöltés...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero szekció */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Használt könyvek<br />új életre kelnek
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              Vásárolj, adj el, fedezz fel - mind egy helyen. 
              Könyvbarátok közössége vár rád.
            </p>
            <div className="flex gap-4">
              <Link
                to="/listings"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Böngészés indítása
              </Link>
              <Link
                to="/register"
                className="bg-blue-700 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-800 transition border-2 border-blue-400"
              >
                Csatlakozz most
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Friss hirdetések */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Frissen érkezett
            </h2>
            <p className="text-gray-600">
              A legújabb könyvek amelyek most kerültek fel
            </p>
          </div>
          <Link
            to="/listings"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Összes megtekintése →
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <div className="text-6xl mb-4">📚</div>
            <p className="text-gray-600 text-lg">
              Hamarosan érkeznek az első hirdetések!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                to={`/listings/${listing.id}`}
                className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300"
              >
                <div className="h-48 overflow-hidden bg-gray-100"> {/* ← Változott! */}
                  <img
                    src={listing.book.coverImageUrl || 'https://via.placeholder.com/300x400?text=📖'}
                    alt={listing.book.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4"> {/* ← p-5 helyett p-4 */}
                  <h3 className="font-bold text-base mb-1 text-gray-800 line-clamp-1 group-hover:text-blue-600 transition"> {/* ← text-lg helyett text-base */}
                    {listing.book.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">{listing.book.author}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-xl font-bold text-gray-900"> {/* ← text-2xl helyett text-xl */}
                        {listing.price.toLocaleString()} Ft
                      </span>
                      <span className="text-xs text-gray-500">
                        {listing.condition === 'mint' ? '⭐ Újszerű' :
                        listing.condition === 'excellent' ? '✨ Kiváló' :
                        listing.condition === 'good' ? '👍 Jó' :
                        listing.condition === 'fair' ? '👌 Elfogadható' : '📖 Olvasható'}
                      </span>
                    </div>
                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Hogyan működik */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Hogyan működik?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Keresd meg</h3>
              <p className="text-gray-600">
                Böngészd a hirdetéseket vagy használd a keresőt hogy megtaláld amit keresel
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Vedd meg</h3>
              <p className="text-gray-600">
                Tedd kosárba és rendeld meg egyszerűen, megbeszélés szerint átveheted
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📚</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Élvezd</h3>
              <p className="text-gray-600">
                Olvasás után add tovább vagy tartsd meg a gyűjteményedben
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA szekció */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Van eladó könyved?
          </h2>
          <p className="text-xl mb-8 text-purple-100">
            Hirdesd meg ingyen és találj vevőt percek alatt
          </p>
          <Link
            to="/my-listings"
            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-purple-50 transition inline-block"
          >
            Hirdetés feladása
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;