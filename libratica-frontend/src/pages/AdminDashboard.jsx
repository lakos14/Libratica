import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useAdminStats,
  useAdminUsers,
  useAdminListings,
  useAdminEvents,
  useReports,
  useCategories,
  useToggleUserActive,
  useToggleUserRole,
  useAdminToggleListingAvailable,
  useAdminDeleteListing,
  useCreateCategory,
  useDeleteCategory,
  useUpdateReportStatus,
  useUpdateEventStatus,
  useAdminDeleteEvent,
} from '../hooks';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [usersPage, setUsersPage] = useState(1);
  const [listingsPage, setListingsPage] = useState(1);
  const adminPageSize = 15;

  const { data: stats, isLoading: statsLoading } = useAdminStats();
  const { data: users = [], isLoading: usersLoading } = useAdminUsers();
  const { data: listings = [], isLoading: listingsLoading } = useAdminListings();
  const { data: events = [], isLoading: eventsLoading } = useAdminEvents();
  const { data: reports = [], isLoading: reportsLoading } = useReports();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();

  const toggleUserActive = useToggleUserActive();
  const toggleUserRole = useToggleUserRole();
  const toggleListingAvailable = useAdminToggleListingAvailable();
  const deleteListing = useAdminDeleteListing();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();
  const updateReportStatus = useUpdateReportStatus();
  const updateEventStatus = useUpdateEventStatus();
  const deleteEvent = useAdminDeleteEvent();

  const paginatedUsers = users.slice((usersPage - 1) * adminPageSize, usersPage * adminPageSize);
  const usersTotalPages = Math.ceil(users.length / adminPageSize);
  const paginatedListings = listings.slice(
    (listingsPage - 1) * adminPageSize,
    listingsPage * adminPageSize
  );
  const listingsTotalPages = Math.ceil(listings.length / adminPageSize);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCreateCategory = async () => {
    if (!newCategory.name.trim()) return;
    await createCategory.mutateAsync(newCategory);
    setNewCategory({ name: '', description: '' });
  };

  const isLoading =
    (activeTab === 'stats' && statsLoading) ||
    (activeTab === 'users' && usersLoading) ||
    (activeTab === 'listings' && listingsLoading) ||
    (activeTab === 'events' && eventsLoading) ||
    (activeTab === 'reports' && reportsLoading) ||
    (activeTab === 'categories' && categoriesLoading);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin felület</h1>

      <div className="flex gap-4 mb-6 border-b flex-wrap">
        {['stats', 'reports', 'users', 'listings', 'categories', 'events'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-semibold ${
              activeTab === tab
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {tab === 'stats' && 'Statisztikák'}
            {tab === 'reports' && 'Reportok'}
            {tab === 'users' && 'Felhasználók'}
            {tab === 'listings' && 'Hirdetések'}
            {tab === 'categories' && 'Kategóriák'}
            {tab === 'events' && 'Események'}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Betöltés...</p>
        </div>
      )}

      {activeTab === 'stats' && stats && !statsLoading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Általános statisztikák</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard label="Összes felhasználó" value={stats.totalUsers} color="blue" />
            <StatCard label="Összes könyv" value={stats.totalBooks} color="purple" />
            <StatCard label="Összes hirdetés" value={stats.totalListings} color="orange" />
            <StatCard label="Összes rendelés" value={stats.totalOrders} color="green" />
          </div>
        </div>
      )}

      {activeTab === 'users' && !usersLoading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Felhasználók ({users.length})</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Felhasználónév</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Szerep</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Műveletek</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">#{user.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/users/${user.username}`}
                        className="text-sm font-medium hover:underline"
                        style={{ color: '#8b4513' }}
                      >
                        {user.username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.roleName === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Aktív' : 'Inaktív'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleUserActive.mutate(user.id)}
                          disabled={toggleUserActive.isPending}
                          className={`px-2 py-1 text-xs rounded text-white ${
                            user.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {user.isActive ? 'Tiltás' : 'Aktiválás'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Biztosan megváltoztatod a szerepkört?')) {
                              toggleUserRole.mutate(user.id);
                            }
                          }}
                          disabled={toggleUserRole.isPending}
                          className="px-2 py-1 text-xs rounded bg-purple-500 text-white hover:bg-purple-600"
                        >
                          {user.roleName === 'admin' ? 'User' : 'Admin'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination current={usersPage} total={usersTotalPages} onChange={setUsersPage} />
        </div>
      )}

      {activeTab === 'listings' && !listingsLoading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Hirdetések ({listings.length})</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Könyv</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Eladó</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ár</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Státusz</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Műveletek</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">#{listing.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link
                        to={`/listings/${listing.id}`}
                        className="text-sm font-medium text-[#8b4513] hover:underline"
                      >
                        {listing.book?.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">{listing.seller?.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                      {listing.price?.toLocaleString('hu-HU')} Ft
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          listing.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {listing.isAvailable ? 'Elérhető' : 'Nem elérhető'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleListingAvailable.mutate(listing.id)}
                          disabled={toggleListingAvailable.isPending}
                          className={`px-2 py-1 text-xs rounded text-white ${
                            listing.isAvailable
                              ? 'bg-yellow-500 hover:bg-yellow-600'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {listing.isAvailable ? 'Inaktiválás' : 'Aktiválás'}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Biztosan törlöd ezt a hirdetést?')) {
                              deleteListing.mutate(listing.id);
                            }
                          }}
                          disabled={deleteListing.isPending}
                          className="px-2 py-1 text-xs rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Törlés
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination current={listingsPage} total={listingsTotalPages} onChange={setListingsPage} />
        </div>
      )}

      {activeTab === 'reports' && !reportsLoading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Reportok ({reports.length})</h2>
          {reports.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-8 text-center">
              <p className="text-gray-500">Nincsenek reportok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          report.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : report.status === 'resolved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {report.status === 'pending'
                          ? 'Függőben'
                          : report.status === 'resolved'
                          ? 'Megoldva'
                          : 'Elvetve'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">{formatDate(report.createdAt)}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-2">
                    Bejelentő: <span className="font-medium">{report.reporter?.username}</span>
                  </p>

                  <p className="text-sm mb-3">
                    Ok: <span className="font-medium">{report.reason}</span>
                  </p>

                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => updateReportStatus.mutate({ id: report.id, status: 'resolved' })}
                        disabled={updateReportStatus.isPending}
                        className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        Elfogad
                      </button>
                      <button
                        onClick={() => updateReportStatus.mutate({ id: report.id, status: 'dismissed' })}
                        disabled={updateReportStatus.isPending}
                        className="px-4 py-2 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
                      >
                        Elvet
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && !categoriesLoading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Kategóriák</h2>

          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-bold mb-3">Új kategória hozzáadása</h3>
            <div className="flex gap-3">
              <input
                type="text"
                value={newCategory.name}
                onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                placeholder="Kategória neve..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
              <input
                type="text"
                value={newCategory.description}
                onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                placeholder="Leírás (opcionális)..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
              <button
                onClick={handleCreateCategory}
                disabled={createCategory.isPending}
                className="px-4 py-2 text-white rounded disabled:bg-gray-400"
                style={{ backgroundColor: '#8b4513' }}
              >
                + Hozzáadás
              </button>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium">{category.name}</p>
                  {category.description && (
                    <p className="text-sm text-gray-500">{category.description}</p>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (window.confirm('Biztosan törlöd ezt a kategóriát?')) {
                      deleteCategory.mutate(category.id);
                    }
                  }}
                  disabled={deleteCategory.isPending}
                  className="px-3 py-1 text-xs rounded bg-red-100 text-red-600 hover:bg-red-200"
                >
                  Törlés
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'events' && !eventsLoading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Események ({events.length})</h2>
          {events.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded p-8 text-center">
              <p className="text-gray-500">Nincsenek események</p>
            </div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-lg">{event.title}</h3>
                      <p className="text-sm text-gray-600">
                        {event.type === 'bookfair' ? '📚 Könyvvásár' : '🔄 Könyvcsere'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        event.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : event.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {event.status === 'pending'
                        ? '⏳ Függőben'
                        : event.status === 'approved'
                        ? 'Jóváhagyva'
                        : 'Elutasítva'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm text-gray-600">
                    <p>📅 {formatDate(event.eventDate)}</p>
                    <p>📍 {event.location}</p>
                    <p>👤 Szervező: {event.organizer?.username}</p>
                    <p>👥 {event.attendeesCount} résztvevő</p>
                  </div>

                  <div className="flex gap-2">
                    {event.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateEventStatus.mutate({ id: event.id, status: 'approved' })}
                          disabled={updateEventStatus.isPending}
                          className="px-3 py-1 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                        >
                          Jóváhagyás
                        </button>
                        <button
                          onClick={() => updateEventStatus.mutate({ id: event.id, status: 'rejected' })}
                          disabled={updateEventStatus.isPending}
                          className="px-3 py-1 text-sm rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Elutasítás
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => {
                        if (window.confirm('Biztosan törlöd ezt az eseményt?')) {
                          deleteEvent.mutate(event.id);
                        }
                      }}
                      disabled={deleteEvent.isPending}
                      className="px-3 py-1 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
                    >
                      Törlés
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }) {
  const colorClasses = {
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    green: 'text-green-600',
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <p className="text-gray-600 text-sm">{label}</p>
        <p className={`text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
      </div>
    </div>
  );
}

function Pagination({ current, total, onChange }) {
  if (total <= 1) return null;

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button
        onClick={() => onChange(1)}
        disabled={current === 1}
        className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        «
      </button>
      <button
        onClick={() => onChange((prev) => prev - 1)}
        disabled={current === 1}
        className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        ‹
      </button>
      <span className="px-3 py-2 text-sm">
        {current} / {total}
      </span>
      <button
        onClick={() => onChange((prev) => prev + 1)}
        disabled={current === total}
        className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        ›
      </button>
      <button
        onClick={() => onChange(total)}
        disabled={current === total}
        className="px-3 py-2 text-sm rounded border border-gray-300 disabled:opacity-50 hover:bg-gray-50"
      >
        »
      </button>
    </div>
  );
}

export default AdminDashboard;
