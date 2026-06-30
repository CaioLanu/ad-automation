import type { ReactNode } from 'react';
import { InstitutionalBar } from '@/components/app/InstitutionalBar';
import { Header } from '@/components/app/Header';
import { Sidebar } from '@/components/app/Sidebar';
import { useAuth } from '@/lib/auth-context';

export function AppLayout({ children }: { children: ReactNode }) {
  const { theme, toggleTheme } = useAuth();

  return (
    <div className="app-glass-shell relative flex min-h-screen w-full flex-col overflow-x-hidden p-3">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:42px_42px] opacity-[0.16]" />
      <div className="pointer-events-none absolute -left-24 top-24 h-80 w-80 rounded-full bg-cyan-200/45 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-0 h-96 w-96 rounded-full bg-sky-200/35 blur-3xl" />
      <div className="sticky top-3 z-50 mb-4">
        <InstitutionalBar theme={theme} onToggleTheme={toggleTheme} />
      </div>
      <div className="relative flex min-h-0 flex-1 md:gap-4">
        <Sidebar />
        <div className="relative flex min-w-0 flex-1 flex-col md:gap-4">
          <Header />
          <main className="relative flex-1 px-1 py-5 md:px-2 md:py-3">
            <div className="mx-auto w-full max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
