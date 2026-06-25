import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'elevated' | 'interactive' | 'panel';
};

const cardVariants = {
  default: 'overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm',
  elevated: 'overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm',
  interactive:
    'overflow-hidden rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-colors hover:border-primary/30',
  panel: 'overflow-hidden rounded-lg border border-border bg-surface text-card-foreground shadow-sm',
} as const;

export const Card = ({ className, variant = 'default', ...props }: CardProps) => (
  <div
    className={cn(
      cardVariants[variant],
      className,
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex flex-col gap-2 border-b border-border/70 bg-transparent p-5 sm:p-6', className)} {...props} />
);

export const CardTitle = ({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl', className)} {...props} />
);

export const CardDescription = ({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm leading-6 text-muted-foreground', className)} {...props} />
);

export const CardContent = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-5 pb-5 sm:px-6 sm:pb-6', className)} {...props} />
);

export const CardFooter = ({ className, ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('flex items-center border-t border-border/70 p-5 pt-4 sm:p-6 sm:pt-5', className)} {...props} />
);
