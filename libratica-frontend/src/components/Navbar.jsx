import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsMenuOpen(false);
  };

  const navLinkStyle = {
    transition: 'color 0.2s'
  };

  const handleMouseEnter = (e) => {
    e.target.style.color = '#8b4513';
  };

  const handleMouseLeave = (e) => {
    e.target.style.color = '#4b5563';
  };

  return (
    <nav className="bg-white border-b border-gray-300">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold" style={{ color: '#8b4513' }}>
            Libratica
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/books" className="text-gray-700" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              Könyvek
            </Link>
            <Link to="/listings" className="text-gray-700" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              Hirdetések
            </Link>

            {user ? (
              <>
                <Link to="/recommendations" className="text-gray-700" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Ajánlott
                </Link>
                <Link to="/cart" className="text-gray-700" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Kosár
                </Link>
                <Link to="/events" className="text-gray-700" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Események
                </Link>

                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700"
                    style={navLinkStyle}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="#8b4513" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>{user.username}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded shadow-lg">
                      <Link to="/my-listings" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                        Hirdetéseim
                      </Link>
                      <Link to="/orders" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                        Rendeléseim
                      </Link>
                      <Link to="/wishlist" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                        Kívánságlista
                      </Link>
                      <Link to="/collection" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                        Gyűjteményem
                      </Link>
                      <Link to="/profile" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                        Profil szerkesztése
                      </Link>
                      {user.roleName === 'admin' && (
                        <Link to="/admin" className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsMenuOpen(false)}>
                          Admin
                        </Link>
                      )}
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Kijelentkezés
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>  
                <Link to="/login" className="text-gray-700" style={navLinkStyle} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
                  Bejelentkezés
                </Link>
                <Link to="/register" className="px-4 py-2 rounded text-white" style={{ backgroundColor: '#8b4513' }}>
                  Regisztráció
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <Link to="/books" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Könyvek
            </Link>
            <Link to="/listings" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
              Hirdetések
            </Link>
            {user ? (
              <>
                <Link to="/recommendations" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Ajánlott
                </Link>
                <Link to="/cart" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Kosár
                </Link>
                <Link to="/events" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Események
                </Link>
                <Link to="/my-listings" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Hirdetéseim
                </Link>
                <Link to="/orders" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Rendeléseim
                </Link>
                {user.roleName === 'admin' && (
                  <Link to="/admin" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-gray-700"
                >
                  Kijelentkezés
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Bejelentkezés
                </Link>
                <Link to="/register" className="block py-2 text-gray-700" onClick={() => setIsMenuOpen(false)}>
                  Regisztráció
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;