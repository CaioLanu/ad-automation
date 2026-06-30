import type { LucideIcon } from 'lucide-react';
import { Building2, Database, FileBarChart, LayoutDashboard, ListChecks, RefreshCcw, Search, ShieldCheck, TableProperties, Upload, UserCog, Users } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

type ModuleCard = {
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  route: string;
};

const modules: ModuleCard[] = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Visão consolidada da operação administrativa com métricas em tempo real.',
    highlights: [
      'Total de usuários ativos e cadastrados',
      'Quantidade de grupos AD',
      'Usuários atualizados recentemente',
      'Acesso rápido ao gerenciamento de usuários',
    ],
    route: '/app',
  },
  {
    icon: TableProperties,
    title: 'BI Diário',
    description: 'Indicadores e relatórios diários para acompanhamento da operação.',
    highlights: [
      'Métricas de desempenho diárias',
      'Acompanhamento de indicadores',
      'Visualização de dados consolidados',
    ],
    route: '/app/permissoes',
  },
  {
    icon: Users,
    title: 'Usuários AD',
    description: 'Gerenciamento completo do Active Directory com interface moderna.',
    highlights: [
      'Cadastro manual de novos usuários',
      'Importação em lote via planilha XLSX',
      'Edição e inativação de usuários',
      'Busca por setor, nome, RG, CPF, cargo ou perfil',
    ],
    route: '/app/usuarios',
  },
  {
    icon: ListChecks,
    title: 'Gestão Active Directory',
    description: 'Administração de filas e grupos do Active Directory.',
    highlights: [
      'Gerenciamento de filas AD',
      'Controle de grupos e permissões',
      'Sincronização com o diretório',
    ],
    route: '/app/filas',
  },
  {
    icon: RefreshCcw,
    title: 'Gestão SEI',
    description: 'Integração com o Sistema Eletrônico de Informações.',
    highlights: [
      'Automação de processos SEI',
      'Sincronização de dados',
      'Gestão de protocolos e documentos',
    ],
    route: '/app/sei',
  },
  {
    icon: FileBarChart,
    title: 'Relatórios',
    description: 'Exportação de relatórios gerenciais em formato XLSX.',
    highlights: [
      'Relatórios de usuários AD',
      'Exportação para planilha Excel',
      'Dados filtrados por setor e perfil',
    ],
    route: '/app/relatorios',
  },
  {
    icon: UserCog,
    title: 'Configurações',
    description: 'Preferências da conta e configurações do sistema.',
    highlights: [
      'Informações da sua conta',
      'Configurações de perfil',
      'Preferências do sistema',
    ],
    route: '/app/configuracoes',
  },
];

function ModuleCardView({ icon: Icon, title, description, highlights, route }: ModuleCard) {
  return (
    <a href={route} className="group block">
      <Card variant="interactive" className="h-full">
        <CardHeader>
          <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/40 bg-background/55 text-primary shadow-sm backdrop-blur">
            <Icon className="h-4 w-4" />
          </div>
          <CardTitle className="mt-1 text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-primary/20 bg-primary/5 text-[9px] font-bold text-primary">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </a>
  );
}

const quickTips = [
  {
    icon: Search,
    title: 'Busca global',
    description: 'Use o campo de busca no topo para localizar usuários rapidamente por nome, RG, CPF ou setor.',
  },
  {
    icon: Upload,
    title: 'Importação em lote',
    description: 'Na página de Usuários, faça upload de uma planilha XLSX para cadastrar múltiplos usuários de uma só vez.',
  },
  {
    icon: ShieldCheck,
    title: 'Permissões de acesso',
    description: 'Apenas usuários com perfil ADMINISTRATORS têm acesso completo. O sistema valida toda ação no backend.',
  },
  {
    icon: Database,
    title: 'Dados persistentes',
    description: 'Todas as alterações são salvas no banco MySQL com auditoria. Nada é volátil.',
  },
];

export function HelpPage() {
  const { session } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Guia de Uso"
        description="Bem-vindo ao AD Automation! Explore os módulos, entenda as permissões e aprenda a utilizar o sistema administrativo."
        eyebrow="Central de ajuda"
      />

      {/* Sessão: boas-vindas e visão geral */}
      <Card variant="elevated">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle>Sobre o AD Automation</CardTitle>
              <CardDescription>
                Plataforma centralizada para gestão do Active Directory, automação SEI e relatórios gerenciais.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl border border-white/25 bg-background/45 p-4 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Conexão segura</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Autenticação via JWT com refresh token. Sessão persistente no navegador com proteção contra acesso não autorizado.
              </p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-background/45 p-4 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Interface moderna</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Design glassmorphism com tema claro/escuro, responsivo e otimizado para produtividade no dia a dia.
              </p>
            </div>
            <div className="rounded-2xl border border-white/25 bg-background/45 p-4 backdrop-blur">
              <p className="text-sm font-semibold text-foreground">Auditoria integrada</p>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Toda operação crítica é registrada com data, hora e identificação do operador para rastreabilidade completa.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessão: informações da conta atual */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/40 bg-background/55 text-primary shadow-sm backdrop-blur">
              <UserCog className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-lg">Sua sessão atual</CardTitle>
              <CardDescription>
                Você está autenticado como <strong className="text-foreground">{session?.user.name}</strong> com o perfil{' '}
                <strong className="text-foreground">{session?.user.permission}</strong>.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3 w-3" />
              {session?.user.permission === 'ADMINISTRATORS'
                ? 'Acesso total ao sistema'
                : 'Acesso limitado — algumas funcionalidades podem estar restritas'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-background/55 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {session?.user.rg}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Sessão: módulos do sistema */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">Módulos do sistema</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ModuleCardView {...modules[0]} />
          <ModuleCardView {...modules[1]} />
          <ModuleCardView {...modules[2]} />
          <ModuleCardView {...modules[3]} />
          <ModuleCardView {...modules[4]} />
          <ModuleCardView {...modules[5]} />
          <ModuleCardView {...modules[6]} />
        </div>
      </div>

      {/* Sessão: dicas rápidas */}
      <div>
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">Dicas rápidas</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickTips.map((tip) => (
            <Card key={tip.title} variant="interactive">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/40 bg-background/55 text-primary shadow-sm backdrop-blur">
                    <tip.icon className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-base">{tip.title}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">{tip.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
