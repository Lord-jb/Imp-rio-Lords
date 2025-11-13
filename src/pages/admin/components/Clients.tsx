// pages/admin/components/Clients.tsx
import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useFirestoreCollection } from '../../../hooks/useFirestore';
import { useCreateClient } from '../../../hooks/useCreateClient';
import { formatCurrency } from '../../../lib/utils';
import { Edit2, Plus, Search, Filter, Download } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface UserClient {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatar?: string;
  planoNome?: string;
  saldo?: number;
  artesTotal?: number;
  statusSite?: string;
  permissoes?: {
    podeSolicitarDesign: boolean;
    recebeLeads: boolean;
  };
}

export function Clients() {
  const { data: clientes = [], loading } = useFirestoreCollection<UserClient>('users');
  const { createClient, loading: creating } = useCreateClient();
  
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<UserClient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    role: 'cliente',
    active: true,
    planoNome: 'Full Marketing',
    saldo: 0,
    artesTotal: 10,
    statusSite: 'Protótipo',
    permiteSolicitar: true,
    permiteLeads: true,
  });
  const [feedback, setFeedback] = useState('');

  const clientesFiltrados = clientes.filter(c =>  
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openCreateModal() {
    setEditingClient(null);
    setFormData({
      nome: '',
      email: '',
      senha: '',
      role: 'cliente',
      active: true,
      planoNome: 'Full Marketing',
      saldo: 0,
      artesTotal: 10,
      statusSite: 'Protótipo',
      permiteSolicitar: true,
      permiteLeads: true,
    });
    setFeedback('');
    setShowModal(true);
  }

  function openEditModal(cliente: UserClient) {
    setEditingClient(cliente);
    setFormData({
      nome: cliente.name || '',
      email: cliente.email || '',
      senha: '',
      role: cliente.role || 'cliente',
      active: cliente.active ?? true,
      planoNome: cliente.planoNome ?? 'Full Marketing',
      saldo: cliente.saldo ?? 0,
      artesTotal: cliente.artesTotal ?? 10,
      statusSite: cliente.statusSite ?? 'Protótipo',
      permiteSolicitar: cliente.permissoes?.podeSolicitarDesign ?? true,
      permiteLeads: cliente.permissoes?.recebeLeads ?? true,
    });
    setFeedback('');
    setShowModal(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback('');

    try {
      if (editingClient) {
        const ref = doc(db, 'users', editingClient.id);
        await updateDoc(ref, {
          name: formData.nome,
          role: formData.role,
          active: formData.active,
          planoNome: formData.planoNome,
          saldo: formData.saldo,
          artesTotal: formData.artesTotal,
          statusSite: formData.statusSite,
          permissoes: {
            podeSolicitarDesign: formData.permiteSolicitar,
            recebeLeads: formData.permiteLeads,
          },
        });

        setFeedback('Cliente atualizado com sucesso!');
      } else {
        await createClient({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
          role: formData.role,
          active: formData.active,
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
          role: 'cliente',
          active: true,
          planoNome: 'Full Marketing',
          saldo: 0,
          artesTotal: 10,
          statusSite: 'Protótipo',
          permiteSolicitar: true,
          permiteLeads: true,
        });
      }

      setTimeout(() => {
        setShowModal(false);
        setFeedback('');
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar cliente');
    }
  }

  function handleVerCampanhas(clienteId: string) {
    window.location.href = `/admin?tab=campanhas&clienteId=${clienteId}`;
  }

  return (
    <>
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar cliente por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-border rounded-lg text-white"
          />
        </div>
        <Button variant="secondary">
          <Filter size={20} className="mr-2" />
          Filtros
        </Button>
        <Button>
          <Download size={20} className="mr-2" />
          Exportar
        </Button>
        <Button onClick={openCreateModal}>
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
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Role</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Status</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Plano</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Status Site</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Saldo</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Artes</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold uppercase text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-border hover:bg-gray-800/30">
                    <td className="py-3 px-4">
                      <p className="font-semibold">{cliente.name}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{cliente.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cliente.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {cliente.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cliente.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {cliente.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{cliente.planoNome ?? 'Sem plano'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cliente.statusSite === 'Ativo' ? 'bg-green-500/20 text-green-500' :
                        cliente.statusSite === 'Em Desenvolvimento' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {cliente.statusSite ?? 'Protótipo'}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-green-500">
                      {formatCurrency(cliente.saldo ?? 0)}
                    </td>
                    <td className="py-3 px-4 text-gray-300">
                      0 / {cliente.artesTotal ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditModal(cliente)}
                        >
                          <Edit2 size={16} className="mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleVerCampanhas(cliente.id)}
                        >
                          Ver Campanhas
                        </Button>
                      </div>
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
          <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {editingClient ? 'Editar Cliente' : 'Cadastrar Novo Cliente'}
              </h2>
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
                  disabled={!!editingClient}
                />

                {!editingClient && (
                  <Input
                    label="Senha Temporária"
                    type="text"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    required
                    minLength={6}
                  />
                )}

                <div>
                  <label className="block text-sm font-medium mb-2">Role</label>
                  <Select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="cliente">Cliente</option>
                    <option value="admin">Admin</option>
                  </Select>
                </div>

                <Input
                  label="Plano"
                  value={formData.planoNome}
                  onChange={(e) => setFormData({ ...formData, planoNome: e.target.value })}
                />

                <Input
                  label="Saldo (R$)"
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

              <div className="flex gap-4 items-center flex-wrap">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">Conta ativa</span>
                </label>

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
                <Button
                  type="submit"
                  disabled={creating && !editingClient}
                  className="flex-1"
                >
                  {editingClient
                    ? 'Salvar alterações'
                    : creating
                      ? 'Cadastrando...'
                      : 'Cadastrar Cliente'}
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
                <p
                  className={`text-center font-semibold ${
                    feedback.includes('sucesso') ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {feedback}
                </p>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}