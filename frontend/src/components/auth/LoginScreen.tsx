import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, MoonStar, SunMedium } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import logo from '../../assets/Logomarca_PP.png';
import type { ThemeMode } from '../../lib/theme';

type LoginScreenProps = {
  loading: boolean;
  error?: string | null;
  onSubmit: (rg: string, password: string) => Promise<void>;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

export const LoginScreen = ({ loading, error, onSubmit, theme, onToggleTheme }: LoginScreenProps) => {
  const [rg, setRg] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(rg.trim(), password);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-muted/40 text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.72),_transparent_38%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.08),transparent_28%),radial-gradient(circle_at_20%_80%,rgba(59,130,246,0.08),transparent_24%)]"
      />

      <div className="relative flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md border border-border bg-background p-2 shadow-sm">
                <img src={logo} alt="Logomarca PP" className="h-full w-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-muted-foreground">Sistema Institucional</p>
                <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-foreground">Central Admin</h1>
                <p className="text-sm text-muted-foreground">Gestão Institucional</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              role="switch"
              aria-checked={theme === 'dark'}
              onClick={onToggleTheme}
              aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar alto contraste'}
              title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar alto contraste'}
              className="shrink-0"
            >
              {theme === 'dark' ? <SunMedium className="h-4 w-4" aria-hidden="true" /> : <MoonStar className="h-4 w-4" aria-hidden="true" />}
              <span>{theme === 'dark' ? 'Modo claro' : 'Alto contraste'}</span>
            </Button>
          </div>

          <Card variant="default" className="border-border/80 shadow-none">
            <CardHeader className="gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-600" aria-hidden="true" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">Acesso restrito</p>
              </div>
              <CardTitle>Entrar no painel</CardTitle>
              <CardDescription>
                Use o RG administrativo autorizado. A autenticação e a autorização permanecem no backend.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="rg">RG administrativo</Label>
                  <Input
                    id="rg"
                    type="text"
                    autoComplete="off"
                    inputMode="text"
                    value={rg}
                    onChange={(event) => setRg(event.target.value)}
                    placeholder="000000"
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="••••••••••••"
                      disabled={loading}
                      required
                      className="pr-12"
                    />
                    <button
                      type="button"
                      className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      onClick={() => setShowPassword((next) => !next)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error ? <Alert variant="destructive" title="Acesso bloqueado" description={error} /> : null}

                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? 'Validando credenciais…' : 'Entrar'}
                  {!loading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex items-center justify-between border-t border-border/70 text-xs leading-6 text-muted-foreground">
              <span>Login administrativo para AD fictício</span>
              <span>VITE_API_URL</span>
            </CardFooter>
          </Card>
        </div>
      </div>
    </main>
  );
};
