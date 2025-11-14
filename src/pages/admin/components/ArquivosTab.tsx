import { useState } from 'react';
import { Plus, Edit2, Trash2, Download, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import type { Cliente, ArquivoCompartilhado } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';

interface ArquivosTabProps {
  clientes: Cliente[];
  arquivos: ArquivoCompartilhado[];
}

export function ArquivosTab({ clientes, arquivos }: ArquivosTabProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingArquivo, setEditingArquivo] = useState<ArquivoCompartilhado | null>(null);

  function handleEdit(arquivo: ArquivoCompartilhado) {
    setEditingArquivo(arquivo);
    setShowModal(true);
  }

  function handleCreate() {
    setEditingArquivo(null);
    setShowModal(true);
  }

  async function handleDelete(arquivoId: string) {
    if (!confirm('Deseja realmente excluir este arquivo?')) return;

    try {
      await deleteDoc(doc(db, 'arquivos', arquivoId));
    } catch (error: any) {
      alert(error.message || 'Erro ao excluir arquivo');
    }
  }

  return (
    <>
      <div className="flex justify-end mb-6">
        <Button onClick={handleCreate}>
          <Plus size={20} className="mr-2" />
          Novo Arquivo
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {arquivos.map((arquivo) => {
          const cliente = clientes.find((c) => c.uid === arquivo.uid_cliente);
          return (
            <Card key={arquivo.id}>
              <div className="flex items-start justify-between mb-4">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  arquivo.categoria === 'contrato' ? 'bg-purple-500/20 text-purple-500' :
                  arquivo.categoria === 'relatorio' ? 'bg-green-500/20 text-green-500' :
                  arquivo.categoria === 'design' ? 'bg-blue-500/20 text-blue-500' :
                  arquivo.categoria === 'video' ? 'bg-red-500/20 text-red-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {arquivo.categoria}
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEdit(arquivo)}
                    className="text-secondary hover:text-yellow-500"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => arquivo.id && handleDelete(arquivo.id)}
                    className="text-red-500 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{arquivo.titulo}</h3>
              <p className="text-xs text-gray-500 mb-3">Cliente: {cliente?.nome || 'N/A'}</p>
              {arquivo.descricao && (
                <p className="text-sm text-gray-400 mb-3">{arquivo.descricao}</p>
              )}

              <div className="flex gap-2 mt-4">
                <a 
                  href={arquivo.downloadURL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" variant="secondary" className="w-full">
                    <ExternalLink size={16} className="mr-1" />
                    Abrir
                  </Button>
                </a>
                <a 
                  href={arquivo.downloadURL}
                  download
                  className="flex-1"
                >
                  <Button size="sm" className="w-full">
                    <Download size={16} className="mr-1" />
                    Baixar
                  </Button>
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <span className="text-xs text-gray-600">{formatDate(arquivo.createdAt)}</span>
              </div>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <ArquivoModal
          clientes={clientes}
          arquivo={editingArquivo}
          onClose={() => {
            setShowModal(false);
            setEditingArquivo(null);
          }}
        />
      )}
    </>
  );
}

function ArquivoModal({
  clientes,
  arquivo = null,
  onClose,
}: {
  clientes: Cliente[];
  arquivo?: ArquivoCompartilhado | null;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    uid_cliente: arquivo?.uid_cliente || '',
    titulo: arquivo?.titulo || '',
    categoria: arquivo?.categoria || 'outro',
    downloadURL: arquivo?.downloadURL || '',
    descricao: arquivo?.descricao || '',
    storagePath: arquivo?.storagePath || '',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback('');

    try {
      if (arquivo?.id) {
        await updateDoc(doc(db, 'arquivos', arquivo.id), {
          uid_cliente: formData.uid_cliente,
          titulo: formData.titulo,
          categoria: formData.categoria,
          downloadURL: formData.downloadURL,
          descricao: formData.descricao,
          storagePath: formData.storagePath,
        });
        setFeedback('Arquivo atualizado com sucesso!');
      } else {
        await addDoc(collection(db, 'arquivos'), {
          uid_cliente: formData.uid_cliente,
          titulo: formData.titulo,
          categoria: formData.categoria,
          downloadURL: formData.downloadURL,
          descricao: formData.descricao,
          storagePath: formData.storagePath,
          createdAt: Timestamp.now(),
        });
        setFeedback('Arquivo criado com sucesso!');
      }

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      setFeedback(error.message || 'Erro ao salvar arquivo');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border border-border rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {arquivo ? 'Editar Arquivo' : 'Novo Arquivo'}
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
              disabled={!!arquivo}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c, i) => (
                <option key={c.uid || `cli-${i}`} value={c.uid}>{c.nome}</option>
              ))}
            </Select>
          </div>

          <Input
            label="Título do Arquivo"
            value={formData.titulo}
            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium mb-2">Categoria</label>
            <Select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value as any })}
            >
              <option value="contrato">Contrato</option>
              <option value="relatorio">Relatório</option>
              <option value="design">Design</option>
              <option value="video">Vídeo</option>
              <option value="outro">Outro</option>
            </Select>
          </div>

          <Input
            label="URL do Arquivo"
            type="url"
            value={formData.downloadURL}
            onChange={(e) => setFormData({ ...formData, downloadURL: e.target.value })}
            required
            placeholder="https://drive.google.com/..."
          />

          <Input
            label="Caminho de Armazenamento"
            value={formData.storagePath}
            onChange={(e) => setFormData({ ...formData, storagePath: e.target.value })}
            required
            placeholder="clientes/uid/arquivo.pdf"
          />

          <div>
            <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[80px]"
            />
          </div>

          <div className="flex gap-4 mt-6">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Salvando...' : arquivo ? 'Salvar Alterações' : 'Criar Arquivo'}
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