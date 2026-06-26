import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Variant = 'ativo' | 'inativo' | 'pendente' | 'critica' | 'em_analise' | 'aguardando' | 'concluida' | 'baixa' | 'media' | 'alta';
const LABELS: Record<Variant, string> = { ativo: 'Ativo', inativo: 'Inativo', pendente: 'Pendente', critica: 'Crítica', em_analise: 'Em análise', aguardando: 'Aguardando', concluida: 'Concluída', baixa: 'Baixa', media: 'Média', alta: 'Alta' };
const STYLES: Record<Variant, string> = { ativo: 'bg-emerald-50 text-emerald-700 border-emerald-200', inativo: 'bg-muted text-muted-foreground border-border', pendente: 'bg-amber-50 text-amber-700 border-amber-200', critica: 'bg-rose-50 text-rose-700 border-rose-200', em_analise: 'bg-slate-100 text-slate-700 border-slate-200', aguardando: 'bg-amber-50 text-amber-700 border-amber-200', concluida: 'bg-emerald-50 text-emerald-700 border-emerald-200', baixa: 'bg-slate-50 text-slate-600 border-slate-200', media: 'bg-slate-100 text-slate-700 border-slate-200', alta: 'bg-amber-50 text-amber-700 border-amber-200' };

export function StatusBadge({ status }: { status: Variant }) { return <Badge variant="outline" className={cn('font-medium rounded-md', STYLES[status])}>{LABELS[status]}</Badge>; }
