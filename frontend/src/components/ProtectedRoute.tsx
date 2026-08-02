import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  // Jab tak auth load na ho, tab tak blank content ke bajay loader dikhate hain.
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-slate-300">
        Loading VaultX...
      </div>
    );
  }

  if (!isAuthenticated) {
    // Token valid nahi hai to user ko login page pe bhej dete hain.
    return <Navigate to="/login" replace />;
  }

  return children;
}
