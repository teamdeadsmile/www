import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return null; // avoid flashing a redirect before /me resolves

  if (status === 'guest') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
