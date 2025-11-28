// pages/admin/components/LeadsTab.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
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
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const leadsFiltrados = selectedCliente
    ? leads.filter(l => l.uid_cliente === selectedCliente)
    : leads;

  function handleEdit(lead: Lead) {
    setEditingLead(lead);
    setShowModal(true);
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
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Lead</th>
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
                        lead.status === 'ganho' ? 'bg-green-500/20 text-green-500' :
                        lead.status === 'em_negociacao' ? 'bg-blue-500/20 text-blue-500' :
                        lead.status === 'perdido' ? 'bg-red-500/20 text-red-500' :
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
                          onClick={() => handleEdit(lead)}
                          className="text-secondary hover:text-yellow-500"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => lead.id && handleDelete(lead.id)}
                          className="text-red-500 hover:text-red-400"
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
    </>
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
      const leadData = {
        uid_cliente: formData.uid_cliente,
        nome: formData.nome,
        email: formData.email,
        telefone: formData.telefone,
        cidade: formData.cidade,
        status: formData.status,
        valor_potencial: formData.valor_potencial,
        print_url: formData.print_url || undefined,
        motivo_desinteresse: formData.motivo_desinteresse || undefined,
      };

      if (lead?.id) {
        await updateDoc(doc(db, 'leads', lead.id), leadData);
        setFeedback('Lead atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'leads'), {
          ...leadData,
          createdAt: Timestamp.now(),
        });
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
            <label className="block text-sm font-medium mb-2">Cliente</label>
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
            label="Nome do Lead"
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
                <option value="contatado">Contatado</option>
                <option value="em_negociacao">Em Negociação</option>
                <option value="ganho">Ganho</option>
                <option value="perdido">Perdido</option>
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

          {/* Upload de Print do Lead */}
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

          {/* Motivo de Desinteresse (apenas se status = perdido) */}
          {formData.status === 'perdido' && (
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