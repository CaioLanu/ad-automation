import { FileBarChart } from 'lucide-react';
import { PageHeader } from '@/components/app/PageHeader';
import { Alert } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Relatórios" description="Espaço visual do Lovable preparado para endpoints futuros." />
      <Alert variant="brand" title="Sem mock operacional" description="Nenhum relatório fictício é enviado ao backend; a área fica aguardando contrato real." />
      <Card className="border-border/80 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold"><FileBarChart className="h-4 w-4" /> Relatórios futuros</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-6 text-muted-foreground">
          Quando houver endpoints de auditoria/relatórios, esta rota pode consumir o mesmo client centralizado em <code className="rounded bg-muted px-1">src/lib/api.ts</code>.
        </CardContent>
      </Card>
    </div>
  );
}
