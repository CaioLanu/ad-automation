import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileSpreadsheet, Filter, Loader2, Search, Upload, UserRoundX, UserPlus, UsersRound } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ApiError, listBiMovements, upsertBiMovements, type BiMovementKind, type BiMovementUpsertInput } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

type MovementKind = 'EXONERACAO' | 'NOMEACAO';
type PeriodFilter = 'daily' | 'weekly' | 'monthly';

type DailyMovement = {
  id: string;
  date: string;
  kind: MovementKind;
  name: string;
  functionalId: string;
  sector: string;
  role: string;
  symbol: string;
  sourceFile: string;
};

const sourceFolder = String.raw`I:\BI FINAL 2026`;

const periodOptions: Array<{ label: string; value: PeriodFilter; description: string }> = [
  { label: 'Diário', value: 'daily', description: 'Somente a data selecionada' },
  { label: 'Semanal', value: 'weekly', description: 'Semana da data selecionada' },
  { label: 'Mensal', value: 'monthly', description: 'Mês da data selecionada' },
];

const toPtDate = (date: string) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${date}T00:00:00`));
const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
const parseInputDate = (date: string) => new Date(`${date}T00:00:00`);

const defaultDate = new Date().toISOString().slice(0, 10);

const getDateRange = (date: string, period: PeriodFilter) => {
  const reference = parseInputDate(date);
  const start = new Date(reference);
  const end = new Date(reference);

  if (period === 'weekly') {
    const day = reference.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    start.setDate(reference.getDate() + mondayOffset);
    end.setTime(start.getTime());
    end.setDate(start.getDate() + 6);
  }

  if (period === 'monthly') {
    start.setDate(1);
    end.setMonth(reference.getMonth() + 1, 0);
  }

  return { start: toInputDate(start), end: toInputDate(end) };
};

const isInsideRange = (date: string, range: { start: string; end: string }) => date >= range.start && date <= range.end;

function MovementCard({ title, description, icon: Icon, items, accent }: { title: string; description: string; icon: typeof UserRoundX; items: DailyMovement[]; accent: 'orange' | 'cyan' }) {
  return (
    <Card variant="elevated" className="overflow-hidden">
      <CardHeader className="gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg sm:text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div
            className={cn(
              'grid h-11 w-11 shrink-0 place-items-center rounded-2xl border shadow-sm',
              accent === 'orange' ? 'border-orange-200 bg-orange-100/70 text-orange-700' : 'border-cyan-200 bg-cyan-100/70 text-cyan-700',
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <div className="mb-4 flex items-center justify-between">
          <Badge variant={accent === 'orange' ? 'warning' : 'default'}>{items.length} registros</Badge>
          <span className="text-xs font-medium text-muted-foreground">Base do período</span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-white/40 bg-background/45">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-56">Nome</TableHead>
                <TableHead className="w-28">ID</TableHead>
                <TableHead className="w-24">Símbolo</TableHead>
                <TableHead className="min-w-52">Setor</TableHead>
                <TableHead className="min-w-52">Relatório</TableHead>
                <TableHead className="text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.role}</p>
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{item.functionalId}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="min-h-6 px-2 py-0 text-[10px] tracking-normal">{item.symbol}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.sector}</TableCell>
                  <TableCell className="max-w-60 truncate text-xs text-muted-foreground" title={item.sourceFile}>{item.sourceFile}</TableCell>
                  <TableCell className="text-right text-xs font-bold tabular-nums text-foreground">{toPtDate(item.date)}</TableCell>
                </TableRow>
              ))}
              {!items.length ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    Nenhum registro encontrado para o período selecionado.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

const movementsToUpsert = (items: DailyMovement[]): BiMovementUpsertInput[] =>
  items.map((m) => ({
    date: m.date,
    kind: m.kind as BiMovementKind,
    name: m.name,
    functionalId: m.functionalId,
    sector: m.sector,
    role: m.role,
    symbol: m.symbol,
    sourceFile: m.sourceFile,
  }));

export function PermissionsPage() {
  const { session } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [period, setPeriod] = useState<PeriodFilter>('daily');
  const [search, setSearch] = useState('');
  const [manualImportFiles, setManualImportFiles] = useState<string[]>([]);
  const [movementsData, setMovementsData] = useState<DailyMovement[]>([]);
  const [loadingBackend, setLoadingBackend] = useState(false);
  const [savingBackend, setSavingBackend] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const loadMovements = useCallback(async () => {
    if (!session) return;
    setLoadingBackend(true);
    setBackendError(null);

    try {
      const records = await listBiMovements(session.accessToken);
      const mapped = records.map((r) => ({
        id: r.id,
        date: r.date,
        kind: r.kind as MovementKind,
        name: r.name,
        functionalId: r.functionalId,
        sector: r.sector,
        role: r.role,
        symbol: r.symbol,
        sourceFile: r.sourceFile,
      }));
      setMovementsData(mapped);
      if (mapped.length > 0) {
        // Auto-ajusta a data selecionada para o registro mais recente
        const latest = mapped.reduce((a, b) => (a.date > b.date ? a : b));
        setSelectedDate(latest.date);
      }
    } catch (err) {
      setBackendError(err instanceof ApiError ? err.message : 'Não foi possível carregar movimentos do backend.');
    } finally {
      setLoadingBackend(false);
    }
  }, [session]);

  useEffect(() => {
    void loadMovements();
  }, [loadMovements]);

  const dateRange = useMemo(() => getDateRange(selectedDate, period), [period, selectedDate]);

  const filteredMovements = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return movementsData.filter((item) => {
      const matchesDate = isInsideRange(item.date, dateRange);
      if (!normalizedSearch) return matchesDate;

      const text = `${item.name} ${item.functionalId} ${item.symbol} ${item.sector} ${item.role}`.toLocaleLowerCase('pt-BR');
      return matchesDate && text.includes(normalizedSearch);
    });
  }, [dateRange, search, movementsData]);

  const exonerations = filteredMovements.filter((item) => item.kind === 'EXONERACAO');
  const appointments = filteredMovements.filter((item) => item.kind === 'NOMEACAO');

  const pendingAfterLastExoneration = useMemo(() => {
    const lastByRg = new Map<string, DailyMovement>();

    movementsData
      .filter((item) => item.date <= dateRange.end)
      .forEach((item) => {
        const previous = lastByRg.get(item.functionalId);
        if (!previous || item.date > previous.date) lastByRg.set(item.functionalId, item);
      });

    const normalizedSearch = search.trim().toLocaleLowerCase('pt-BR');

    return Array.from(lastByRg.values())
      .filter((item) => item.kind === 'EXONERACAO')
      .filter((item) => {
        if (!normalizedSearch) return true;
        return `${item.name} ${item.functionalId} ${item.symbol} ${item.sector} ${item.role}`.toLocaleLowerCase('pt-BR').includes(normalizedSearch);
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [dateRange, search, movementsData]);

  const importedFile = manualImportFiles.length > 1 ? `${manualImportFiles.length} BIs selecionados` : manualImportFiles[0] ?? filteredMovements[0]?.sourceFile ?? `BI_${selectedDate}.pdf`;
  const periodLabel = period === 'daily' ? toPtDate(selectedDate) : `${toPtDate(dateRange.start)} até ${toPtDate(dateRange.end)}`;

  const handleFileChange = (files?: FileList | null) => {
    const selectedFiles = Array.from(files ?? []);
    if (!selectedFiles.length) return;
    const fileNames = selectedFiles.map((file) => file.name);
    setManualImportFiles(fileNames);

    const fileLabel = fileNames.length === 1 ? fileNames[0] : `${fileNames.length} BIs importados`;
    const updated = movementsData.map((m) => (isInsideRange(m.date, dateRange) ? { ...m, sourceFile: fileLabel } : m));
    setMovementsData(updated);

    if (session) {
      setSavingBackend(true);
      setBackendError(null);
      upsertBiMovements(session.accessToken, movementsToUpsert(updated.filter((m) => isInsideRange(m.date, dateRange))))
        .then(() => loadMovements())
        .catch((err) => setBackendError(err instanceof ApiError ? err.message : 'Erro ao salvar movimentos.'))
        .finally(() => setSavingBackend(false));
    }
  };

  const handleFilter = useCallback(() => {
    if (manualImportFiles.length > 0) {
      const fileLabel =
        manualImportFiles.length === 1
          ? manualImportFiles[0]
          : `${manualImportFiles.length} BIs importados`;

      setMovementsData((prev) => {
        const updated = prev.map((m) => (isInsideRange(m.date, dateRange) ? { ...m, sourceFile: fileLabel } : m));

        if (session) {
          setSavingBackend(true);
          upsertBiMovements(session.accessToken, movementsToUpsert(updated.filter((m) => isInsideRange(m.date, dateRange))))
            .then(() => loadMovements())
            .catch((err) => setBackendError(err instanceof ApiError ? err.message : 'Erro ao salvar movimentos.'))
            .finally(() => setSavingBackend(false));
        }

        return updated;
      });
    } else {
      // Sem arquivos manuais: apenas recarrega do backend
      void loadMovements();
    }
  }, [manualImportFiles, dateRange, session, loadMovements]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-8">
      <PageHeader
        title="BI Diário"
        eyebrow={null}
        description="Importe os arquivos Publicados em Boletim Interno, para efetuar o filtro"
        actions={
          <>
            <input ref={fileInputRef} type="file" accept="application/pdf,.pdf" multiple className="hidden" onChange={(event) => handleFileChange(event.target.files)} />
            <Button className="rounded-full" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" /> Importar BIs
            </Button>
          </>
        }
      />

      <Alert
        variant="brand"
        title="Importação diária"
        description={`Os BIs devem ser importados diariamente da pasta ${sourceFolder}. O botão de importação permite selecionar o PDF do dia; a extração automática será conectada ao backend.`}
      />

      {loadingBackend ? (
        <Alert variant="default" title="Carregando movimentos" description={<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Sincronizando com o servidor…</span>} />
      ) : null}

      {backendError ? <Alert variant="destructive" title="Erro de sincronização" description={backendError} /> : null}

      {savingBackend ? (
        <Alert variant="default" title="Salvando alterações" description={<span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Movimentos sendo persistidos no servidor…</span>} />
      ) : null}

      <section className="glass-panel rounded-[2rem] p-5 sm:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.6fr_0.85fr_0.7fr_auto] lg:items-end">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Relatórios importados</p>
            <div className="mt-2 flex items-center gap-3 rounded-2xl border border-white/40 bg-background/55 px-4 py-3 shadow-sm">
              <FileSpreadsheet className="h-5 w-5 text-primary" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{importedFile}</p>
                <p className="truncate text-xs text-muted-foreground">{sourceFolder}</p>
              </div>
            </div>
            {manualImportFiles.length > 1 ? (
              <p className="mt-2 line-clamp-2 text-xs text-muted-foreground" title={manualImportFiles.join(', ')}>
                {manualImportFiles.join(', ')}
              </p>
            ) : null}
          </div>

          <label className="space-y-2 text-sm font-semibold">
            Data do relatório
            <Input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="h-11 rounded-2xl border-white/40 bg-background/65 shadow-sm" />
          </label>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Período</p>
            <div className="grid grid-cols-3 gap-1 rounded-2xl border border-white/40 bg-background/45 p-1 shadow-sm">
              {periodOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  title={option.description}
                  className={cn(
                    'min-h-9 rounded-xl border px-2 text-xs font-bold transition-all duration-200',
                    period === option.value
                      ? 'border-primary/20 bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/15'
                      : 'border-transparent bg-transparent text-muted-foreground hover:border-white/40 hover:bg-background/75 hover:text-foreground',
                  )}
                  onClick={() => setPeriod(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="space-y-2 text-sm font-semibold">
            Buscar
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome, ID, símbolo ou setor" className="h-11 rounded-2xl border-white/40 bg-background/65 pl-9 shadow-sm" />
            </div>
          </label>

          <Button variant="default" className="min-h-11 rounded-full px-8 shadow-lg shadow-primary/15" onClick={handleFilter}>
            <Filter className="h-4 w-4" /> Filtrar
          </Button>
        </div>

        <div className="mt-4 rounded-2xl border border-white/40 bg-background/45 px-4 py-3 text-sm text-muted-foreground">
          Exibindo período: <span className="font-bold text-foreground">{periodLabel}</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="glass-card rounded-2xl border-orange-200/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Exonerações</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{exonerations.length}</p>
          </div>
          <div className="glass-card rounded-2xl border-cyan-200/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Nomeações</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{appointments.length}</p>
          </div>
          <div className="glass-card rounded-2xl border-amber-200/70 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Sem movimentação</p>
            <p className="mt-2 text-3xl font-black tabular-nums text-foreground">{pendingAfterLastExoneration.length}</p>
          </div>
        </div>
      </section>

      <div className="flex items-center justify-between gap-3 pt-1">
        <p className="text-[10px] font-black uppercase tracking-[0.32em] text-muted-foreground">Colunas do relatório</p>
        <p className="text-xs text-muted-foreground">Nome, ID funcional, símbolo, setor, relatório e data</p>
      </div>

      <section className="grid gap-5 xl:grid-cols-2">
        <MovementCard title="EXONERAÇÕES" description="Coluna de saídas importadas para a data selecionada." icon={UserRoundX} items={exonerations} accent="orange" />
        <MovementCard title="NOMEAÇÕES" description="Coluna de entradas importadas no relatório diário." icon={UserPlus} items={appointments} accent="cyan" />
      </section>

      <Card variant="elevated" className="overflow-hidden">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <UsersRound className="h-5 w-5 text-amber-600" /> Usuários sem movimentação após a última exoneração
              </CardTitle>
              <CardDescription>Último movimento conhecido é exoneração e não há nomeação posterior até a data filtrada.</CardDescription>
            </div>
            <Badge variant="warning">{pendingAfterLastExoneration.length} pendências</Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-5">
          <div className="overflow-hidden rounded-2xl border border-white/40 bg-background/45">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-56">Usuário</TableHead>
                  <TableHead className="w-28">ID</TableHead>
                  <TableHead className="w-24">Símbolo</TableHead>
                  <TableHead className="min-w-36">Última exoneração</TableHead>
                  <TableHead className="min-w-56">Arquivo</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAfterLastExoneration.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sector}</p>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{item.functionalId}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="min-h-6 px-2 py-0 text-[10px] tracking-normal">{item.symbol}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{toPtDate(item.date)}</TableCell>
                    <TableCell className="max-w-72 truncate text-xs text-muted-foreground">{item.sourceFile}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="warning" className="normal-case tracking-normal">Aguardando nova movimentação</Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!pendingAfterLastExoneration.length ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      Nenhum usuário pendente para o filtro atual.
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
