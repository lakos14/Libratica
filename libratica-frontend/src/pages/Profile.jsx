import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user, login } = useAuth();

  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    fullName: user?.fullName || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

 const handleProfileSubmit = async (e) => {
   e.preventDefault();
   setProfileLoading(true);
 
   try {
     await profileAPI.updateProfile({
       username: profileData.username || null,
       fullName: profileData.fullName || null,
       phoneNumber: profileData.phoneNumber || null,  // üres string helyett null
     });
     toast.success('Profil sikeresen mentve!');
     setTimeout(() => window.location.reload(), 1500);
   } catch (err) {
   } finally {
     setProfileLoading(false);
   }
 };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('A két jelszó nem egyezik meg.');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Az új jelszó minimum 6 karakter.');
      return;
    }

    setPasswordLoading(true);
    try {
      await profileAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Jelszó sikeresen megváltoztatva!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#8b4513' }}>
          Profil szerkesztése
        </h1>

        {/* Profil adatok */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Alapadatok</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {/* Email (nem szerkeszthető) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email cím (nem módosítható)
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-200 rounded bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>

            {/* Felhasználónév */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Felhasználónév
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                maxLength={50}
                minLength={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Teljes név */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teljes név
              </label>
              <input
                type="text"
                value={profileData.fullName}
                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            {/* Telefonszám */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefonszám
              </label>
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                placeholder="+36301234567"
                maxLength={20}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="w-full py-2 rounded text-white font-medium disabled:bg-gray-400"
              style={{ backgroundColor: profileLoading ? undefined : '#8b4513' }}
            >
              {profileLoading ? 'Mentés...' : 'Változtatások mentése'}
            </button>
          </form>
        </div>

        {/* Jelszóváltoztatás */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-6">Jelszó megváltoztatása</h2>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jelenlegi jelszó
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Új jelszó
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Új jelszó megerősítése
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={passwordLoading}
              className="w-full py-2 rounded text-white font-medium disabled:bg-gray-400"
              style={{ backgroundColor: passwordLoading ? undefined : '#8b4513' }}
            >
              {passwordLoading ? 'Mentés...' : 'Jelszó megváltoztatása'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;