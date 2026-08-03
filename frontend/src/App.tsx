import { Navigate, Route, Routes } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import SessionsPage from './pages/SessionsPage';
import ThreatDashboardPage from './pages/ThreatDashboardPage';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthProvider } from './hooks/useAuth';

export default function App() {
  return (
    // Pure app shell yahan set ho raha hai; auth provider sab routes ko context deta hai.
    <AuthProvider>
      <Routes>
        {/* Public aur protected routes ko alag rakha gaya hai. */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<LoginPage />} />
          <Route
            path="dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="sessions"
            element={
              <ProtectedRoute>
                <SessionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="threats"
            element={
              <ProtectedRoute>
                <ThreatDashboardPage />
              </ProtectedRoute>
            }
          />
        </Route>
        {/* Unknown path ko homepage pe bhej dete hain. */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
