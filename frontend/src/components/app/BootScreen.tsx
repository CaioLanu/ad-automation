export function BootScreen() {
  return (
    <div className="app-glass-shell grid min-h-screen place-items-center px-6 text-center">
      <div className="glass-panel w-full max-w-md rounded-[2rem] p-8 sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <div className="h-3 w-3 rounded-full bg-current" />
        </div>
        <p className="font-display text-xl text-foreground">Preparando a sessão…</p>
        <p className="mt-2 text-sm text-muted-foreground">Validando tokens, permissão e estado restaurado.</p>
      </div>
    </div>
  );
}
