import { useState } from 'react';
import { Users, Phone, Mail, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, ChevronDown, Plus, MessageSquare, Eye } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import { Input } from '../../../components/ui/Input';
import { FileUpload } from '../../../components/ui/FileUpload';
import type { Lead } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';
import { useAuth } from '../../../contexts/AuthContext.tsx';

interface LeadsListClientProps {
  leads: Lead[];
}

export function LeadsListClient({ leads }: LeadsListClientProps) {
  const { user } = useAuth();
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (!leadId) return;

    setUpdatingStatus(leadId);
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do lead');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'novo':
        return {
          label: 'Novo',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'em_contato':
        return {
          label: 'Em Contato',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: <Phone className="w-4 h-4" />,
        };
      case 'atendido':
        return {
          label: 'Atendido',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'convertido':
        return {
          label: 'Convertido',
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'cliente_recusou':
        return {
          label: 'Cliente Recusou',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: <XCircle className="w-4 h-4" />,
        };
      case 'sem_interesse':
        return {
          label: 'Sem Interesse',
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: <AlertCircle className="w-4 h-4" />,
        };
    }
  };

  function handleView(lead: Lead) {
    setSelectedLead(lead);
    setShowDetailsModal(true);
  }

  function handleAddObservation(lead: Lead) {
    setSelectedLead(lead);
    setShowObservationModal(true);
  }

  if (leads.length === 0) {
    return (
      <>
        <div className="flex justify-end mb-4">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={20} className="mr-2" />
            Novo Lead
          </Button>
        </div>
        <Card className="text-center py-12">
          <Users className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400 mb-2">Nenhum lead disponível</p>
          <p className="text-sm text-gray-500">
            Quando houver leads, eles aparecerão aqui
          </p>
        </Card>
        {showCreateModal && user && (
          <CreateLeadModal
            uid_cliente={user.uid}
            onClose={() => setShowCreateModal(false)}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus size={20} className="mr-2" />
          Novo Lead
        </Button>
      </div>

      <div className="space-y-4">
        {leads.map((lead) => {
          const statusInfo = getStatusInfo(lead.status);
          const isExpanded = expandedLead === lead.id;

          return (
            <Card key={lead.id} className="hover:border-secondary/50 transition-all">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{lead.nome}</h3>
                      <p className="text-xs text-gray-500">{formatDate(lead.createdAt)}</p>
                    </div>
                    <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border flex items-center gap-2 ${statusInfo.color}`}>
                      {statusInfo.icon}
                      {statusInfo.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Mail className="w-4 h-4 text-secondary" />
                      {lead.email}
                    </div>
                    {lead.telefone && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <Phone className="w-4 h-4 text-secondary" />
                        {lead.telefone}
                      </div>
                    )}
                    {lead.valor_potencial && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <DollarSign className="w-4 h-4 text-green-500" />
                        <span className="text-green-500 font-semibold">
                          {formatCurrency(lead.valor_potencial)}
                        </span>
                      </div>
                    )}
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-border space-y-3 animate-slideDown">
                      {lead.origem && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Origem:</p>
                          <p className="text-sm text-white">{lead.origem}</p>
                        </div>
                      )}
                      {lead.mensagem && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mensagem:</p>
                          <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                            {lead.mensagem}
                          </p>
                        </div>
                      )}
                      {lead.print_url && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Comprovante:</p>
                          <a
                            href={lead.print_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-secondary hover:underline"
                          >
                            Ver anexo →
                          </a>
                        </div>
                      )}
                      {lead.observacoes && lead.observacoes.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-500 mb-2">Observações:</p>
                          <div className="space-y-2">
                            {lead.observacoes.map((obs, i) => (
                              <div key={i} className="bg-gray-800/50 p-2 rounded text-xs">
                                <p className="text-gray-400 mb-1">
                                  {formatDate(obs.data)} - {obs.autor}
                                </p>
                                <p className="text-gray-300">{obs.texto}</p>
                                {obs.anexo_url && (
                                  <a
                                    href={obs.anexo_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-secondary hover:underline mt-1 inline-block"
                                  >
                                    Ver anexo →
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                      <label className="text-sm text-gray-400 font-medium">
                        Alterar status:
                      </label>
                      <div className="flex-1 sm:max-w-xs">
                        <Select
                          value={lead.status}
                          onChange={(e) => lead.id && handleStatusChange(lead.id, e.target.value)}
                          disabled={updatingStatus === lead.id}
                          className="w-full"
                        >
                          <option value="novo">🆕 Novo</option>
                          <option value="em_contato">📞 Em Contato</option>
                          <option value="atendido">✅ Atendido</option>
                          <option value="convertido">🎉 Convertido</option>
                          <option value="cliente_recusou">❌ Cliente Recusou</option>
                          <option value="sem_interesse">🚫 Sem Interesse</option>
                        </Select>
                      </div>
                      {updatingStatus === lead.id && (
                        <span className="text-xs text-gray-500">Atualizando...</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={() => handleView(lead)}
                      className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Ver detalhes
                    </button>
                    <button
                      onClick={() => handleAddObservation(lead)}
                      className="text-sm text-purple-500 hover:text-purple-400 flex items-center gap-2"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Adicionar observação
                    </button>
                    <button
                      onClick={() => setExpandedLead(isExpanded ? null : lead.id || null)}
                      className="text-sm text-secondary hover:text-secondary/80 flex items-center gap-2"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                      {isExpanded ? 'Ver menos' : 'Ver mais'}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}

        <style>{`
          @keyframes slideDown {
            from {
              opacity: 0;
              max-height: 0;
            }
            to {
              opacity: 1;
              max-height: 500px;
            }
          }

          .animate-slideDown {
            animation: slideDown 0.3s ease-out;
          }
        `}</style>
      </div>

      {showCreateModal && user && (
        <CreateLeadModal
          uid_cliente={user.uid}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showDetailsModal && selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedLead(null);
          }}
        />
      )}

      {showObservationModal && selectedLead && (
        <ObservationModal
          lead={selectedLead}
          onClose={() => {
            setShowObservationModal(false);
            setSelectedLead(null);
          }}
        />
      )}
    </>
  );
}

function CreateLeadModal({
  uid_cliente,
  onClose,
}: {
  uid_cliente: string;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    status: 'novo' as const,
    valor_potencial: 0,
    mensagem: '',
    print_url: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!uid_cliente) {
      setFeedback('Erro: Cliente não identificado');
      return;
    }

    setLoading(true);
    setFeedback('');

    try {
      const leadData: any = {
        uid_cliente: uid_cliente,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        status: formData.status,
        createdAt: Timestamp.now(),
        observacoes: [],
      };

      if (formData.cidade) leadData.cidade = formData.cidade;
      if (formData.valor_potencial > 0) leadData.valor_potencial = formData.valor_potencial;
      if (formData.mensagem) leadData.mensagem = formData.mensagem;
      if (formData.print_url) leadData.print_url = formData.print_url;

      await addDoc(collection(db, 'leads'), leadData);
      setFeedback('Lead criado com sucesso!');
      setTimeout(onClose, 1500);
    } catch (error: any) {
      console.error('Erro ao criar lead:', error);
      setFeedback(error.message || 'Erro ao criar lead');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Novo Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Cliente"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
            placeholder="Nome completo do cliente"
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="E-mail"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Telefone"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              required
            />
          </div>

          <Input
            label="Cidade"
            value={formData.cidade}
            onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
          />

          <Input
            label="Valor Potencial (R$)"
            type="number"
            step="0.01"
            value={formData.valor_potencial}
            onChange={(e) => setFormData({ ...formData, valor_potencial: Number(e.target.value) })}
          />

          <div>
            <label className="block text-sm font-medium mb-2">Mensagem (opcional)</label>
            <textarea
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[80px]"
              placeholder="Informações adicionais sobre o lead..."
            />
          </div>

          <FileUpload
            label="Print/Screenshot (opcional)"
            folder={`leads/${uid_cliente}`}
            onUploadComplete={(url) => setFormData({ ...formData, print_url: url })}
            onError={(error) => console.error(error)}
            accept="image/*"
          />

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Criar Lead'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>

          {feedback && (
            <p className={`text-center font-semibold ${
              feedback.includes('sucesso') ? 'text-green-500' : 'text-red-500'
            }`}>
              {feedback}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}

function LeadDetailsModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Detalhes do Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Nome do Cliente</p>
            <p className="text-white font-semibold">{lead.nome}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">E-mail</p>
              <p className="text-white">{lead.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Telefone</p>
              <p className="text-white">{lead.telefone || '-'}</p>
            </div>
          </div>

          {lead.cidade && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Cidade</p>
              <p className="text-white">{lead.cidade}</p>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="text-white">{lead.status}</p>
          </div>

          {lead.valor_potencial && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Valor Potencial</p>
              <p className="text-white font-semibold">{formatCurrency(lead.valor_potencial)}</p>
            </div>
          )}

          {lead.mensagem && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Mensagem</p>
              <p className="text-white bg-gray-800/50 p-3 rounded-lg">{lead.mensagem}</p>
            </div>
          )}

          {lead.print_url && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Print/Screenshot</p>
              <a href={lead.print_url} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">
                Ver anexo →
              </a>
            </div>
          )}

          {lead.observacoes && lead.observacoes.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Histórico de Observações</p>
              <div className="space-y-3">
                {lead.observacoes.map((obs, i) => (
                  <div key={i} className="bg-gray-800/50 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">
                      {formatDate(obs.data)} - {obs.autor}
                    </p>
                    <p className="text-white">{obs.texto}</p>
                    {obs.anexo_url && (
                      <a
                        href={obs.anexo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-secondary hover:underline mt-2 inline-block"
                      >
                        Ver anexo →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs text-gray-500 mb-1">Data de Criação</p>
            <p className="text-white">{formatDate(lead.createdAt)}</p>
          </div>
        </div>

        <Button onClick={onClose} className="w-full mt-6">Fechar</Button>
      </div>
    </div>
  );
}

function ObservationModal({
  lead,
  onClose,
}: {
  lead: Lead;
  onClose: () => void;
}) {
  const [observacao, setObservacao] = useState('');
  const [anexoUrl, setAnexoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!observacao.trim() || !lead.id) return;

    setLoading(true);
    try {
      const novaObservacao: {
        texto: string;
        data: any;
        autor: string;
        anexo_url?: string;
      } = {
        texto: observacao.trim(),
        data: Timestamp.now(),
        autor: 'Cliente',
      };

      if (anexoUrl) {
        novaObservacao.anexo_url = anexoUrl;
      }

      const observacoesAtuais = lead.observacoes || [];
      await updateDoc(doc(db, 'leads', lead.id), {
        observacoes: [...observacoesAtuais, novaObservacao],
      });

      alert('Observação adicionada!');
      onClose();
    } catch (error: any) {
      alert(error.message || 'Erro ao adicionar observação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Adicionar Observação</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">Lead: <span className="text-white font-semibold">{lead.nome}</span></p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[120px]"
              placeholder="Digite sua observação..."
              required
            />
          </div>

          <FileUpload
            label="Anexo (opcional)"
            folder={`leads/${lead.uid_cliente}/observacoes`}
            onUploadComplete={(url) => setAnexoUrl(url)}
            onError={(error) => console.error(error)}
            accept="image/*,application/pdf,.doc,.docx"
          />

          {lead.observacoes && lead.observacoes.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Observações anteriores:</p>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {lead.observacoes.map((obs, i) => (
                  <div key={i} className="bg-gray-800/50 p-3 rounded-lg text-sm">
                    <p className="text-xs text-gray-400 mb-1">
                      {formatDate(obs.data)} - {obs.autor}
                    </p>
                    <p className="text-gray-300">{obs.texto}</p>
                    {obs.anexo_url && (
                      <a
                        href={obs.anexo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-secondary hover:underline mt-2 inline-block"
                      >
                        Ver anexo →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : 'Adicionar'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}