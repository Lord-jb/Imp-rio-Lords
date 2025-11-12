import { useState } from 'react';
import { where, orderBy } from 'firebase/firestore';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { Cliente, Campanha } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { db } from '../../lib/firebase';
import { Plus } from 'lucide-react';

export function Campaigns() {
  const { data: clientes } = useFirestoreCollection<Cliente>('clientes');
  const [selectedClient, setSelectedClient] = useState('');
  
  const { data: campanhas } = useFirestoreCollection<Campanha>('campanhas', 
    selectedClient ? [
      where('uid_cliente', '==', selectedClient),
      orderBy('createdAt', 'desc')
    ] : []
  );

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome_campanha: '',
    status: 'Ativa' as const,
    investimento: 0,
    resultado: '',
    cliques: 0,
    leads: 0,
  });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedClient) return;

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'campanhas'), {
        uid_cliente: selectedClient,
        nome_campanha: formData.nome_campanha,
        status: formData.status,
        investimento: formData.investimento,
        resultado: formData.resultado,
        metricas: {
          cliques: formData.cliques,
          leads: formData.leads,
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setFormData({
        nome_campanha: '',
        status: 'Ativa',
        investimento: 0,
        resultado: '',
        cliques: 0,
        leads: 0,
      });
      setShowModal(false);
    } catch (error) {
      console.error('Erro ao criar campanha:', error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Campanhas de Tráfego</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-1">
            <h3 className="font-semibold mb-4">Selecionar Cliente</h3>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="input-field"
            >
              <option value="">Escolha um cliente...</option>
              {clientes.map((cliente) => (
                <option key={cliente.uid} value={cliente.uid}>
                  {cliente.nome}
                </option>
              ))}
            </select>

            {selectedClient && (
              <Button onClick={() => setShowModal(true)} className="w-full mt-4">
                <Plus size={20} className="mr-2" />
                Nova Campanha
              </Button>
            )}
          </Card>

          <Card className="lg:col-span-3">
            <h3 className="text-xl font-semibold mb-4">Campanhas</h3>
            
            {!selectedClient ? (
              <p className="text-gray-400">Selecione um cliente para ver as campanhas.</p>
            ) : campanhas.length === 0 ? (
              <p className="text-gray-400">Nenhuma campanha cadastrada.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Nome</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Status</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Investimento</th>
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Resultados</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campanhas.map((campanha) => (
                      <tr key={campanha.id} className="border-b border-border hover:bg-gray-800/30">
                        <td className="py-3 px-4">{campanha.nome_campanha}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            campanha.status === 'Ativa' ? 'bg-green-500/20 text-green-500' :
                            campanha.status === 'Pausada' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-red-500/20 text-red-500'
                          }`}>
                            {campanha.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold">{formatCurrency(campanha.investimento)}</td>
                        <td className="py-3 px-4 text-gray-300">{campanha.resultado || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Nova Campanha</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Nome da Campanha"
                  value={formData.nome_campanha}
                  onChange={(e) => setFormData({ ...formData, nome_campanha: e.target.value })}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="input-field"
                    >
                      <option value="Ativa">Ativa</option>
                      <option value="Pausada">Pausada</option>
                      <option value="Finalizada">Finalizada</option>
                    </select>
                  </div>

                  <Input
                    label="Investimento (R$)"
                    type="number"
                    step="0.01"
                    value={formData.investimento}
                    onChange={(e) => setFormData({ ...formData, investimento: Number(e.target.value) })}
                  />

                  <Input
                    label="Cliques"
                    type="number"
                    value={formData.cliques}
                    onChange={(e) => setFormData({ ...formData, cliques: Number(e.target.value) })}
                  />

                  <Input
                    label="Leads"
                    type="number"
                    value={formData.leads}
                    onChange={(e) => setFormData({ ...formData, leads: Number(e.target.value) })}
                  />
                </div>

                <Input
                  label="Resultado / ROAS"
                  value={formData.resultado}
                  onChange={(e) => setFormData({ ...formData, resultado: e.target.value })}
                />

                <div className="flex gap-4 mt-6">
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? 'Salvando...' : 'Salvar Campanha'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}