import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { Ban, FileSpreadsheet, Pencil, Plus, RefreshCw, Search, Upload } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { UserDialog } from '@/components/app/UserDialog';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiError, createAdUser, deactivateAdUser, importAdUsersXlsx, listAdUsers, updateAdUser, type AdUser, type AdUserCreateInput, type AdUserImportSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

export function UsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdUser[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<AdUser | null>(null);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState<'todos' | 'ativos' | 'inativos'>('todos');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSummary, setImportSummary] = useState<AdUserImportSummary | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadUsers = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      setUsers(await listAdUsers(session.accessToken));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar usuários.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return users.filter((user) => {
      if (status === 'ativos' && !user.isActive) return false;
      if (status === 'inativos' && user.isActive) return false;
      if (!term) return true;
      return `${user.sector} ${user.name} ${user.rgLogin} ${user.cpf} ${user.role} ${user.profile} ${user.adId} ${user.memberOf.join(' ')}`.toLowerCase().includes(term);
    });
  }, [q, status, users]);

  const handleSubmit = async (data: AdUserCreateInput) => {
    if (!session) return;
    setSaving(true);
    setError(null);
    try {
      const saved = editing
        ? await updateAdUser(session.accessToken, editing.id, data)
        : await createAdUser(session.accessToken, data);

      setUsers((current) => editing ? current.map((user) => user.id === saved.id ? saved : user) : [saved, ...current]);
      setOpen(false);
      setEditing(null);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (user: AdUser) => {
    if (!session || !window.confirm(`Inativar ${user.name}?`)) return;
    setSaving(true);
    setError(null);
    try {
      const updated = await deactivateAdUser(session.accessToken, user.id);
      setUsers((current) => current.map((item) => item.id === updated.id ? updated : item));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível inativar o usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(event.target.files?.[0] ?? null);
    setImportSummary(null);
  };

  const handleImport = async () => {
    if (!session) return;
    if (!selectedFile) {
      setError('Selecione um arquivo XLSX para importar.');
      return;
    }

    setImporting(true);
    setError(null);
    try {
      const summary = await importAdUsersXlsx(session.accessToken, selectedFile);
      setImportSummary(summary);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadUsers();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível importar o XLSX.');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gerenciamento de Usuários AD"
        description="Cadastro manual ou importação XLSX no padrão da planilha, com acesso autenticado aos endpoints do backend."
        actions={
          <Button onClick={() => { setEditing(null); setOpen(true); }} disabled={saving}>
            <Plus className="mr-1.5 h-4 w-4" /> Novo usuário
          </Button>
        }
      />

      {error ? <Alert variant="destructive" title="Operação não concluída" description={error} /> : null}
      {importSummary ? (
        <Alert
          variant="default"
          title={`Importação concluída (${importSummary.importedRows}/${importSummary.totalRows})`}
          description={
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">Arquivo: {importSummary.fileName} • Lote: {importSummary.batchId}</div>
              {importSummary.invalidRows > 0 ? <div className="text-sm text-foreground">Linhas inválidas: {importSummary.invalidRows}</div> : null}
              {importSummary.errors.length > 0 ? (
                <div className="space-y-1 text-sm">
                  <div className="font-medium">Erros:</div>
                  <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
                    {importSummary.errors.map((errorItem, index) => (
                      <li key={`${errorItem.rowNumber}-${index}`}>Linha {errorItem.rowNumber}: {errorItem.message}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          }
        />
      ) : null}

      <Card>
        <CardContent className="p-4">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar por setor, nome, RG/Login, CPF, cargo ou perfil" className="h-9 pl-8" />
            </div>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as typeof status)}
              className="h-11 rounded-xl border border-white/40 bg-background/55 px-3 text-sm text-foreground shadow-sm backdrop-blur outline-none focus:ring-2 focus:ring-ring/20"
            >
              <option value="todos">Todos os status</option>
              <option value="ativos">Ativos</option>
              <option value="inativos">Inativos</option>
            </select>
            <Button variant="outline" onClick={loadUsers} disabled={loading || saving}>
              <RefreshCw className="h-4 w-4" /> {loading ? 'Atualizando…' : 'Atualizar'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-dashed border-white/45 bg-background/45 px-4 py-3 backdrop-blur">
              <FileSpreadsheet className="h-5 w-5 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">Importar XLSX</div>
                <div className="truncate text-xs text-muted-foreground">{selectedFile ? selectedFile.name : 'Selecione um arquivo .xlsx no padrão da planilha'}</div>
              </div>
              <Input ref={fileInputRef} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} className="max-w-xs" />
            </div>
            <Button onClick={handleImport} disabled={importing || !selectedFile}>
              <Upload className="mr-1.5 h-4 w-4" /> {importing ? 'Importando…' : 'Importar XLSX'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Setor/Sigla</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Rg/Login</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Cargo</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualizado</TableHead>
                <TableHead className="w-[150px] text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground">{user.sector}</TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{user.rgLogin}</TableCell>
                  <TableCell className="text-muted-foreground">{user.cpf}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.profile}</TableCell>
                  <TableCell><Badge variant={user.isActive ? 'success' : 'secondary'}>{user.isActive ? 'ativo' : 'inativo'}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{formatDate(user.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditing(user); setOpen(true); }} disabled={saving}>
                        <Pencil className="h-4 w-4" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeactivate(user)} disabled={saving || !user.isActive}>
                        <Ban className="h-4 w-4" /> Inativar
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                    {loading ? 'Carregando usuários…' : 'Nenhum usuário encontrado com os filtros aplicados.'}
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <UserDialog open={open} onOpenChange={setOpen} user={editing} busy={saving} onSubmit={handleSubmit} />
    </div>
  );
}
