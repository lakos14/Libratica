import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold">
            📚 Libratica
          </Link>

          <div className="flex gap-6 items-center">
            <Link to="/books" className="hover:text-blue-200">
              Könyvek
            </Link>
            <Link to="/listings" className="hover:text-blue-200">
              Hirdetések
            </Link>

            {isAuthenticated ? (
              <>
                <Link to="/cart" className="hover:text-blue-200">
                   Kosár
                </Link>
                <Link to="/my-listings" className="hover:text-blue-200">
                  Hirdetéseim
                </Link>
                <Link to="/orders" className="hover:text-blue-200">
                   Rendeléseim
                </Link>
                <div className="flex items-center gap-4">
                  <span className="text-sm">👤 {user?.username}</span>
                  <button
                    onClick={logout}
                    className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
                  >
                    Kilépés
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-gray-100"
                >
                  Bejelentkezés
                </Link>
                <Link
                  to="/register"
                  className="bg-green-500 px-4 py-2 rounded hover:bg-green-600"
                >
                  Regisztráció
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;