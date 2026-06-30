import { PageHeader } from '@/components/app/PageHeader';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SeiPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão SEI"
        description="Replicação para o SEI após a conclusão das alterações no Active Directory."
      />

      <Card>
        <CardHeader>
          <CardTitle>Replicação SEI</CardTitle>
          <CardDescription>Esta etapa será usada depois que os usuários forem enviados ou atualizados no AD.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert
            variant="default"
            title="Aguardando alterações no AD"
            description="Após a conclusão das ações no Active Directory, os registros serão preparados para replicação no SEI."
          />
        </CardContent>
      </Card>
    </div>
  );
}
