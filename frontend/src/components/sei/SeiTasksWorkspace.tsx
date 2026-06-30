import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react';
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  FileSpreadsheet,
  Filter,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Search,
  UploadCloud,
} from 'lucide-react';
import { Alert } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import {
  ApiError,
  checkSeiTaskInAd,
  createSeiTask,
  importSeiTasksXlsx,
  listSeiTasks,
  type SeiTask,
  type SeiTaskAdCheckResult,
  type SeiTaskAction,
  type SeiTaskFilters,
  type SeiTaskImportSummary,
  type SeiTaskStatus,
  type SeiTaskUpsertInput,
  updateSeiTask,
} from '../../lib/api';
import type { AuthSession } from '../../lib/storage';
import { cn } from '../../lib/utils';

type SeiTaskDraft = {
  sector: string;
  name: string;
  rgLogin: string;
  functionalId: string;
  cpf: string;
  role: string;
  personalEmail: string;
  personalPhone: string;
  profile: string;
  action: SeiTaskAction;
  status: SeiTaskStatus;
};

const STATUS_OPTIONS: Array<{ value: SeiTaskStatus; label: string }> = [
  { value: 'PENDING', label: 'Pendente' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'COMPLETED', label: 'Concluído' },
  { value: 'CANCELED', label: 'Cancelado' },
  { value: 'INVALID', label: 'Inválido' },
];

const ACTION_OPTIONS: Array<{ value: SeiTaskAction; label: string }> = [
  { value: 'CREATE', label: 'Enviar para AD' },
  { value: 'UPDATE', label: 'Atualizar' },
];

const statusLabels: Record<SeiTaskStatus, string> = {
  PENDING: 'Pendente',
  IN_PROGRESS: 'Em andamento',
  COMPLETED: 'Concluído',
  CANCELED: 'Cancelado',
  INVALID: 'Inválido',
};

const actionLabels: Record<SeiTaskAction, string> = {
  CREATE: 'Enviar para AD',
  UPDATE: 'Atualizar',
};

const emptyDraft = (): SeiTaskDraft => ({
  sector: '',
  name: '',
  rgLogin: '',
  functionalId: '',
  cpf: '',
  role: '',
  personalEmail: '',
  personalPhone: '',
  profile: '',
  action: 'CREATE',
  status: 'PENDING',
});

const draftFromTask = (task: SeiTask): SeiTaskDraft => ({
  sector: task.sector ?? '',
  name: task.name ?? '',
  rgLogin: task.rgLogin ?? '',
  functionalId: task.functionalId ?? '',
  cpf: task.cpf ?? '',
  role: task.role ?? '',
  personalEmail: task.personalEmail ?? '',
  personalPhone: task.personalPhone ?? '',
  profile: task.profile ?? '',
  action: task.action,
  status: task.status,
});

const toPayload = (draft: SeiTaskDraft): SeiTaskUpsertInput => ({
  sector: draft.sector.trim(),
  name: draft.name.trim(),
  rgLogin: draft.rgLogin.trim(),
  functionalId: draft.functionalId.trim() || null,
  cpf: draft.cpf.trim() || null,
  role: draft.role.trim() || null,
  personalEmail: draft.personalEmail.trim() || null,
  personalPhone: draft.personalPhone.trim() || null,
  profile: draft.profile.trim(),
  action: draft.action,
  status: draft.status,
});

const taskBadges = {
  PENDING: 'warning',
  IN_PROGRESS: 'brand',
  COMPLETED: 'success',
  CANCELED: 'secondary',
  INVALID: 'destructive',
} as const;

const actionBadges = {
  CREATE: 'brand',
  UPDATE: 'secondary',
} as const;

const formatDateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(date);
};

const fieldClass =
  'min-h-11 w-full rounded-xl border border-white/40 bg-background/55 px-4 py-2 text-sm text-foreground shadow-sm backdrop-blur transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50';

const displayValue = (value?: string | null) => value?.trim() || '—';

const formatValidationError = (error: unknown) => {
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const payload = error as { message?: unknown; fields?: unknown };
    const message = String(payload.message ?? 'Registro inválido');
    const fields = Array.isArray(payload.fields) ? payload.fields.join(', ') : '';
    return fields ? `${message} (${fields})` : message;
  }
  return 'Registro marcado como inválido pelo backend.';
};

const fileLabel = (file?: File | null) => {
  if (!file) return 'Nenhum arquivo selecionado';
  const size = file.size < 1024 * 1024 ? `${Math.max(1, Math.round(file.size / 1024))} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
  return `${file.name} • ${size}`;
};

type SeiTasksWorkspaceProps = {
  session: AuthSession;
};

export const SeiTasksWorkspace = ({ session }: SeiTasksWorkspaceProps) => {
  const [tasks, setTasks] = useState<SeiTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [draft, setDraft] = useState<SeiTaskDraft>(emptyDraft);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SeiTaskStatus | ''>('');
  const [actionFilter, setActionFilter] = useState<SeiTaskAction | ''>('');
  const [sectorFilter, setSectorFilter] = useState('');
  const [profileFilter, setProfileFilter] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<SeiTaskImportSummary | null>(null);
  const [checkingTaskId, setCheckingTaskId] = useState<string | null>(null);
  const [adCheckResults, setAdCheckResults] = useState<Record<string, SeiTaskAdCheckResult>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedTaskIdRef = useRef<string | null>(null);

  useEffect(() => {
    selectedTaskIdRef.current = selectedTaskId;
  }, [selectedTaskId]);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const filters: SeiTaskFilters = {
        search,
        status: statusFilter,
        action: actionFilter,
        sector: sectorFilter,
        profile: profileFilter,
      };
      const data = await listSeiTasks(session.accessToken, filters);
      setTasks(data);

      if (selectedTaskIdRef.current) {
        const selected = data.find((task) => task.id === selectedTaskIdRef.current);
        if (!selected) {
          setSelectedTaskId(null);
          setDraft(emptyDraft());
        }
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar a fila de usuários.');
    } finally {
      setLoading(false);
    }
  }, [actionFilter, profileFilter, search, sectorFilter, session.accessToken, statusFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadTasks();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadTasks]);

  const selectedTask = useMemo(() => tasks.find((task) => task.id === selectedTaskId) ?? null, [selectedTaskId, tasks]);

  const filteredHint = useMemo(() => {
    const active = [search, statusFilter, actionFilter, sectorFilter, profileFilter].filter(Boolean).length;
    return active > 0 ? `${active} filtro(s) aplicados` : 'Sem filtros';
  }, [actionFilter, profileFilter, search, sectorFilter, statusFilter]);

  const invalidTasks = useMemo(
    () => tasks.filter((task) => task.status === 'INVALID' || (task.validationErrors?.length ?? 0) > 0),
    [tasks],
  );

  const handlePickTask = (task: SeiTask) => {
    setSelectedTaskId(task.id);
    setNotice(null);
    setError(null);
    setDraft(draftFromTask(task));
  };

  const handleNewTask = () => {
    setSelectedTaskId(null);
    setNotice(null);
    setError(null);
    setDraft(emptyDraft());
  };

  const handleSave = async () => {
    setSaving(true);
    setNotice(null);
    setError(null);

    try {
      const payload = toPayload(draft);
      const saved = selectedTaskId
        ? await updateSeiTask(session.accessToken, selectedTaskId, payload)
        : await createSeiTask(session.accessToken, payload);

      setSelectedTaskId(saved.id);
      setDraft(draftFromTask(saved));
      setNotice(selectedTaskId ? 'Registro atualizado com sucesso.' : 'Registro criado com sucesso.');
      await loadTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível salvar o registro.');
    } finally {
      setSaving(false);
    }
  };

  const handleCheckAdUser = async (task: SeiTask) => {
    setCheckingTaskId(task.id);
    setNotice(null);
    setError(null);

    try {
      const result = await checkSeiTaskInAd(session.accessToken, task.id);
      setAdCheckResults((current) => ({ ...current, [task.id]: result }));
      setNotice(result.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível verificar o usuário no Active Directory.');
    } finally {
      setCheckingTaskId(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      setError('Escolha um arquivo XLSX antes de importar.');
      return;
    }

    setImporting(true);
    setNotice(null);
    setError(null);

    try {
      const summary = await importSeiTasksXlsx(session.accessToken, selectedFile);
      setImportSummary(summary);
      setNotice(`Importação concluída: ${summary.importedRows}/${summary.totalRows} linhas processadas.`);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      await loadTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível importar o XLSX.');
    } finally {
      setImporting(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);
    setImportSummary(null);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportSummary(null);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleSave();
  };

  const taskCountLabel = tasks.length === 1 ? '1 usuário' : `${tasks.length} usuários`;

  return (
    <section id="active-directory" className="scroll-mt-6 space-y-4">
      <Card variant="elevated">
        <CardHeader>
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-2">
              <Badge variant="brand" className="w-fit">AD xlsx import</Badge>
              <CardTitle>Fila de usuários importados</CardTitle>
              <CardDescription>Importe planilhas, filtre registros e ajuste manualmente as linhas antes do envio para o Active Directory.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary"><ArrowDownUp className="h-3.5 w-3.5" />{taskCountLabel}</Badge>
              <Badge variant="secondary"><Filter className="h-3.5 w-3.5" />{filteredHint}</Badge>
              <Button variant="secondary" onClick={handleNewTask}><Plus className="h-4 w-4" />Novo registro</Button>
              <Button variant="outline" onClick={() => void loadTasks()} disabled={loading}><RefreshCcw className={cn('h-4 w-4', loading && 'animate-spin')} />Recarregar</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error ? <Alert variant="destructive" title="Não foi possível concluir a operação" description={error} /> : null}
          {notice ? <Alert variant="success" title="Tudo certo" description={notice} /> : null}

          <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="space-y-4">
              <Card variant="panel" className="min-h-0">
              <CardHeader className="pb-4">
                <div className="grid gap-3 lg:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,0.8fr))]">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome, CPF/Login ou setor" className="pl-11" />
                  </div>
                  <Input value={sectorFilter} onChange={(event) => setSectorFilter(event.target.value)} placeholder="Setor/Sigla" />
                  <Input value={profileFilter} onChange={(event) => setProfileFilter(event.target.value)} placeholder="Perfil" />
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as SeiTaskStatus | '')} className={fieldClass}>
                    <option value="">Todos os status</option>
                    {STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                  <select value={actionFilter} onChange={(event) => setActionFilter(event.target.value as SeiTaskAction | '')} className={fieldClass}>
                    <option value="">Todas as ações</option>
                    {ACTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="overflow-x-auto rounded-2xl border border-white/35 bg-background/35 backdrop-blur">
                  <table className="w-full min-w-[70rem] border-collapse text-left text-sm">
                    <caption className="sr-only">Usuários importados ou criados manualmente</caption>
                    <thead className="border-b border-white/35 bg-background/55 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-bold">Nome</th>
                        <th scope="col" className="px-4 py-3 font-bold">CPF/Login</th>
                        <th scope="col" className="px-4 py-3 font-bold">Setor/Sigla</th>
                        <th scope="col" className="px-4 py-3 font-bold">Perfil</th>
                        <th scope="col" className="px-4 py-3 font-bold">Status</th>
                        <th scope="col" className="px-4 py-3 font-bold">Ação</th>
                        <th scope="col" className="px-4 py-3 font-bold">Active Directory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {loading ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                            <div className="inline-flex items-center gap-2">
                              <Loader2 className="h-4 w-4 animate-spin" />Carregando usuários…
                            </div>
                          </td>
                        </tr>
                      ) : tasks.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">Nenhum usuário encontrado.</td>
                        </tr>
                      ) : tasks.map((task) => {
                        const adCheckResult = adCheckResults[task.id];
                        const checking = checkingTaskId === task.id;

                        return (
                          <tr
                            key={task.id}
                            onClick={() => handlePickTask(task)}
                            className={cn(
                              'cursor-pointer transition-colors odd:bg-background/25 hover:bg-background/55',
                              selectedTaskId === task.id && 'bg-background/65 ring-1 ring-inset ring-white/45',
                            )}
                          >
                            <td className="px-4 py-4 align-top">
                              <div className="font-medium text-foreground">{displayValue(task.name)}</div>
                            </td>
                            <td className="px-4 py-4 align-top font-mono text-foreground tabular">{displayValue(task.rgLogin)}</td>
                            <td className="px-4 py-4 align-top text-foreground">{displayValue(task.sector)}</td>
                            <td className="px-4 py-4 align-top text-foreground">{displayValue(task.profile)}</td>
                            <td className="px-4 py-4 align-top"><Badge variant={taskBadges[task.status]}>{statusLabels[task.status]}</Badge></td>
                            <td className="px-4 py-4 align-top"><Badge variant={actionBadges[task.action]}>{actionLabels[task.action]}</Badge></td>
                            <td className="px-4 py-4 align-top">
                              <div className="flex flex-wrap items-center gap-2">
                                {adCheckResult ? (
                                  <Badge variant={adCheckResult.exists ? 'success' : 'destructive'}>
                                    {adCheckResult.exists ? 'Existe no AD' : 'Não encontrado'}
                                  </Badge>
                                ) : null}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={checking}
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    void handleCheckAdUser(task);
                                  }}
                                >
                                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                                  Verificar no AD
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
              </Card>

              <Card variant="panel">
                <CardHeader>
                  <CardTitle>{selectedTaskId ? 'Editar registro' : 'Novo registro'}</CardTitle>
                  <CardDescription>Preencha os campos do usuário importado e grave no backend autorizado.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="space-y-2 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Setor/Sigla</span><Input value={draft.sector} onChange={(event) => setDraft((current) => ({ ...current, sector: event.target.value }))} required /></label>
                      <label className="space-y-2 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Nome</span><Input value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} required /></label>
                      <label className="space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">CPF/Login</span><Input value={draft.rgLogin} onChange={(event) => setDraft((current) => ({ ...current, rgLogin: event.target.value }))} required /></label>
                      <label className="space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Id Func.</span><Input value={draft.functionalId} onChange={(event) => setDraft((current) => ({ ...current, functionalId: event.target.value }))} /></label>
                      <label className="space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">CPF</span><Input value={draft.cpf} onChange={(event) => setDraft((current) => ({ ...current, cpf: event.target.value }))} /></label>
                      <label className="space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Cargo</span><Input value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value }))} /></label>
                      <label className="space-y-2 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">E-mail institucional</span><Input type="email" value={draft.personalEmail} onChange={(event) => setDraft((current) => ({ ...current, personalEmail: event.target.value }))} placeholder="nome.sobrenome@orgao.gov.br" /></label>
                      <label className="space-y-2 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Celular</span><Input value={draft.personalPhone} onChange={(event) => setDraft((current) => ({ ...current, personalPhone: event.target.value }))} /></label>
                      <label className="space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Perfil</span><Input value={draft.profile} onChange={(event) => setDraft((current) => ({ ...current, profile: event.target.value }))} required /></label>
                      <label className="space-y-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Status</span><select value={draft.status} onChange={(event) => setDraft((current) => ({ ...current, status: event.target.value as SeiTaskStatus }))} className={fieldClass}>{STATUS_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                      <label className="space-y-2 sm:col-span-2"><span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Ação</span><select value={draft.action} onChange={(event) => setDraft((current) => ({ ...current, action: event.target.value as SeiTaskAction }))} className={fieldClass}>{ACTION_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      <Button type="submit" disabled={saving} className="sm:flex-1">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{selectedTaskId ? 'Salvar alterações' : 'Criar registro'}</Button>
                      <Button type="button" variant="secondary" onClick={handleNewTask}>Limpar formulário</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card variant="panel">
                <CardHeader>
                  <CardTitle className="text-xl">Importar XLSX</CardTitle>
                  <CardDescription>Envie o arquivo original da planilha para criar a fila de envio ao AD em lote.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onDragEnter={() => setDragActive(true)}
                    onDragLeave={() => setDragActive(false)}
                    onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
                    onDrop={handleDrop}
                    className={cn(
                      'rounded-2xl border border-dashed p-5 text-center transition-colors backdrop-blur',
                      dragActive ? 'border-primary bg-primary/10' : 'border-white/40 bg-background/45',
                    )}
                  >
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/40 bg-background/55 text-primary">
                      <FileSpreadsheet className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="font-semibold text-foreground">Solte o XLSX aqui ou escolha um arquivo</p>
                      <p className="text-sm text-muted-foreground">A API espera o binário com o nome original no cabeçalho x-file-name.</p>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                      <Button variant="secondary" onClick={() => fileInputRef.current?.click()}><UploadCloud className="h-4 w-4" />Escolher arquivo</Button>
                      <Button onClick={() => void handleImport()} disabled={importing || !selectedFile}>
                        {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        Importar
                      </Button>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                  </div>

                  <div className="glass-card rounded-2xl p-4 text-sm text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-current/15 bg-current/10 text-current">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      <div className="space-y-1">
                        <div className="font-semibold text-foreground">{fileLabel(selectedFile)}</div>
                        <p>Somente arquivos XLSX são processados. Os registros inválidos retornam junto com o resumo da importação.</p>
                      </div>
                    </div>
                  </div>

                  {importSummary ? (
                    <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/10 p-4 backdrop-blur">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <div className="font-semibold text-foreground">Resumo da importação</div>
                          <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Batch {importSummary.batchId}</div>
                        </div>
                        <Badge variant="brand">{importSummary.fileName}</Badge>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-3">
                        <div className="glass-card rounded-2xl p-3"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Linhas</div><div className="mt-1 text-lg font-semibold text-foreground">{importSummary.totalRows}</div></div>
                        <div className="glass-card rounded-2xl p-3"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Importadas</div><div className="mt-1 text-lg font-semibold text-emerald-700">{importSummary.importedRows}</div></div>
                        <div className="glass-card rounded-2xl p-3"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Inválidas</div><div className="mt-1 text-lg font-semibold text-amber-700">{importSummary.invalidRows}</div></div>
                      </div>
                    </div>
                  ) : null}

                  {invalidTasks.length > 0 ? (
                    <div className="space-y-2">
                      <div className="text-sm font-semibold text-foreground">Erros de validação</div>
                      <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                        {invalidTasks.map((task) => (
                          <div key={task.id} className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm backdrop-blur">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="font-semibold text-foreground">{task.name}</div>
                              <Badge variant="destructive">{statusLabels[task.status]}</Badge>
                            </div>
                            <div className="mt-2 text-muted-foreground">{displayValue(task.sector)} • {displayValue(task.rgLogin)}</div>
                            <ul className="mt-3 list-disc space-y-1 pl-5 text-destructive">
                              {(task.validationErrors ?? ['Registro marcado como inválido pelo backend.']).map((message, index) => <li key={`${task.id}-${index}`}>{formatValidationError(message)}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              {selectedTask ? (
                <Card variant="panel">
                  <CardHeader>
                    <CardTitle className="text-xl">Detalhes do registro</CardTitle>
                    <CardDescription>Informações retornadas pela API para a linha selecionada.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="glass-card rounded-2xl p-3"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Criado em</div><div className="mt-1 font-medium text-foreground">{formatDateTime(selectedTask.createdAt)}</div></div>
                      <div className="glass-card rounded-2xl p-3"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Atualizado em</div><div className="mt-1 font-medium text-foreground">{formatDateTime(selectedTask.updatedAt)}</div></div>
                    </div>
                    <div className="glass-card rounded-2xl p-3"><div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Campos opcionais</div><div className="mt-1 text-muted-foreground">Id Func.: {displayValue(selectedTask.functionalId)} • CPF: {displayValue(selectedTask.cpf)} • E-mail institucional: {displayValue(selectedTask.personalEmail)}</div></div>
                    {(selectedTask.validationErrors?.length ?? 0) > 0 ? (
                      <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3 backdrop-blur">
                        <div className="font-semibold text-foreground">Erros associados</div>
                        <ul className="mt-2 list-disc space-y-1 pl-5 text-destructive">
                          {(selectedTask.validationErrors ?? []).map((message, index) => <li key={`${selectedTask.id}-detail-${index}`}>{formatValidationError(message)}</li>)}
                        </ul>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
