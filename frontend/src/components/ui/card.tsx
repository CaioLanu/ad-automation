import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'default' | 'elevated' | 'interactive' | 'panel';
};

const cardVariants = {
  default: 'glass-card rounded-[1.35rem] text-card-foreground',
  elevated: 'glass-panel rounded-[1.75rem] text-card-foreground',
  interactive:
    'glass-card rounded-[1.35rem] text-card-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30',
  panel: 'glass-card rounded-[1.35rem] text-card-foreground',
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
  <div className={cn('flex flex-col gap-2 border-b border-white/35 bg-transparent p-5 sm:p-6', className)} {...props} />
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
  <div className={cn('flex items-center border-t border-white/35 p-5 pt-4 sm:p-6 sm:pt-5', className)} {...props} />
);
