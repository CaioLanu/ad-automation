import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps { label: string; value: string | number; hint?: string; icon?: LucideIcon }

export function StatCard({ label, value, hint, icon: Icon }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{value}</p>
            {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
          </div>
          {Icon ? <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/40 bg-background/55 text-primary shadow-sm backdrop-blur"><Icon className="h-4 w-4" /></div> : null}
        </div>
      </CardContent>
    </Card>
  );
}
