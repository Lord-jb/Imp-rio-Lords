// pages/client/components/IdeiaModal.tsx
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { db } from '../../../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { X, Lightbulb, Loader2 } from 'lucide-react';

interface IdeiaModalProps {
  clienteUid: string;
  onClose: () => void;
}

export function IdeiaModal({ clienteUid, onClose }: IdeiaModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
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
        status: 'novo',
        createdAt: Timestamp.now(),
      });

      setFeedback('Ideia enviada com sucesso!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao enviar ideia');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-900 border border-border rounded-xl shadow-2xl p-6 max-w-2xl w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-purple-500/20 rounded-lg p-2">
              <Lightbulb className="text-purple-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Enviar Ideia</h2>
              <p className="text-sm text-gray-400">Compartilhe suas sugestões</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Título da Ideia"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ex: Campanha para Black Friday"
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Descrição Detalhada</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[150px] focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="Descreva sua ideia em detalhes: objetivos, público-alvo, estratégia, etc."
              required
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Enviando...
                </>
              ) : (
                'Enviar Ideia'
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
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
  );
}