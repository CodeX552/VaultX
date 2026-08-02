import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { apiClient } from '../services/api';
import { loginRequest, logoutRequest, refreshRequest, registerRequest } from '../services/authService';
import { getStoredAuth, setStoredAuth } from '../utils/storage';
import type { AuthUser } from '../types/auth';

interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // User aur token state yahan centralize ki gayi hai taaki har component access kar sake.
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Local storage se saved token uthake app ko reload ke baad bhi session jaisa feel dete hain.
    const storedAuth = getStoredAuth();
    if (storedAuth?.accessToken) {
      setAccessToken(storedAuth.accessToken);
      apiClient.defaults.headers.common.Authorization = `Bearer ${storedAuth.accessToken}`;
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Axios defaults me access token inject kar dete hain.
    if (accessToken) {
      apiClient.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    }
  }, [accessToken]);

  async function bootstrap() {
    // Existing token ho to refresh karke fresh session banta hai.
    const storedAuth = getStoredAuth();

    if (!storedAuth?.accessToken) {
      return;
    }

    try {
      apiClient.defaults.headers.common.Authorization = `Bearer ${storedAuth.accessToken}`;
      const refreshed = await refreshRequest();
      setUser(refreshed.user);
      setAccessToken(refreshed.accessToken);
      setStoredAuth({ accessToken: refreshed.accessToken });
    } catch {
      setUser(null);
      setAccessToken(null);
      setStoredAuth(null);
      delete apiClient.defaults.headers.common.Authorization;
    }
  }

  async function login(email: string, password: string) {
    // Login success par user aur token dono state me save karte hain.
    const response = await loginRequest({ email, password });
    setUser(response.user);
    setAccessToken(response.accessToken);
    setStoredAuth({ accessToken: response.accessToken });
    apiClient.defaults.headers.common.Authorization = `Bearer ${response.accessToken}`;
  }

  async function register(name: string, email: string, password: string) {
    // Register flow same pattern follow karta hai, bas naya account create hota hai.
    const response = await registerRequest({ name, email, password });
    setUser(response.user);
    setAccessToken(response.accessToken);
    setStoredAuth({ accessToken: response.accessToken });
    apiClient.defaults.headers.common.Authorization = `Bearer ${response.accessToken}`;
  }

  async function logout() {
    // Logout ke time backend session revoke aur local state clear hoti hai.
    await logoutRequest();
    setUser(null);
    setAccessToken(null);
    setStoredAuth(null);
    delete apiClient.defaults.headers.common.Authorization;
  }

  useEffect(() => {
    void bootstrap();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: Boolean(user && accessToken),
        isLoading,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  // Hook ko provider ke bahar use karna error deta hai.
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
