// pages/admin/components/LeadsTab.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, MessageSquare } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FileUpload } from '../../../components/ui/FileUpload';
import type { Cliente, Lead } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface LeadsTabProps {
  clientes: Cliente[];
  leads: Lead[];
}

export function LeadsTab({ clientes, leads }: LeadsTabProps) {
  const [selectedCliente, setSelectedCliente] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showObservationModal, setShowObservationModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [viewingLead, setViewingLead] = useState<Lead | null>(null);

  const leadsFiltrados = selectedCliente
    ? leads.filter(l => l.uid_cliente === selectedCliente)
    : leads;

  function handleEdit(lead: Lead) {
    setEditingLead(lead);
    setShowModal(true);
  }

  function handleView(lead: Lead) {
    setViewingLead(lead);
    setShowDetailsModal(true);
  }

  function handleAddObservation(lead: Lead) {
    setEditingLead(lead);
    setShowObservationModal(true);
  }

  function handleCreate() {
    setEditingLead(null);
    setShowModal(true);
  }

  async function handleDelete(leadId: string) {
    if (!confirm('Deseja realmente excluir este lead?')) return;

    try {
      await deleteDoc(doc(db, 'leads', leadId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir lead');
    }
  }

  return (
    <>
      <div className="flex gap-4 mb-6">
        <Select
          value={selectedCliente}
          onChange={(e) => setSelectedCliente(e.target.value)}
          className="flex-1"
        >
          <option value="">Todos os clientes</option>
          {clientes.map((c, i) => (
            <option key={c.uid || `cliente-${i}`} value={c.uid}>{c.nome}</option>
          ))}
        </Select>
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Novo Lead
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Meu Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Lead (Cliente Final)</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Contato</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cidade</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Valor</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Data</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {leadsFiltrados.map((lead, i) => {
                const cliente = clientes.find((c) => c.uid === lead.uid_cliente);
                const rowKey = lead.id || `${lead.uid_cliente}-${lead.email}-${i}`;
                return (
                  <tr key={rowKey} className="border-b border-border hover:bg-gray-800/50">
                    <td className="py-3 px-4">{cliente?.nome || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold">{lead.nome}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>{lead.email}</div>
                      <div className="text-gray-400">{lead.telefone}</div>
                    </td>
                    <td className="py-3 px-4">{lead.cidade}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        lead.status === 'convertido' ? 'bg-green-500/20 text-green-500' :
                        lead.status === 'em_contato' ? 'bg-blue-500/20 text-blue-500' :
                        lead.status === 'cliente_recusou' ? 'bg-red-500/20 text-red-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.valor_potencial ? formatCurrency(lead.valor_potencial) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleView(lead)}
                          className="text-blue-500 hover:text-blue-400"
                          title="Ver detalhes"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleAddObservation(lead)}
                          className="text-purple-500 hover:text-purple-400"
                          title="Adicionar observação"
                        >
                          <MessageSquare size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(lead)}
                          className="text-secondary hover:text-yellow-500"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => lead.id && handleDelete(lead.id)}
                          className="text-red-500 hover:text-red-400"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {showModal && (
        <LeadModal
          clientes={clientes}
          lead={editingLead}
          onClose={() => {
            setShowModal(false);
            setEditingLead(null);
          }}
        />
      )}

      {showDetailsModal && viewingLead && (
        <LeadDetailsModal
          lead={viewingLead}
          cliente={clientes.find(c => c.uid === viewingLead.uid_cliente)}
          onClose={() => {
            setShowDetailsModal(false);
            setViewingLead(null);
          }}
        />
      )}

      {showObservationModal && editingLead && (
        <ObservationModal
          lead={editingLead}
          onClose={() => {
            setShowObservationModal(false);
            setEditingLead(null);
          }}
        />
      )}
    </>
  );
}

function LeadDetailsModal({
  lead,
  cliente,
  onClose,
}: {
  lead: Lead;
  cliente?: Cliente;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Detalhes do Lead</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-2xl">×</button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Meu Cliente</p>
              <p className="text-white font-semibold">{cliente?.nome || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Lead (Cliente Final)</p>
              <p className="text-white font-semibold">{lead.nome}</p>
            </div>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Cidade</p>
              <p className="text-white">{lead.cidade || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <span className={`px-2 py-1 rounded text-xs font-semibold inline-block ${
                lead.status === 'convertido' ? 'bg-green-500/20 text-green-500' :
                lead.status === 'em_contato' ? 'bg-blue-500/20 text-blue-500' :
                lead.status === 'cliente_recusou' ? 'bg-red-500/20 text-red-500' :
                'bg-gray-500/20 text-gray-500'
              }`}>
                {lead.status}
              </span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Valor Potencial</p>
            <p className="text-white font-semibold">
              {lead.valor_potencial ? formatCurrency(lead.valor_potencial) : '-'}
            </p>
          </div>

          {lead.mensagem && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Mensagem</p>
              <p className="text-white bg-gray-800/50 p-3 rounded-lg">{lead.mensagem}</p>
            </div>
          )}

          {lead.print_url && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Print/Screenshot</p>
              <a
                href={lead.print_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline"
              >
                Ver anexo →
              </a>
            </div>
          )}

          {lead.motivo_desinteresse && (
            <div>
              <p className="text-xs text-gray-500 mb-1">Motivo de Desinteresse</p>
              <p className="text-white bg-red-500/10 p-3 rounded-lg">{lead.motivo_desinteresse}</p>
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

        <Button onClick={onClose} className="w-full mt-6">
          Fechar
        </Button>
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
        autor: 'Admin',
      };

      if (anexoUrl) {
        novaObservacao.anexo_url = anexoUrl;
      }

      const observacoesAtuais = lead.observacoes || [];
      await updateDoc(doc(db, 'leads', lead.id), {
        observacoes: [...observacoesAtuais, novaObservacao],
      });

      alert('Observação adicionada com sucesso!');
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
              placeholder="Digite sua observação sobre este lead..."
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
              {loading ? 'Salvando...' : 'Adicionar Observação'}
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

function LeadModal({
  clientes,
  lead = null,
  onClose,
}: {
  clientes: Cliente[];
  lead?: Lead | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: lead?.uid_cliente || '',
    nome: lead?.nome || '',
    email: lead?.email || '',
    telefone: lead?.telefone || '',
    cidade: lead?.cidade || '',
    status: lead?.status || 'novo',
    valor_potencial: lead?.valor_potencial || 0,
    print_url: lead?.print_url || '',
    mensagem: lead?.mensagem || '',
    motivo_desinteresse: lead?.motivo_desinteresse || '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [uploadError, setUploadError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      const leadData: any = {
        uid_cliente: formData.uid_cliente,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        status: formData.status,
      };

      if (formData.cidade) leadData.cidade = formData.cidade;
      if (formData.valor_potencial > 0) leadData.valor_potencial = formData.valor_potencial;
      if (formData.print_url) leadData.print_url = formData.print_url;
      if (formData.mensagem) leadData.mensagem = formData.mensagem;
      if (formData.motivo_desinteresse) leadData.motivo_desinteresse = formData.motivo_desinteresse;

      if (lead?.id) {
        await updateDoc(doc(db, 'leads', lead.id), leadData);
        setFeedback('Lead atualizado com sucesso!');
      } else {
        leadData.createdAt = Timestamp.now();
        leadData.observacoes = [];
        await addDoc(collection(db, 'leads'), leadData);
        setFeedback('Lead criado com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar lead');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {lead ? 'Editar Lead' : 'Novo Lead'}
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
            <label className="block text-sm font-medium mb-2">Meu Cliente</label>
            <Select
              value={formData.uid_cliente}
              onChange={(e) => setFormData({ ...formData, uid_cliente: e.target.value })}
              required
              disabled={!!lead}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c, i) => (
                <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Nome do Lead (Cliente Final)"
            value={formData.nome}
            onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
            required
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="novo">Novo</option>
                <option value="em_contato">Em Contato</option>
                <option value="atendido">Atendido</option>
                <option value="convertido">Convertido</option>
                <option value="cliente_recusou">Cliente Recusou</option>
                <option value="sem_interesse">Sem Interesse</option>
              </Select>
            </div>

            <Input
              label="Valor Potencial (R$)"
              type="number"
              step="0.01"
              value={formData.valor_potencial}
              onChange={(e) => setFormData({ ...formData, valor_potencial: Number(e.target.value) })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Mensagem (opcional)</label>
            <textarea
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[80px]"
              placeholder="Informações adicionais sobre o lead..."
            />
          </div>

          {!lead && formData.uid_cliente && (
            <FileUpload
              label="Print/Screenshot do Lead (opcional)"
              folder={`leads/${formData.uid_cliente}`}
              onUploadComplete={(downloadURL) => {
                setFormData({ ...formData, print_url: downloadURL });
                setUploadError('');
              }}
              onError={(error) => setUploadError(error)}
              accept="image/*"
            />
          )}

          {lead && formData.print_url && (
            <div>
              <label className="block text-sm font-medium mb-2">Print do Lead</label>
              <a
                href={formData.print_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline text-sm"
              >
                Ver print anexado →
              </a>
            </div>
          )}

          {(formData.status === 'cliente_recusou' || formData.status === 'sem_interesse') && (
            <div>
              <label className="block text-sm font-medium mb-2">Motivo de Desinteresse</label>
              <textarea
                value={formData.motivo_desinteresse}
                onChange={(e) => setFormData({ ...formData, motivo_desinteresse: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[80px]"
                placeholder="Por que o lead foi perdido?"
              />
            </div>
          )}

          {uploadError && (
            <p className="text-red-500 text-sm text-center">{uploadError}</p>
          )}

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : lead ? 'Salvar Alterações' : 'Criar Lead'}
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