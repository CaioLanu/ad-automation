import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Clock3,
  FileBarChart,
  Fingerprint,
  LayoutDashboard,
  LogOut,
  ServerCog,
  Settings,
  ShieldCheck,
  Users,
  UserCog,
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
import { cn } from '../../lib/utils';
import { AdUsersWorkspace } from './AdUsersWorkspace';
import { PageHeader, StatCard, StatusBadge } from './dashboard-primitives';

type DashboardShellProps = {
  session: AuthSession;
  busy?: boolean;
  onLogout: () => Promise<void>;
  theme: ThemeMode;
  onToggleTheme: () => void;
};

const sections = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'usuarios-ad', label: 'Usuários AD', icon: Users },
  { id: 'sei', label: 'SEI', icon: Fingerprint },
  { id: 'permissoes', label: 'Permissões', icon: ShieldCheck },
  { id: 'relatorios', label: 'Relatórios', icon: FileBarChart },
  { id: 'configuracoes', label: 'Configurações', icon: Settings },
] as const;

type SectionId = (typeof sections)[number]['id'];

const getSectionFromHash = () => {
  if (typeof window === 'undefined') return 'dashboard' as SectionId;

  const value = window.location.hash.replace('#', '') as SectionId;
  return sections.some((section) => section.id === value) ? value : 'dashboard';
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

const formatRemaining = (expiresAt?: number) => {
  if (!expiresAt) return 'sem prazo explícito';

  const delta = expiresAt - Date.now();
  if (delta <= 0) return 'expirado';

  const minutes = Math.max(1, Math.round(delta / 60000));
  return `${minutes} min restantes`;
};

export const DashboardShell = ({ session, busy, onLogout, theme, onToggleTheme }: DashboardShellProps) => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const [activeSection, setActiveSection] = useState<SectionId>(() => getSectionFromHash());

  useEffect(() => {
    const onHashChange = () => setActiveSection(getSectionFromHash());

    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const jumpToSection = (section: SectionId) => {
    setActiveSection(section);

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', `#${section}`);
    }
  };

  const activeSectionMeta = sections.find((section) => section.id === activeSection) ?? sections[0];

  const metrics = useMemo(
    () => [
      { label: 'Operador', value: session.user.name, hint: session.user.rg, icon: UserCog, tone: 'brand' as const },
      { label: 'Permissão', value: session.user.permission, hint: 'Permissão validada no JWT', icon: ShieldCheck, tone: 'success' as const },
      { label: 'Expiração', value: formatExpiry(session.expiresAt), hint: formatRemaining(session.expiresAt), icon: Clock3, tone: 'warning' as const },
      { label: 'API ativa', value: apiUrl.replace(/^https?:\/\//, ''), hint: 'Fonte real de dados', icon: ServerCog, tone: 'default' as const },
    ],
    [apiUrl, session.expiresAt, session.user.name, session.user.permission, session.user.rg],
  );

  const sessionRows = [
    ['Nome', session.user.name, 'VERIFICADO'],
    ['CPF', '***.***.***-**', 'MASCARADO'],
    ['E-mail institucional', 'servidor@orgao.gov.br', 'GOV.BR'],
    ['Permissão', session.user.permission, 'AUTORIZADA'],
    ['API', apiUrl, 'BACKEND'],
  ] as const;

  const renderSection = () => {
    switch (activeSection) {
      case 'usuarios-ad':
        return <AdUsersWorkspace session={session} />;
      case 'sei':
        return <SeiTasksWorkspace session={session} />;
      case 'permissoes':
        return (
          <section id="permissoes" className="scroll-mt-6 space-y-4">
            <PageHeader
              eyebrow="Permissões"
              title="Controle rígido de acesso"
              description="A interface continua pública apenas para o que a sessão já autorizou; o backend mantém a regra final para as tabelas AD e filas SEI."
            />

            <div className="grid gap-4 xl:grid-cols-2">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Barreiras de acesso</CardTitle>
                  <CardDescription>O shell só abre após autenticação válida e permissão administrativa.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert variant="brand" title="Backend como fonte de verdade" description="Nenhum dado AD é mockado ou acessado diretamente no frontend." />
                  <Alert variant="success" title="Sessão restaurada" description="Tokens e permissões são validados antes de renderizar o painel." />
                </CardContent>
              </Card>

              <Card variant="panel">
                <CardHeader>
                  <CardTitle>Matriz operacional</CardTitle>
                  <CardDescription>Resumo dos módulos e da intenção de uso.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    ['Usuários AD', 'CRUD autorizado via /ad/users'],
                    ['SEI', 'Importação e edição de tarefas'],
                    ['Relatórios', 'Leitura consolidada'],
                    ['Configurações', 'Tema, sessão e runtime'],
                  ].map(([label, description]) => (
                    <div key={label} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4">
                      <div>
                        <div className="font-medium text-foreground">{label}</div>
                        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                      </div>
                      <StatusBadge label="Autorizado" tone="success" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        );
      case 'relatorios':
        return (
          <section id="relatorios" className="scroll-mt-6 space-y-4">
            <PageHeader
              eyebrow="Relatórios"
              title="Painel de leitura e auditoria"
              description="Estrutura pronta para consolidar métricas, auditoria e exportações do produto sem esconder o backend real."
            />

            <div className="grid gap-4 lg:grid-cols-3">
              {[
                ['Atividade', 'Fluxo de uso e ações recentes'],
                ['Saúde', 'Status do backend e da sessão'],
                ['Cobertura', 'Volume de módulos e pendências'],
              ].map(([title, description]) => (
                <Card key={title} variant="interactive">
                  <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>Área reservada para gráficos, exportação e auditoria detalhada.</p>
                    <StatusBadge label="Pronto para integrar" tone="brand" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        );
      case 'configuracoes':
        return (
          <section id="configuracoes" className="scroll-mt-6 space-y-4">
            <PageHeader
              eyebrow="Configurações"
              title="Sessão, tema e ambiente"
              description="Mantém o foco nas regras reais do app: autenticação, backend, tema e proteção administrativa."
            />

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card variant="elevated">
                <CardHeader>
                  <CardTitle>Ambiente atual</CardTitle>
                  <CardDescription>Detalhes técnicos usados pela interface.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <span className="text-muted-foreground">Tema</span>
                    <StatusBadge label={theme === 'dark' ? 'Alto contraste' : 'Modo claro'} tone="secondary" />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <span className="text-muted-foreground">API</span>
                    <span className="font-mono text-xs text-foreground">{apiUrl}</span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border bg-background p-4">
                    <span className="text-muted-foreground">Sessão</span>
                    <StatusBadge label={session.expiresAt ? 'Expira em breve' : 'Sem expiração'} tone="warning" />
                  </div>
                </CardContent>
              </Card>

              <Card variant="panel">
                <CardHeader>
                  <CardTitle>Regras do shell</CardTitle>
                  <CardDescription>O comportamento visual não altera as proteções do produto.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert variant="brand" title="Logout real" description="O encerramento local continua sincronizado com o backend." />
                  <Alert variant="success" title="Tema persistido" description="A escolha visual é salva no navegador sem afetar a sessão." />
                </CardContent>
              </Card>
            </div>
          </section>
        );
      default:
        return (
          <section id="dashboard" className="scroll-mt-6 space-y-5">
            <PageHeader
              eyebrow="Dashboard"
              title="Operações administrativas"
              description="Uma interface mais densa e institucional, mas ainda ancorada nos mesmos tokens, sessões e APIs reais."
              actions={
                <>
                  <Button variant="secondary" onClick={() => jumpToSection('usuarios-ad')}>
                    <Users className="h-4 w-4" />
                    Abrir usuários AD
                  </Button>
                  <Button variant="outline" onClick={() => jumpToSection('sei')}>
                    <Fingerprint className="h-4 w-4" />
                    Abrir SEI
                  </Button>
                </>
              }
            />

            <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <Card variant="elevated" className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Fila de implantação</CardTitle>
                  <CardDescription>As próximas superfícies do produto continuam claras, mas agora com uma composição mais rica.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { title: 'Usuários AD', description: 'CRUD real consumindo /ad/users.', tone: 'success' as const },
                    { title: 'SEI', description: 'Importação, edição e validação da fila atual.', tone: 'brand' as const },
                    { title: 'Relatórios', description: 'Resumo operacional e auditoria.', tone: 'warning' as const },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start justify-between gap-4 rounded-lg border border-border bg-background p-4">
                      <div>
                        <div className="font-display text-lg font-semibold text-foreground">{item.title}</div>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.description}</p>
                      </div>
                      <StatusBadge label="Pronto" tone={item.tone} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card variant="panel">
                <CardHeader>
                  <CardTitle>Proteções ativas</CardTitle>
                  <CardDescription>Regras que não foram alteradas pelo redesenho visual.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Alert variant="brand" title="Backend autoriza os dados" description="O frontend só apresenta e edita registros via API autorizada." />
                  <Alert variant="success" title="Sessão validada" description="O shell continua dependente da restauração e logout existentes." />
                </CardContent>
              </Card>
            </div>

            <Card variant="panel">
              <CardHeader>
                <CardTitle>Registro da sessão</CardTitle>
                <CardDescription>Valores derivados do token atual e da configuração runtime.</CardDescription>
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
                        <tr key={label} className="transition-colors odd:bg-muted/40 hover:bg-muted">
                          <th scope="row" className="px-4 py-4 font-medium text-muted-foreground">{label}</th>
                          <td className="max-w-0 truncate px-4 py-4 font-mono text-foreground tabular">{value}</td>
                          <td className="px-4 py-4">
                            <StatusBadge label={status} tone={status === 'AUTORIZADA' || status === 'VERIFICADO' ? 'success' : 'secondary'} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </section>
        );
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_hsl(var(--primary)/0.12),_transparent_32%),radial-gradient(circle_at_top_right,_hsl(var(--warning)/0.08),_transparent_28%),linear-gradient(to_bottom,_transparent,_hsl(var(--background))_50%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[linear-gradient(to_bottom,_hsl(var(--surface-subtle)/0.8),_transparent)] opacity-80" />

      <GovIdentityBar theme={theme} onToggleTheme={onToggleTheme} subtitle="Painel institucional com controles administrativos e fila SEI" />

      <div className="mx-auto grid max-w-[92rem] gap-5 px-4 py-4 sm:px-6 lg:px-8 xl:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-border bg-surface/85 p-4 shadow-sm backdrop-blur xl:sticky xl:top-4 xl:min-h-[calc(100vh-7rem)]">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border bg-background p-2 shadow-sm">
              <img src={logo} alt="Logomarca PP" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="font-display text-lg font-semibold text-foreground">AD Automation</div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Central Administrativa</div>
            </div>
          </div>

          <nav className="mt-5 space-y-1.5" aria-label="Navegação principal">
            {sections.map(({ label, icon: Icon, id }) => {
              const active = activeSection === id;

              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    jumpToSection(id);
                  }}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition-colors',
                    active
                      ? 'border-primary/30 bg-primary/10 text-foreground shadow-sm'
                      : 'border-transparent text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', active ? 'text-primary' : 'text-muted-foreground')} aria-hidden="true" />
                  <span className="truncate">{label}</span>
                </a>
              );
            })}
          </nav>

          <div className="mt-5 space-y-3 rounded-xl border border-border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />
              Sessão validada
            </div>
            <p className="text-sm leading-6 text-muted-foreground">O acesso às tabelas AD continua protegido exclusivamente no backend.</p>
          </div>

          <div className="mt-3 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
            <div className="flex items-center justify-between gap-3">
              <span>API</span>
              <span className="font-mono text-xs text-foreground">{apiUrl}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span>Token</span>
              <StatusBadge label={session.expiresAt ? 'Ativo' : 'Indefinido'} tone="success" />
            </div>
          </div>
        </aside>

        <section className="space-y-5">
          <Card variant="panel" className="overflow-hidden">
            <CardContent className="relative p-6 sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_hsl(var(--primary)/0.1),_transparent_38%)]" />
              <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                <div className="max-w-3xl space-y-4">
                  <Badge variant="brand" className="w-fit">Command center</Badge>
                  <div className="space-y-3">
                    <h1 className="font-display text-4xl font-bold tracking-[-0.04em] text-balance text-foreground sm:text-5xl">
                      Interface administrativa mais viva, sem perder o controle real.
                    </h1>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                      O shell agora assume uma linguagem visual mais completa, mas continua preso às mesmas garantias: sessão restaurada, logout real, tema persistido e API do backend como fonte única.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => jumpToSection('usuarios-ad')}>
                      <Users className="h-4 w-4" />
                      Usuários AD
                    </Button>
                    <Button variant="outline" onClick={() => jumpToSection('sei')}>
                      <Fingerprint className="h-4 w-4" />
                      SEI
                    </Button>
                    <Button variant="outline" onClick={onLogout} disabled={busy}>
                      <LogOut className="h-4 w-4" />
                      {busy ? 'Encerrando…' : 'Sair'}
                    </Button>
                  </div>
                </div>

                <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:w-[24rem] xl:grid-cols-1">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Seção ativa</div>
                      <div className="mt-1 font-display text-lg font-semibold text-foreground">{activeSectionMeta.label}</div>
                    </div>
                    <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 shadow-sm">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Expiração</div>
                      <div className="mt-1 font-display text-lg font-semibold text-foreground">{formatExpiry(session.expiresAt)}</div>
                    </div>
                    <Clock3 className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="grid gap-4 xl:grid-cols-4" aria-label="Resumo da sessão">
            {metrics.map(({ label, value, hint, icon, tone }) => (
              <StatCard key={label} label={label} value={value} hint={hint} icon={icon} tone={tone} />
            ))}
          </section>

          <nav className="flex gap-2 overflow-x-auto pb-1" aria-label="Seções internas">
            {sections.map(({ id, label, icon: Icon }) => {
              const active = id === activeSection;

              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    jumpToSection(id);
                  }}
                  className={cn(
                    'inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors',
                    active ? 'border-primary/30 bg-primary text-primary-foreground shadow-sm' : 'border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {label}
                </a>
              );
            })}
          </nav>

          <div className="animate-fade-up">
            {renderSection()}
          </div>
        </section>
      </div>
    </main>
  );
};
