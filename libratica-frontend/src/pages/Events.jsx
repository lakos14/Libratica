import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEvents, useCreateEvent, useToggleEventAttend } from '../hooks';

function Events() {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'bookfair',
    eventDate: '',
    location: '',
  });
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState('all');

  const { data: events = [], isLoading, isError } = useEvents();
  const createEvent = useCreateEvent();
  const toggleAttend = useToggleEventAttend();

  const handleToggleAttend = async (id) => {
    if (!user) {
      return;
    }
    await toggleAttend.mutateAsync(id);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Cím kötelező';
    if (!formData.eventDate) newErrors.eventDate = 'Dátum kötelező';
    if (!formData.location.trim()) newErrors.location = 'Helyszín kötelező';
    if (new Date(formData.eventDate) < new Date()) newErrors.eventDate = 'A dátum nem lehet múltbeli';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await createEvent.mutateAsync({
        ...formData,
        eventDate: formData.eventDate,
      });
      setShowCreateModal(false);
      setFormData({ title: '', description: '', type: 'bookfair', eventDate: '', location: '' });
    } catch (error) {
    }
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
      timeZone: 'Europe/Budapest'
    });
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    return e.type === filter;
  });

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
            Hiba az események betöltésekor
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: '#8b4513' }}>
              Események
            </h1>
            <p className="text-gray-600 mt-1">Könyvvásárok és könyvcsere események</p>
          </div>
          {user && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded text-white font-medium"
              style={{ backgroundColor: '#8b4513' }}
            >
              + Esemény létrehozása
            </button>
          )}
        </div>

        <div className="flex gap-3 mb-6">
          {['all', 'bookfair', 'bookswap'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                filter === f
                  ? 'text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
              style={filter === f ? { backgroundColor: '#8b4513' } : {}}
            >
              {f === 'all' ? 'Összes' : f === 'bookfair' ? '📚 Könyvvásár' : '🔄 Könyvcsere'}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">Nincsenek események</p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="text-sm font-medium"
                style={{ color: '#8b4513' }}
              >
                Hozd létre az első eseményt!
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-400 transition">
                <div className="px-4 pt-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    event.type === 'bookfair'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {getTypeLabel(event.type)}
                  </span>
                  {event.isExpired && (
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500 ml-2">
                      Lezajlott
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="text-xl font-bold mb-2" style={{ color: '#8b4513' }}>
                    {event.title}
                  </h3>

                  {event.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  )}

                  <div className="space-y-1 mb-4">
                    <p className="text-sm text-gray-600">
                      📅 {formatDate(event.eventDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      📍 {event.location}
                    </p>
                    <p className="text-sm text-gray-600">
                      👤 Szervező: {event.organizer?.username}
                    </p>
                    <p className="text-sm text-gray-600">
                      👥 {event.attendeesCount} résztvevő
                    </p>
                    <p className="text-sm text-gray-600">
                      💬 {event.commentsCount} komment
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Link
                      to={`/events/${event.id}`}
                      className="flex-1 text-center px-3 py-2 text-sm rounded border font-medium"
                      style={{ borderColor: '#8b4513', color: '#8b4513' }}
                    >
                      Részletek
                    </Link>
                    {user && !event.isExpired && (
                      <button
                        onClick={() => handleToggleAttend(event.id)}
                        disabled={toggleAttend.isPending}
                        className="flex-1 px-3 py-2 text-sm rounded text-white font-medium disabled:opacity-50"
                        style={{ backgroundColor: '#8b4513' }}
                      >
                        Részt veszek
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-screen overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6" style={{ color: '#8b4513' }}>
              Új esemény létrehozása
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cím *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Esemény neve..."
                  maxLength={200}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                />
                {errors.title && <p className="text-red-600 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Típus *
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                >
                  <option value="bookfair">📚 Könyvvásár</option>
                  <option value="bookswap">🔄 Könyvcsere</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dátum és idő *
                </label>
                <input
                  type="datetime-local"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                />
                {errors.eventDate && <p className="text-red-600 text-xs mt-1">{errors.eventDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Helyszín *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Pl: Budapest, Vörösmarty tér"
                  maxLength={300}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                />
                {errors.location && <p className="text-red-600 text-xs mt-1">{errors.location}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Leírás (opcionális)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Részletes leírás az eseményről..."
                  rows="3"
                  maxLength={2000}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-800">
                  Az esemény admin jóváhagyás után jelenik meg a listában.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setErrors({});
                    setFormData({ title: '', description: '', type: 'bookfair', eventDate: '', location: '' });
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Mégse
                </button>
                <button
                  type="submit"
                  disabled={createEvent.isPending}
                  className="flex-1 px-4 py-2 text-white rounded disabled:bg-gray-400 font-semibold"
                  style={{ backgroundColor: '#8b4513' }}
                >
                  {createEvent.isPending ? 'Létrehozás...' : 'Létrehozás'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
