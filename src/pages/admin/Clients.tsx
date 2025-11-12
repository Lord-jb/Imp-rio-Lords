import { useState } from 'react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { useCreateClient } from '../../hooks/useCreateClient';
import type { Cliente } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Edit2, Plus } from 'lucide-react';

export function Clients() {
  const { data: clientes, loading } = useFirestoreCollection<Cliente>('clientes');
  const { createClient, loading: creating } = useCreateClient();
  
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    planoNome: 'Full Marketing',
    saldo: 0,
    artesTotal: 10,
    statusSite: 'Protótipo',
    permiteSolicitar: true,
    permiteLeads: true,
  });
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback('');

    try {
      await createClient({
        nome: formData.nome,
        email: formData.email,
        senha: formData.senha,
        planoNome: formData.planoNome,
        saldo: formData.saldo,
        artesTotal: formData.artesTotal,
        statusSite: formData.statusSite,
        permissoes: {
          podeSolicitarDesign: formData.permiteSolicitar,
          recebeLeads: formData.permiteLeads,
        },
      });

      setFeedback('Cliente cadastrado com sucesso!');
      setFormData({
        nome: '',
        email: '',
        senha: '',
        planoNome: 'Full Marketing',
        saldo: 0,
        artesTotal: 10,
        statusSite: 'Protótipo',
        permiteSolicitar: true,
        permiteLeads: true,
      });
      
      setTimeout(() => {
        setShowModal(false);
        setFeedback('');
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao cadastrar cliente');
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Gerenciar Clientes</h1>
          <Button onClick={() => setShowModal(true)}>
            <Plus size={20} className="mr-2" />
            Novo Cliente
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
          </div>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Cliente</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">E-mail</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Status Site</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Saldo</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((cliente) => (
                    <tr key={cliente.uid} className="border-b border-border hover:bg-gray-800/30">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-semibold">{cliente.nome}</p>
                          <p className="text-sm text-gray-400">{cliente.plano_nome}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300">{cliente.email_login}</td>
                      <td className="py-3 px-4">{cliente.status_site}</td>
                      <td className="py-3 px-4 font-semibold">{formatCurrency(cliente.saldo_carteira)}</td>
                      <td className="py-3 px-4">
                        <button className="text-secondary hover:text-yellow-500 transition-colors">
                          <Edit2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {showModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Cadastrar Novo Cliente</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                  />

                  <Input
                    label="E-mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />

                  <Input
                    label="Senha Temporária"
                    type="text"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                    minLength={6}
                  />

                  <Input
                    label="Plano"
                    value={formData.planoNome}
                    onChange={(e) => setFormData({ ...formData, planoNome: e.target.value })}
                  />

                  <Input
                    label="Saldo Inicial (R$)"
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) => setFormData({ ...formData, saldo: Number(e.target.value) })}
                  />

                  <Input
                    label="Total de Artes"
                    type="number"
                    value={formData.artesTotal}
                    onChange={(e) => setFormData({ ...formData, artesTotal: Number(e.target.value) })}
                  />

                  <Input
                    label="Status do Site"
                    value={formData.statusSite}
                    onChange={(e) => setFormData({ ...formData, statusSite: e.target.value })}
                  />
                </div>

                <div className="flex gap-4 items-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permiteSolicitar}
                      onChange={(e) => setFormData({ ...formData, permiteSolicitar: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Pode solicitar artes</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.permiteLeads}
                      onChange={(e) => setFormData({ ...formData, permiteLeads: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">Recebe leads</span>
                  </label>
                </div>

                <div className="flex gap-4 mt-6">
                  <Button type="submit" disabled={creating} className="flex-1">
                    {creating ? 'Cadastrando...' : 'Cadastrar Cliente'}
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

                {feedback && (
                  <p className={`text-center font-semibold ${feedback.includes('sucesso') ? 'text-green-500' : 'text-red-500'}`}>
                    {feedback}
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}