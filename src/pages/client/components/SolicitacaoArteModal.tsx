// pages/client/components/SolicitacaoArteModal.tsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface SolicitacaoArteModalProps {
  clienteUid: string;
  onClose: () => void;
}

export function SolicitacaoArteModal({ clienteUid, onClose }: SolicitacaoArteModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    briefing: '',
    tipo: 'feed' as const,
    dimensoes: '',
    referencia_url: '',
    prazo: '',
    prioridade: 'media' as const,
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      await addDoc(collection(db, 'solicitacoes_design'), {
        uid_cliente: clienteUid,
        titulo: formData.titulo,
        briefing: formData.briefing,
        tipo: formData.tipo,
        dimensoes: formData.dimensoes,
        referencia_url: formData.referencia_url,
        prazo: formData.prazo,
        prioridade: formData.prioridade,
        status: 'novo',
        entregas: [],
        comentarios: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setFeedback('Solicitação enviada com sucesso!');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setFeedback('Erro ao enviar solicitação.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Solicitar Arte</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título da Solicitação"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
            placeholder="Ex: Banner para Instagram"
          />

          <div>
            <label className="block text-sm font-semibold mb-2">Briefing</label>
            <textarea
              value={formData.briefing}
              onChange={(e) => setFormData({ ...formData, briefing: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-32"
              required
              placeholder="Descreva detalhadamente o que você precisa..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Tipo de Arte</label>
              <select
                value={formData.tipo}
                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as any })}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
              >
                <option value="feed">Feed (Post)</option>
                <option value="stories">Stories</option>
                <option value="banner">Banner</option>
                <option value="logo">Logo</option>
                <option value="video">Vídeo</option>
                <option value="outro">Outro</option>
              </select>
            </div>

            <Input
              label="Dimensões"
              value={formData.dimensoes}
              onChange={(e) => setFormData({ ...formData, dimensoes: e.target.value })}
              placeholder="Ex: 1080x1080"
            />

            <Input
              label="Referência (URL)"
              type="url"
              value={formData.referencia_url}
              onChange={(e) => setFormData({ ...formData, referencia_url: e.target.value })}
              placeholder="Link de inspiração"
            />

            <Input
              label="Prazo Desejado"
              value={formData.prazo}
              onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
              placeholder="Ex: 3 dias"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Prioridade</label>
            <select
              value={formData.prioridade}
              onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
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