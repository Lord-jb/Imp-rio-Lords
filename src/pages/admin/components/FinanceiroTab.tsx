// pages/admin/components/FinanceiroTab.tsx
import { useState } from 'react';
import { Plus, Edit2, Trash2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Cliente } from '../../../types';
import { formatCurrency } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { useFirestoreCollection } from '../../../hooks/useFirestore';

interface Transacao {
  id?: string;
  uid_cliente: string;
  tipo: 'entrada' | 'saida';
  valor: number;
  descricao: string;
  categoria: string;
  data: string;
  status: 'pago' | 'pendente' | 'cancelado';
  createdAt: any;
}

interface FinanceiroTabProps {
  clientes: Cliente[];
}

export function FinanceiroTab({ clientes }: FinanceiroTabProps) {
  const { data: transacoes = [] } = useFirestoreCollection<Transacao>('transacoes');
  const [showModal, setShowModal] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState<Transacao | null>(null);
  const [selectedCliente, setSelectedCliente] = useState('');

  const transacoesFiltradas = selectedCliente
    ? transacoes.filter(t => t.uid_cliente === selectedCliente)
    : transacoes;

  const totalEntradas = transacoesFiltradas
    .filter(t => t.tipo === 'entrada' && t.status === 'pago')
    .reduce((sum, t) => sum + t.valor, 0);

  const totalSaidas = transacoesFiltradas
    .filter(t => t.tipo === 'saida' && t.status === 'pago')
    .reduce((sum, t) => sum + t.valor, 0);

  const saldoTotal = totalEntradas - totalSaidas;

  function handleEdit(transacao: Transacao) {
    setEditingTransacao(transacao);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingTransacao(null);
    setShowModal(true);
  }

  async function handleDelete(transacaoId: string) {
    if (!confirm('Deseja realmente excluir esta transação?')) return;

    try {
      await deleteDoc(doc(db, 'transacoes', transacaoId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir transação');
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm uppercase font-semibold">Total Entradas</p>
              <p className="text-3xl font-bold text-green-500">{formatCurrency(totalEntradas)}</p>
            </div>
            <TrendingUp className="text-green-500" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm uppercase font-semibold">Total Saídas</p>
              <p className="text-3xl font-bold text-red-500">{formatCurrency(totalSaidas)}</p>
            </div>
            <TrendingDown className="text-red-500" size={40} />
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm uppercase font-semibold">Saldo Líquido</p>
              <p className={`text-3xl font-bold ${saldoTotal >= 0 ? 'text-blue-500' : 'text-red-500'}`}>
                {formatCurrency(saldoTotal)}
              </p>
            </div>
            <DollarSign className="text-blue-500" size={40} />
          </div>
        </Card>
      </div>

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
          Nova Transação
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Data</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Descrição</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Categoria</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Tipo</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Valor</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.map((transacao, i) => {
                const cliente = clientes.find((c) => c.uid === transacao.uid_cliente);
                const rowKey = transacao.id || `transacao-${i}`;
                return (
                  <tr key={rowKey} className="border-b border-border hover:bg-gray-800/50">
                    <td className="py-3 px-4 text-sm">{transacao.data}</td>
                    <td className="py-3 px-4">{cliente?.nome || 'N/A'}</td>
                    <td className="py-3 px-4">{transacao.descricao}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{transacao.categoria}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        transacao.tipo === 'entrada'
                          ? 'bg-green-500/20 text-green-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}>
                        {transacao.tipo}
                      </span>
                    </td>
                    <td className={`py-3 px-4 font-semibold ${
                      transacao.tipo === 'entrada' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {transacao.tipo === 'entrada' ? '+' : '-'}{formatCurrency(transacao.valor)}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        transacao.status === 'pago' ? 'bg-green-500/20 text-green-500' :
                        transacao.status === 'pendente' ? 'bg-yellow-500/20 text-yellow-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {transacao.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(transacao)}
                          className="text-secondary hover:text-yellow-500"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => transacao.id && handleDelete(transacao.id)}
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
        <TransacaoModal
          clientes={clientes}
          transacao={editingTransacao}
          onClose={() => {
            setShowModal(false);
            setEditingTransacao(null);
          }}
        />
      )}
    </>
  );
}

function TransacaoModal({
  clientes,
  transacao = null,
  onClose,
}: {
  clientes: Cliente[];
  transacao?: Transacao | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: transacao?.uid_cliente || '',
    tipo: transacao?.tipo || 'entrada',
    valor: transacao?.valor || 0,
    descricao: transacao?.descricao || '',
    categoria: transacao?.categoria || '',
    data: transacao?.data || new Date().toISOString().split('T')[0],
    status: transacao?.status || 'pendente',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      if (transacao?.id) {
        await updateDoc(doc(db, 'transacoes', transacao.id), {
          uid_cliente: formData.uid_cliente,
          tipo: formData.tipo,
          valor: formData.valor,
          descricao: formData.descricao,
          categoria: formData.categoria,
          data: formData.data,
          status: formData.status,
        });
        setFeedback('Transação atualizada com sucesso!');
      } else {
        await addDoc(collection(db, 'transacoes'), {
          uid_cliente: formData.uid_cliente,
          tipo: formData.tipo,
          valor: formData.valor,
          descricao: formData.descricao,
          categoria: formData.categoria,
          data: formData.data,
          status: formData.status,
          createdAt: Timestamp.now(),
        });
        setFeedback('Transação criada com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar transação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {transacao ? 'Editar Transação' : 'Nova Transação'}
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
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c, i) => (
                <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Tipo</label>
              <Select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
              >
                <option value="entrada">Entrada</option>
                <option value="saida">Saída</option>
              </Select>
            </div>

            <Input
              label="Valor (R$)"
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
              required
            />
          </div>

          <Input
            label="Descrição"
            value={formData.descricao}
            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Categoria"
              placeholder="Ex: Serviço, Produto, Despesa..."
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              required
            />

            <Input
              label="Data"
              type="date"
              value={formData.data}
              onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <Select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="cancelado">Cancelado</option>
            </Select>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : transacao ? 'Salvar Alterações' : 'Criar Transação'}
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