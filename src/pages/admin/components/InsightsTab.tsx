// pages/admin/components/InsightsTab.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Insight } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface InsightsTabProps {
  insights: Insight[];
}

export function InsightsTab({ insights }: InsightsTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingInsight, setEditingInsight] = useState<Insight | null>(null);

  function handleEdit(insight: Insight) {
    setEditingInsight(insight);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingInsight(null);
    setShowModal(true);
  }

  async function handleDelete(insightId: string) {
    if (!confirm('Deseja realmente excluir este insight?')) return;

    try {
      await deleteDoc(doc(db, 'insights', insightId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir insight');
    }
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate}>
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
                <button 
                  onClick={() => handleEdit(insight)}
                  className="text-secondary hover:text-yellow-500"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => insight.id && handleDelete(insight.id)}
                  className="text-red-500 hover:text-red-400"
                >
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

      {showModal && (
        <InsightModal 
          insight={editingInsight}
          onClose={() => {
            setShowModal(false);
            setEditingInsight(null);
          }} 
        />
      )}
    </>
  );
}

function InsightModal({ 
  insight = null,
  onClose 
}: { 
  insight?: Insight | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    titulo: insight?.titulo || '',
    descricao: insight?.descricao || '',
    categoria: insight?.categoria || 'dica',
    link_externo: insight?.link_externo || '',
    destaque: insight?.destaque || false,
    ativo: insight?.ativo ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      if (insight?.id) {
        await updateDoc(doc(db, 'insights', insight.id), {
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria,
          link_externo: formData.link_externo,
          destaque: formData.destaque,
          ativo: formData.ativo,
        });
        setFeedback('Insight atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'insights'), {
          titulo: formData.titulo,
          descricao: formData.descricao,
          categoria: formData.categoria,
          link_externo: formData.link_externo,
          destaque: formData.destaque,
          ativo: formData.ativo,
          createdAt: Timestamp.now(),
        });
        setFeedback('Insight criado com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar insight');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {insight ? 'Editar Insight' : 'Novo Insight'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[100px]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <Select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
            >
              <option value="dica">Dica</option>
              <option value="oferta">Oferta</option>
              <option value="atualizacao">Atualização</option>
              <option value="tendencia">Tendência</option>
            </Select>
          </div>

          <Input
            label="Link Externo (opcional)"
            type="url"
            value={formData.link_externo}
            onChange={(e) => setFormData({ ...formData, link_externo: e.target.value })}
          />

          <div className="flex gap-4 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.destaque}
                onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Marcar como destaque</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.ativo}
                onChange={(e) => setFormData({ ...formData, ativo: e.target.checked })}
                className="w-4 h-4"
              />
              <span className="text-sm">Insight ativo</span>
            </label>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : insight ? 'Salvar Alterações' : 'Criar Insight'}
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