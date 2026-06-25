import {
  Activity,
  CircleCheckBig,
  Clock3,
  Fingerprint,
  Gauge,
  Layers3,
  LogOut,
  Search,
  ServerCog,
  ShieldCheck,
  UserCog,
  Users,
} from 'lucide-react';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { SeiTasksWorkspace } from '../sei/SeiTasksWorkspace';
import type { AuthSession } from '../../lib/storage';
import { GovIdentityBar } from '../layout/GovIdentityBar';
import logo from '../../assets/Logomarca_PP.png';
import type { ThemeMode } from '../../lib/theme';

type DashboardShellProps = {
  session: AuthSession;
  busy?: boolean;
  onLogout: () => Promise<void>;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

const formatExpiry = (expiresAt?: number) => {
  if (!expiresAt) return '15 min';
  return new Intl.DateTimeFormat('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  }).format(expiresAt);
};

const navItems = [
  { label: 'Command', icon: Gauge, href: '#command', active: true },
  { label: 'Usuários', icon: Users, href: '#users', active: false },
  { label: 'SEI', icon: Fingerprint, href: '#sei', active: false },
  { label: 'Diretórios', icon: Layers3, href: '#directories', active: false },
  { label: 'Auditoria', icon: Activity, href: '#audit', active: false },
  { label: 'Infra', icon: ServerCog, href: '#infra', active: false },
];

export const DashboardShell = ({ session, busy, onLogout, theme, onToggleTheme }: DashboardShellProps) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const metrics = [
    { label: 'Operador', value: session.user.name, hint: session.user.rg, icon: UserCog, tone: 'brand' as const },
    { label: 'Permissão', value: session.user.permission, hint: 'Permissão validada no JWT', icon: ShieldCheck, tone: 'success' as const },
    { label: 'Expiração', value: formatExpiry(session.expiresAt), hint: 'Janela do access token', icon: Clock3, tone: 'warning' as const },
  ];

  const sessionRows = [
    ['Nome', session.user.name, 'VERIFICADO'],
    ['CPF', '***.***.***-**', 'MASCARADO'],
    ['E-mail institucional', 'servidor@orgao.gov.br', 'GOV.BR'],
    ['Permissão', session.user.permission, 'AUTORIZADA'],
    ['API', apiUrl, 'BACKEND'],
  ] as const;

  return (
    <main className="min-h-screen bg-background">
      <GovIdentityBar theme={theme} onToggleTheme={onToggleTheme} subtitle="Painel institucional com controles administrativos e fila SEI" />

      <div className="mx-auto grid max-w-[92rem] gap-5 px-4 py-4 sm:px-6 lg:px-8 lg:grid-cols-[18rem_1fr]">
        <aside className="h-fit rounded-lg border border-border bg-surface p-4 shadow-sm lg:sticky lg:top-4 lg:min-h-[calc(100vh-7rem)]">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-12 w-12 items-center justify-center border border-border bg-background p-2">
              <img src={logo} alt="Logomarca PP" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-foreground">AD Automation</div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Painel institucional</div>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:grid lg:overflow-visible lg:pb-0" aria-label="Navegação principal">
            {navItems.map(({ label, icon: Icon, href, active }) => (
              <a
                key={label}
                href={href}
                className="flex min-h-11 shrink-0 items-center gap-3 rounded-md border border-transparent px-3 text-left text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 data-[active=true]:border-border data-[active=true]:bg-background"
                data-active={active}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </a>
            ))}
          </nav>

          <div className="mt-6 rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground shadow-sm">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <CircleCheckBig className="h-4 w-4" aria-hidden="true" />
              Permissão verificada
            </div>
            <p className="mt-2">O acesso às tabelas AD continua protegido exclusivamente no backend.</p>
          </div>
        </aside>

        <section className="space-y-5">
          <header id="command" className="scroll-mt-6 rounded-lg border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <Badge variant="brand" className="w-fit">Command center</Badge>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-[-0.03em] text-balance text-foreground sm:text-5xl">Operações administrativas</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">Shell preparado para CRUD de usuários, trilha de auditoria e estados operacionais do AD fictício.</p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button variant="command" className="justify-start sm:min-w-72">
                  <Search className="h-4 w-4" aria-hidden="true" />
                  Pesquisar no painel, SEI ou auditoria…
                </Button>
                <Button variant="secondary" onClick={onLogout} disabled={busy}>
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  {busy ? 'Encerrando…' : 'Sair'}
                </Button>
              </div>
            </div>
          </header>

          <section className="grid gap-4 xl:grid-cols-3" aria-label="Resumo da sessão">
            {metrics.map(({ label, value, hint, icon: Icon, tone }) => (
              <Card key={label} variant="interactive" className="group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <CardDescription>{label}</CardDescription>
                      <CardTitle className="mt-2 truncate text-2xl">{value}</CardTitle>
                    </div>
                    <Badge variant={tone}><Icon className="h-3.5 w-3.5" aria-hidden="true" />ok</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">{hint}</CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
            <Card variant="elevated">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Fila de produção</CardTitle>
                    <CardDescription>Próximas superfícies para o slice de CRUD autenticado.</CardDescription>
                  </div>
                  <Badge variant="outline">roadmap UI</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { id: 'users', title: 'Usuários AD', description: 'Lista, filtros, criação, edição, ativação e remoção com confirmação.' },
                  { id: 'directories', title: 'Diretórios', description: 'Visão de grupos, unidades e metadados vinculados ao AD fictício.' },
                  { id: 'audit', title: 'Auditoria', description: 'Timeline por ação administrativa, ator, alvo, timestamp e resultado.' },
                ].map(({ id, title, description }) => (
                  <div id={id} key={id} className="scroll-mt-6 rounded-lg border border-border bg-background p-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                      <div>
                        <div className="font-display font-semibold text-foreground">{title}</div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="infra" variant="panel" className="scroll-mt-6">
              <CardHeader>
                <CardTitle>Guard rails</CardTitle>
                <CardDescription>Regras não negociáveis do produto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Alert variant="brand" title="Backend autoriza dados AD" description="O frontend nunca acessa as tabelas diretamente; ele só consome endpoints autorizados." />
                <Alert variant="success" title="Sessão autorizada" description="O shell só renderiza após permissão válida e sessão restaurada." />
              </CardContent>
            </Card>
          </section>

          <Card variant="panel">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Registro da sessão</CardTitle>
                  <CardDescription>Informações derivadas do token e da configuração runtime.</CardDescription>
                </div>
                <Badge variant="secondary">tabular</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto rounded-lg border border-border bg-background">
                <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
                  <caption className="sr-only">Dados da sessão administrativa atual</caption>
                  <thead className="border-b border-border bg-muted text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-bold">Campo</th>
                      <th scope="col" className="px-4 py-3 font-bold">Valor</th>
                      <th scope="col" className="px-4 py-3 font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/70">
                    {sessionRows.map(([label, value, status]) => (
                      <tr key={label} className="transition-colors odd:bg-muted/50 hover:bg-muted">
                        <th scope="row" className="px-4 py-4 font-medium text-muted-foreground">{label}</th>
                        <td className="max-w-0 truncate px-4 py-4 font-mono text-foreground tabular">{value}</td>
                        <td className="px-4 py-4">
                          <Badge variant={status === 'AUTORIZADA' || status === 'VERIFICADO' ? 'success' : 'secondary'} className="w-fit">
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <SeiTasksWorkspace session={session} />
        </section>
      </div>
    </main>
  );
};
