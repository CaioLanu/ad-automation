import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

type ButtonVariant = 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'command';
type ButtonSize = 'sm' | 'default' | 'lg' | 'icon';

const variantStyles: Record<ButtonVariant, string> = {
  default:
    'border border-primary/20 bg-gradient-to-r from-primary to-cyan-500 text-primary-foreground shadow-lg shadow-primary/15 hover:brightness-105 focus-visible:ring-primary/40',
  secondary:
    'border border-white/35 bg-background/55 text-foreground shadow-sm backdrop-blur hover:bg-background/80',
  ghost: 'bg-transparent text-foreground hover:bg-background/55',
  outline:
    'border border-white/40 bg-background/50 text-foreground shadow-sm backdrop-blur hover:bg-background/78',
  destructive:
    'border border-destructive bg-destructive text-destructive-foreground hover:bg-destructive/90 focus-visible:ring-destructive/40',
  command:
    'border border-white/40 bg-background/50 text-muted-foreground shadow-sm backdrop-blur hover:bg-background/78 hover:text-foreground',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'min-h-10 rounded-md px-3 text-sm',
  default: 'min-h-11 rounded-md px-4 text-sm',
  lg: 'min-h-12 rounded-md px-6 text-base',
  icon: 'h-11 w-11 rounded-md',
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
        variantStyles[variant as ButtonVariant],
        sizeStyles[size as ButtonSize],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = 'Button';
