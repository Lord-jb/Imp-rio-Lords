// pages/client/components/SolicitacaoArteModal.tsx
import { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { db } from '../../../lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { X, Palette, Loader2 } from 'lucide-react';

interface SolicitacaoArteModalProps {
  clienteUid: string;
  onClose: () => void;
}

export function SolicitacaoArteModal({ clienteUid, onClose }: SolicitacaoArteModalProps) {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: '',
    briefing: '',
    prazo: '',
    prioridade: 'media' as 'baixa' | 'media' | 'alta' | 'urgente',
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
        tipo: formData.tipo,
        briefing: formData.briefing,
        prazo: formData.prazo,
        prioridade: formData.prioridade,
        status: 'pendente',
        entregas: [],
        createdAt: Timestamp.now(),
      });

      setFeedback('Solicitação enviada com sucesso!');
      
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao enviar solicitação');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-gray-900 border border-border rounded-xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-secondary/20 rounded-lg p-2">
              <Palette className="text-secondary" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Solicitar Arte</h2>
              <p className="text-sm text-gray-400">Descreva o que você precisa</p>
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
            label="Título da Arte"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            placeholder="Ex: Banner para Instagram"
            required
          />

          <Input
            label="Tipo de Arte"
            value={formData.tipo}
            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
            placeholder="Ex: Post, Story, Banner, Flyer..."
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Briefing / Descrição Completa</label>
            <textarea
              value={formData.briefing}
              onChange={(e) => setFormData({ ...formData, briefing: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[120px] focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
              placeholder="Descreva em detalhes o que você precisa: cores, textos, imagens, referências, etc."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Prazo Desejado"
              type="date"
              value={formData.prazo}
              onChange={(e) => setFormData({ ...formData, prazo: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium mb-2">Prioridade</label>
              <Select
                value={formData.prioridade}
                onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as any })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </Select>
            </div>
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
                'Enviar Solicitação'
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