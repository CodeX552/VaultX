import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export function AppLayout() {
  // Auth state ke hisaab se header me login ya logout actions dikh rahe hain.
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-lg font-semibold tracking-wide text-white">
            VaultX
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-300">
            {isAuthenticated ? (
              <>
                <span className="hidden text-slate-400 sm:inline">{user?.name}</span>
                <Link to="/dashboard" className="transition hover:text-white">
                  Dashboard
                </Link>
                <Link to="/sessions" className="transition hover:text-white">
                  Sessions
                </Link>
                <Link to="/threats" className="transition hover:text-red-400 text-red-500 font-semibold">
                  Threats
                </Link>
                <button onClick={logout} className="rounded-full bg-white/5 px-4 py-2 font-medium text-white transition hover:bg-white/10">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="transition hover:text-white">
                  Login
                </Link>
                <Link
                  to="/dashboard"
                  className="rounded-full bg-emerald-400 px-4 py-2 font-medium text-slate-950 transition hover:bg-emerald-300"
                >
                  Open Dashboard
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {/* Outlet ke through current page render hota hai. */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
