import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { profileAPI } from '../services/api';
import { toast } from 'react-toastify';

const Profile = () => {
  const { user } = useAuth();

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

    if (profileData.phoneNumber) {
      const cleanedPhone = profileData.phoneNumber.replace(/[\s\-]/g, '');
      if (!/^[+0-9]+$/.test(cleanedPhone)) {
        toast.error('A telefonszám csak számokat, +, - és szóközt tartalmazhat!');
        return;
      }
      if (cleanedPhone.length < 11) {
        toast.error('A telefonszám túl rövid! (min. 11 karakter, pl. +36301234567)');
        return;
      }
    }

    setProfileLoading(true);

    try {
      await profileAPI.updateProfile({
        username: profileData.username || null,
        fullName: profileData.fullName || null,
        phoneNumber: profileData.phoneNumber || null,
      });
      toast.success('Profil sikeresen mentve!');
      setTimeout(() => window.location.reload(), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Hiba a mentés során');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 8) {
      toast.error('Az új jelszó minimum 8 karakter legyen!');
      return;
    }

    if (!/[a-zA-Z]/.test(passwordData.newPassword)) {
      toast.error('A jelszónak tartalmaznia kell legalább egy betűt!');
      return;
    }

    if (!/[0-9]/.test(passwordData.newPassword)) {
      toast.error('A jelszónak tartalmaznia kell legalább egy számot!');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('A két jelszó nem egyezik meg!');
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
      toast.error(err.response?.data?.message || 'Hiba a jelszó változtatásakor');
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

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Alapadatok</h2>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telefonszám
              </label>
              <input
                type="tel"
                value={profileData.phoneNumber}
                onChange={(e) => setProfileData({ ...profileData, phoneNumber: e.target.value })}
                placeholder="+36301234567"
                pattern="[+0-9\s\-]+"
                title="Csak számokat, +, - és szóközt tartalmazhat"
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
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
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
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                minLength={8}
                placeholder="Min. 8 karakter, betű és szám"
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-gray-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Min. 8 karakter, tartalmazzon betűt és számot
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Új jelszó megerősítése
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
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