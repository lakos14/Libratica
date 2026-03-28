import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvent, useToggleEventAttend, useAddEventComment, useDeleteEventComment } from '../hooks';
import { toast } from 'react-toastify';
import MapPicker from '../components/MapPicker';

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [comment, setComment] = useState('');

  const { data: event, isLoading, isError } = useEvent(id);
  const toggleAttend = useToggleEventAttend();
  const addComment = useAddEventComment();
  const deleteComment = useDeleteEventComment();

  const attending = user && event?.attendees?.some((a) => a.id === user.id);

  const handleToggleAttend = async () => {
    if (!user) {
      toast.error('Bejelentkezés szükséges!');
      return;
    }
    await toggleAttend.mutateAsync(id);
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    await addComment.mutateAsync({ eventId: id, content: comment });
    setComment('');
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment.mutateAsync({ eventId: id, commentId });
  };

  const getTypeLabel = (type) => {
    return type === 'bookfair' ? '📚 Könyvvásár' : '🔄 Könyvcsere';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Budapest',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Esemény nem található
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button onClick={() => navigate('/events')} className="mb-4 text-gray-600 hover:text-gray-800">
          ← Vissza az eseményekhez
        </button>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${event.type === 'bookfair' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}
            >
              {getTypeLabel(event.type)}
            </span>
          </div>

          <h1 className="text-3xl font-bold mb-4" style={{ color: '#8b4513' }}>
            {event.title}
          </h1>

          {event.description && (
            <p className="text-gray-700 mb-6 whitespace-pre-wrap">{event.description}</p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-2">
              <p className="text-gray-600">
                📅 <span className="font-medium">{formatDate(event.eventDate)}</span>
              </p>
              <p className="text-gray-600">
                📍 <span className="font-medium">{event.location}</span>
              </p>
              {event.latitude && event.longitude && (
                <div className="mt-4">
                  <MapPicker position={[event.latitude, event.longitude]} setPosition={() => { }} />
                </div>
              )}
              <p className="text-gray-600">
                👤 Szervező: <span className="font-medium">{event.organizer?.username}</span>
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-gray-600">
                👥 <span className="font-medium">{event.attendees?.length || 0} résztvevő</span>
              </p>
              <p className="text-gray-600">
                💬 <span className="font-medium">{event.comments?.length || 0} komment</span>
              </p>
            </div>
          </div>

          {user && (
            <button
              onClick={handleToggleAttend}
              disabled={toggleAttend.isPending}
              className={`px-6 py-2 rounded font-semibold transition disabled:opacity-50 ${attending ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'text-white'
                }`}
              style={!attending ? { backgroundColor: '#8b4513' } : {}}
            >
              {toggleAttend.isPending
                ? '...'
                : attending
                  ? 'Részt veszek (visszavonás)'
                  : '+ Részt veszek'}
            </button>
          )}
        </div>

        {event.attendees?.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4" style={{ color: '#8b4513' }}>
              Résztvevők ({event.attendees.length})
            </h2>
            <div className="flex flex-wrap gap-2">
              {event.attendees.map((attendee) => (
                <span
                  key={attendee.id}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700"
                >
                  👤 {attendee.username}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4" style={{ color: '#8b4513' }}>
            Kommentek ({event.comments?.length || 0})
          </h2>

          {user ? (
            <form onSubmit={handleAddComment} className="mb-6">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Írj egy kommentet..."
                rows="3"
                maxLength={1000}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500 mb-2"
              />
              <button
                type="submit"
                disabled={addComment.isPending || !comment.trim()}
                className="px-4 py-2 text-white rounded disabled:bg-gray-400 font-medium"
                style={{ backgroundColor: '#8b4513' }}
              >
                {addComment.isPending ? 'Küldés...' : 'Komment elküldése'}
              </button>
            </form>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-6">
              <p className="text-gray-600 text-sm">
                Kommenteléshez{' '}
                <a href="/login" className="font-medium" style={{ color: '#8b4513' }}>
                  jelentkezz be
                </a>
                !
              </p>
            </div>
          )}

          {event.comments?.length === 0 ? (
            <p className="text-gray-500 text-sm">Még nincsenek kommentek.</p>
          ) : (
            <div className="space-y-4">
              {event.comments?.map((c) => (
                <div key={c.id} className="border-b border-gray-100 pb-4 last:border-b-0">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{c.user?.username}</span>
                      <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                    </div>
                    {(user?.id === c.user?.id || user?.roleName === 'admin') && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        disabled={deleteComment.isPending}
                        className="text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        Törlés
                      </button>
                    )}
                  </div>
                  <p className="text-gray-700 text-sm">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EventDetails;
