import { AdminLayout } from '../../components/layout/AdminLayout';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { SolicitacoesArtesTab } from './components/SolicitacoesArtesTab';
import type { Cliente, SolicitacaoDesign } from '../../types';

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

export function Solicitacoes() {
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

  const { data: solicitacoes } = useFirestoreCollection<SolicitacaoDesign>('solicitacoes_design');

  return (
    <AdminLayout>
      <SolicitacoesArtesTab clientes={clientes} solicitacoes={solicitacoes} />
    </AdminLayout>
  );
}
