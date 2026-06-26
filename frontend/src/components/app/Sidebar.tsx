import { Link, useRouterState } from '@tanstack/react-router';
import { Building2, FileBarChart, LayoutDashboard, ListChecks, RefreshCcw, Settings, ShieldCheck, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const nav: NavItem[] = [
  { to: '/app', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { to: '/app/usuarios', label: 'Usuários', icon: Users },
  { to: '/app/permissoes', label: 'Permissões', icon: ShieldCheck },
  { to: '/app/filas', label: 'Gestão Active Directory', icon: ListChecks },
  { to: '/app/sei', label: 'Gestão SEI', icon: RefreshCcw },
  { to: '/app/relatorios', label: 'Relatórios', icon: FileBarChart },
  { to: '/app/configuracoes', label: 'Configurações', icon: Settings },
];

export function Sidebar({ mobile = false }: { mobile?: boolean }) {
  const pathname = useRouterState({ select: (s: { location: { pathname: string } }) => s.location.pathname });

  return (
    <aside className={cn(mobile ? 'flex h-full w-full flex-col bg-card' : 'hidden md:flex md:w-60 md:flex-col md:border-r md:border-border md:bg-card')}>
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-foreground text-background">
          <Building2 className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">Central Admin</p>
          <p className="truncate text-[11px] text-muted-foreground">Gestão Institucional</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-2">
        <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Operação</p>
        <ul className="space-y-0.5">
          {nav.map((item) => {
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    'flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors',
                    active ? 'bg-accent text-foreground font-medium' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="border-t border-border p-3 text-[11px] text-muted-foreground">v1.0 · Ambiente Homologação</div>
    </aside>
  );
}
