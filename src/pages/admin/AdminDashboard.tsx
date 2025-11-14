// pages/admin/AdminDashboard.tsx
import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { OverviewTab } from './components/OverviewTab';
import { Clients } from './components/Clients';
import { CampanhasTab } from './components/CampanhasTab';
import { AgendaTab } from './components/AgendaTab';
import { LeadsTab } from './components/LeadsTab';
import { ArquivosTab } from './components/ArquivosTab';
import { InsightsTab } from './components/InsightsTab';
import { IdeiasTab } from './components/IdeiasTab';
import { FinanceiroTab } from './components/FinanceiroTab';
import { NovoClienteModal } from './components/NovoClienteModal';
import { SolicitacoesArtesTab } from './components/SolicitacoesArtesTab';
import type { 
  Cliente, 
  Campanha, 
  SolicitacaoDesign, 
  Lead, 
  Agenda,
  ArquivoCompartilhado,
  Insight,
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

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'campanhas' | 'agenda' | 'solicitacoes' | 'arquivos' | 'leads' | 'insights' | 'ideias' | 'financeiro'>('overview');
  const [showClienteModal, setShowClienteModal] = useState(false);

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
  const { data: arquivos } = useFirestoreCollection<ArquivoCompartilhado>('arquivos');
  const { data: insights } = useFirestoreCollection<Insight>('insights');
  const { data: ideias } = useFirestoreCollection<Ideia>('ideias');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">

<div className="flex gap-2 mb-8 overflow-x-auto pb-2">
  {[
    { key: 'overview', label: 'Visão Geral' },
    { key: 'users', label: 'Usuários' },
    { key: 'campanhas', label: 'Campanhas' },
    { key: 'agenda', label: 'Agenda' },
    { key: 'solicitacoes', label: 'Solicitações de Artes' }, // ALTERADO
    { key: 'leads', label: 'Leads' },
    { key: 'arquivos', label: 'Arquivos' },
    { key: 'insights', label: 'Insights' },
    { key: 'ideias', label: 'Ideias' },
    { key: 'financeiro', label: 'Financeiro' },
  ].map((tab) => (
    <button
      key={`tab-${tab.key}`}
      onClick={() => setActiveTab(tab.key as any)}
      className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
        activeTab === tab.key
          ? 'bg-secondary text-background'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
      }`}
    >
      {tab.label}
    </button>
  ))}
</div>

        {activeTab === 'overview' && (
          <OverviewTab 
            clientes={clientes}
            campanhas={campanhas}
            solicitacoes={solicitacoes}
            leads={leads}
            agendas={agendas}
            ideias={ideias}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'users' && <Clients />}

        {activeTab === 'campanhas' && (
          <CampanhasTab clientes={clientes} campanhas={campanhas} />
        )}

        {activeTab === 'agenda' && (
          <AgendaTab clientes={clientes} agendas={agendas} />
        )}

        {activeTab === 'solicitacoes' && (
          <SolicitacoesArtesTab 
            clientes={clientes}
            solicitacoes={solicitacoes}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsTab clientes={clientes} leads={leads} />
        )}

        {activeTab === 'arquivos' && (
          <ArquivosTab clientes={clientes} arquivos={arquivos} />
        )}

        {activeTab === 'insights' && (
          <InsightsTab insights={insights} />
        )}

        {activeTab === 'ideias' && (
          <IdeiasTab clientes={clientes} ideias={ideias} />
        )}

        {activeTab === 'financeiro' && (
          <FinanceiroTab clientes={clientes} />
        )}
      </main>

      {showClienteModal && (
        <NovoClienteModal onClose={() => setShowClienteModal(false)} />
      )}
    </div>
  );
}