import type { ReactNode } from 'react';

interface PageHeaderProps { title: string; description?: string; actions?: ReactNode; eyebrow?: string | null }

export function PageHeader({ title, description, actions, eyebrow = 'Central administrativa' }: PageHeaderProps) {
  return (
    <div className="glass-panel grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 rounded-[1.75rem] p-5 sm:p-6">
      <div className="min-w-0">
        {eyebrow ? <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-primary">{eyebrow}</p> : null}
        <h1 className={eyebrow ? 'mt-1 truncate font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl' : 'truncate font-display text-2xl font-black tracking-tight text-foreground sm:text-3xl'}>{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
