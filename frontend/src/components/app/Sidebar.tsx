import { Link, useRouterState } from '@tanstack/react-router';
import { BookOpen, Building2, FileBarChart, LayoutDashboard, ListChecks, RefreshCcw, Settings, TableProperties } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const nav: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/app/permissoes', label: 'BI Diário', icon: TableProperties },
  { to: '/app/filas', label: 'Gestão Active Directory', icon: ListChecks },
  { to: '/app/sei', label: 'Gestão SEI', icon: RefreshCcw },
  { to: '/app/relatorios', label: 'Relatórios', icon: FileBarChart },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/app/ajuda', label: 'Ajuda', icon: BookOpen },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = useRouterState({ select: (s: { location: { pathname: string } }) => s.location.pathname });

  return (
    <aside className={cn(mobile ? 'glass-panel flex h-full w-full flex-col rounded-none border-0 shadow-none' : 'glass-panel hidden md:sticky md:top-[6.75rem] md:flex md:h-[calc(100vh-7.5rem)] md:w-52 md:flex-col md:rounded-[1.5rem]')}>
      <div className="flex h-14 items-center gap-2.5 border-b border-white/35 px-3.5">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-primary/15 bg-background/75 text-primary shadow-sm shadow-primary/10">
          <Building2 className="h-3.5 w-3.5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-[0.92rem] font-bold leading-tight">AD Automation</p>
          <p className="truncate text-[9px] font-bold uppercase tracking-[0.26em] text-muted-foreground">Central Administrativa</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-1.5">
        <p className="px-2.5 pb-1 pt-2.5 text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">Operação</p>
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'group flex min-h-10 items-center gap-2 rounded-xl border px-3 py-2 text-[0.92rem] transition-all duration-200',
                    active
                      ? 'border-primary/20 bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground shadow-md shadow-primary/15'
                      : 'border-white/40 bg-background/42 text-muted-foreground hover:border-primary/15 hover:bg-background/72 hover:text-foreground',
                  )}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:scale-105" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-white/35 px-3 py-2 text-[10px] text-muted-foreground">v1.0 · Ambiente Homologação</div>
    </aside>
  );
}
