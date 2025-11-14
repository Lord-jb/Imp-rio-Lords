// pages/admin/components/OverviewTab.tsx
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Palette, 
  Calendar,
  Lightbulb
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { formatCurrency } from '../../../lib/utils';
import type { Cliente, Campanha, SolicitacaoDesign, Lead, Agenda, Ideia } from '../../../types';

interface OverviewTabProps {
  clientes: Cliente[];
  campanhas: Campanha[];
  solicitacoes: SolicitacaoDesign[];
  leads: Lead[];
  agendas: Agenda[];
  ideias: Ideia[];
  setActiveTab: (tab: any) => void;
}

export function OverviewTab({
  clientes,
  campanhas,
  solicitacoes,
  leads,
  agendas,
  ideias,
  setActiveTab
}: OverviewTabProps) {
  const saldoTotal = clientes.reduce((sum, c) => sum + (c.saldo_carteira || 0), 0);
  const campanhasAtivas = campanhas.filter(c => c.status === 'Ativa').length;
  const artesPendentes = solicitacoes.filter(s => s.status !== 'entregue' && s.status !== 'cancelado').length;
  const leadsNovos = leads.filter(l => l.status === 'novo').length;

  return (
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
                onClick={() => setActiveTab('users')}
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
  );
}