import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import { AlertTriangle, ListChecks, ShieldCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { StatCard } from '@/components/app/StatCard';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiError, listAdUsers, type AdUser } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

export function DashboardPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    let active = true;
    listAdUsers(session.accessToken)
      .then((items) => {
        if (active) setUsers(items);
      })
      .catch((err) => {
        if (active) setError(err instanceof ApiError ? err.message : 'Não foi possível carregar o resumo de usuários.');
      });
    return () => {
      active = false;
    };
  }, [session]);

  const activeUsers = users.filter((user) => user.isActive).length;
  const groups = new Set(users.flatMap((user) => user.memberOf));
  const recent = [...users].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard" description="Visão consolidada da operação administrativa com dados do backend atual." />

      {error ? <Alert variant="destructive" title="Resumo indisponível" description={error} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Usuários ativos" value={String(activeUsers)} hint={`${users.length} usuários cadastrados`} icon={Users} />
        <StatCard label="Grupos AD" value={String(groups.size)} hint="Derivado de memberOf" icon={ShieldCheck} />
        <StatCard label="Fila SEI" value="Real" hint="Mantida pela lógica antiga" icon={ListChecks} />
        <StatCard label="Guard rails" value="Backend" hint="Autorização protegida no servidor" icon={AlertTriangle} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base font-semibold">Usuários atualizados recentemente</CardTitle>
              <Link to="/app/usuarios" className="hidden min-h-10 items-center rounded-full border border-white/40 bg-background/55 px-3 text-sm font-semibold text-foreground shadow-sm backdrop-blur hover:bg-background/80 sm:inline-flex">
                Gerenciar
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>RG</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Atualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="text-muted-foreground">{user.rg}</TableCell>
                    <TableCell><Badge variant={user.isActive ? 'success' : 'secondary'}>{user.isActive ? 'ativo' : 'inativo'}</Badge></TableCell>
                    <TableCell className="text-right text-muted-foreground">{formatDate(user.updatedAt)}</TableCell>
                  </TableRow>
                ))}
                {recent.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">Nenhum usuário retornado pelo backend.</TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Sessão administrativa</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Alert variant="success" title="Permissão validada" description={session?.user.permission ?? '—'} />
            <Alert variant="brand" title="API real" description={import.meta.env.VITE_API_URL || 'http://localhost:3000'} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
