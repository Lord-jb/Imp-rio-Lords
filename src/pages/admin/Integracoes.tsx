import { AdminLayout } from '../../components/layout/AdminLayout';
import { IntegracoesTab } from './components/IntegracoesTab';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { Cliente, IntegracaoAPI, MetricasPlataforma } from '../../types';

interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
}

export function Integracoes() {
  const { data: usersRaw } = useFirestoreCollection<UserDoc>('users');
  const clientes: Cliente[] = (usersRaw || []).map((u) => ({
    uid: u.id,
    nome: u.name,
    email_login: u.email,
  })) as Cliente[];

  const { data: integracoes } = useFirestoreCollection<IntegracaoAPI>('integracoes_api');
  const { data: metricas } = useFirestoreCollection<MetricasPlataforma>('metricas_plataformas');

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold mb-2">Integrações de APIs</h1>
        <p className="text-neutral-400 mb-8">
          Conecte contas de Meta Ads e Google Ads para sincronizar métricas automaticamente
        </p>

        <IntegracoesTab
          clientes={clientes}
          integracoes={integracoes}
          metricas={metricas}
        />
      </div>
    </AdminLayout>
  );
}
