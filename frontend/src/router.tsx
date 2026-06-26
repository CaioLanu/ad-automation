import { createRootRoute, createRoute, createRouter, Link, Navigate, Outlet } from '@tanstack/react-router';
import { AppLayout } from '@/components/app/AppLayout';
import { BootScreen } from '@/components/app/BootScreen';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { useAuth } from '@/lib/auth-context';
import { DashboardPage } from '@/routes/DashboardPage';
import { PermissionsPage } from '@/routes/PermissionsPage';
import { QueuesPage } from '@/routes/QueuesPage';
import { ReportsPage } from '@/routes/ReportsPage';
import { SeiPage } from '@/routes/SeiPage';
import { SettingsPage } from '@/routes/SettingsPage';
import { UsersPage } from '@/routes/UsersPage';

function LoginRoute() {
  const { view, session, loading, error, login, theme, toggleTheme } = useAuth();

  if (view === 'booting') return <BootScreen />;
  if (session) return <Navigate to="/app" replace />;

  return <LoginScreen loading={loading} error={error} onSubmit={login} theme={theme} onToggleTheme={toggleTheme} />;
}

function ProtectedAppRoute() {
  const { view, session } = useAuth();

  if (view === 'booting') return <BootScreen />;
  if (!session) return <Navigate to="/" replace />;

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}

function NotFoundRoute() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">404</p>
        <h1 className="mt-2 font-display text-2xl font-bold text-foreground">Página não encontrada</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">A rota solicitada não existe no painel administrativo.</p>
        <Link to="/app" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-md border border-primary bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
          Voltar ao dashboard
        </Link>
      </div>
    </div>
  );
}

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundRoute,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginRoute,
});

const appRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'app',
  component: ProtectedAppRoute,
});

const dashboardRoute = createRoute({
  getParentRoute: () => appRoute,
  path: '/',
  component: DashboardPage,
});

const usersRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'usuarios',
  component: UsersPage,
});

const permissionsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'permissoes',
  component: PermissionsPage,
});

const queuesRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'filas',
  component: QueuesPage,
});

const seiRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'sei',
  component: SeiPage,
});

const reportsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'relatorios',
  component: ReportsPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => appRoute,
  path: 'configuracoes',
  component: SettingsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  appRoute.addChildren([dashboardRoute, usersRoute, permissionsRoute, queuesRoute, seiRoute, reportsRoute, settingsRoute]),
]);

export const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
