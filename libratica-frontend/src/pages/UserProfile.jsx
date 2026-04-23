import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useUserProfile } from '../hooks';
import { BASE_URL } from '../services/api';

function UserProfile() {
  const { username } = useParams();
  const [activeTab, setActiveTab] = useState('listings');

  const { data: profile, isLoading, isError, error } = useUserProfile(username);

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

  const formatDate = (dateString) => {
    const date = new Date(dateString.endsWith('Z') ? dateString : dateString + 'Z');
    return date.toLocaleString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Budapest',
    });
  };

  const renderStars = (rating) => {
    return [1, 2, 3, 4, 5].map((star) => (
      <span key={star} className={star <= rating ? 'text-yellow-400' : 'text-gray-300'}>
        ★
      </span>
    ));
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
            {error?.message || 'Felhasználó nem található'}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-[#8b4513] text-white flex items-center justify-center text-3xl font-bold flex-shrink-0">
              {profile.username.charAt(0).toUpperCase()}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold" style={{ color: '#8b4513' }}>
                {profile.username}
              </h1>
              {profile.fullName && <p className="text-gray-600">{profile.fullName}</p>}

              <div className="flex items-center gap-2 mt-1">
                {profile.rating ? (
                  <>
                    <span className="text-lg">{renderStars(Math.round(profile.rating))}</span>
                    <span className="text-gray-600 text-sm">
                      {profile.rating.toFixed(1)} / 5.0
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 text-sm">Még nincs értékelés</span>
                )}
              </div>

              <div className="flex flex-col gap-1 mt-2 text-sm text-gray-500">
                <span>{profile.activeListingsCount} aktív hirdetés</span>
                <span>Regisztrált: {formatDate(profile.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mt-4 pt-4 border-t flex-wrap">

            <a href={`https://mail.google.com/mail/?view=cm&to=${profile.email}`}
              target="_blank"
              rel="noreferrer"
              className="inline-block text-sm text-gray-600 hover:text-[#8b4513] border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
            >
              Gmail
            </a>

            <a href={`mailto:${profile.email}`}
              className="inline-block text-sm text-gray-600 hover:text-[#8b4513] border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
            >
              Email alkalmazás
            </a>
            {profile.phoneNumber && (

              <a href={`tel:${profile.phoneNumber}`}
                className="inline-block text-sm text-gray-600 hover:text-[#8b4513] border border-gray-300 rounded px-3 py-1 hover:bg-gray-50"
              >
                📞 {profile.phoneNumber}
              </a>
            )}
          </div>
        </div >

        <div className="flex gap-4 mb-6 border-b border-gray-300">
          <button
            onClick={() => setActiveTab('listings')}
            className={`px-4 py-2 font-semibold ${activeTab === 'listings' ? 'border-b-2' : 'text-gray-600 hover:text-gray-800'
              }`}
            style={activeTab === 'listings' ? { color: '#8b4513', borderColor: '#8b4513' } : {}}
          >
            Hirdetések ({profile.listings?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-semibold ${activeTab === 'reviews' ? 'border-b-2' : 'text-gray-600 hover:text-gray-800'
              }`}
            style={activeTab === 'reviews' ? { color: '#8b4513', borderColor: '#8b4513' } : {}}
          >
            Értékelések ({profile.reviews?.length || 0})
          </button>
        </div>

        {
          activeTab === 'listings' && (
            <div>
              {profile.listings?.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded p-8 text-center">
                  <p className="text-gray-500">Nincsenek aktív hirdetések</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {profile.listings?.map((listing) => (
                    <Link
                      key={listing.id}
                      to={`/listings/${listing.id}`}
                      className="bg-white border border-gray-200 rounded p-3 hover:border-gray-400 transition-colors flex flex-col"
                    >
                      {(() => {
                        const imgUrl = listing.images?.length > 0
                          ? `${BASE_URL}${listing.images[0]}`
                          : listing.book?.coverImageUrl;
                        return imgUrl ? (
                          <img src={imgUrl} alt={listing.book?.title} className="w-full h-64 object-cover rounded mb-3" />
                        ) : (
                          <div className="w-full h-64 bg-gray-200 rounded mb-3 flex items-center justify-center">
                            <span className="text-gray-400 text-4xl">📚</span>
                          </div>
                        );
                      })()}
                      <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                        {listing.book?.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-2">{listing.book?.author}</p>
                      <div className="mt-auto">
                        <p className="font-bold text-sm" style={{ color: '#8b4513' }}>
                          {listing.price?.toLocaleString('hu-HU')} Ft
                        </p>
                        <p className="text-xs text-gray-500">{getConditionLabel(listing.condition)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        }

        {
          activeTab === 'reviews' && (
            <div>
              {profile.reviews?.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded p-8 text-center">
                  <p className="text-gray-500">Még nincsenek értékelések</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {profile.reviews?.map((review) => (
                    <div key={review.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-800">
                            {review.reviewer?.username}
                          </span>
                          <span className="text-yellow-400 text-lg">
                            {renderStars(review.rating)}
                          </span>
                          <span className="text-sm text-gray-500">{review.rating}/5</span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
                      </div>
                      {review.comment && <p className="text-gray-700 text-sm">{review.comment}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        }
      </div >
    </div >
  );
}

export default UserProfile;
