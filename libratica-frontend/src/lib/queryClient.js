import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

export const queryKeys = {
  //Auth
  currentUser: ['currentUser'],
  
  //Books
  books: ['books'],
  book: (id) => ['books', id],
  booksWithListings: ['books', 'withListings'],
  
  //Listings
  listings: ['listings'],
  listing: (id) => ['listings', id],
  myListings: ['listings', 'my'],
  
  //Cart
  cart: ['cart'],
  
  //Orders
  purchases: ['orders', 'purchases'],
  sales: ['orders', 'sales'],
  order: (id) => ['orders', id],
  
  //Users
  userProfile: (username) => ['users', username],
  
  //Wishlist
  wishlist: ['wishlist'],
  wishlistCheck: (bookId) => ['wishlist', 'check', bookId],
  
  //Book Collection
  bookCollection: ['bookCollection'],
  
  //Recommendations
  recommendations: ['recommendations'],
  
  //Categories
  categories: ['categories'],
  
  //Events
  events: ['events'],
  event: (id) => ['events', id],
  myEvents: ['events', 'my'],
  
  //Reviews
  userReviews: (userId) => ['reviews', 'user', userId],
  orderReviews: (orderId) => ['reviews', 'order', orderId],
  
  //Admin
  adminStats: ['admin', 'stats'],
  adminUsers: ['admin', 'users'],
  adminListings: ['admin', 'listings'],
  adminEvents: ['admin', 'events'],
  reports: ['reports'],
};
