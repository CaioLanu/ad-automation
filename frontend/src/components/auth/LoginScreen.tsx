import { useState, type FormEvent } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { InstitutionalBar } from '../app/InstitutionalBar';
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

const benefits = [
  'Criação automática de usuários',
  'Sincronização com boletins internos',
  'Atualização automática de grupos de segurança',
  'Maior segurança e padronização dos processos',
  'Alteração de lotações e permissões',
  'Gestão de pastas e recursos compartilhados',
  'Auditoria e histórico de alterações',
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
    <main className="app-glass-shell relative min-h-screen overflow-hidden text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(255,255,255,0.78),transparent_20%),radial-gradient(circle_at_88%_8%,rgba(96,165,250,0.22),transparent_24%),radial-gradient(circle_at_82%_78%,rgba(191,219,254,0.32),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.72),rgba(248,251,255,0.18))]"
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(255,255,255,0.82),rgba(255,255,255,0))]" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <InstitutionalBar theme={theme} onToggleTheme={onToggleTheme} className="sticky top-3 z-30 animate-fade-up" />

        <section className="grid flex-1 items-center gap-6 py-6 lg:grid-cols-[minmax(340px,420px)_1fr] lg:gap-8 lg:py-10">
          <Card variant="panel" className="glass-card animate-fade-up border-blue-100/70 bg-white/80 shadow-[0_24px_70px_-50px_rgba(15,23,42,0.45)]">
            <CardHeader className="border-b border-blue-100/60 bg-gradient-to-b from-white/90 to-white/40 pb-5">
              <div className="inline-flex w-fit items-center rounded-md border border-slate-200 bg-white/85 px-3 py-2 text-slate-800 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.28em]">Acesso restrito</p>
              </div>
              <CardTitle className="text-2xl sm:text-[2rem]">Entrar no painel</CardTitle>
              <CardDescription className="text-pretty text-sm leading-6 text-slate-600">
                Este sistema é restrito, apenas administradores da rede possuem acesso
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form className="space-y-4" onSubmit={handleSubmit} aria-busy={loading}>
                <div className="space-y-2">
                  <Label htmlFor="rg" className="text-slate-700">
                    RG administrativo (ADMIN_RG)
                  </Label>
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
                    className="border-blue-100 bg-white/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] focus-visible:border-blue-400 focus-visible:ring-blue-200"
                  />
                  <p className="text-xs leading-5 text-slate-500">Deve corresponder ao valor de ADMIN_RG configurado em backend/.env.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-700">
                    Senha
                  </Label>
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
                      className="border-blue-100 bg-white/90 pr-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] focus-visible:border-blue-400 focus-visible:ring-blue-200"
                    />
                    <button
                      type="button"
                      className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-slate-500 transition-colors hover:bg-blue-50 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
                      onClick={() => setShowPassword((next) => !next)}
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error ? <Alert variant="destructive" title="Acesso bloqueado" description={error} /> : null}

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-700 to-sky-600 text-white shadow-[0_18px_34px_-22px_rgba(37,99,235,0.75)] hover:from-blue-800 hover:to-sky-700"
                  size="lg"
                  disabled={loading}
                >
                  {loading ? 'Validando credenciais…' : 'Entrar'}
                  {!loading ? <ArrowRight className="h-4 w-4" aria-hidden="true" /> : null}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="border-t border-blue-100/70 bg-white/60 text-xs leading-6 text-slate-500">
              <span>Desenvolvido por Caio Lázaro.</span>
            </CardFooter>
          </Card>

          <div className="relative flex min-h-[560px] overflow-hidden rounded-[1.75rem] border border-blue-100/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.72),rgba(239,246,255,0.52))] p-6 shadow-[0_32px_88px_-54px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-8 lg:p-10">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(125,211,252,0.38),transparent_26%),radial-gradient(circle_at_84%_10%,rgba(191,219,254,0.42),transparent_26%),radial-gradient(circle_at_78%_80%,rgba(96,165,250,0.18),transparent_22%)]" />
            <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.38),transparent_30%,rgba(255,255,255,0.1))]" />

            <div className="relative mx-auto flex w-full max-w-4xl flex-col justify-center space-y-7">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-blue-100 bg-white/75 shadow-sm backdrop-blur">
                  <img src={logo} alt="Brasão institucional" className="h-10 w-10 object-contain" />
                </div>
                <div>
                  <p className="text-[0.64rem] font-bold uppercase tracking-[0.46em] text-slate-500">Portal Administrativo</p>
                  <p className="mt-1 text-sm text-slate-500">Facilitando sua Gestão</p>
                </div>
              </div>

              <div className="space-y-5">
                <h2 className="text-balance font-display text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                  Gestão Inteligente de Redes Compartilhadas
                </h2>

                <p className="text-pretty text-base leading-7 text-slate-600 sm:text-lg">
                  Automatize a administração da sua rede interna com segurança e eficiência.
                </p>

                <p className="max-w-3xl text-pretty text-base leading-8 text-slate-600">
                  Crie, altere e gerencie usuários de forma centralizada, sincronizando automaticamente as movimentações publicadas no boletim interno do seu órgão. Mantenha lotações, permissões, grupos de acesso e recursos compartilhados sempre atualizados, eliminando tarefas manuais e reduzindo inconsistências.
                </p>
              </div>

              <div className="glass-card rounded-[1.5rem] border-blue-100/70 bg-white/58 p-5 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.45)] sm:p-6">
                <p className="font-display text-lg font-semibold text-slate-900">Principais benefícios:</p>
                <div className="mt-4 grid gap-x-10 gap-y-3 text-sm text-slate-600 sm:grid-cols-2">
                  {benefits.map((benefit) => (
                    <div key={benefit} className="flex items-center gap-3">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};
