import type { LabelHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export const Label = ({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn(
      'inline-flex items-center gap-2 text-sm font-semibold leading-none text-foreground',
      className,
    )}
    {...props}
  />
);
