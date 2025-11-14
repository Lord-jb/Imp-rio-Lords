// pages/admin/components/SolicitacoesArtesTab.tsx
import { useState } from 'react';
import { Trash2, Upload, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { Cliente, SolicitacaoDesign } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';

interface SolicitacoesArtesTabProps {
  clientes: Cliente[];
  solicitacoes: SolicitacaoDesign[];
}

export function SolicitacoesArtesTab({ clientes, solicitacoes }: SolicitacoesArtesTabProps) {
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  const solicitacoesFiltradas = solicitacoes.filter(sol => {
    const clienteMatch = selectedCliente ? sol.uid_cliente === selectedCliente : true;
    const statusMatch = selectedStatus ? sol.status === selectedStatus : true;
    return clienteMatch && statusMatch;
  });

  const pendentes = solicitacoes.filter(s => s.status === 'pendente' || !s.status).length;
  const emProducao = solicitacoes.filter(s => s.status === 'em_producao').length;
  const entregues = solicitacoes.filter(s => s.status === 'entregue').length;

  async function handleDelete(solId: string) {
    if (!confirm('Deseja realmente excluir esta solicitação?')) return;

    try {
      await deleteDoc(doc(db, 'solicitacoes_design', solId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir solicitação');
    }
  }

  async function handleUpdateStatus(solId: string, status: string) {
    try {
      await updateDoc(doc(db, 'solicitacoes_design', solId), { status });
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar status');
    }
  }

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
              <Upload className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-3xl font-bold">{solicitacoes.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <Select
          value={selectedCliente}
          onChange={(e) => setSelectedCliente(e.target.value)}
          className="flex-1"
        >
          <option value="">Todos os clientes</option>
          {clientes.map((c, i) => (
            <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
          ))}
        </Select>

        <Select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="flex-1"
        >
          <option value="">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="em_producao">Em Produção</option>
          <option value="revisao">Revisão</option>
          <option value="entregue">Entregue</option>
          <option value="cancelado">Cancelado</option>
        </Select>
      </div>

      {/* Lista de Solicitações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {solicitacoesFiltradas.map((sol) => {
          const cliente = clientes.find((c) => c.uid === sol.uid_cliente);
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
                <div className="flex gap-2">
                  <button 
                    onClick={() => sol.id && handleDelete(sol.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-lg mb-2">{sol.titulo}</h3>
              <p className="text-sm text-gray-400 mb-1">
                Cliente: <span className="text-white font-semibold">{cliente?.nome || 'N/A'}</span>
              </p>
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

              {/* Ações rápidas de status */}
              <div className="flex gap-2 mb-3">
                {status === 'pendente' && (
                  <Button
                    size="sm"
                    onClick={() => sol.id && handleUpdateStatus(sol.id, 'em_producao')}
                    className="flex-1"
                  >
                    Iniciar Produção
                  </Button>
                )}
                
                {status === 'em_producao' && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => sol.id && handleUpdateStatus(sol.id, 'revisao')}
                      className="flex-1"
                    >
                      Enviar p/ Revisão
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => sol.id && handleUpdateStatus(sol.id, 'entregue')}
                      className="flex-1"
                    >
                      Entregar
                    </Button>
                  </>
                )}

                {status === 'revisao' && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => sol.id && handleUpdateStatus(sol.id, 'em_producao')}
                      className="flex-1"
                    >
                      Voltar p/ Produção
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => sol.id && handleUpdateStatus(sol.id, 'entregue')}
                      className="flex-1"
                    >
                      Entregar
                    </Button>
                  </>
                )}

                {status === 'entregue' && (
                  <div className="flex items-center gap-2 text-green-500 text-sm font-semibold px-3 py-2 bg-green-500/10 rounded-lg w-full justify-center">
                    <CheckCircle2 size={16} />
                    Entregue com sucesso
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-border">
                Criado em {formatDate(sol.createdAt)}
              </p>
            </Card>
          );
        })}
      </div>

      {solicitacoesFiltradas.length === 0 && (
        <Card className="text-center py-12">
          <Upload className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 mb-2">Nenhuma solicitação encontrada</p>
          <p className="text-sm text-gray-500">
            {selectedCliente || selectedStatus 
              ? 'Tente ajustar os filtros' 
              : 'Aguarde as solicitações dos clientes'}
          </p>
        </Card>
      )}
    </>
  );
}