import { Link, useRouterState } from '@tanstack/react-router';
import { Bell, LogOut, Menu, Search, UserCog } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from './Sidebar';

const TITLES: Record<string, string> = {
  '/app': 'Dashboard',
  '/app/permissoes': 'BI Diário',
  '/app/filas': 'Gestão Active Directory',
  '/app/sei': 'Gestão SEI',
  '/app/relatorios': 'Relatórios',
  '/app/configuracoes': 'Configurações',
  '/app/ajuda': 'Ajuda',
};

const initials = (name?: string) =>
  (name ?? 'Admin')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'AD';

export function Header() {
  const pathname = useRouterState({ select: (s: { location: { pathname: string } }) => s.location.pathname });
  const title = TITLES[pathname] ?? 'Central Administrativa';
  const { session, loading, logout } = useAuth();

  return (
    <header className="glass-panel flex h-16 items-center gap-3 border-b border-white/35 bg-background/78 px-4 backdrop-blur md:rounded-[1.75rem] md:border md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full border border-white/30 bg-background/45 md:hidden" aria-label="Abrir menu">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 border-r border-white/30 bg-background/82 p-0 backdrop-blur-2xl">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      <div className="hidden min-w-0 sm:block">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-muted-foreground">Painel executivo</p>
        <h2 className="truncate text-sm font-semibold text-foreground">{title}</h2>
      </div>

      <div className="relative ml-auto hidden w-full max-w-sm sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar usuários, RG ou grupos…" className="h-10 rounded-full border-white/40 bg-background/62 pl-9 text-sm shadow-sm" />
      </div>

      <Button variant="ghost" size="icon" className="shrink-0 rounded-full border border-white/30 bg-background/45 shadow-sm" aria-label="Notificações">
        <Bell className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="shrink-0 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" aria-label="Menu da conta">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="border border-white/35 bg-gradient-to-br from-sky-100 to-cyan-200 text-xs font-semibold text-sky-950">{initials(session?.user.name)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span className="truncate text-sm font-semibold">{session?.user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{session?.user.permission}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to="/app/configuracoes">
              <UserCog className="mr-2 h-4 w-4" /> Minha conta
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} disabled={loading}>
            <LogOut className="mr-2 h-4 w-4" /> {loading ? 'Saindo…' : 'Sair'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
