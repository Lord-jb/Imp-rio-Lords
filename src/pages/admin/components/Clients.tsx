// pages/admin/components/Clients.tsx - Otimizações de layout
import { useState } from 'react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { useFirestoreCollection } from '../../../hooks/useFirestore';
import { useCreateClient } from '../../../hooks/useCreateClient';
import { formatCurrency } from '../../../lib/utils';
import { Edit2, Plus, Search, Filter, Download, Trash2 } from 'lucide-react';
import { db } from '../../../lib/firebase';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import type {UserClient} from '@/types/index'


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
    role: 'client',
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
      role: 'client',
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
      role: cliente.role || 'client',
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

  async function handleDelete(clienteId: string) {
    if (!confirm('Deseja realmente excluir este cliente? Esta ação não pode ser desfeita.')) return;

    try {
      await deleteDoc(doc(db, 'users', clienteId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir cliente');
    }
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
          role: 'client',
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

  return (
    <>
      {/* Header com ações */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar cliente por nome ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-border rounded-lg text-white focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="whitespace-nowrap">
            <Filter size={20} className="mr-2" />
            Filtros
          </Button>
          <Button variant="secondary" className="whitespace-nowrap">
            <Download size={20} className="mr-2" />
            Exportar
          </Button>
          <Button onClick={openCreateModal} className="whitespace-nowrap">
            <Plus size={20} className="mr-2" />
            Novo Cliente
          </Button>
        </div>
      </div>

      {/* Tabela responsiva */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-secondary"></div>
        </div>
      ) : clientesFiltrados.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400 text-lg mb-2">Nenhum cliente encontrado</p>
          <p className="text-gray-500 text-sm mb-6">
            {searchTerm ? 'Tente ajustar sua pesquisa' : 'Comece adicionando seu primeiro cliente'}
          </p>
          {!searchTerm && (
            <Button onClick={openCreateModal}>
              <Plus size={20} className="mr-2" />
              Adicionar Cliente
            </Button>
          )}
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-border bg-gray-800/50">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Cliente</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">E-mail</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Role</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Status</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Plano</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Site</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Saldo</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Artes</th>
                  <th className="text-center py-4 px-4 text-gray-400 font-semibold uppercase text-xs">Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="border-b border-border hover:bg-gray-800/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        {cliente.avatar ? (
                          <img src={cliente.avatar} alt={cliente.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                            {cliente.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <p className="font-semibold">{cliente.name}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{cliente.email}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cliente.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-blue-500/20 text-blue-500'
                      }`}>
                        {cliente.role}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cliente.active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {cliente.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">{cliente.planoNome ?? 'Sem plano'}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        cliente.statusSite === 'Ativo' ? 'bg-green-500/20 text-green-500' :
                        cliente.statusSite === 'Em Desenvolvimento' ? 'bg-blue-500/20 text-blue-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {cliente.statusSite ?? 'Protótipo'}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold text-green-500">
                      {formatCurrency(cliente.saldo ?? 0)}
                    </td>
                    <td className="py-4 px-4 text-gray-300 text-sm">
                      <span className="font-mono">0 / {cliente.artesTotal ?? 0}</span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEditModal(cliente)}
                          className="p-2 text-secondary hover:bg-secondary/10 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(cliente.id)}
                          className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Paginação/Total */}
          <div className="px-4 py-3 bg-gray-800/30 border-t border-border">
            <p className="text-sm text-gray-400">
              Mostrando <span className="font-semibold text-white">{clientesFiltrados.length}</span> de{' '}
              <span className="font-semibold text-white">{clientes.length}</span> clientes
            </p>
          </div>
        </Card>
      )}

      {/* Modal otimizado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-gray-900 border border-border rounded-xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                {editingClient ? (
                  <>
                    <Edit2 size={24} className="text-secondary" />
                    Editar Cliente
                  </>
                ) : (
                  <>
                    <Plus size={24} className="text-secondary" />
                    Cadastrar Novo Cliente
                  </>
                )}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white text-3xl transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-800"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300 pb-2 border-b border-border">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome Completo"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    required
                    placeholder="Digite o nome completo"
                  />

                  <Input
                    label="E-mail"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={!!editingClient}
                    placeholder="cliente@exemplo.com"
                  />

                  {!editingClient && (
                    <Input
                      label="Senha Temporária"
                      type="text"
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      required
                      minLength={6}
                      placeholder="Mínimo 6 caracteres"
                    />
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Perfil de Acesso</label>
                    <Select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="client">Cliente</option>
                      <option value="admin">Administrador</option>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Plano e Configurações */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300 pb-2 border-b border-border">
                  Plano e Configurações
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Nome do Plano"
                    value={formData.planoNome}
                    onChange={(e) => setFormData({ ...formData, planoNome: e.target.value })}
                    placeholder="Ex: Full Marketing"
                  />

                  <Input
                    label="Saldo em Carteira (R$)"
                    type="number"
                    step="0.01"
                    value={formData.saldo}
                    onChange={(e) => setFormData({ ...formData, saldo: Number(e.target.value) })}
                  />

                  <Input
                    label="Total de Artes Mensais"
                    type="number"
                    value={formData.artesTotal}
                    onChange={(e) => setFormData({ ...formData, artesTotal: Number(e.target.value) })}
                  />

                  <Input
                    label="Status do Site"
                    value={formData.statusSite}
                    onChange={(e) => setFormData({ ...formData, statusSite: e.target.value })}
                    placeholder="Ex: Protótipo, Ativo"
                  />
                </div>
              </div>

              {/* Permissões */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-300 pb-2 border-b border-border">
                  Permissões
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-5 h-5 rounded accent-secondary"
                    />
                    <span className="text-sm font-medium">Conta Ativa</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permiteSolicitar}
                      onChange={(e) => setFormData({ ...formData, permiteSolicitar: e.target.checked })}
                      className="w-5 h-5 rounded accent-secondary"
                    />
                    <span className="text-sm font-medium">Solicitar Artes</span>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg border border-border hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      checked={formData.permiteLeads}
                      onChange={(e) => setFormData({ ...formData, permiteLeads: e.target.checked })}
                      className="w-5 h-5 rounded accent-secondary"
                    />
                    <span className="text-sm font-medium">Receber Leads</span>
                  </label>
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={creating && !editingClient}
                  className="flex-1"
                >
                  {editingClient
                    ? 'Salvar Alterações'
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
                <div className={`p-4 rounded-lg text-center font-semibold animate-fadeIn ${
                  feedback.includes('sucesso') 
                    ? 'bg-green-500/20 text-green-500 border border-green-500/50' 
                    : 'bg-red-500/20 text-red-500 border border-red-500/50'
                }`}>
                  {feedback}
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}