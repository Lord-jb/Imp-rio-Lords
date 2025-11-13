// pages/client/components/IdeiaModal.tsx
import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

interface IdeiaModalProps {
  clienteUid: string;
  onClose: () => void;
}

export function IdeiaModal({ clienteUid, onClose }: IdeiaModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    categoria: '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      await addDoc(collection(db, 'ideias'), {
        uid_cliente: clienteUid,
        titulo: formData.titulo,
        descricao: formData.descricao,
        categoria: formData.categoria,
        status: 'novo',
        prioridade: 'media',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setFeedback('Ideia enviada com sucesso!');
      setTimeout(() => onClose(), 1500);
    } catch (error) {
      setFeedback('Erro ao enviar ideia.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Enviar Ideia</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título da Ideia"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
            placeholder="Ex: Nova campanha para Black Friday"
          />

          <div>
            <label className="block text-sm font-semibold mb-2">Descrição</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white h-32"
              required
              placeholder="Descreva sua ideia, sugestão ou necessidade..."
            />
          </div>

          <Input
            label="Categoria (opcional)"
            value={formData.categoria}
            onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
            placeholder="Ex: Marketing, Design, Produto"
          />

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enviando...' : 'Enviar Ideia'}
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