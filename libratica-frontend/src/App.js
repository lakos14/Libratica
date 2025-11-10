import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Listings from './pages/Listings';
import ListingDetails from './pages/ListingDetails';
import Cart from './pages/Cart';
import MyListings from './pages/MyListings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/listings/:id" element={<ListingDetails />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/my-listings" element={<MyListings />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;