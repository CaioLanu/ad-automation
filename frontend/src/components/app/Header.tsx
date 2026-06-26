import { Link, useRouterState } from '@tanstack/react-router';
import { Bell, LogOut, Menu, Moon, Search, Sun, UserCog } from 'lucide-react';
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
  '/app/usuarios': 'Usuários',
  '/app/permissoes': 'Permissões',
  '/app/filas': 'Gestão Active Directory',
  '/app/sei': 'Gestão SEI',
  '/app/relatorios': 'Relatórios',
  '/app/configuracoes': 'Configurações',
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
  const { session, loading, logout, theme, toggleTheme } = useAuth();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur md:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Abrir menu">
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar mobile />
        </SheetContent>
      </Sheet>

      <h2 className="hidden truncate text-sm font-semibold text-foreground sm:block">{title}</h2>

      <div className="relative ml-auto hidden w-full max-w-sm sm:block">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar usuários, RG ou grupos…" className="h-9 pl-8 text-sm" />
      </div>

      <Button variant="ghost" size="icon" className="shrink-0" aria-label="Notificações">
        <Bell className="h-4 w-4" />
      </Button>

      <Button variant="ghost" size="icon" className="shrink-0" onClick={toggleTheme} aria-label="Alternar tema">
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="shrink-0 rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" aria-label="Menu da conta">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-muted text-xs font-semibold">{initials(session?.user.name)}</AvatarFallback>
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
