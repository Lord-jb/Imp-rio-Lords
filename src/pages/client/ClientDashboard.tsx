// pages/client/ClientDashboard.tsx
import { useState } from 'react';
import { 
  Wallet, 
  Globe, 
  Palette, 
  Calendar, 
  FileText, 
  Lightbulb, 
  Users, 
  Bell, 
  TrendingUp,
  Eye,
  MousePointer,
  Target,
  Award,
  Activity,
  DollarSign,
  Zap,
  BarChart3,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
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

  // Buscar dados do usuário da collection 'users'
  const { data: usersRaw } = useFirestoreCollection<any>('users');
  const userData = usersRaw.find((u: any) => u.id === uid);

  // Mapear para o formato Cliente
  const cliente: Cliente | undefined = userData ? {
    uid: userData.id,
    nome: userData.name,
    email_login: userData.email,
    plano_nome: userData.planoNome || '',
    status_site: userData.statusSite || 'Em Análise',
    saldo_carteira: userData.saldo || 0,
    plano_artes_total: userData.artesTotal || 0,
    artes_usadas: userData.artesUsadas || 0,
    permissoes: userData.permissoes || {
      podeSolicitarDesign: true,
      recebeLeads: false,
    },
    createdAt: userData.createdAt,
    updatedAt: userData.updatedAt,
  } as Cliente : undefined;

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

  // Métricas consolidadas
  const totalCliques = campanhasAtivas.reduce((sum, c) => sum + (c.metricas?.cliques || 0), 0);
  const totalLeads = campanhasAtivas.reduce((sum, c) => sum + (c.metricas?.leads || 0), 0);
  const totalInvestimento = campanhasAtivas.reduce((sum, c) => sum + c.investimento, 0);
  const roasMedia = campanhasAtivas.length > 0 
    ? (campanhasAtivas.reduce((sum, c) => sum + (c.metricas?.roas || 0), 0) / campanhasAtivas.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gray-900">
      <Header />
      
      <main className="px-4 sm:px-6 lg:px-8 py-8 max-w-[1600px] mx-auto">
        {/* Hero Section */}
        <section className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/20 via-secondary/10 to-transparent border border-secondary/30 p-8">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-2">
                  Olá, <span className="text-secondary animate-pulse">{cliente?.nome?.split(' ')[0] || 'Cliente'}</span>!
                </h1>
                <p className="text-gray-400 text-lg">
                  Acompanhe suas campanhas, resultados e gerencie sua presença digital em tempo real.
                </p>
              </div>
              <div className="flex gap-3">
                <Button size="lg" onClick={() => setShowSolicitacaoModal(true)} className="shadow-lg shadow-secondary/20">
                  <Palette size={20} className="mr-2" />
                  Solicitar Arte
                </Button>
                <Button size="lg" variant="secondary" onClick={() => setShowIdeiaModal(true)}>
                  <Lightbulb size={20} className="mr-2" />
                  Enviar Ideia
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Notificações em destaque */}
        {notificacoes.length > 0 && (
          <div className="mb-8 animate-slideIn">
            <Card className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-l-4 border-orange-500">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500/20 rounded-full p-3 animate-pulse">
                  <Bell className="text-orange-500" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    Notificações Importantes
                    <span className="bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs">
                      {notificacoes.length}
                    </span>
                  </h3>
                  <div className="space-y-2">
                    {notificacoes.slice(0, 3).map((notif) => (
                      <div key={notif.id} className="flex items-start gap-2 text-sm">
                        <AlertCircle size={16} className="text-orange-500 mt-0.5 flex-shrink-0" />
                        <p className="text-gray-300">{notif.mensagem}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* KPIs Principais - Design Premium */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-green-500/20 transition-all duration-300 cursor-pointer border-green-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-500/20 rounded-xl p-3 group-hover:scale-110 transition-transform">
                  <Wallet className="text-green-500" size={28} />
                </div>
                <ArrowUpRight className="text-green-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold tracking-wide mb-1">Saldo em Tráfego</h3>
              <p className="text-3xl font-bold text-green-500 mb-1">
                {formatCurrency(cliente?.saldo_carteira || 0)}
              </p>
              <p className="text-xs text-gray-500">Disponível para campanhas</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 cursor-pointer border-blue-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-500/20 rounded-xl p-3 group-hover:scale-110 transition-transform">
                  <Globe className="text-blue-500" size={28} />
                </div>
                <Activity className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold tracking-wide mb-1">Status do Site</h3>
              <p className="text-2xl font-bold mb-1">{cliente?.status_site || 'Em Análise'}</p>
              <p className="text-xs text-gray-500">{cliente?.plano_nome || 'Plano não definido'}</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 cursor-pointer border-purple-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-500/20 rounded-xl p-3 group-hover:scale-110 transition-transform">
                  <Palette className="text-purple-500" size={28} />
                </div>
                <Zap className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold tracking-wide mb-1">Artes do Plano</h3>
              <div className="mb-2">
                <p className="text-2xl font-bold mb-1">
                  {cliente?.artes_usadas || 0} <span className="text-gray-500 text-lg">/ {cliente?.plano_artes_total || 0}</span>
                </p>
                <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${((cliente?.artes_usadas || 0) / (cliente?.plano_artes_total || 1)) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-xs text-gray-500">{(cliente?.plano_artes_total || 0) - (cliente?.artes_usadas || 0)} artes restantes</p>
            </div>
          </Card>

          <Card className="relative overflow-hidden group hover:shadow-2xl hover:shadow-orange-500/20 transition-all duration-300 cursor-pointer border-orange-500/30">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-500/20 rounded-xl p-3 group-hover:scale-110 transition-transform">
                  <Users className="text-orange-500" size={28} />
                </div>
                <Target className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
              </div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold tracking-wide mb-1">Leads Capturados</h3>
              <p className="text-3xl font-bold text-orange-500 mb-1">
                <span className="text-green-400 text-2xl">+</span>{leadsNovos}
              </p>
              <p className="text-xs text-gray-500">Total: {leads.length} leads</p>
            </div>
          </Card>
        </div>

        {/* Métricas de Performance */}
        {campanhasAtivas.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 rounded-lg p-2">
                  <Eye className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total de Cliques</p>
                  <p className="text-2xl font-bold">{totalCliques.toLocaleString()}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-green-500/5 to-transparent border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 rounded-lg p-2">
                  <Target className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Total de Leads</p>
                  <p className="text-2xl font-bold text-green-500">{totalLeads}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-purple-500/5 to-transparent border-purple-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 rounded-lg p-2">
                  <DollarSign className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">Investimento Ativo</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalInvestimento)}</p>
                </div>
              </div>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-500/5 to-transparent border-yellow-500/30">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-500/20 rounded-lg p-2">
                  <Award className="text-yellow-500" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-400">ROAS Médio</p>
                  <p className="text-2xl font-bold text-yellow-500">{roasMedia}x</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Seção Principal - Grid 2 Colunas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Campanhas Ativas - Design Aprimorado */}
          <Card className="h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-secondary/20 rounded-lg p-2">
                  <TrendingUp className="text-secondary" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Campanhas Ativas</h3>
                  <p className="text-sm text-gray-400">Performance em tempo real</p>
                </div>
              </div>
              <span className="bg-secondary/20 text-secondary px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                <Activity size={16} />
                {campanhasAtivas.length}
              </span>
            </div>
            
            {campanhasAtivas.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                <BarChart3 className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 mb-2">Nenhuma campanha ativa</p>
                <p className="text-sm text-gray-500">Aguarde o início das suas campanhas</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {campanhasAtivas.map((campanha) => (
                  <div
                    key={campanha.id}
                    className="relative group border border-border rounded-xl p-5 hover:border-secondary/50 hover:bg-gray-800/50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowUpRight className="text-secondary" size={20} />
                    </div>
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-1">{campanha.nome_campanha}</h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                            {campanha.plataforma || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-500">•</span>
                          <span className="text-xs text-gray-400">
                            Investimento: <span className="text-secondary font-semibold">{formatCurrency(campanha.investimento)}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-3">
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <MousePointer className="mx-auto text-blue-400 mb-1" size={20} />
                        <p className="text-xl font-bold">{campanha.metricas?.cliques || 0}</p>
                        <p className="text-xs text-gray-500">Cliques</p>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <Target className="mx-auto text-green-400 mb-1" size={20} />
                        <p className="text-xl font-bold text-green-400">{campanha.metricas?.leads || 0}</p>
                        <p className="text-xs text-gray-500">Leads</p>
                      </div>
                      <div className="text-center p-3 bg-gray-800/50 rounded-lg">
                        <Award className="mx-auto text-yellow-400 mb-1" size={20} />
                        <p className="text-xl font-bold text-yellow-400">
                          {campanha.metricas?.roas ? `${campanha.metricas.roas}x` : '-'}
                        </p>
                        <p className="text-xs text-gray-500">ROAS</p>
                      </div>
                    </div>

                    {campanha.resultado && (
                      <p className="text-sm text-gray-400 italic">"{campanha.resultado}"</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Próximos Eventos - Design Aprimorado */}
          <Card className="h-fit">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 rounded-lg p-2">
                  <Calendar className="text-purple-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Próximos Eventos</h3>
                  <p className="text-sm text-gray-400">Sua agenda de compromissos</p>
                </div>
              </div>
            </div>
            
            {proximosEventos.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                <Clock className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 mb-2">Agenda limpa</p>
                <p className="text-sm text-gray-500">Nenhum evento agendado no momento</p>
              </div>
            ) : (
              <div className="space-y-4">
                {proximosEventos.map((evento) => (
                  <div
                    key={evento.id}
                    className="border border-border rounded-xl p-5 hover:border-purple-500/50 hover:bg-gray-800/50 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-bold text-lg mb-2 group-hover:text-purple-400 transition-colors">
                          {evento.descricao}
                        </h4>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-2 text-gray-400">
                            <Calendar size={16} className="text-purple-500" />
                            {formatDate(evento.data)}
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock size={16} className="text-purple-500" />
                            {evento.hora}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-2 flex items-center gap-2">
                          <span>📍</span> {evento.local}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                        evento.status === 'confirmado' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {evento.status === 'confirmado' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {evento.status}
                      </span>
                    </div>
                    
                    {evento.link_meet && (
                      <Button 
                        size="sm" 
                        variant="secondary"
                        className="w-full mt-3 group-hover:bg-purple-500 group-hover:text-white transition-colors"
                        onClick={() => window.open(evento.link_meet, '_blank')}
                      >
                        Acessar Reunião Online
                        <ArrowUpRight size={16} className="ml-2" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Solicitações de Artes e Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Solicitações de Design */}
          <Card>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500/20 rounded-lg p-2">
                  <Palette className="text-orange-500" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Solicitações de Artes</h3>
                  <p className="text-sm text-gray-400">Acompanhe suas criações</p>
                </div>
              </div>
              <span className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-full text-sm font-bold">
                {solicitacoesPendentes.length} pendentes
              </span>
            </div>
            
            {solicitacoes.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                <Palette className="mx-auto text-gray-600 mb-4" size={48} />
                <p className="text-gray-400 mb-2">Nenhuma solicitação ainda</p>
                <Button onClick={() => setShowSolicitacaoModal(true)} className="mt-4">
                  Solicitar Primeira Arte
                </Button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {solicitacoes.map((sol) => (
                  <div
                    key={sol.id}
                    className="border border-border rounded-lg p-4 hover:border-orange-500/50 hover:bg-gray-800/50 transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-1">{sol.titulo}</h4>
                        <p className="text-sm text-gray-400">{sol.tipo}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        sol.status === 'entregue' ? 'bg-green-500/20 text-green-400' :
                        sol.status === 'em_producao' ? 'bg-blue-500/20 text-blue-400' :
                        sol.status === 'revisao' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {sol.status === 'entregue' && <CheckCircle2 size={14} />}
                        {sol.status === 'em_producao' && <Activity size={14} />}
                        {sol.status.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-gray-500 mb-3">
                      Criado em {formatDate(sol.createdAt)}
                    </p>

                    {sol.links_entrega && sol.links_entrega.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-border bg-green-500/5 rounded-lg p-3">
                        <p className="text-xs text-green-400 mb-2 font-semibold flex items-center gap-2">
                          <CheckCircle2 size={14} />
                          Arquivos Entregues:
                        </p>
                        <div className="space-y-2">
                          {sol.links_entrega.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 text-secondary text-sm hover:underline hover:text-secondary/80 transition-colors bg-black/20 px-3 py-2 rounded-lg"
                            >
                              <FileText size={14} />
                              Arquivo {idx + 1}
                              <ArrowUpRight size={12} className="ml-auto" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Leads Recebidos */}
          {cliente?.permissoes?.recebeLeads && (
            <Card>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 rounded-lg p-2">
                    <Users className="text-green-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Meus Leads</h3>
                    <p className="text-sm text-gray-400">Oportunidades de negócio</p>
                  </div>
                </div>
                <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm font-bold">
                  {leadsNovos} novos
                </span>
              </div>
              
              {leads.length === 0 ? (
                <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
                  <Users className="mx-auto text-gray-600 mb-4" size={48} />
                  <p className="text-gray-400 mb-2">Nenhum lead ainda</p>
                  <p className="text-sm text-gray-500">Aguarde os primeiros contatos</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                  {leads.map((lead) => (
                    <div
                      key={lead.id}
                      className="border border-border rounded-lg p-4 hover:border-green-500/50 hover:bg-gray-800/50 transition-all duration-300group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg mb-2 group-hover:text-green-400 transition-colors">
                            {lead.nome}
                          </h4>
                          <div className="space-y-1 text-sm text-gray-400">
                            <p className="flex items-center gap-2">
                              <span>📧</span>
                              <a href={`mailto:${lead.email}`} className="hover:text-secondary transition-colors">
                                {lead.email}
                              </a>
                            </p>
                            <p className="flex items-center gap-2">
                              <span>📱</span>
                              <a href={`tel:${lead.telefone}`} className="hover:text-secondary transition-colors">
                                {lead.telefone}
                              </a>
                            </p>
                            {lead.cidade && (
                              <p className="flex items-center gap-2">
                                <span>📍</span>
                                {lead.cidade}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                          lead.status === 'ganho' ? 'bg-green-500/20 text-green-400' :
                          lead.status === 'em_negociacao' ? 'bg-blue-500/20 text-blue-400' :
                          lead.status === 'perdido' ? 'bg-red-500/20 text-red-400' :
                          lead.status === 'contatado' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {lead.status.replace('_', ' ')}
                        </span>
                      </div>

                      {lead.valor_potencial && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <p className="text-xs text-gray-500 mb-1">Valor Potencial</p>
                          <p className="text-lg font-bold text-green-400">
                            {formatCurrency(lead.valor_potencial)}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Arquivos e Entregas */}
        <Card className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 rounded-lg p-2">
                <FileText className="text-blue-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold">Arquivos & Entregas</h3>
                <p className="text-sm text-gray-400">Documentos e materiais compartilhados</p>
              </div>
            </div>
            <span className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-full text-sm font-bold">
              {arquivos.length} arquivos
            </span>
          </div>
          
          {arquivos.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-dashed border-gray-700">
              <FileText className="mx-auto text-gray-600 mb-4" size={48} />
              <p className="text-gray-400 mb-2">Nenhum arquivo compartilhado</p>
              <p className="text-sm text-gray-500">Arquivos aparecerão aqui quando disponíveis</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {arquivos.map((arquivo) => (
                <div
                  key={arquivo.id}
                  className="border border-border rounded-xl p-5 hover:border-blue-500/50 hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="bg-blue-500/20 rounded-lg p-3 group-hover:scale-110 transition-transform">
                      <FileText className="text-blue-400" size={24} />
                    </div>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">
                      {arquivo.categoria}
                    </span>
                  </div>
                  
                  <h4 className="font-bold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                    {arquivo.titulo}
                  </h4>
                  
                  {arquivo.descricao && (
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {arquivo.descricao}
                    </p>
                  )}
                  
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full group-hover:bg-blue-500 group-hover:text-white transition-colors"
                    onClick={() => window.open(arquivo.downloadURL, '_blank')}
                  >
                    Baixar Arquivo
                    <ArrowUpRight size={16} className="ml-2" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Insights e Ofertas */}
        {insights.length > 0 && (
          <Card className="mb-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-secondary/20 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-yellow-500/20 rounded-lg p-2">
                    <Lightbulb className="text-yellow-500" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Dicas e Ofertas Exclusivas</h3>
                    <p className="text-sm text-gray-400">Insights para impulsionar seu negócio</p>
                  </div>
                </div>
                <Zap className="text-yellow-500 animate-pulse" size={24} />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`relative overflow-hidden rounded-xl p-5 group cursor-pointer transition-all duration-300 ${
                      insight.destaque 
                        ? 'bg-gradient-to-br from-secondary/20 to-secondary/5 border-2 border-secondary hover:shadow-xl hover:shadow-secondary/30' 
                        : 'border border-border hover:border-yellow-500/50 hover:bg-gray-800/50'
                    }`}
                  >
                    {insight.destaque && (
                      <div className="absolute top-3 right-3">
                        <span className="bg-secondary text-background px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Zap size={12} />
                          DESTAQUE
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start gap-3 mb-4">
                      <div className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                        insight.categoria === 'oferta' ? 'bg-green-500/20 text-green-400' :
                        insight.categoria === 'dica' ? 'bg-blue-500/20 text-blue-400' :
                        insight.categoria === 'atualizacao' ? 'bg-purple-500/20 text-purple-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {insight.categoria.toUpperCase()}
                      </div>
                    </div>
                    
                    <h4 className="font-bold text-lg mb-3 group-hover:text-yellow-400 transition-colors">
                      {insight.titulo}
                    </h4>
                    
                    <p className="text-sm text-gray-400 mb-4 line-clamp-3">
                      {insight.descricao}
                    </p>
                    
                    {insight.link_externo && (
                      <Button
                        size="sm"
                        variant={insight.destaque ? "primary" : "secondary"}
                        className="w-full group-hover:scale-105 transition-transform"
                        onClick={() => window.open(insight.link_externo, '_blank')}
                      >
                        Saiba Mais
                        <ArrowUpRight size={16} className="ml-2" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Call to Action - Enviar Ideia */}
        <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-transparent border-2 border-purple-500/30">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="relative z-10 text-center py-8">
            <div className="inline-block bg-purple-500/20 rounded-full p-4 mb-4">
              <Lightbulb className="text-purple-400 animate-pulse" size={48} />
            </div>
            
            <h3 className="text-2xl font-bold mb-3">Tem uma ideia brilhante?</h3>
            
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Compartilhe suas sugestões, insights ou necessidades para as próximas campanhas. 
              Nossa equipe está pronta para transformar suas ideias em realidade!
            </p>
            
            <Button 
              size="lg"
              onClick={() => setShowIdeiaModal(true)}
              className="shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
            >
              <Lightbulb size={20} className="mr-2" />
              Enviar Minha Ideia
            </Button>
          </div>
        </Card>
      </main>

      {/* Modals */}
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

      {/* Custom Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(209, 163, 48, 0.5);
          border-radius: 10px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(209, 163, 48, 0.7);
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}