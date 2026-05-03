import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Skeleton from '../shared/Skeleton';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="container" style={{ paddingTop: '120px' }}>
        <Skeleton variant="text" width="60%" height={40} />
        <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <Skeleton variant="card" />
          <Skeleton variant="card" />
          <Skeleton variant="card" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
