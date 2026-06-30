import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive' | 'brand' | 'success' | 'warning';

const styles: Record<BadgeVariant, string> = {
  default: 'bg-primary/10 text-primary border border-primary/20',
  secondary: 'bg-background/50 text-foreground border border-white/35 backdrop-blur',
  outline: 'bg-background/35 text-foreground border border-white/35 backdrop-blur',
  destructive: 'bg-destructive/10 text-destructive border border-destructive/20',
  brand: 'bg-primary text-primary-foreground border border-primary',
  success: 'bg-success/15 text-success border border-success/20',
  warning: 'bg-warning/15 text-warning border border-warning/20',
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export const Badge = ({ className, variant = 'default', ...props }: BadgeProps) => (
  <span
    className={cn(
      'inline-flex min-h-7 items-center gap-1.5 rounded-md px-3 py-1 text-xs font-bold uppercase tracking-[0.16em]',
      styles[variant as BadgeVariant],
      className,
    )}
    {...props}
  />
);
