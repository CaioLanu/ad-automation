import { MoonStar, SunMedium } from 'lucide-react';
import logo from '../../assets/Logomarca_PP.png';
import type { ThemeMode } from '../../lib/theme';
import { Button } from '../ui/button';

type GovIdentityBarProps = {
  theme: ThemeMode;
  onToggleTheme: () => void;
  subtitle?: string;
};

export const GovIdentityBar = ({ theme, onToggleTheme, subtitle }: GovIdentityBarProps) => (
  <div className="border-b border-border bg-surface">
    <div className="mx-auto flex max-w-[92rem] flex-col gap-3 px-4 py-3 sm:px-6 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 border-l-4 border-l-emerald-700 pl-3">
          <img src={logo} alt="Logomarca PP" className="h-10 w-10 object-contain" />
          <div className="leading-tight">
            <div className="text-[0.65rem] font-bold uppercase tracking-[0.24em] text-muted-foreground">Brasil</div>
            <div className="text-sm font-semibold text-foreground">Governo Federal</div>
            <div className="text-xs text-muted-foreground">Barra de identidade institucional</div>
          </div>
        </div>

        {subtitle ? <div className="hidden border-l border-border pl-4 text-sm text-muted-foreground lg:block">{subtitle}</div> : null}
      </div>

      <div className="flex items-center gap-3">
        <span className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          gov.br
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          role="switch"
          aria-checked={theme === 'dark'}
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar alto contraste'}
          title={theme === 'dark' ? 'Ativar modo claro' : 'Ativar alto contraste'}
          className="rounded-md px-3"
        >
          {theme === 'dark' ? <SunMedium className="h-4 w-4" aria-hidden="true" /> : <MoonStar className="h-4 w-4" aria-hidden="true" />}
          <span className="relative h-5 w-10 rounded-full border border-border bg-muted" aria-hidden="true">
            <span
              className={`absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-foreground transition-transform ${
                theme === 'dark' ? 'translate-x-5' : 'translate-x-1'
              }`}
            />
          </span>
          <span>{theme === 'dark' ? 'Modo claro' : 'Alto contraste'}</span>
        </Button>
      </div>
    </div>
  </div>
);
