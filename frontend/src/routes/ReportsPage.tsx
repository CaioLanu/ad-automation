import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Download, Loader2, RefreshCw } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError, getReportSummary, type ReportDomain, type ReportGranularity, type ReportSummary } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { cn } from '@/lib/utils';

const domainOptions: Array<{ label: string; value: ReportDomain }> = [
  { label: 'Boletim Interno', value: 'ALL' },
  { label: 'AD', value: 'AD' },
  { label: 'SEI', value: 'SEI' },
];

const granularityOptions: Array<{ label: string; value: ReportGranularity; hint: string }> = [
  { label: 'Diário', value: 'daily', hint: 'Agrupa por dia' },
  { label: 'Semanal', value: 'weekly', hint: 'Agrupa por semana' },
  { label: 'Mensal', value: 'monthly', hint: 'Agrupa por mês' },
];

const toInputDate = (date: Date) => date.toISOString().slice(0, 10);

const formatDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value));

const formatInputDate = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(new Date(`${value}T00:00:00`));

const maxValue = (items: Array<{ value: number }>) => Math.max(1, ...items.map((item) => item.value));
const domainLabel = (domain: ReportDomain) => (domain === 'ALL' ? 'Boletim Interno' : domain);
const defaultBars: ReportSummary['bars'] = [
  { label: 'Criados', value: 0, color: '#19bce3' },
  { label: 'Alterados', value: 0, color: '#dd5fd2' },
  { label: 'Desativados', value: 0, color: '#fb7a21' },
];

function Donut({ items, total, label }: { items: ReportSummary['donut']; total: number; label: string }) {
  const gradient = useMemo(() => {
    const sum = Math.max(1, items.reduce((acc, item) => acc + item.value, 0));
    let cursor = 0;
    const stops = items.map((item) => {
      const start = cursor;
      cursor += (item.value / sum) * 100;
      return `${item.color} ${start}% ${cursor}%`;
    });

    return `conic-gradient(${stops.join(', ') || '#19bce3 0 100%'})`;
  }, [items]);

  return (
        <div className="relative grid h-20 w-20 shrink-0 place-items-center rounded-full border border-primary/20 bg-background/55 p-1.5 shadow-sm backdrop-blur" style={{ background: gradient }}>
          <div className="grid h-full w-full place-items-center rounded-full border border-white/75 bg-background/86 text-center shadow-sm backdrop-blur">
        <span className="text-[7px] font-bold uppercase leading-3 tracking-[0.2em] text-muted-foreground">Total<br />{label}</span>
        <span className="-mt-2 text-lg font-black tabular text-foreground">{total}</span>
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { session } = useAuth();
  const defaultEnd = useMemo(() => new Date(), []);
  const defaultStart = useMemo(() => {
    const date = new Date(defaultEnd);
    date.setDate(date.getDate() - 29);
    return date;
  }, [defaultEnd]);
  const [domain, setDomain] = useState<ReportDomain>('AD');
  const [granularity, setGranularity] = useState<ReportGranularity>('daily');
  const [startDate, setStartDate] = useState(toInputDate(defaultStart));
  const [endDate, setEndDate] = useState(toInputDate(defaultEnd));
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const result = await getReportSummary(session.accessToken, { domain, granularity, startDate, endDate });
      setSummary(result);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Não foi possível carregar os relatórios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, domain, granularity]);

  const bars = useMemo(() => {
    const sourceBars = summary?.bars?.length ? summary.bars : defaultBars;
    const hasVisibleMovement = sourceBars.some((bar) => bar.value > 0);

    if (hasVisibleMovement || !summary?.totals.total) return sourceBars;

    return sourceBars.map((bar, index) => (index === 0 ? { ...bar, value: summary.totals.total } : bar));
  }, [summary]);
  const periodLabel = `${formatInputDate(startDate)} → ${formatInputDate(endDate)}`;
  const primaryTotal = summary?.totals.total ?? 0;
  const chartMax = maxValue(bars);
  const activeDomainLabel = domainLabel(domain);

  return (
    <div className="mx-auto max-w-7xl space-y-5 pb-8">
      <section className="glass-panel rounded-[2.25rem] p-5 sm:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="default" className="border border-primary/10 bg-primary/10 text-primary">Canal de relatórios</Badge>
              <Badge variant="outline" className="border-sky-200/70 bg-background/55">{domain}</Badge>
              <Badge variant="outline" className="border-sky-200/70 bg-background/55">
                {granularity === 'daily' ? 'Diário' : granularity === 'weekly' ? 'Semanal' : 'Mensal'}
              </Badge>
            </div>

            <div className="max-w-3xl space-y-3">
              <h1 className="font-display text-3xl font-black tracking-tight text-foreground text-balance sm:text-4xl lg:text-5xl">
                Painel executivo para emissão e leitura rápida.
              </h1>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                Consulte AD com um recorte protegido e exporte o mesmo resultado em PDF para emissão formal.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-primary/20 bg-background/55 px-3 py-1.5 font-medium text-primary shadow-sm backdrop-blur">
                Atualizado: {summary ? formatDate(summary.generatedAt) : 'aguardando dados'}
              </span>
              <span className="rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-muted-foreground shadow-sm">
                Janela: {periodLabel}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <Button variant="outline" className="justify-start rounded-full border-white/40 bg-background/55 shadow-sm" onClick={loadSummary} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Atualizar dados
              </Button>
              <Button variant="outline" className="justify-start rounded-full border-white/40 bg-background/55 shadow-sm" onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Exportar PDF
              </Button>
            </div>
          </div>
        </div>

        {error ? <Alert className="mt-6" variant="destructive" title="Relatório indisponível" description={error} /> : null}

        <div className="mt-7 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="glass-card rounded-[1.75rem] p-4 sm:p-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-primary">Domínio</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {domainOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'min-h-14 rounded-xl border px-4 text-sm font-bold transition-all duration-200',
                    domain === option.value
                      ? 'border-primary/25 bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/15'
                      : 'border-white/40 bg-background/50 text-muted-foreground hover:-translate-y-0.5 hover:bg-background/80 hover:text-foreground',
                  )}
                  onClick={() => setDomain(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-[1.75rem] p-4 sm:p-5">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.34em] text-primary">Período</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {granularityOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    'rounded-xl border p-3 text-left transition-all duration-200',
                    granularity === option.value
                      ? 'border-primary/25 bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/15'
                      : 'border-white/40 bg-background/50 hover:-translate-y-0.5 hover:bg-background/80',
                  )}
                  onClick={() => setGranularity(option.value)}
                >
                  <span className="block text-sm font-black">{option.label}</span>
                  <span className={cn('mt-1 block text-xs', granularity === option.value ? 'text-primary-foreground/85' : 'text-muted-foreground')}>
                    {option.hint}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 grid items-end gap-3 lg:grid-cols-[1fr_1fr_auto]">
          <label className="space-y-2 text-sm font-semibold">
            Data inicial
            <Input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-11 rounded-2xl border-white/40 bg-background/65 shadow-sm" />
          </label>
          <label className="space-y-2 text-sm font-semibold">
            Data final
            <Input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-11 rounded-2xl border-white/40 bg-background/65 shadow-sm" />
          </label>
          <Button className="min-h-11 rounded-full bg-gradient-to-r from-primary to-cyan-500 px-8 shadow-lg shadow-primary/15" onClick={loadSummary} disabled={loading}>
            <CalendarDays className="h-4 w-4" /> Aplicar
          </Button>
        </div>

        <div className="glass-card mt-4 rounded-[1.5rem] p-5">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.34em] text-primary">{activeDomainLabel}</p>
              <p className="mt-2 text-3xl font-black tabular text-foreground">{primaryTotal}</p>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">
                Movimentações {domain === 'ALL' ? 'consolidadas' : domain === 'SEI' ? 'SEI' : 'de usuários AD'} no recorte selecionado.
              </p>
            </div>
            <Donut items={summary?.donut ?? []} total={primaryTotal} label={activeDomainLabel} />
          </div>

          <div className="mt-6 space-y-4">
            {bars.map((bar) => (
              <div key={bar.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{bar.label}</span>
                  <span className="font-bold tabular text-foreground">{bar.value}</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-background/70 shadow-inner">
                  <div className="h-full rounded-full shadow-[0_0_18px_rgba(14,165,233,0.18)]" style={{ width: `${Math.max(2, (bar.value / chartMax) * 100)}%`, backgroundColor: bar.color }} />
                </div>
              </div>
            ))}
            {!summary && !loading ? <p className="text-sm text-muted-foreground">Aguardando consulta ao backend.</p> : null}
          </div>
        </div>
      </section>
    </div>
  );
}
