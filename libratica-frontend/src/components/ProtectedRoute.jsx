import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Betöltés közben
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Ha nincs bejelentkezve
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Ha be van jelentkezve, jelenítse meg az oldalt
  return children;
};

export default ProtectedRoute;