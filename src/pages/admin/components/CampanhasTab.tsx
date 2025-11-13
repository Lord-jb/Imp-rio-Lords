// pages/admin/components/CampanhasTab.tsx
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import type { Cliente, Campanha } from '@/types';
import { formatCurrency } from '@/lib/utils';

type Props = {
  clientes?: Cliente[];
  campanhas?: Campanha[];
  selectedCliente?: string;
  setSelectedCliente?: (v: string) => void;
};

export function CampanhasTab({
  clientes = [],
  campanhas = [],
  selectedCliente = '',
  setSelectedCliente = () => {},
}: Props) {
  const [showModal, setShowModal] = useState(false);

  const campanhasFiltradas = useMemo(
    () => (selectedCliente ? campanhas.filter(c => c.uid_cliente === selectedCliente) : campanhas),
    [campanhas, selectedCliente]
  );

  return (
    <>
      <div className="flex gap-4 mb-6">
        <Select
          value={selectedCliente}
          onChange={(e) => setSelectedCliente(e.target.value)}
          className="flex-1"
        >
          <option key="all" value="">Todos os clientes</option>
          {clientes.map((c, i) => (
            <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
          ))}
        </Select>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          Nova Campanha
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Campanha</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Plataforma</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Investimento</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliques</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Leads</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">CPC</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">ROAS</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {campanhasFiltradas.map((campanha, i) => {
                const cliente = clientes.find((c) => c.uid === campanha.uid_cliente);
                const k = campanha.id || `${campanha.uid_cliente}-${campanha.nome_campanha}-${i}`;
                return (
                  <tr key={k} className="border-b border-border hover:bg-gray-800/50">
                    <td className="py-3 px-4">{cliente?.nome || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold">{campanha.nome_campanha}</td>
                    <td className="py-3 px-4 text-gray-400">{campanha.plataforma || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          campanha.status === 'Ativa'
                            ? 'bg-green-500/20 text-green-500'
                            : campanha.status === 'Pausada'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}
                      >
                        {campanha.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(campanha.investimento)}</td>
                    <td className="py-3 px-4">{campanha.metricas?.cliques || 0}</td>
                    <td className="py-3 px-4">{campanha.metricas?.leads || 0}</td>
                    <td className="py-3 px-4">
                      {campanha.metricas?.cpc ? formatCurrency(campanha.metricas.cpc) : '-'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-secondary">
                      {campanha.metricas?.roas ? `${campanha.metricas.roas}x` : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-secondary hover:text-yellow-500">
                          <Edit2 size={16} />
                        </button>
                        <button className="text-red-500 hover:text-red-400">
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
        <NovaCampanhaModal clientes={clientes} onClose={() => setShowModal(false)} />
      )}
    </>
  );
}

function NovaCampanhaModal({
  clientes = [],
  onClose,
}: {
  clientes?: Cliente[];
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: '',
    nome_campanha: '',
    plataforma: '',
    investimento: 0,
    status: 'Ativa' as const,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6">Nova Campanha</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            value={formData.uid_cliente}
            onChange={(e) => setFormData({ ...formData, uid_cliente: e.target.value })}
            required
          >
            <option key="sel" value="">Selecione um cliente</option>
            {clientes.map((c, i) => (
              <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
            ))}
          </Select>

          <input
            type="text"
            placeholder="Nome da Campanha"
            value={formData.nome_campanha}
            onChange={(e) => setFormData({ ...formData, nome_campanha: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />

          <input
            type="text"
            placeholder="Plataforma (Meta, Google, etc)"
            value={formData.plataforma}
            onChange={(e) => setFormData({ ...formData, plataforma: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />

          <input
            type="number"
            placeholder="Investimento (R$)"
            step="0.01"
            value={formData.investimento}
            onChange={(e) => setFormData({ ...formData, investimento: Number(e.target.value) })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">Criar Campanha</Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
