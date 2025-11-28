import { AdminLayout } from '../../components/layout/AdminLayout';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { OverviewTab } from './components/OverviewTab';
import type {
  Cliente,
  Campanha,
  SolicitacaoDesign,
  Lead,
  Agenda,
  Ideia
} from '../../types';

interface UserDoc {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatar?: string;
  planoNome?: string;
  saldo?: number;
  artesTotal?: number;
  statusSite?: string;
}

export function Overview() {
  const { data: usersRaw } = useFirestoreCollection<UserDoc>('users');
  const clientes: Cliente[] = (usersRaw || []).map((u) => ({
    uid: u.id,
    nome: u.name,
    email_login: u.email,
    plano_nome: u.planoNome ?? '',
    status_site: u.statusSite ?? 'Protótipo',
    saldo_carteira: u.saldo ?? 0,
    plano_artes_total: u.artesTotal ?? 0,
    artes_usadas: 0,
  })) as Cliente[];

  const { data: campanhas } = useFirestoreCollection<Campanha>('campanhas');
  const { data: solicitacoes } = useFirestoreCollection<SolicitacaoDesign>('solicitacoes_design');
  const { data: leads } = useFirestoreCollection<Lead>('leads');
  const { data: agendas } = useFirestoreCollection<Agenda>('agenda');
  const { data: ideias } = useFirestoreCollection<Ideia>('ideias');

  return (
    <AdminLayout>
      <OverviewTab
        clientes={clientes}
        campanhas={campanhas}
        solicitacoes={solicitacoes}
        leads={leads}
        agendas={agendas}
        ideias={ideias}
        setActiveTab={() => {}} // Not needed anymore since we use routing
      />
    </AdminLayout>
  );
}
