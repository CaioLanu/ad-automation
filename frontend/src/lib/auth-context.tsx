import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ApiError, loginRequest, logoutRequest } from '@/lib/api';
import { ADMIN_DENIED_MESSAGE, createSessionFromTokens, restoreSession, signOutLocally } from '@/lib/auth';
import type { AuthSession } from '@/lib/storage';
import { applyTheme, getInitialTheme, persistTheme, type ThemeMode } from '@/lib/theme';

type ViewState = 'booting' | 'signed-out' | 'signed-in';

type AuthContextValue = {
  view: ViewState;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
  theme: ThemeMode;
  login: (rg: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  toggleTheme: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewState>('booting');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    const restored = restoreSession();
    if (restored.session) {
      setSession(restored.session);
      setView('signed-in');
      setError(null);
    } else {
      setSession(null);
      setView('signed-out');
      if (restored.error) setError(restored.error);
    }
  }, []);

  const login = async (rg: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await loginRequest(rg, password);
      const next = createSessionFromTokens(response.accessToken, response.refreshToken);

      if ('error' in next) {
        setSession(null);
        setView('signed-out');
        setError(next.error ?? ADMIN_DENIED_MESSAGE);
        return;
      }

      setSession(next.session);
      setView('signed-in');
      setError(null);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Não foi possível entrar. Verifique suas credenciais.';
      setError(message);
      setSession(null);
      setView('signed-out');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!session) return;

    setLoading(true);
    try {
      await logoutRequest(session.accessToken, session.refreshToken);
    } catch {
      // A sessão local é encerrada mesmo se o backend não responder.
    } finally {
      signOutLocally();
      setSession(null);
      setView('signed-out');
      setLoading(false);
    }
  };

  const value = useMemo<AuthContextValue>(
    () => ({
      view,
      session,
      loading,
      error,
      theme,
      login,
      logout,
      toggleTheme: () => setTheme((current) => (current === 'dark' ? 'light' : 'dark')),
    }),
    [view, session, loading, error, theme],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
