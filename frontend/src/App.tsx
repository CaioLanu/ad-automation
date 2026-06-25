import { useEffect, useState } from 'react';
import { LoginScreen } from './components/auth/LoginScreen';
import { DashboardShell } from './components/dashboard/DashboardShell';
import { loginRequest, logoutRequest, ApiError } from './lib/api';
import { createSessionFromTokens, restoreSession, signOutLocally, ADMIN_DENIED_MESSAGE } from './lib/auth';
import type { AuthSession } from './lib/storage';
import { applyTheme, getInitialTheme, persistTheme, type ThemeMode } from './lib/theme';

type ViewState = 'booting' | 'signed-out' | 'signed-in';

export default function App() {
  const [view, setView] = useState<ViewState>('booting');
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => getInitialTheme());

  const shellMode = view === 'signed-in' && session !== null;

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
      setView('signed-out');
      if (restored.error) setError(restored.error);
    }
  }, []);

  const handleLogin = async (rg: string, password: string) => {
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
      setView('signed-out');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
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

  const handleToggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  if (view === 'booting') {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
        <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground shadow-sm">
            <div className="h-3 w-3 rounded-full bg-current" />
          </div>
          <p className="font-display text-xl text-foreground">Preparando a sessão…</p>
          <p className="mt-2 text-sm text-muted-foreground">Validando tokens, permissão e estado restaurado.</p>
        </div>
      </div>
    );
  }

  if (shellMode && session) {
    return <DashboardShell session={session} busy={loading} onLogout={handleLogout} theme={theme} onToggleTheme={handleToggleTheme} />;
  }

  return <LoginScreen loading={loading} error={error} onSubmit={handleLogin} theme={theme} onToggleTheme={handleToggleTheme} />;
}
