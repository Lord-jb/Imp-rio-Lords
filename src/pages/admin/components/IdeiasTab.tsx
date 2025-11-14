// pages/admin/components/IdeiasTab.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Cliente, Ideia } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface IdeiasTabProps {
  clientes: Cliente[];
  ideias: Ideia[];
}

export function IdeiasTab({ clientes, ideias }: IdeiasTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingIdeia, setEditingIdeia] = useState<Ideia | null>(null);

  function handleEdit(ideia: Ideia) {
    setEditingIdeia(ideia);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingIdeia(null);
    setShowModal(true);
  }

  async function handleDelete(ideiaId: string) {
    if (!confirm('Deseja realmente excluir esta ideia?')) return;

    try {
      await deleteDoc(doc(db, 'ideias', ideiaId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir ideia');
    }
  }

  async function handleUpdateStatus(ideiaId: string, status: string) {
    try {
      await updateDoc(doc(db, 'ideias', ideiaId), { status });
    } catch (error: any) {
      alert(error.message || 'Erro ao atualizar status');
    }
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Nova Ideia
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ideias.map((ideia) => {
          const cliente = clientes.find((c) => c.uid === ideia.uid_cliente);
          return (
            <Card key={ideia.id}>
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  ideia.status === 'aprovado' ? 'bg-green-500/20 text-green-500' :
                  ideia.status === 'rejeitado' ? 'bg-red-500/20 text-red-500' :
                  ideia.status === 'em_analise' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {ideia.status}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(ideia)}
                    className="text-secondary hover:text-yellow-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => ideia.id && handleDelete(ideia.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{ideia.titulo}</h3>
              <p className="text-sm text-gray-400 mb-3">{ideia.descricao}</p>
              <p className="text-xs text-gray-500 mb-3">Cliente: {cliente?.nome || 'N/A'}</p>

              {ideia.status === 'novo' && (
                <div className="flex gap-2 mt-4">
                  <Button 
                    size="sm" 
                    onClick={() => ideia.id && handleUpdateStatus(ideia.id, 'aprovado')}
                    className="flex-1"
                  >
                    <ThumbsUp size={16} className="mr-1" />
                    Aprovar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => ideia.id && handleUpdateStatus(ideia.id, 'em_analise')}
                    className="flex-1"
                  >
                    Em Análise
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => ideia.id && handleUpdateStatus(ideia.id, 'rejeitado')}
                    className="flex-1"
                  >
                    <ThumbsDown size={16} className="mr-1" />
                    Rejeitar
                  </Button>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-gray-600">{formatDate(ideia.createdAt)}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <IdeiaModal
          clientes={clientes}
          ideia={editingIdeia}
          onClose={() => {
            setShowModal(false);
            setEditingIdeia(null);
          }}
        />
      )}
    </>
  );
}

function IdeiaModal({
  clientes,
  ideia = null,
  onClose,
}: {
  clientes: Cliente[];
  ideia?: Ideia | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: ideia?.uid_cliente || '',
    titulo: ideia?.titulo || '',
    descricao: ideia?.descricao || '',
    status: ideia?.status || 'novo',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      if (ideia?.id) {
        await updateDoc(doc(db, 'ideias', ideia.id), {
          uid_cliente: formData.uid_cliente,
          titulo: formData.titulo,
          descricao: formData.descricao,
          status: formData.status,
        });
        setFeedback('Ideia atualizada com sucesso!');
      } else {
        await addDoc(collection(db, 'ideias'), {
          uid_cliente: formData.uid_cliente,
          titulo: formData.titulo,
          descricao: formData.descricao,
          status: formData.status,
          createdAt: Timestamp.now(),
        });
        setFeedback('Ideia criada com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar ideia');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {ideia ? 'Editar Ideia' : 'Nova Ideia'}
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
              disabled={!!ideia}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c, i) => (
                <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[120px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="novo">Novo</option>
              <option value="em_analise">Em Análise</option>
              <option value="aprovado">Aprovado</option>
              <option value="rejeitado">Rejeitado</option>
              <option value="implementado">Implementado</option>
            </Select>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : ideia ? 'Salvar Alterações' : 'Criar Ideia'}
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