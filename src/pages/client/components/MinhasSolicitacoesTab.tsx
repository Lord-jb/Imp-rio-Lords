// pages/client/components/MinhasSolicitacoesTab.tsx
import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { CheckCircle2, Clock, AlertCircle, MessageSquare, X, FileDown } from 'lucide-react';
import { CommentsSection } from '../../../components/comments/CommentsSection';
import type { SolicitacaoDesign } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { useAuth } from '../../../hooks/useAuth';

interface MinhasSolicitacoesTabProps {
  solicitacoes: SolicitacaoDesign[];
}

export function MinhasSolicitacoesTab({ solicitacoes }: MinhasSolicitacoesTabProps) {
  const { session, profile } = useAuth();
  const [commentsSol, setCommentsSol] = useState<SolicitacaoDesign | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('');

  const solicitacoesFiltradas = solicitacoes.filter(sol => {
    if (!selectedStatus) return true;
    return sol.status === selectedStatus;
  });

  const pendentes = solicitacoes.filter(s => s.status === 'pendente' || !s.status).length;
  const emProducao = solicitacoes.filter(s => s.status === 'em_producao').length;
  const entregues = solicitacoes.filter(s => s.status === 'entregue').length;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 rounded-lg p-3">
              <Clock className="text-orange-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Pendentes</p>
              <p className="text-3xl font-bold text-orange-500">{pendentes}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 rounded-lg p-3">
              <AlertCircle className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Em Produção</p>
              <p className="text-3xl font-bold text-blue-500">{emProducao}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 rounded-lg p-3">
              <CheckCircle2 className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Entregues</p>
              <p className="text-3xl font-bold text-green-500">{entregues}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 rounded-lg p-3">
              <AlertCircle className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-3xl font-bold">{solicitacoes.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtro de Status */}
      <div className="mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedStatus('')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedStatus === ''
                ? 'bg-secondary text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Todas
          </button>
          <button
            onClick={() => setSelectedStatus('pendente')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'pendente'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Pendentes
          </button>
          <button
            onClick={() => setSelectedStatus('em_producao')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'em_producao'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Em Produção
          </button>
          <button
            onClick={() => setSelectedStatus('revisao')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'revisao'
                ? 'bg-yellow-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Em Revisão
          </button>
          <button
            onClick={() => setSelectedStatus('entregue')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
              selectedStatus === 'entregue'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Entregues
          </button>
        </div>
      </div>

      {/* Lista de Solicitações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {solicitacoesFiltradas.map((sol) => {
          const prioridade = sol.prioridade || 'media';
          const status = sol.status || 'pendente';
          
          return (
            <Card key={sol.id} className="hover:border-secondary/50 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                    prioridade === 'urgente' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    prioridade === 'alta' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' :
                    prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {prioridade}
                  </span>
                  <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                    status === 'entregue' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                    status === 'em_producao' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                    status === 'revisao' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                    status === 'cancelado' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  }`}>
                    {status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">{sol.titulo}</h3>
              <p className="text-sm text-gray-500 mb-3">Tipo: {sol.tipo}</p>
              
              <div className="bg-gray-800/50 rounded-lg p-3 mb-3">
                <p className="text-xs text-gray-400 mb-1 font-semibold">Briefing:</p>
                <p className="text-sm text-gray-300">{sol.briefing}</p>
              </div>

              {sol.prazo && (
                <p className="text-xs text-gray-500 mb-3 flex items-center gap-2">
                  <Clock size={14} />
                  Prazo: {sol.prazo}
                </p>
              )}

              {/* Links de Entrega */}
              {sol.links_entrega && sol.links_entrega.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
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
                        className="flex items-center gap-2 text-sm text-secondary hover:underline bg-gray-800/50 rounded px-3 py-2 transition-colors hover:bg-gray-800"
                      >
                        <FileDown size={16} />
                        Baixar Arquivo {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Info */}
              {status === 'pendente' && (
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-orange-400 font-semibold flex items-center gap-2">
                    <Clock size={14} />
                    Aguardando início da produção
                  </p>
                </div>
              )}

              {status === 'em_producao' && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-400 font-semibold flex items-center gap-2">
                    <AlertCircle size={14} />
                    Nossa equipe está trabalhando na sua arte
                  </p>
                </div>
              )}

              {status === 'revisao' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-yellow-400 font-semibold flex items-center gap-2">
                    <AlertCircle size={14} />
                    Arte em revisão - aguardando aprovação
                  </p>
                </div>
              )}

              {/* Botão de Comentários */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCommentsSol(sol)}
                className="w-full mt-2"
              >
                <MessageSquare size={16} className="mr-2" />
                Comentários e Chat
              </Button>

              <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-border">
                Solicitado em {formatDate(sol.createdAt)}
              </p>
            </Card>
          );
        })}
      </div>

      {solicitacoesFiltradas.length === 0 && (
        <Card className="text-center py-12">
          <AlertCircle className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 mb-2">Nenhuma solicitação encontrada</p>
          <p className="text-sm text-gray-500">
            {selectedStatus
              ? 'Tente ajustar os filtros'
              : 'Você ainda não fez nenhuma solicitação de arte'}
          </p>
        </Card>
      )}

      {/* Comments Modal */}
      {commentsSol && session?.uid && profile?.name && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-2xl font-bold">{commentsSol.titulo}</h2>
                <p className="text-sm text-neutral-400 mt-1">
                  Tipo: {commentsSol.tipo} | Status: {commentsSol.status?.replace('_', ' ')}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    commentsSol.status === 'entregue' ? 'bg-green-500/20 text-green-400' :
                    commentsSol.status === 'em_producao' ? 'bg-blue-500/20 text-blue-400' :
                    commentsSol.status === 'revisao' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    {commentsSol.status?.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setCommentsSol(null)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {commentsSol.id && (
              <CommentsSection
                solicitacaoId={commentsSol.id}
                currentUserId={session.uid}
                currentUserName={profile.name}
                currentUserRole="client"
                currentUserAvatar={profile.avatar}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}