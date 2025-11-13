// pages/admin/components/CampanhasTab.tsx
import { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import type { Cliente, Campanha } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

type Props = {
  clientes?: Cliente[];
  campanhas?: Campanha[];
};

export function CampanhasTab({
  clientes = [],
  campanhas = [],
}: Props) {
  const [showModal, setShowModal] = useState(false);
  const [editingCampanha, setEditingCampanha] = useState<Campanha | null>(null);
  const [selectedCliente, setSelectedCliente] = useState('');

  const campanhasFiltradas = useMemo(
    () => (selectedCliente ? campanhas.filter(c => c.uid_cliente === selectedCliente) : campanhas),
    [campanhas, selectedCliente]
  );

  function handleEdit(campanha: Campanha) {
    setEditingCampanha(campanha);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingCampanha(null);
    setShowModal(true);
  }

  async function handleDelete(campanhaId: string) {
    if (!confirm('Deseja realmente excluir esta campanha?')) return;

    try {
      await deleteDoc(doc(db, 'campanhas', campanhaId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir campanha');
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
            <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
          ))}
        </Select>
        <Button onClick={handleCreate}>
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
                        <button 
                          onClick={() => handleEdit(campanha)}
                          className="text-secondary hover:text-yellow-500"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => campanha.id && handleDelete(campanha.id)}
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
        <CampanhaModal 
          clientes={clientes} 
          campanha={editingCampanha}
          onClose={() => {
            setShowModal(false);
            setEditingCampanha(null);
          }} 
        />
      )}
    </>
  );
}

function CampanhaModal({
  clientes = [],
  campanha = null,
  onClose,
}: {
  clientes?: Cliente[];
  campanha?: Campanha | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: campanha?.uid_cliente || '',
    nome_campanha: campanha?.nome_campanha || '',
    plataforma: campanha?.plataforma || '',
    investimento: campanha?.investimento || 0,
    status: campanha?.status || 'Ativa',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      if (campanha?.id) {
        await updateDoc(doc(db, 'campanhas', campanha.id), {
          uid_cliente: formData.uid_cliente,
          nome_campanha: formData.nome_campanha,
          plataforma: formData.plataforma,
          investimento: formData.investimento,
          status: formData.status,
        });
        setFeedback('Campanha atualizada com sucesso!');
      } else {
        await addDoc(collection(db, 'campanhas'), {
          uid_cliente: formData.uid_cliente,
          nome_campanha: formData.nome_campanha,
          plataforma: formData.plataforma,
          investimento: formData.investimento,
          status: formData.status,
          metricas: {
            impressoes: 0,
            cliques: 0,
            leads: 0,
            conversoes: 0,
            cpc: 0,
            ctr: 0,
            roas: 0,
          },
          data_inicio: Timestamp.now(),
          data_criacao: Timestamp.now(),
        });
        setFeedback('Campanha criada com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar campanha');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {campanha ? 'Editar Campanha' : 'Nova Campanha'}
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
              disabled={!!campanha}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c, i) => (
                <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Nome da Campanha"
            value={formData.nome_campanha}
            onChange={(e) => setFormData({ ...formData, nome_campanha: e.target.value })}
            required
          />

          <Input
            label="Plataforma"
            placeholder="Meta, Google, TikTok..."
            value={formData.plataforma}
            onChange={(e) => setFormData({ ...formData, plataforma: e.target.value })}
            required
          />

          <Input
            label="Investimento (R$)"
            type="number"
            step="0.01"
            value={formData.investimento}
            onChange={(e) => setFormData({ ...formData, investimento: Number(e.target.value) })}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="Ativa">Ativa</option>
              <option value="Pausada">Pausada</option>
              <option value="Finalizada">Finalizada</option>
            </Select>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : campanha ? 'Salvar Alterações' : 'Criar Campanha'}
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