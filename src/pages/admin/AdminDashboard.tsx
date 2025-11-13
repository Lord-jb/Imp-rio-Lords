// pages/admin/AdminDashboard.tsx
import { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Palette, 
  Plus,
  Calendar,
  Lightbulb,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { CampanhasTab } from './components/CampanhasTab';
import { AgendaTab } from './components/AgendaTab';
import { DesignTab } from './components/DesignTab';
import { LeadsTab } from './components/LeadsTab';
import { ArquivosTab } from './components/ArquivosTab';
import { InsightsTab } from './components/InsightsTab';
import { IdeiasTab } from './components/IdeiasTab';
import { FinanceiroTab } from './components/FinanceiroTab';
import { NovoClienteModal } from './components/NovoClienteModal';
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
import { formatCurrency } from '../../lib/utils';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'clientes' | 'campanhas' | 'agenda' | 'design' | 'arquivos' | 'leads' | 'insights' | 'ideias' | 'financeiro'>('overview');
  const [selectedCliente, setSelectedCliente] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showClienteModal, setShowClienteModal] = useState(false);

  const { data: clientes } = useFirestoreCollection<Cliente>('clientes');
  const { data: campanhas } = useFirestoreCollection<Campanha>('campanhas');
  const { data: solicitacoes } = useFirestoreCollection<SolicitacaoDesign>('solicitacoes_design');
  const { data: leads } = useFirestoreCollection<Lead>('leads');
  const { data: agendas } = useFirestoreCollection<Agenda>('agenda');
  const { data: arquivos } = useFirestoreCollection<ArquivoCompartilhado>('arquivos');
  const { data: insights } = useFirestoreCollection<Insight>('insights');
  const { data: ideias } = useFirestoreCollection<Ideia>('ideias');

  const saldoTotal = clientes.reduce((sum, c) => sum + (c.saldo_carteira || 0), 0);
  const campanhasAtivas = campanhas.filter(c => c.status === 'Ativa').length;
  const artesPendentes = solicitacoes.filter(s => s.status !== 'entregue' && s.status !== 'cancelado').length;
  const leadsNovos = leads.filter(l => l.status === 'novo').length;

  const clientesFiltrados = clientes.filter(c =>  
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email_login.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const leadsFiltrados = selectedCliente
    ? leads.filter(l => l.uid_cliente === selectedCliente)
    : leads;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <Button onClick={() => setShowClienteModal(true)}>
            <Plus size={20} className="mr-2" />
            Novo Cliente
          </Button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
{[
  { key: 'overview', label: 'Visão Geral' },
  { key: 'clientes', label: 'Clientes' },
  { key: 'campanhas', label: 'Campanhas' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'design', label: 'Design' },
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
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-semibold">Clientes Ativos</p>
                    <p className="text-3xl font-bold text-secondary">{clientes.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Total cadastrados</p>
                  </div>
                  <Users className="text-secondary" size={40} />
                </div>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-semibold">Saldo em Carteira</p>
                    <p className="text-3xl font-bold text-green-500">{formatCurrency(saldoTotal)}</p>
                    <p className="text-xs text-gray-500 mt-1">Total disponível</p>
                  </div>
                  <DollarSign className="text-green-500" size={40} />
                </div>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-semibold">Campanhas Ativas</p>
                    <p className="text-3xl font-bold text-blue-500">{campanhasAtivas}</p>
                    <p className="text-xs text-gray-500 mt-1">de {campanhas.length} total</p>
                  </div>
                  <TrendingUp className="text-blue-500" size={40} />
                </div>
              </Card>

              <Card className="hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm uppercase font-semibold">Artes Pendentes</p>
                    <p className="text-3xl font-bold text-orange-500">{artesPendentes}</p>
                    <p className="text-xs text-gray-500 mt-1">Aguardando produção</p>
                  </div>
                  <Palette className="text-orange-500" size={40} />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <h3 className="text-xl font-semibold mb-4">Atividade Recente</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Users className="text-secondary" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Novos Leads</p>
                      <p className="text-xs text-gray-400">Últimas 24h</p>
                    </div>
                    <span className="text-2xl font-bold text-green-500">+{leadsNovos}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Palette className="text-secondary" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Solicitações de Design</p>
                      <p className="text-xs text-gray-400">Pendentes</p>
                    </div>
                    <span className="text-2xl font-bold text-orange-500">{artesPendentes}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Calendar className="text-secondary" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Eventos Agendados</p>
                      <p className="text-xs text-gray-400">Próximos 7 dias</p>
                    </div>
                    <span className="text-2xl font-bold text-blue-500">{agendas.length}</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                    <Lightbulb className="text-secondary" size={20} />
                    <div className="flex-1">
                      <p className="text-sm font-semibold">Ideias Recebidas</p>
                      <p className="text-xs text-gray-400">Aguardando análise</p>
                    </div>
                    <span className="text-2xl font-bold text-purple-500">{ideias.filter(i => i.status === 'novo').length}</span>
                  </div>
                </div>
              </Card>

              <Card>
                <h3 className="text-xl font-semibold mb-4">Clientes Recentes</h3>
                <div className="space-y-2 max-h-96 overflow-y-auto">
{clientes.slice(0, 8).map((cliente, i) => (
  <div 
    key={cliente.uid || `cliente-${i}`}
    className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-gray-800/50 transition-colors cursor-pointer"
    onClick={() => {
      setSelectedCliente(cliente.uid);
      setActiveTab('clientes');
    }}
  >
    <div>
      <p className="font-semibold">{cliente.nome}</p>
      <p className="text-sm text-gray-400">{cliente.email_login}</p>
    </div>
    <div className="text-right">
      <p className="font-semibold text-green-500">{formatCurrency(cliente.saldo_carteira)}</p>
      <p className="text-xs text-gray-500">{cliente.plano_nome}</p>
    </div>
  </div>
))}

                </div>
              </Card>
            </div>

            <Card>
              <h3 className="text-xl font-semibold mb-4">Performance das Campanhas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Campanha</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Investimento</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Leads</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">ROAS</th>
                    </tr>
                  </thead>
                  <tbody>
{campanhas.slice(0, 10).map((campanha, i) => {
  const cliente = clientes.find(c => c.uid === campanha.uid_cliente);
  const rowKey = campanha.id || `${campanha.uid_cliente}-${campanha.nome_campanha}-${i}`;
  return (
    <tr key={rowKey} className="border-b border-border hover:bg-gray-800/50">
      <td className="py-3 px-4">{cliente?.nome || 'N/A'}</td>
      <td className="py-3 px-4">{campanha.nome_campanha}</td>
      <td className="py-3 px-4">
        <span className={`px-2 py-1 rounded text-xs font-semibold ${
          campanha.status === 'Ativa' ? 'bg-green-500/20 text-green-500' :
          campanha.status === 'Pausada' ? 'bg-yellow-500/20 text-yellow-500' :
          'bg-gray-500/20 text-gray-500'
        }`}>
          {campanha.status}
        </span>
      </td>
      <td className="py-3 px-4 font-semibold">{formatCurrency(campanha.investimento)}</td>
      <td className="py-3 px-4">{campanha.metricas?.leads || 0}</td>
      <td className="py-3 px-4 font-semibold text-secondary">
        {campanha.metricas?.roas ? `${campanha.metricas.roas}x` : '-'}
      </td>
    </tr>
  );
})}

                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'clientes' && (
          <>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar cliente por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-border rounded-lg text-white"
                />
              </div>
              <Button variant="secondary">
                <Filter size={20} className="mr-2" />
                Filtros
              </Button>
              <Button>
                <Download size={20} className="mr-2" />
                Exportar
              </Button>
            </div>

            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">E-mail</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Plano</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status Site</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Saldo</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Artes</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientesFiltrados.map((cliente, i) => (
                      <tr key={cliente.uid || `cliente-row-${i}`} className="border-b border-border hover:bg-gray-800/50">
                        <td className="py-3 px-4 font-semibold">{cliente.nome}</td>
                        <td className="py-3 px-4 text-gray-400">{cliente.email_login}</td>
                        <td className="py-3 px-4">{cliente.plano_nome}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            cliente.status_site === 'Ativo' ? 'bg-green-500/20 text-green-500' :
                            cliente.status_site === 'Em Desenvolvimento' ? 'bg-blue-500/20 text-blue-500' :
                            'bg-gray-500/20 text-gray-500'
                          }`}>
                            {cliente.status_site}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-green-500">
                          {formatCurrency(cliente.saldo_carteira)}
                        </td>
                        <td className="py-3 px-4">
                          {cliente.artes_usadas} / {cliente.plano_artes_total}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="secondary">Editar</Button>
                            <Button size="sm" onClick={() => {
                              setSelectedCliente(cliente.uid);
                              setActiveTab('campanhas');
                            }}>
                              Ver Campanhas
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {activeTab === 'campanhas' && (
          <CampanhasTab
            clientes={clientes}
            campanhas={campanhas}
            selectedCliente={selectedCliente}
            setSelectedCliente={setSelectedCliente}
          />
        )}

        {activeTab === 'agenda' && (
          <AgendaTab 
            clientes={clientes}
            agendas={agendas}
          />
        )}

        {activeTab === 'design' && (
          <DesignTab 
            clientes={clientes}
            solicitacoes={solicitacoes}
          />
        )}

        {activeTab === 'leads' && (
          <LeadsTab 
            clientes={clientes}
            leads={leadsFiltrados}
            selectedCliente={selectedCliente}
            setSelectedCliente={setSelectedCliente}
          />
        )}

        {activeTab === 'arquivos' && (
          <ArquivosTab 
            clientes={clientes}
            arquivos={arquivos}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab insights={insights} />
        )}

        {activeTab === 'ideias' && (
          <IdeiasTab
            clientes={clientes}
            ideias={ideias}
          />
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
