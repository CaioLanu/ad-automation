export function BootScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-background px-6 text-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm sm:p-10">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-md border border-border bg-primary text-primary-foreground shadow-sm">
          <div className="h-3 w-3 rounded-full bg-current" />
        </div>
        <p className="font-display text-xl text-foreground">Preparando a sessão…</p>
        <p className="mt-2 text-sm text-muted-foreground">Validando tokens, permissão e estado restaurado.</p>
      </div>
    </div>
  );
}
