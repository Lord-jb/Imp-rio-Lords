// pages/admin/components/AgendaTab.tsx
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { Cliente, Agenda } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface AgendaTabProps {
  clientes: Cliente[];
  agendas: Agenda[];
}

export function AgendaTab({ clientes, agendas }: AgendaTabProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowModal(true)}>
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
                <Button size="sm" variant="secondary">Editar</Button>
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
        <NovoEventoModal
          clientes={clientes}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}

function NovoEventoModal({
  clientes,
  onClose,
}: {
  clientes: Cliente[];
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: '',
    data: '',
    hora: '',
    local: '',
    descricao: '',
    tipo: 'reuniao' as const,
    link_meet: '',
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Novo Evento</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.uid_cliente}
            onChange={(e) => setFormData({ ...formData, uid_cliente: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          >
            <option key="sel" value="">Selecione um cliente</option>
            {clientes.map((c, i) => (
              <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Descrição do evento"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            />
            <input
              type="time"
              value={formData.hora}
              onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              required
            />
          </div>

          <input
            type="text"
            placeholder="Local"
            value={formData.local}
            onChange={(e) => setFormData({ ...formData, local: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />

          <select
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option key="t1" value="gravacao">Gravação</option>
            <option key="t2" value="reuniao">Reunião</option>
            <option key="t3" value="entrega">Entrega</option>
            <option key="t4" value="outro">Outro</option>
          </select>

          <input
            type="url"
            placeholder="Link Google Meet (opcional)"
            value={formData.link_meet}
            onChange={(e) => setFormData({ ...formData, link_meet: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">Criar Evento</Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
