import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';

const Home = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      const response = await listingsAPI.getAll();
      setListings(response.data.slice(0, 6)); // Első 6 hirdetés
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
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">
          Üdvözöl a Libratica! 📚
        </h1>
        <p className="text-xl text-gray-600">
          Használt könyvek piactere - Vásárolj és adj el könnyedén!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg text-center">
          <div className="text-4xl mb-4">📖</div>
          <h3 className="text-xl font-bold mb-2">Böngészd a könyveket</h3>
          <p className="text-gray-600">Több ezer használt könyv közül választhatsz</p>
        </div>
        <div className="bg-green-50 p-6 rounded-lg text-center">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-xl font-bold mb-2">Add el a könyveidet</h3>
          <p className="text-gray-600">Egyszerűen és gyorsan, azonnal élőben</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg text-center">
          <div className="text-4xl mb-4">🚀</div>
          <h3 className="text-xl font-bold mb-2">Gyors vásárlás</h3>
          <p className="text-gray-600">Kosárba teszed és megrendeled</p>
        </div>
      </div>

      <h2 className="text-3xl font-bold mb-6">Legújabb hirdetések</h2>
      
      {listings.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Még nincsenek hirdetések
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              to={`/listings/${listing.id}`}
              className="border rounded-lg p-4 hover:shadow-lg transition"
            >
              <img
                src={listing.book.coverImageUrl || 'https://via.placeholder.com/200x300?text=No+Cover'}
                alt={listing.book.title}
                className="w-full h-64 object-cover rounded mb-4"
              />
              <h3 className="font-bold text-lg mb-2">{listing.book.title}</h3>
              <p className="text-gray-600 mb-2">{listing.book.author}</p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-green-600">
                  {listing.price} {listing.currency}
                </span>
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">
                  {listing.condition}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="text-center mt-8">
        <Link
          to="/listings"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg hover:bg-blue-700"
        >
          Összes hirdetés megtekintése →
        </Link>
      </div>
    </div>
  );
};

export default Home;