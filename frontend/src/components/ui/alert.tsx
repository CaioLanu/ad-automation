import type { HTMLAttributes, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  title?: ReactNode;
  description?: ReactNode;
  variant?: 'default' | 'destructive' | 'brand' | 'success' | 'warning';
};

const alertStyles = {
  default: 'border-border bg-background text-foreground',
  destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
  brand: 'border-primary/30 bg-primary/10 text-primary',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
} as const;

export const Alert = ({ className, title, description, variant = 'default', children, ...props }: AlertProps) => (
  <div
    role="alert"
    className={cn(
      'rounded-lg border px-4 py-4 shadow-sm',
      alertStyles[variant as keyof typeof alertStyles],
      className,
    )}
    {...props}
  >
    <div className="flex gap-3">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-current/20 bg-current/10">
        <AlertTriangle className="h-4 w-4" />
      </div>
      <div className="space-y-1">
        {title ? <div className="font-semibold leading-5">{title}</div> : null}
        {description ? <div className="text-sm leading-6 opacity-90">{description}</div> : null}
        {children}
      </div>
    </div>
  </div>
);
