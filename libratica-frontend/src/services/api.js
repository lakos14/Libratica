import axios from 'axios';

const API_BASE_URL = 'http://localhost:5102/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token hozzáadása minden kéréshez
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
};

// Books API
export const booksAPI = {
  getAll: (params) => api.get('/books', { params }),
  getWithAvailableListings: (params) => api.get('/books/with-available-listings', { params }),
  getById: (id) => api.get(`/books/${id}`),
  create: (data) => api.post('/books', data),
  update: (id, data) => api.put(`/books/${id}`, data),
  delete: (id) => api.delete(`/books/${id}`),
};

// Listings API
export const listingsAPI = {
  getAll: (params) => api.get('/listings', { params }),
  getById: (id) => api.get(`/listings/${id}`),
  create: (data) => api.post('/listings', data),
  update: (id, data) => api.put(`/listings/${id}`, data),
  delete: (id) => api.delete(`/listings/${id}`),
  getMyListings: () => api.get('/listings/my-listings'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateCartItem: (itemId, data) => api.put(`/cart/items/${itemId}`, data),
  removeFromCart: (itemId) => api.delete(`/cart/items/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
};

// Orders API
export const ordersAPI = {
  getMyOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  checkout: (data) => api.post('/orders/checkout', data),
  getPurchases: () => api.get('/orders/purchases'),
  getSales: () => api.get('/orders/sales'),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  rejectOrder: (id) => api.post(`/orders/${id}/reject`),
};

// Search API
export const searchAPI = {
  searchBooks: (params) => api.get('/search/books', { params }),
  searchListings: (params) => api.get('/search/listings', { params }),
};

// Admin API
export const adminAPI = {
  getStats: () => api.get('/admin/stats'),
  getAllUsers: () => api.get('/admin/users'),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  getAllListings: () => api.get('/admin/listings'),
};

// Profile API
export const profileAPI = {
    updateProfile: (data) => api.put('/profile', data),
    changePassword: (data) => api.put('/profile/change-password', data),
};

// Reviews API
export const reviewsAPI = {
  createReview: (data) => api.post('/reviews', data),
  getUserReviews: (userId) => api.get(`/reviews/user/${userId}`),
  getOrderReviews: (orderId) => api.get(`/reviews/order/${orderId}`),
};

// Reports API
export const reportsAPI = {
  createReport: (data) => api.post('/reports', data),
  getReports: (status) => api.get('/reports', { params: { status } }),
  updateReportStatus: (id, data) => api.put(`/reports/${id}/status`, data),
};

// Users API
export const usersAPI = {
  getPublicProfile: (username) => api.get(`/users/${username}`),
};

// AI API
export const aiAPI = {
  search: (query) => api.post('/ai/search', { query }),
};

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (bookId) => api.post(`/wishlist/${bookId}`),
  removeFromWishlist: (bookId) => api.delete(`/wishlist/${bookId}`),
  checkWishlist: (bookId) => api.get(`/wishlist/check/${bookId}`),
};

// Google Books API
export const googleBooksAPI = {
  searchByISBN: (isbn) => 
    fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
      .then(res => res.json()),
  searchByTitle: (query) => 
    fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&langRestrict=hu&maxResults=5`)
      .then(res => res.json()),
};

// Book collection API
export const bookCollectionAPI = {
  getCollection: () => api.get('/bookcollection'),
  addToCollection: (data) => api.post('/bookcollection', data),
  removeFromCollection: (id) => api.delete(`/bookcollection/${id}`),
  checkCollection: (googleBooksId) => api.get(`/bookcollection/check/${googleBooksId}`),
};

export default api;