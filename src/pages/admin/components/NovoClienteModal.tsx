// pages/admin/components/NovoClienteModal.tsx
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useCreateClient } from '../../../hooks/useCreateClient';

interface NovoClienteModalProps {
  onClose: () => void;
}

export function NovoClienteModal({ onClose }: NovoClienteModalProps) {
  const { createClient, loading } = useCreateClient();
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
      setTimeout(() => onClose(), 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao cadastrar cliente');
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Cadastrar Novo Cliente</h2>
          <button
            onClick={onClose}
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
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Cadastrando...' : 'Cadastrar Cliente'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
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
  );
}