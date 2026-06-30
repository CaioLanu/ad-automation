import { Settings } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export function SettingsPage() {
  const { session, theme, toggleTheme } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações" description="Preferências locais da interface e diagnóstico de runtime." />
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold"><Settings className="h-4 w-4" /> Interface</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <button type="button" onClick={toggleTheme} className="glass-card rounded-2xl p-4 text-left transition-colors hover:bg-background/70">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tema atual</p>
            <p className="mt-2 font-semibold text-foreground">{theme === 'dark' ? 'Alto contraste' : 'Claro institucional'}</p>
          </button>
          <div className="glass-card rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">API</p>
            <p className="mt-2 break-all font-mono text-sm text-foreground">{import.meta.env.VITE_API_URL || 'http://localhost:3000'}</p>
          </div>
          <div className="glass-card rounded-2xl p-4 md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Sessão</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary">{session?.user.name}</Badge>
              <Badge variant="outline">{session?.user.rg}</Badge>
              <Badge variant="success">{session?.user.permission}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
