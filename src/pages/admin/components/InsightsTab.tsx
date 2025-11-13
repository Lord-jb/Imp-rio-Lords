// pages/admin/components/InsightsTab.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { Insight } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface InsightsTabProps {
  insights: Insight[];
}

export function InsightsTab({ insights }: InsightsTabProps) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} className="mr-2" />
          Novo Insight
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight) => (
          <Card key={insight.id} className={insight.destaque ? 'border-2 border-secondary' : ''}>
            <div className="flex items-start justify-between mb-4">
              <span className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs font-semibold">
                {insight.categoria}
              </span>
              <div className="flex gap-2">
                <button className="text-secondary hover:text-yellow-500">
                  <Edit2 size={16} />
                </button>
                <button className="text-red-500 hover:text-red-400">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="font-semibold text-lg mb-2">{insight.titulo}</h3>
            <p className="text-sm text-gray-400 mb-3">{insight.descricao}</p>
            {insight.link_externo && (
              <a
                href={insight.link_externo}
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline text-sm"
              >
                Saiba mais →
              </a>
            )}

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <span className="text-xs text-gray-600">{formatDate(insight.createdAt)}</span>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                insight.ativo ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
              }`}>
                {insight.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {showModal && <NovoInsightModal onClose={() => setShowModal(false)} />}
    </>
  );
}

function NovoInsightModal({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: 'dica' as const,
    link_externo: '',
    destaque: false,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Implementar salvamento
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Novo Insight</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            required
          />

          <textarea
            placeholder="Descrição"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-32"
            required
          />

          <select
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          >
            <option value="dica">Dica</option>
            <option value="oferta">Oferta</option>
            <option value="atualizacao">Atualização</option>
            <option value="tendencia">Tendência</option>
          </select>

          <input
            type="url"
            placeholder="Link externo (opcional)"
            value={formData.link_externo}
            onChange={(e) => setFormData({ ...formData, link_externo: e.target.value })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
          />

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.destaque}
              onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm">Marcar como destaque</span>
          </label>

          <div className="flex gap-4">
            <Button type="submit" className="flex-1">Criar Insight</Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancelar</Button>
          </div>
        </form>
      </div>
    </div>
  );
}