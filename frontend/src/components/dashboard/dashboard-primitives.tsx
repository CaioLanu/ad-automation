import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { cn } from '../../lib/utils';

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const PageHeader = ({ eyebrow, title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col gap-4 border-b border-border/70 pb-5 lg:flex-row lg:items-end lg:justify-between">
    <div className="min-w-0 space-y-2">
      {eyebrow ? <Badge variant="outline" className="w-fit">{eyebrow}</Badge> : null}
      <div className="space-y-1">
        <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">{title}</h2>
        {description ? <p className="max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p> : null}
      </div>
    </div>
    {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
  </div>
);

type StatCardProps = {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'default' | 'brand' | 'success' | 'warning';
};

const toneStyles: Record<NonNullable<StatCardProps['tone']>, string> = {
  default: 'bg-muted text-foreground border border-border',
  brand: 'bg-primary/10 text-primary border border-primary/20',
  success: 'bg-success/15 text-success border border-success/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
};

export const StatCard = ({ label, value, hint, icon: Icon, tone = 'default' }: StatCardProps) => (
  <Card variant="interactive" className="group relative overflow-hidden">
    <CardContent className="p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
          <p className="mt-2 truncate font-display text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-[2rem]">{value}</p>
          {hint ? <p className="mt-1 text-xs leading-5 text-muted-foreground">{hint}</p> : null}
        </div>
        {Icon ? (
          <div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl', toneStyles[tone])}>
            <Icon className="h-5 w-5" aria-hidden="true" />
          </div>
        ) : null}
      </div>
    </CardContent>
  </Card>
);

type StatusBadgeProps = {
  label: string;
  tone?: 'brand' | 'success' | 'warning' | 'secondary' | 'destructive';
};

export const StatusBadge = ({ label, tone = 'secondary' }: StatusBadgeProps) => (
  <Badge variant={tone} className="w-fit rounded-md">
    {label}
  </Badge>
);
