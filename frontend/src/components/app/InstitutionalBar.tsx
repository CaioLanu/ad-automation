import { Globe2, MoonStar, SunMedium } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import logo from '../../assets/Logomarca_PP.png';
import type { ThemeMode } from '@/lib/theme';

type InstitutionalBarProps = {
  theme: ThemeMode;
  onToggleTheme: () => void;
  className?: string;
};

export function InstitutionalBar({ theme, onToggleTheme, className }: InstitutionalBarProps) {
  return (
    <header
      aria-label="Barra institucional"
      className={cn(
        'glass-panel flex flex-col gap-4 rounded-[1.5rem] border-white/35 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between',
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3 sm:gap-4">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[1rem] border border-white/60 bg-white/85 shadow-[0_14px_28px_-22px_rgba(37,99,235,0.45)] backdrop-blur">
          <img src={logo} alt="Brasão institucional" className="h-10 w-10 object-contain" />
        </div>

        <div className="min-w-0">
          <p className="text-[0.62rem] font-bold uppercase tracking-[0.4em] text-muted-foreground">BRASIL</p>
          <p className="font-display text-sm font-semibold leading-tight text-foreground sm:text-[0.95rem]">Secretaria de Estado de Polícia Penal</p>
          <p className="text-xs leading-5 text-muted-foreground">Automatizando sua Gestão, com segurança</p>
        </div>
      </div>

      <p className="hidden max-w-xl border-l border-border/70 pl-5 text-sm leading-6 text-muted-foreground xl:block">
        Acesso institucional à gestão centralizada de redes compartilhadas
      </p>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => window.open('https://www.gov.br/', '_blank', 'noopener,noreferrer')}
          className="border-border/70 bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-surface-subtle"
        >
          <Globe2 className="h-4 w-4" aria-hidden="true" />
          <span>GOV.BR</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          role="switch"
          aria-checked={theme === 'dark'}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Desativar alto contraste' : 'Ativar alto contraste'}
          title={theme === 'dark' ? 'Desativar alto contraste' : 'Ativar alto contraste'}
          className="border-border/70 bg-background/80 text-foreground shadow-sm backdrop-blur hover:bg-surface-subtle"
        >
          {theme === 'dark' ? <SunMedium className="h-4 w-4" aria-hidden="true" /> : <MoonStar className="h-4 w-4" aria-hidden="true" />}
          <span>Alto contraste</span>
        </Button>
      </div>
    </header>
  );
}
