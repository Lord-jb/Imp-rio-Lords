// pages/client/ClientDashboard.tsx
import { useState } from 'react';
import { Wallet, Globe, Palette, Calendar, FileText, Lightbulb, Users, Bell, TrendingUp } from 'lucide-react';
import { where } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SolicitacaoArteModal } from './components/SolicitacaoArteModal';
import { IdeiaModal } from './components/IdeiaModal';
import type { 
  Cliente, 
  Campanha, 
  SolicitacaoDesign, 
  Lead, 
  Notificacao, 
  Agenda, 
  ArquivoCompartilhado, 
  Insight
} from '../../types';
import { formatCurrency, formatDate } from '../../lib/utils';

export function ClientDashboard() {
  const { session } = useAuth();
  const uid = session?.uid || '';
  const [showSolicitacaoModal, setShowSolicitacaoModal] = useState(false);
  const [showIdeiaModal, setShowIdeiaModal] = useState(false);

  const { data: clientes } = useFirestoreCollection<Cliente>('clientes');
  const cliente = clientes.find((c) => c.uid === uid);

  const { data: campanhas } = useFirestoreCollection<Campanha>('campanhas', [
    where('uid_cliente', '==', uid),
  ]);

  const { data: solicitacoes } = useFirestoreCollection<SolicitacaoDesign>('solicitacoes_design', [
    where('uid_cliente', '==', uid),
  ]);

  const { data: leads } = useFirestoreCollection<Lead>('leads', [
    where('uid_cliente', '==', uid),
  ]);

  const { data: notificacoes } = useFirestoreCollection<Notificacao>('notificacoes', [
    where('uid_cliente', '==', uid),
    where('lido', '==', false),
  ]);

  const { data: agendas } = useFirestoreCollection<Agenda>('agenda', [ 
    where('uid_cliente', '==', uid),
  ]);

  const { data: arquivos } = useFirestoreCollection<ArquivoCompartilhado>('arquivos', [
    where('uid_cliente', '==', uid),
  ]);

  const { data: insights } = useFirestoreCollection<Insight>('insights', [
    where('ativo', '==', true),
  ]);

  const campanhasAtivas = campanhas.filter(c => c.status === 'Ativa');
  const solicitacoesPendentes = solicitacoes.filter(s => s.status !== 'entregue' && s.status !== 'cancelado');
  const leadsNovos = leads.filter(l => l.status === 'novo').length;
  const proximosEventos = agendas.slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold">
            Olá, <span className="text-secondary">{cliente?.nome?.split(' ')[0] || 'Cliente'}</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Bem-vindo ao seu centro de controle. Tudo que o time atualiza aparece aqui em tempo real.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="bg-secondary/10 rounded-full p-4">
              <Wallet className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Saldo (Tráfego)</h3>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(cliente?.saldo_carteira || 0)}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="bg-secondary/10 rounded-full p-4">
              <Globe className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Status do Site</h3>
              <p className="text-xl font-bold">{cliente?.status_site || '-'}</p>
              <small className="text-gray-500">{cliente?.plano_nome}</small>
            </div>
          </Card>

          <Card className="flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="bg-secondary/10 rounded-full p-4">
              <Palette className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Artes do Plano</h3>
              <p className="text-xl font-bold">
                {cliente?.artes_usadas || 0} / {cliente?.plano_artes_total || 0}
              </p>
              {cliente?.permissoes?.podeSolicitarDesign && (
                <Button 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setShowSolicitacaoModal(true)}
                >
                  Solicitar Arte
                </Button>
              )}
            </div>
          </Card>

          <Card className="flex items-center gap-4 hover:shadow-lg transition-shadow">
            <div className="bg-secondary/10 rounded-full p-4">
              <Users className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Leads Novos</h3>
              <p className="text-xl font-bold text-green-500">+{leadsNovos}</p>
              <small className="text-gray-500">Total: {leads.length}</small>
            </div>
          </Card>
        </div>

        {notificacoes.length > 0 && (
          <Card className="mb-6 bg-secondary/5 border-l-4 border-secondary">
            <div className="flex items-start gap-3">
              <Bell className="text-secondary mt-1" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold mb-2">Notificações Recentes</h3>
                <div className="space-y-2">
                  {notificacoes.slice(0, 3).map((notif) => (
                    <p key={notif.id} className="text-sm text-gray-300">
                      • {notif.mensagem}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="text-secondary" size={24} />
                Campanhas Ativas
              </h3>
              <span className="bg-secondary/20 text-secondary px-3 py-1 rounded-full text-sm font-semibold">
                {campanhasAtivas.length}
              </span>
            </div>
            
            {campanhasAtivas.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhuma campanha ativa no momento.</p>
            ) : (
              <div className="space-y-3">
                {campanhasAtivas.map((campanha) => (
                  <div
                    key={campanha.id}
                    className="flex justify-between items-center border border-border rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div>
                      <p className="font-semibold">{campanha.nome_campanha}</p>
                      <p className="text-sm text-gray-400">{campanha.plataforma || 'N/A'}</p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        <span>Cliques: {campanha.metricas?.cliques || 0}</span>
                        <span>Leads: {campanha.metricas?.leads || 0}</span>
                        {campanha.metricas?.roas && <span>ROAS: {campanha.metricas.roas}x</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">{formatCurrency(campanha.investimento)}</p>
                      <p className="text-sm text-gray-400">{campanha.resultado || '-'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Calendar className="text-secondary" size={24} />
                Próximos Eventos
              </h3>
            </div>
            
            {proximosEventos.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhum evento agendado.</p>
            ) : (
              <div className="space-y-3">
                {proximosEventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="border border-border rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{evento.descricao}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {formatDate(evento.data)} às {evento.hora}
                        </p>
                        <p className="text-sm text-gray-500">{evento.local}</p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        evento.status === 'confirmado' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {evento.status}
                      </span>
                    </div>
                    {evento.link_meet && (
                      <a 
                        href={evento.link_meet} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-secondary text-sm mt-2 inline-block hover:underline"
                      >
                        Acessar reunião →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Palette className="text-secondary" size={24} />
                Solicitações de Artes
              </h3>
              <span className="bg-orange-500/20 text-orange-500 px-3 py-1 rounded-full text-sm font-semibold">
                {solicitacoesPendentes.length} pendentes
              </span>
            </div>
            
            {solicitacoes.length === 0 ? (
              <p className="text-gray-400 text-center py-4">Nenhuma solicitação ainda.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {solicitacoes.slice(0, 5).map((sol) => (
                  <div
                    key={sol.id}
                    className="border border-border rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">{sol.titulo}</p>
                        <p className="text-sm text-gray-400 mt-1">{sol.tipo}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Criado em {formatDate(sol.createdAt)}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        sol.status === 'entregue' ? 'bg-green-500/20 text-green-500' :
                        sol.status === 'em_producao' ? 'bg-blue-500/20 text-blue-500' :
                        sol.status === 'revisao' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {sol.status.replace('_', ' ')}
                      </span>
                    </div>
                    {sol.entregas.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <p className="text-xs text-gray-400 mb-2">Entregas:</p>
                        {sol.entregas.map((entrega, idx) => (
                          <a
                            key={idx}
                            href={entrega.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-secondary text-sm hover:underline block"
                          >
                            📎 {entrega.nome}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {cliente?.permissoes?.recebeLeads && (
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="text-secondary" size={24} />
                  Meus Leads
                </h3>
                <span className="bg-green-500/20 text-green-500 px-3 py-1 rounded-full text-sm font-semibold">
                  {leadsNovos} novos
                </span>
              </div>
              
              {leads.length === 0 ? (
                <p className="text-gray-400 text-center py-4">Nenhum lead recebido ainda.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {leads.slice(0, 5).map((lead) => (
                    <div
                      key={lead.id}
                      className="border border-border rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-semibold">{lead.nome}</p>
                          <p className="text-sm text-gray-400">{lead.email}</p>
                          <p className="text-sm text-gray-400">{lead.telefone}</p>
                          <p className="text-xs text-gray-500 mt-1">{lead.cidade}</p>
                        </div>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          lead.status === 'ganho' ? 'bg-green-500/20 text-green-500' :
                          lead.status === 'em_negociacao' ? 'bg-blue-500/20 text-blue-500' :
                          lead.status === 'perdido' ? 'bg-red-500/20 text-red-500' :
                          lead.status === 'contatado' ? 'bg-yellow-500/20 text-yellow-500' :
                          'bg-gray-500/20 text-gray-500'
                        }`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        <Card className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <FileText className="text-secondary" size={24} />
              Arquivos & Entregas
            </h3>
          </div>
          
          {arquivos.length === 0 ? (
            <p className="text-gray-400 text-center py-4">Nenhum arquivo recebido.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {arquivos.map((arquivo) => (
                <div
                  key={arquivo.id}
                  className="border border-border rounded-lg p-4 hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{arquivo.titulo}</p>
                      <p className="text-sm text-gray-400 mt-1">{arquivo.descricao}</p>
                      <span className="inline-block mt-2 px-2 py-1 bg-secondary/20 text-secondary rounded text-xs">
                        {arquivo.categoria}
                      </span>
                    </div>
                  </div>
                  <a
                    href={arquivo.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-block text-secondary hover:underline text-sm"
                  >
                    Baixar arquivo →
                  </a>
                </div>
              ))}
            </div>
          )}
        </Card>

        {insights.length > 0 && (
          <Card className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold flex items-center gap-2">
                <Lightbulb className="text-secondary" size={24} />
                Dicas e Ofertas
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight) => (
                <div
                  key={insight.id}
                  className={`border rounded-lg p-4 ${
                    insight.destaque 
                      ? 'border-secondary bg-secondary/5' 
                      : 'border-border hover:bg-gray-800/50'
                  } transition-colors`}
                >
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs font-semibold">
                      {insight.categoria}
                    </span>
                  </div>
                  <h4 className="font-semibold mt-3">{insight.titulo}</h4>
                  <p className="text-sm text-gray-400 mt-2">{insight.descricao}</p>
                  {insight.link_externo && (
                    <a
                      href={insight.link_externo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-block text-secondary hover:underline text-sm"
                    >
                      Saiba mais →
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Lightbulb className="text-secondary" size={24} />
              Tem uma ideia?
            </h3>
          </div>
          <p className="text-gray-400 mb-4">
            Envie sugestões, necessidades ou qualquer insight para sua próxima campanha.
          </p>
          <Button onClick={() => setShowIdeiaModal(true)}>
            Enviar Ideia
          </Button>
        </Card>
      </main>

      {showSolicitacaoModal && (
        <SolicitacaoArteModal
          clienteUid={uid}
          onClose={() => setShowSolicitacaoModal(false)}
        />
      )}

      {showIdeiaModal && (
        <IdeiaModal
          clienteUid={uid}
          onClose={() => setShowIdeiaModal(false)}
        />
      )}
    </div>
  );
}
