import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { Ban, CheckCircle2, Loader2, Pencil, RefreshCcw, Save, Search, ShieldCheck, Users } from 'lucide-react';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import {
  ApiError,
  createAdUser,
  deactivateAdUser,
  listAdUsers,
  updateAdUser,
  type AdUser,
} from '../../lib/api';
import type { AuthSession } from '../../lib/storage';
import { cn } from '../../lib/utils';
import { PageHeader, StatCard, StatusBadge } from './dashboard-primitives';

type AdUserDraft = {
  rg: string;
  name: string;
  adId: string;
  memberOf: string;
  isActive: boolean;
};

const emptyDraft = (): AdUserDraft => ({
  rg: '',
  name: '',
  adId: '',
  memberOf: '',
  isActive: true,
});

const draftFromUser = (user: AdUser): AdUserDraft => ({
  rg: user.rg,
  name: user.name,
  adId: user.adId,
  memberOf: user.memberOf.join('\n'),
  isActive: user.isActive,
});

const parseGroups = (value: string) =>
  [...new Set(value.split(/[\n,;]+/).map((group) => group.trim()).filter(Boolean))];

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

const fieldClass =
  'min-h-11 w-full rounded-md border border-input bg-background px-4 py-2 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';

const statusOptions = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
] as const;

type AdUsersWorkspaceProps = {
  session: AuthSession;
};

export const AdUsersWorkspace = ({ session }: AdUsersWorkspaceProps) => {
  const [users, setUsers] = useState<AdUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdUserDraft>(emptyDraft);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]['value']>('all');
  const selectedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedUserIdRef.current = selectedUserId;
  }, [selectedUserId]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await listAdUsers(session.accessToken);
      setUsers(data);

      const currentSelected = selectedUserIdRef.current;
      if (currentSelected) {
        const selected = data.find((user) => user.id === currentSelected);
        if (!selected) {
          setSelectedUserId(null);
          setDraft(emptyDraft());
        } else {
          setDraft(draftFromUser(selected));
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os usuários AD.');
    } finally {
      setLoading(false);
    }
  }, [session.accessToken]);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return users.filter((user) => {
      if (statusFilter === 'active' && !user.isActive) return false;
      if (statusFilter === 'inactive' && user.isActive) return false;

      if (!query) return true;

      const haystack = [user.name, user.rg, user.adId, user.memberOf.join(' ')].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [search, statusFilter, users]);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) ?? null,
    [selectedUserId, users],
  );

  const stats = useMemo(() => {
    const active = users.filter((user) => user.isActive).length;
    const inactive = users.length - active;
    const groupCount = new Set(users.flatMap((user) => user.memberOf)).size;

    return [
      { label: 'Total', value: users.length, hint: 'Registros vindos do backend', icon: Users, tone: 'brand' as const },
      { label: 'Ativos', value: active, hint: 'Contas liberadas', icon: CheckCircle2, tone: 'success' as const },
      { label: 'Inativos', value: inactive, hint: 'Contas desativadas', icon: Ban, tone: 'warning' as const },
      { label: 'Grupos', value: groupCount, hint: 'Vínculos distintos', icon: ShieldCheck, tone: 'default' as const },
    ];
  }, [users]);

  const handleSelectUser = (user: AdUser) => {
    setSelectedUserId(user.id);
    setDraft(draftFromUser(user));
    setError(null);
    setNotice(null);
  };

  const handleNewUser = () => {
    setSelectedUserId(null);
    setDraft(emptyDraft());
    setError(null);
    setNotice(null);
  };

  const handleSave = async () => {
    const rg = draft.rg.trim();
    const name = draft.name.trim();
    const adId = draft.adId.trim();
    const memberOf = parseGroups(draft.memberOf);

    if (!rg || !name || !adId) {
      setError('Preencha RG, nome e AD ID antes de salvar.');
      return;
    }

    if (memberOf.length === 0) {
      setError('Informe ao menos um grupo de acesso.');
      return;
    }

    setSaving(true);
    setError(null);
    setNotice(null);

    try {
      if (selectedUserId) {
        const saved = await updateAdUser(session.accessToken, selectedUserId, {
          rg,
          name,
          adId,
          memberOf,
        });
        setSelectedUserId(saved.id);
        setDraft(draftFromUser(saved));
        setNotice('Usuário AD atualizado com sucesso.');
      } else {
        const saved = await createAdUser(session.accessToken, {
          rg,
          name,
          adId,
          isActive: draft.isActive,
          memberOf,
        });
        setSelectedUserId(saved.id);
        setDraft(draftFromUser(saved));
        setNotice('Usuário AD criado com sucesso.');
      }

      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o usuário AD.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedUserId) return;

    const target = users.find((user) => user.id === selectedUserId);
    if (!target || !target.isActive) return;

    if (!window.confirm(`Desativar ${target.name}?`)) return;

    setDeactivating(true);
    setError(null);
    setNotice(null);

    try {
      await deactivateAdUser(session.accessToken, selectedUserId);
      setNotice('Usuário AD desativado com sucesso.');
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível desativar o usuário AD.');
    } finally {
      setDeactivating(false);
    }
  };

  const visibleLabel = filteredUsers.length === 1 ? '1 usuário' : `${filteredUsers.length} usuários`;

  return (
    <section id="usuarios-ad" className="scroll-mt-6 space-y-4">
      <PageHeader
        eyebrow="Usuários AD"
        title="Gestão real de contas"
        description="Cadastro e manutenção direta das contas do AD fictício, consumindo apenas os endpoints autorizados do backend."
        actions={
          <>
            <Badge variant="secondary">{visibleLabel}</Badge>
            <Button variant="secondary" onClick={() => void loadUsers()} disabled={loading}>
              <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
              Recarregar
            </Button>
            <Button onClick={handleNewUser}>Novo usuário</Button>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {error ? <Alert variant="destructive" title="Não foi possível concluir a operação" description={error} /> : null}
      {notice ? <Alert variant="success" title="Tudo certo" description={notice} /> : null}

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card variant="elevated" className="min-w-0">
          <CardHeader>
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <CardTitle>Usuários cadastrados</CardTitle>
                <CardDescription>Filtre, selecione e edite um registro sem sair do shell.</CardDescription>
              </div>
              <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
                <div className="relative min-w-0 flex-1 xl:w-80">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Buscar por nome, RG, AD ID ou grupo"
                    className="pl-11"
                  />
                </div>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className={fieldClass}>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="overflow-x-auto rounded-lg border border-border bg-background">
              <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
                <caption className="sr-only">Usuários AD disponíveis no backend</caption>
                <thead className="border-b border-border bg-muted text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-bold">Nome</th>
                    <th scope="col" className="px-4 py-3 font-bold">RG</th>
                    <th scope="col" className="px-4 py-3 font-bold">AD ID</th>
                    <th scope="col" className="px-4 py-3 font-bold">Grupos</th>
                    <th scope="col" className="px-4 py-3 font-bold">Status</th>
                    <th scope="col" className="px-4 py-3 font-bold">Atualizado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/70">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        <div className="inline-flex items-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />Carregando usuários AD…
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        Nenhum usuário encontrado com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handleSelectUser(user);
                          }
                        }}
                        role="button"
                        tabIndex={0}
                        className={cn(
                          'cursor-pointer transition-colors odd:bg-muted/40 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40',
                          selectedUserId === user.id && 'bg-muted ring-1 ring-inset ring-border',
                        )}
                      >
                        <td className="px-4 py-4 align-top">
                          <div className="font-medium text-foreground">{user.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">ID {user.id.slice(0, 8)}…</div>
                        </td>
                        <td className="px-4 py-4 align-top font-mono text-foreground tabular">{user.rg}</td>
                        <td className="px-4 py-4 align-top font-mono text-foreground tabular">{user.adId}</td>
                        <td className="px-4 py-4 align-top text-foreground">
                          <div className="flex flex-wrap gap-1.5">
                            {user.memberOf.slice(0, 3).map((group) => (
                              <Badge key={group} variant="outline" className="rounded-md normal-case tracking-normal">
                                {group}
                              </Badge>
                            ))}
                            {user.memberOf.length > 3 ? <Badge variant="secondary">+{user.memberOf.length - 3}</Badge> : null}
                          </div>
                        </td>
                        <td className="px-4 py-4 align-top">
                          <StatusBadge label={user.isActive ? 'Ativo' : 'Inativo'} tone={user.isActive ? 'success' : 'destructive'} />
                        </td>
                        <td className="px-4 py-4 align-top text-muted-foreground">{formatDate(user.updatedAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card variant="panel" className="h-fit">
          <CardHeader>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{selectedUser ? 'Editar usuário' : 'Novo usuário'}</CardTitle>
                <CardDescription>{selectedUser ? 'Atualize os campos e salve no backend.' : 'Crie uma nova conta AD com grupos válidos.'}</CardDescription>
              </div>
              <Badge variant={selectedUser ? 'outline' : 'brand'}>{selectedUser ? 'Selecionado' : 'Cadastro'}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form
              className="space-y-4"
              onSubmit={(event: FormEvent<HTMLFormElement>) => {
                event.preventDefault();
                void handleSave();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">RG</span>
                  <Input value={draft.rg} onChange={(event) => setDraft((current) => ({ ...current, rg: event.target.value }))} placeholder="0000000" />
                </label>
                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">AD ID</span>
                  <Input value={draft.adId} onChange={(event) => setDraft((current) => ({ ...current, adId: event.target.value }))} placeholder="AD-000123" />
                </label>
              </div>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Nome</span>
                <Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Nome completo do servidor" />
              </label>

              <label className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Grupos</span>
                <textarea
                  value={draft.memberOf}
                  onChange={(event) => setDraft((current) => ({ ...current, memberOf: event.target.value }))}
                  placeholder="Digite um grupo por linha ou separado por vírgulas"
                  className={cn(fieldClass, 'min-h-28 resize-y py-3 font-mono text-sm')}
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-4 py-3">
                <div>
                  <span className="block text-sm font-medium text-foreground">Conta ativa</span>
                  <span className="block text-xs text-muted-foreground">
                    {selectedUser ? 'Use a ação Desativar para encerrar uma conta existente.' : 'Define o status inicial da nova conta.'}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={draft.isActive}
                  onChange={(event) => setDraft((current) => ({ ...current, isActive: event.target.checked }))}
                  disabled={selectedUser !== null}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
              </label>

              {selectedUser ? (
                <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 font-medium text-foreground">
                    <Pencil className="h-4 w-4" />Registro carregado
                  </div>
                  <p className="mt-2">Última atualização: {formatDate(selectedUser.updatedAt)}</p>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" disabled={saving || deactivating}>
                  <Save className="h-4 w-4" />
                  {saving ? 'Salvando…' : selectedUser ? 'Atualizar' : 'Criar usuário'}
                </Button>
                <Button type="button" variant="secondary" onClick={handleNewUser}>
                  Limpar
                </Button>
                <Button type="button" variant="outline" onClick={() => void loadUsers()} disabled={loading}>
                  <RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />
                  Recarregar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => void handleDeactivate()}
                  disabled={deactivating || !selectedUser?.isActive}
                >
                  <Ban className="h-4 w-4" />
                  {deactivating ? 'Desativando…' : 'Desativar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
