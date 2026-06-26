import { ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';

export function PermissionsPage() {
  const { session } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader title="Permissões" description="Permissões continuam derivadas do JWT emitido pelo backend antigo." />
      <Alert variant="brand" title="Sem regra duplicada no frontend" description="Esta tela mostra a sessão atual; a autorização real continua nas rotas protegidas do backend." />
      <Card className="border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <ShieldCheck className="h-4 w-4" /> Permissão da sessão
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usuário</p>
            <p className="mt-2 font-semibold text-foreground">{session?.user.name}</p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">RG</p>
            <p className="mt-2 font-mono text-sm text-foreground">{session?.user.rg}</p>
          </div>
          <div className="rounded-md border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Permissão</p>
            <Badge variant="success" className="mt-2">{session?.user.permission}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
