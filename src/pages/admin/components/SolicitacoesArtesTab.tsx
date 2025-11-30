// pages/admin/components/SolicitacoesArtesTab.tsx
import { useState } from 'react';
import { Trash2, Upload, CheckCircle2, Clock, AlertCircle, FileUp, MessageSquare, X } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { FileUpload } from '../../../components/ui/FileUpload';
import { CommentsSection } from '../../../components/comments/CommentsSection';
import type { Cliente, SolicitacaoDesign } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, deleteDoc, arrayUnion, getDoc } from 'firebase/firestore';
import { createNotification } from '../../../hooks/useNotifications';
import { useAuth } from '../../../hooks/useAuth';

interface SolicitacoesArtesTabProps {
  clientes: Cliente[];
  solicitacoes: SolicitacaoDesign[];
}

export function SolicitacoesArtesTab({ clientes, solicitacoes }: SolicitacoesArtesTabProps) {
  const { session, profile } = useAuth();
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [uploadingSol, setUploadingSol] = useState<SolicitacaoDesign | null>(null);
  const [commentsSol, setCommentsSol] = useState<SolicitacaoDesign | null>(null);

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
      // Atualizar status da solicitação
      await updateDoc(doc(db, 'solicitacoes_design', solId), { status });

      // Se status = 'entregue', incrementar artesUsadas do cliente e notificar
      if (status === 'entregue') {
        const solicitacao = solicitacoes.find(s => s.id === solId);
        if (solicitacao) {
          const userRef = doc(db, 'users', solicitacao.uid_cliente);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const currentArtes = userSnap.data().artesUsadas || 0;
            await updateDoc(userRef, {
              artesUsadas: currentArtes + 1,
            });

            // Criar notificação para o cliente
            await createNotification({
              uid_destinatario: solicitacao.uid_cliente,
              tipo: 'sucesso',
              titulo: '🎨 Arte Entregue!',
              mensagem: `Sua solicitação "${solicitacao.tipo}" foi entregue e está disponível para visualização.`,
              link: '/client',
            });
          }
        }
      }

      // Notificar quando mudar para em_producao
      if (status === 'em_producao') {
        const solicitacao = solicitacoes.find(s => s.id === solId);
        if (solicitacao) {
          await createNotification({
            uid_destinatario: solicitacao.uid_cliente,
            tipo: 'info',
            titulo: '⚙️ Arte em Produção',
            mensagem: `Sua solicitação "${solicitacao.tipo}" está sendo produzida pela nossa equipe.`,
            link: '/client',
          });
        }
      }
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

              {/* Links de Entrega */}
              {sol.links_entrega && sol.links_entrega.length > 0 && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 mb-3">
                  <p className="text-xs text-green-400 mb-2 font-semibold">Arquivos Entregues:</p>
                  <div className="space-y-1">
                    {sol.links_entrega.map((link, idx) => (
                      <a
                        key={idx}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-secondary hover:underline block truncate"
                      >
                        📎 Arquivo {idx + 1}
                      </a>
                    ))}
                  </div>
                </div>
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
                      variant="ghost"
                      onClick={() => setUploadingSol(sol)}
                      className="flex-1"
                    >
                      <FileUp size={16} className="mr-1" />
                      Upload Entrega
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => sol.id && handleUpdateStatus(sol.id, 'revisao')}
                      className="flex-1"
                    >
                      Enviar p/ Revisão
                    </Button>
                  </>
                )}

                {status === 'revisao' && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setUploadingSol(sol)}
                      className="flex-1"
                    >
                      <FileUp size={16} className="mr-1" />
                      Upload Entrega
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

              {/* Botão de Comentários */}
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCommentsSol(sol)}
                className="w-full mt-2"
              >
                <MessageSquare size={16} className="mr-2" />
                Comentários
              </Button>

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
                currentUserRole="admin"
                currentUserAvatar={profile.avatar}
              />
            )}
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadingSol && (
        <UploadEntregaModal
          solicitacao={uploadingSol}
          onClose={() => setUploadingSol(null)}
        />
      )}
    </>
  );
}

// Modal para Upload de Entrega
function UploadEntregaModal({
  solicitacao,
  onClose,
}: {
  solicitacao: SolicitacaoDesign;
  onClose: () => void;
}) {
  const [uploadError, setUploadError] = useState('');
  const [saving, setSaving] = useState(false);

  async function handleUploadComplete(downloadURL: string, _storagePath: string, _fileName: string) {
    if (!solicitacao.id) return;

    setSaving(true);
    try {
      await updateDoc(doc(db, 'solicitacoes_design', solicitacao.id), {
        links_entrega: arrayUnion(downloadURL),
      });

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setUploadError(error.message || 'Erro ao salvar entrega');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Upload de Entrega</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            disabled={saving}
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">
            Solicitação: <span className="text-white font-semibold">{solicitacao.titulo}</span>
          </p>
          <p className="text-sm text-gray-400">
            Tipo: <span className="text-white">{solicitacao.tipo}</span>
          </p>
        </div>

        <FileUpload
          label="Arquivo de Entrega"
          folder={`entregas/${solicitacao.uid_cliente}/${solicitacao.id}`}
          onUploadComplete={handleUploadComplete}
          onError={(error) => setUploadError(error)}
          accept="image/*,video/*,.pdf,.ai,.psd,.fig"
        />

        {uploadError && (
          <p className="text-red-500 text-sm text-center mt-4">{uploadError}</p>
        )}

        {saving && (
          <p className="text-green-500 text-sm text-center mt-4">
            Salvando entrega...
          </p>
        )}
      </div>
    </div>
  );
}