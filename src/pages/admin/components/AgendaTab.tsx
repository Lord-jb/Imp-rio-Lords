// pages/admin/components/AgendaTab.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Cliente, Agenda } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface AgendaTabProps {
  clientes: Cliente[];
  agendas: Agenda[];
}

export function AgendaTab({ clientes, agendas }: AgendaTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingEvento, setEditingEvento] = useState<Agenda | null>(null);

  function handleEdit(evento: Agenda) {
    setEditingEvento(evento);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingEvento(null);
    setShowModal(true);
  }

  async function handleDelete(eventoId: string) {
    if (!confirm('Deseja realmente excluir este evento?')) return;

    try {
      await deleteDoc(doc(db, 'agenda', eventoId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir evento');
    }
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {agendas.map((evento, i) => {
          const cliente = clientes.find((c) => c.uid === evento.uid_cliente);
          const k = evento.id || `${evento.uid_cliente}-${evento.descricao}-${i}`;
          return (
            <Card key={k}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      evento.tipo === 'gravacao'
                        ? 'bg-red-500/20 text-red-500'
                        : evento.tipo === 'reuniao'
                        ? 'bg-blue-500/20 text-blue-500'
                        : 'bg-purple-500/20 text-purple-500'
                    }`}
                  >
                    {evento.tipo}
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                      evento.status === 'confirmado'
                        ? 'bg-green-500/20 text-green-500'
                        : evento.status === 'realizado'
                        ? 'bg-gray-500/20 text-gray-500'
                        : 'bg-yellow-500/20 text-yellow-500'
                    }`}
                  >
                    {evento.status}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(evento)}
                    className="text-secondary hover:text-yellow-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => evento.id && handleDelete(evento.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{evento.descricao}</h3>
              <p className="text-gray-400 mb-2">Cliente: {cliente?.nome || 'N/A'}</p>
              <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
                <span>📅 {formatDate(evento.data)}</span>
                <span>🕐 {evento.hora}</span>
                <span>📍 {evento.local}</span>
              </div>
              {evento.link_meet && (
                <a
                  href={evento.link_meet}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-secondary hover:underline text-sm"
                >
                  Acessar reunião →
                </a>
              )}
            </Card>
          );
        })}
      </div>

      {showModal && (
        <EventoModal
          clientes={clientes}
          evento={editingEvento}
          onClose={() => {
            setShowModal(false);
            setEditingEvento(null);
          }}
        />
      )}
    </>
  );
}

function EventoModal({
  clientes,
  evento = null,
  onClose,
}: {
  clientes: Cliente[];
  evento?: Agenda | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: evento?.uid_cliente || '',
    data: evento?.data || '',
    hora: evento?.hora || '',
    local: evento?.local || '',
    descricao: evento?.descricao || '',
    tipo: evento?.tipo || 'reuniao',
    status: evento?.status || 'pendente',
    link_meet: evento?.link_meet || '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      if (evento?.id) {
        await updateDoc(doc(db, 'agenda', evento.id), {
          uid_cliente: formData.uid_cliente,
          data: formData.data,
          hora: formData.hora,
          local: formData.local,
          descricao: formData.descricao,
          tipo: formData.tipo,
          status: formData.status,
          link_meet: formData.link_meet,
        });
        setFeedback('Evento atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'agenda'), {
          uid_cliente: formData.uid_cliente,
          data: formData.data,
          hora: formData.hora,
          local: formData.local,
          descricao: formData.descricao,
          tipo: formData.tipo,
          status: formData.status,
          link_meet: formData.link_meet,
          data_criacao: Timestamp.now(),
        });
        setFeedback('Evento criado com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar evento');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {evento ? 'Editar Evento' : 'Novo Evento'}
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
              disabled={!!evento}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c, i) => (
                <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Descrição do Evento"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
            <Input
              label="Horário"
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              required
            />
          </div>

          <Input
            label="Local"
            value={formData.local}
            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <Select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              >
                <option value="gravacao">Gravação</option>
                <option value="reuniao">Reunião</option>
                <option value="entrega">Entrega</option>
                <option value="outro">Outro</option>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <option value="pendente">Pendente</option>
                <option value="confirmado">Confirmado</option>
                <option value="realizado">Realizado</option>
                <option value="cancelado">Cancelado</option>
              </Select>
            </div>
          </div>

          <Input
            label="Link Google Meet (opcional)"
            type="url"
            value={formData.link_meet}
            onChange={(e) => setFormData({ ...formData, link_meet: e.target.value })}
          />

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : evento ? 'Salvar Alterações' : 'Criar Evento'}
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