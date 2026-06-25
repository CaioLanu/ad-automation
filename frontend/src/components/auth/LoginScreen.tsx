import { useState, type FormEvent } from 'react';
import { ArrowRight, Eye, EyeOff, Fingerprint, LockKeyhole, Radar, ShieldCheck } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { GovIdentityBar } from '../layout/GovIdentityBar';
import logo from '../../assets/Logomarca_PP.png';
import type { ThemeMode } from '../../lib/theme';

type LoginScreenProps = {
  loading: boolean;
  error?: string | null;
  onSubmit: (rg: string, password: string) => Promise<void>;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

const trustSignals = [
  { icon: ShieldCheck, label: 'Permissão', value: 'ADMINISTRADOR' },
  { icon: Fingerprint, label: 'CPF', value: '***.***.***-**' },
  { icon: Radar, label: 'E-mail institucional', value: 'servidor@orgao.gov.br' },
];

export const LoginScreen = ({ loading, error, onSubmit, theme, onToggleTheme }: LoginScreenProps) => {
  const [rg, setRg] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(rg.trim(), password);
  };

  return (
    <main className="min-h-screen bg-background">
      <GovIdentityBar theme={theme} onToggleTheme={onToggleTheme} subtitle="Acesso institucional ao AD fictício e à fila SEI" />

      <div className="mx-auto grid min-h-[calc(100vh-4.5rem)] max-w-7xl items-center gap-6 px-4 py-6 sm:px-6 lg:px-8 xl:grid-cols-[1.08fr_0.92fr] xl:gap-8">
        <section className="space-y-6 rounded-lg border border-border bg-surface p-6 shadow-sm sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Badge variant="brand" className="w-fit">Acesso institucional</Badge>
            <span className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-emerald-700" />
              Alto contraste disponível
            </span>
          </div>

          <div className="grid gap-8 xl:grid-cols-[1fr_18rem] xl:items-end">
            <div className="space-y-8">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center border border-border bg-background p-2">
                    <img src={logo} alt="Logomarca PP" className="h-full w-full object-contain" />
                  </div>
                  <div>
                    <div className="text-xs font-bold uppercase tracking-[0.24em] text-muted-foreground">Portal administrativo</div>
                    <div className="text-sm text-muted-foreground">Ambiente corporativo do Governo Federal</div>
                  </div>
                </div>

                <h1 className="max-w-3xl text-balance font-display text-4xl font-bold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-6xl">
                  Interface institucional para operar o Active Directory fictício.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">
                  Acesso restrito a administradores, com validação no backend, tipografia forte, contraste alto e foco visível para leitura segura.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {['CPF mascarado', 'E-mail .gov.br', 'JWT', 'Auditável'].map((item) => (
                  <span key={item} className="rounded-md border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {trustSignals.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
                    <div className="mt-1 font-display text-xl font-semibold text-foreground">{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-muted text-foreground">
                      <LockKeyhole className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-display text-lg font-semibold text-foreground">Segurança no backend</div>
                      <p className="text-sm leading-6 text-muted-foreground">A tela organiza a sessão; autorização e persistência seguem no servidor.</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-md border border-border bg-muted text-foreground">
                      <Radar className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <div className="font-display text-lg font-semibold text-foreground">Permissões explícitas</div>
                      <p className="text-sm leading-6 text-muted-foreground">Somente usuários autorizados passam pelo login administrativo.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden rounded-lg border border-border bg-background p-4 shadow-sm xl:block">
              <div className="flex h-full flex-col justify-between rounded-md border border-border bg-surface p-5">
                <div className="space-y-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground shadow-sm">
                    <LockKeyhole className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="text-sm leading-7 text-muted-foreground">
                    A experiência mantém a sessão no cliente, mas a autorização de tabelas AD continua exclusivamente no backend.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Postura de segurança</div>
                    <div className="mt-2 font-display text-2xl font-semibold text-foreground">CPF + permissão</div>
                  </div>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
                    Sessão bloqueada antes do dashboard renderizar.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Card variant="elevated" className="animate-fade-up [animation-delay:90ms]">
          <CardHeader>
            <Badge variant="outline" className="w-fit">
              acesso restrito
            </Badge>
            <CardTitle>Entrar no painel</CardTitle>
            <CardDescription>
              Use o identificador administrativo autorizado. Contas sem permissão válida são bloqueadas e os tokens locais são removidos.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="space-y-5" onSubmit={handleSubmit} aria-busy={loading}>
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

          <CardFooter className="border-t border-border text-sm leading-6 text-muted-foreground">
            API configurada por variável de ambiente `VITE_API_URL`.
          </CardFooter>
        </Card>
      </div>
    </main>
  );
};
