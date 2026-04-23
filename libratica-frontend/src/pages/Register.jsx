import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    if (formData.password.length < 8) {
      setError('A jelszó minimum 8 karakter legyen!');
      return false;
    }
    if (!/[a-zA-Z]/.test(formData.password)) {
      setError('A jelszónak tartalmaznia kell legalább egy betűt!');
      return false;
    }
    if (!/[0-9]/.test(formData.password)) {
      setError('A jelszónak tartalmaznia kell legalább egy számot!');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('A két jelszó nem egyezik meg!');
      return false;
    }
    if (formData.phoneNumber) {
      const cleanedPhone = formData.phoneNumber.replace(/[\s\-]/g, '');
      if (!/^[+0-9]+$/.test(cleanedPhone)) {
        setError('A telefonszám csak számokat, +, - és szóközt tartalmazhat!');
        return false;
      }
      if (cleanedPhone.length < 7) {
        setError('A telefonszám túl rövid! (min. 7 karakter, pl. +36301234567)');
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    const { confirmPassword, ...registerData } = formData;
    const result = await register(registerData);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-4 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6" style={{ color: '#8b4513' }}>
          Regisztráció
        </h2>

        <p className="text-sm text-gray-500 mb-4">A * jelölt mezők kitöltése kötelező.</p>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="pelda@email.com"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Felhasználónév *</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="pl. kovacs_janos"
              minLength={3}
              maxLength={50}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Teljes név *</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="pl. Kovács János"
              maxLength={100}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Telefonszám</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              placeholder="+36301234567"
              pattern="^\+?[0-9\s\-]{7,15}$"
              title="Csak számokat, +, - és szóközt tartalmazhat"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Jelszó *</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min. 8 karakter, betű és szám"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                {showPassword ? 'Elrejt' : 'Mutat'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Min. 8 karakter, tartalmazzon betűt és számot
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Jelszó megerősítése *</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Írd be újra a jelszót"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-gray-500 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm font-medium"
              >
                {showConfirmPassword ? 'Elrejt' : 'Mutat'}
              </button>
            </div>
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">A két jelszó nem egyezik meg</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="text-green-500 text-xs mt-1">A jelszavak egyeznek</p>
            )}
          </div>
          <div className="mb-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                required
                className="mt-1"
              />
              <span className="text-sm text-gray-600">
                Elfogadom az{' '}

                <a href="/adatvedelmi-nyilatkozat"
                  target="_blank"
                  className="text-[#8b4513] hover:underline"
                >
                  Adatvédelmi nyilatkozatot
                </a>
                {' '}*
              </span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full text-white py-3 rounded-lg disabled:bg-gray-400 font-semibold"
            style={{ backgroundColor: loading ? undefined : '#8b4513' }}
          >
            {loading ? 'Regisztráció...' : 'Regisztráció'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Már van fiókod?{' '}
          <Link to="/login" className="text-[#8b4513] hover:underline">
            Jelentkezz be itt!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;