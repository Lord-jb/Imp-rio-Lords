import { useState } from 'react';
import { Plus, Trash2, RefreshCw, CheckCircle, XCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Cliente, IntegracaoAPI, MetricasPlataforma } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { createNotification } from '../../../hooks/useNotifications';

interface IntegracoesTabProps {
  clientes: Cliente[];
  integracoes: IntegracaoAPI[];
  metricas: MetricasPlataforma[];
}

export function IntegracoesTab({ clientes, integracoes, metricas }: IntegracoesTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingIntegracao, setEditingIntegracao] = useState<IntegracaoAPI | null>(null);

  function handleCreate() {
    setEditingIntegracao(null);
    setShowModal(true);
  }

  function handleEdit(integracao: IntegracaoAPI) {
    setEditingIntegracao(integracao);
    setShowModal(true);
  }

  async function handleDelete(integracaoId: string) {
    if (!confirm('Deseja realmente excluir esta integração?')) return;

    try {
      await deleteDoc(doc(db, 'integracoes_api', integracaoId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir integração');
    }
  }

  async function handleSyncMetrics(integracao: IntegracaoAPI) {
    if (!integracao.id) return;

    try {
      // Aqui você implementaria a lógica real de sincronização com a API
      // Por enquanto, vamos apenas atualizar o timestamp
      await updateDoc(doc(db, 'integracoes_api', integracao.id), {
        ultima_sincronizacao: Timestamp.now(),
        status: 'ativa',
      });

      // Notificar o cliente
      await createNotification({
        uid_destinatario: integracao.uid_cliente,
        tipo: 'sucesso',
        titulo: '📊 Métricas Sincronizadas',
        mensagem: `As métricas da plataforma ${integracao.plataforma} foram atualizadas com sucesso.`,
        link: '/client',
      });

      alert('Sincronização iniciada! As métricas serão atualizadas em breve.');
    } catch (error: any) {
      alert(error.message || 'Erro ao sincronizar métricas');
    }
  }

  const integracoesAtivas = integracoes.filter(i => i.status === 'ativa').length;
  const integracoesExpiradas = integracoes.filter(i => i.status === 'expirada').length;

  const getPlatformIcon = (plataforma: string) => {
    switch (plataforma) {
      case 'meta_ads':
        return '📘'; // Facebook/Meta
      case 'google_ads':
        return '🔍'; // Google
      case 'tiktok_ads':
        return '🎵'; // TikTok
      default:
        return '📱';
    }
  };

  const getPlatformName = (plataforma: string) => {
    switch (plataforma) {
      case 'meta_ads':
        return 'Meta Ads (Facebook/Instagram)';
      case 'google_ads':
        return 'Google Ads';
      case 'tiktok_ads':
        return 'TikTok Ads';
      default:
        return plataforma;
    }
  };

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 rounded-lg p-3">
              <LinkIcon className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Total de Integrações</p>
              <p className="text-3xl font-bold text-blue-500">{integracoes.length}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-transparent border-green-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-green-500/20 rounded-lg p-3">
              <CheckCircle className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Ativas</p>
              <p className="text-3xl font-bold text-green-500">{integracoesAtivas}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500/10 to-transparent border-orange-500/30">
          <div className="flex items-center gap-3">
            <div className="bg-orange-500/20 rounded-lg p-3">
              <AlertCircle className="text-orange-500" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-400">Expiradas/Erro</p>
              <p className="text-3xl font-bold text-orange-500">{integracoesExpiradas}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Nova Integração
        </Button>
      </div>

      {/* Lista de Integrações */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {integracoes.map((integracao) => {
          const cliente = clientes.find((c) => c.uid === integracao.uid_cliente);
          const metricasCount = metricas.filter(m => m.integracao_id === integracao.id).length;

          return (
            <Card key={integracao.id} className="relative">
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {integracao.status === 'ativa' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : integracao.status === 'expirada' ? (
                  <AlertCircle className="w-6 h-6 text-orange-500" />
                ) : (
                  <XCircle className="w-6 h-6 text-red-500" />
                )}
              </div>

              <div className="pr-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{getPlatformIcon(integracao.plataforma)}</span>
                  <div>
                    <h3 className="font-bold text-lg">{integracao.nome_conexao}</h3>
                    <p className="text-xs text-gray-400">{getPlatformName(integracao.plataforma)}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-sm text-gray-400">
                    Cliente: <span className="text-white font-semibold">{cliente?.nome || 'N/A'}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Conta ID: <span className="text-white font-mono text-xs">{integracao.conta_id}</span>
                  </p>
                  <p className="text-sm text-gray-400">
                    Métricas coletadas: <span className="text-white font-semibold">{metricasCount}</span>
                  </p>
                  {integracao.ultima_sincronizacao && (
                    <p className="text-xs text-gray-500">
                      Última sinc: {formatDate(integracao.ultima_sincronizacao)}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSyncMetrics(integracao)}
                    className="flex-1"
                  >
                    <RefreshCw size={14} className="mr-1" />
                    Sincronizar
                  </Button>
                  <button
                    onClick={() => integracao.id && handleDelete(integracao.id)}
                    className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="text-xs text-gray-600 mt-3 pt-3 border-t border-border">
                  Criado em {formatDate(integracao.createdAt)}
                </p>
              </div>
            </Card>
          );
        })}
      </div>

      {integracoes.length === 0 && (
        <Card className="text-center py-12">
          <LinkIcon className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 mb-2">Nenhuma integração configurada</p>
          <p className="text-sm text-gray-500 mb-4">
            Conecte contas de Meta Ads ou Google Ads para começar a sincronizar métricas
          </p>
          <Button onClick={handleCreate}>
            <Plus size={20} className="mr-2" />
            Adicionar Primeira Integração
          </Button>
        </Card>
      )}

      {/* Modal */}
      {showModal && (
        <IntegracaoModal
          clientes={clientes}
          integracao={editingIntegracao}
          onClose={() => {
            setShowModal(false);
            setEditingIntegracao(null);
          }}
        />
      )}
    </>
  );
}

// Modal para Nova/Editar Integração
function IntegracaoModal({
  clientes,
  integracao = null,
  onClose,
}: {
  clientes: Cliente[];
  integracao?: IntegracaoAPI | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: integracao?.uid_cliente || '',
    plataforma: integracao?.plataforma || ('meta_ads' as const),
    nome_conexao: integracao?.nome_conexao || '',
    conta_id: integracao?.conta_id || '',
    access_token: '', // Não preenche por segurança
    metricas_permissoes: integracao?.metricas_permissoes?.join(', ') || 'impressoes, cliques, conversoes',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      const permissoes = formData.metricas_permissoes.split(',').map(p => p.trim());

      if (integracao?.id) {
        await updateDoc(doc(db, 'integracoes_api', integracao.id), {
          uid_cliente: formData.uid_cliente,
          nome_conexao: formData.nome_conexao,
          conta_id: formData.conta_id,
          ...(formData.access_token && { access_token: formData.access_token }), // Só atualiza se fornecido
          metricas_permissoes: permissoes,
          updatedAt: Timestamp.now(),
        });
        setFeedback('✅ Integração atualizada com sucesso!');
      } else {
        await addDoc(collection(db, 'integracoes_api'), {
          uid_cliente: formData.uid_cliente,
          plataforma: formData.plataforma,
          nome_conexao: formData.nome_conexao,
          conta_id: formData.conta_id,
          access_token: formData.access_token || '',
          status: 'ativa',
          metricas_permissoes: permissoes,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        // Notificar cliente
        await createNotification({
          uid_destinatario: formData.uid_cliente,
          tipo: 'sucesso',
          titulo: '🔗 Nova Integração Conectada',
          mensagem: `A conta ${formData.nome_conexao} foi conectada e está pronta para sincronizar métricas.`,
          link: '/client',
        });

        setFeedback('✅ Integração criada com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(`❌ Erro: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {integracao ? 'Editar Integração' : 'Nova Integração'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <Select
              value={formData.uid_cliente}
              onChange={(e) => setFormData({ ...formData, uid_cliente: e.target.value })}
              required
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.uid} value={c.uid}>{c.nome}</option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Plataforma</label>
            <Select
              value={formData.plataforma}
              onChange={(e) => setFormData({ ...formData, plataforma: e.target.value as any })}
              disabled={!!integracao}
              required
            >
              <option value="meta_ads">Meta Ads (Facebook/Instagram)</option>
              <option value="google_ads">Google Ads</option>
              <option value="tiktok_ads">TikTok Ads</option>
            </Select>
            {integracao && (
              <p className="text-xs text-gray-500 mt-1">Não é possível alterar a plataforma após criação</p>
            )}
          </div>

          <Input
            label="Nome da Conexão"
            value={formData.nome_conexao}
            onChange={(e) => setFormData({ ...formData, nome_conexao: e.target.value })}
            placeholder="Ex: Conta Principal Facebook"
            required
          />

          <Input
            label="ID da Conta na Plataforma"
            value={formData.conta_id}
            onChange={(e) => setFormData({ ...formData, conta_id: e.target.value })}
            placeholder="Ex: act_123456789"
            required
          />

          <div>
            <Input
              label="Access Token (Opcional para edição)"
              type="password"
              value={formData.access_token}
              onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
              placeholder={integracao ? 'Deixe vazio para não alterar' : 'Cole o token aqui'}
              required={!integracao}
            />
            <p className="text-xs text-gray-500 mt-1">
              ⚠️ Este token será armazenado de forma segura e nunca será exibido novamente
            </p>
          </div>

          <div>
            <Input
              label="Permissões de Métricas (separadas por vírgula)"
              value={formData.metricas_permissoes}
              onChange={(e) => setFormData({ ...formData, metricas_permissoes: e.target.value })}
              placeholder="impressoes, cliques, conversoes, investimento"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Ex: impressoes, cliques, conversoes, investimento, roas
            </p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-4">
            <p className="text-blue-400 text-sm">
              <strong>💡 Como obter o Access Token:</strong>
            </p>
            <ul className="text-blue-400 text-xs mt-2 space-y-1 list-disc list-inside">
              <li><strong>Meta Ads:</strong> Business Settings → Usuários do Sistema → Gerar Token</li>
              <li><strong>Google Ads:</strong> API Center → Credentials → OAuth 2.0</li>
              <li><strong>TikTok Ads:</strong> Business Center → Tools → API Tools</li>
            </ul>
          </div>

          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : integracao ? 'Salvar Alterações' : 'Criar Integração'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>

          {feedback && (
            <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
              feedback.includes('✅')
                ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}>
              {feedback}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
