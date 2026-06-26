import { PageHeader } from '@/components/app/PageHeader';
import { SeiTasksWorkspace } from '@/components/sei/SeiTasksWorkspace';
import { useAuth } from '@/lib/auth-context';

export function QueuesPage() {
  const { session } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão Active Directory"
        description="Gerencie usuários importados, envio para AD e verificações antes da replicação para o SEI."
      />
      {session ? <SeiTasksWorkspace session={session} /> : null}
    </div>
  );
}
