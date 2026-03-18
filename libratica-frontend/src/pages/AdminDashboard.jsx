import React, { useState, useEffect } from 'react';
import { adminAPI, reportsAPI } from '../services/api';
import { toast } from 'react-toastify';

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (activeTab === 'stats') {
      loadStats();
    } else if (activeTab === 'users') {
      loadUsers();
    } else if (activeTab === 'listings') {
      loadListings();
    } else if (activeTab === 'reports') {
      loadReports();
    } 
  }, [activeTab]);

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a statisztikák betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a felhasználók betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const loadListings = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await adminAPI.getAllListings();
      setListings(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a hirdetések betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const loadReports = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await reportsAPI.getReports();
      setReports(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Hiba a reportok betöltésekor');
    } finally {
      setLoading(false);
    }
  };

  const handleReportStatus = async (id, status) => {
    try {
      await reportsAPI.updateReportStatus(id, { status });
      toast.success(status === 'resolved' ? 'Report elfogadva, intézkedés megtörtént!' : 'Report elvetve!');
      loadReports();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba a report kezelésekor');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('hu-HU', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">⚙️ Admin Dashboard</h1>

      {/* Tab navigáció */}
      <div className="flex gap-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('stats')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'stats'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📊 Statisztikák
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'reports'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          🚩 Reportok
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          👥 Felhasználók
        </button>
        <button
          onClick={() => setActiveTab('listings')}
          className={`px-4 py-2 font-semibold ${
            activeTab === 'listings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          📚 Hirdetések
        </button>
      </div>


      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Betöltés...</p>
        </div>
      )}

      {/* TAB 1: Statisztikák */}
      {activeTab === 'stats' && stats && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Általános statisztikák</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Felhasználók */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Összes felhasználó</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
                </div>
                <div className="text-4xl">👥</div>
              </div>
              {stats.today.users > 0 && (
                <p className="text-sm text-green-600 mt-2">+{stats.today.users} ma</p>
              )}
            </div>

            {/* Könyvek */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Összes könyv</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.totalBooks}</p>
                </div>
                <div className="text-4xl">📖</div>
              </div>
            </div>

            {/* Hirdetések */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Összes hirdetés</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.totalListings}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.activeListings} aktív
                  </p>
                </div>
                <div className="text-4xl">📚</div>
              </div>
              {stats.today.listings > 0 && (
                <p className="text-sm text-green-600 mt-2">+{stats.today.listings} ma</p>
              )}
            </div>

            {/* Rendelések */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Összes rendelés</p>
                  <p className="text-3xl font-bold text-green-600">{stats.totalOrders}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {stats.pendingOrders} függőben
                  </p>
                </div>
                <div className="text-4xl">🛒</div>
              </div>
              {stats.today.orders > 0 && (
                <p className="text-sm text-green-600 mt-2">+{stats.today.orders} ma</p>
              )}
            </div>
          </div>

          {/* Bevétel */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-lg">Összes bevétel</p>
                <p className="text-5xl font-bold">{stats.totalRevenue.toLocaleString('hu-HU')} Ft</p>
                <p className="text-green-100 text-sm mt-2">
                  (Lemondott rendelések nélkül)
                </p>
              </div>
              <div className="text-7xl">💰</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Felhasználók */}
      {activeTab === 'users' && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Felhasználók ({users.length})
          </h2>
          
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Felhasználónév
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teljes név
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Szerep
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hirdetések
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vásárlások
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Értékelés
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Regisztráció
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Státusz
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{user.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.fullName || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.roleName === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {user.roleName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.listingsCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.ordersAsBuyerCount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.rating ? `⭐ ${user.rating.toFixed(1)}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? '✓ Aktív' : '✗ Inaktív'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: Hirdetések */}
      {activeTab === 'listings' && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Hirdetések ({listings.length})
          </h2>
          
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Könyv
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eladó
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Állapot
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ár
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mennyiség
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Létrehozva
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Státusz
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      #{listing.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {listing.book.coverImageUrl && (
                          <img
                            src={listing.book.coverImageUrl}
                            alt={listing.book.title}
                            className="h-10 w-8 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {listing.book.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {listing.book.author}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {listing.seller.username}
                      </div>
                      <div className="text-sm text-gray-500">
                        {listing.seller.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.condition === 'new' && '🆕 Új'}
                      {listing.condition === 'like_new' && '✨ Majdnem új'}
                      {listing.condition === 'good' && '👍 Jó'}
                      {listing.condition === 'fair' && '👌 Elfogadható'}
                      {listing.condition === 'poor' && '📉 Rossz'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {listing.price.toLocaleString('hu-HU')} {listing.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {listing.quantity} db
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(listing.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          listing.isAvailable
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {listing.isAvailable ? '✓ Elérhető' : '✗ Nem elérhető'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'reports' && !loading && (
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Reportok ({reports.length})
          </h2>

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
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status === 'pending' ? '⏳ Függőben' :
                        report.status === 'resolved' ? '✓ Megoldva' : '✗ Elvetve'}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        {formatDate(report.createdAt)}
                      </span>
                    </div>
                  </div>

                  {/* Bejelentő */}
                  <p className="text-sm text-gray-600 mb-2">
                    Bejelentő: <span className="font-medium">{report.reporter?.username}</span>
                  </p>

                  {/* Hirdetés report */}
                  {report.listing && (
                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <a 
                        href={`/listings/${report.listing.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-[#8b4513] hover:underline"
                      >
                        📚 Hirdetés: {report.listing.title}
                      </a>
                      <p className="text-sm text-gray-600">Szerző: {report.listing.author}</p>
                      <p className="text-sm text-gray-600">Eladó: {report.listing.seller?.username}</p>
                      <p className="text-sm text-gray-600">Ár: {report.listing.price?.toLocaleString('hu-HU')} Ft</p>
                    </div>
                  )}

                  {/* Felhasználó report */}
                  {report.reportedUser && (
                    <div className="bg-gray-50 rounded p-3 mb-2">
                      <p className="text-sm font-medium">👤 Jelentett felhasználó: {report.reportedUser?.username}</p>
                      <p className="text-sm text-gray-600">Email: {report.reportedUser?.email}</p>
                    </div>
                  )}

                  {/* Ok */}
                  <p className="text-sm mb-3">
                    Ok: <span className="font-medium">{report.reason}</span>
                  </p>

                  {/* Gombok */}
                  {report.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReportStatus(report.id, 'resolved')}
                        className="px-4 py-2 text-sm rounded bg-green-600 text-white hover:bg-green-700"
                      >
                        ✓ Elfogad {report.listing ? '(hirdetés inaktiválása)' : '(felhasználó tiltása)'}
                      </button>
                      <button
                        onClick={() => handleReportStatus(report.id, 'dismissed')}
                        className="px-4 py-2 text-sm rounded bg-gray-500 text-white hover:bg-gray-600"
                      >
                        ✗ Elvet
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;