import { useState } from 'react';
import { Plus, Edit2, Trash2, Download, ExternalLink } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Select } from '../../../components/ui/Select';
import { FileUpload } from '../../../components/ui/FileUpload';
import type { Cliente, ArquivoCompartilhado } from '../../../types';
import { formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import { createNotification } from '../../../hooks/useNotifications';

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
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Função para salvar no banco de dados
  async function saveToDatabase() {
    if (!formData.uid_cliente || !formData.downloadURL) {
      setFeedback('Selecione um cliente e faça upload do arquivo primeiro');
      return;
    }

    setLoading(true);
    setFeedback('Salvando arquivo no banco de dados...');

    try {
      await addDoc(collection(db, 'arquivos'), {
        uid_cliente: formData.uid_cliente,
        titulo: formData.titulo,
        categoria: formData.categoria,
        downloadURL: formData.downloadURL,
        descricao: formData.descricao,
        storagePath: formData.storagePath,
        createdAt: Timestamp.now(),
      });

      // Criar notificação para o cliente
      await createNotification({
        uid_destinatario: formData.uid_cliente,
        tipo: 'info',
        titulo: '📁 Novo Arquivo Compartilhado',
        mensagem: `Um novo arquivo "${formData.titulo}" foi compartilhado com você na categoria ${formData.categoria}.`,
        link: '/client',
      });

      setFeedback('✅ Arquivo compartilhado com o cliente com sucesso!');

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      setFeedback(`❌ Erro ao salvar: ${error.message || 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    // Se está editando, usa a lógica antiga
    if (arquivo?.id) {
      setLoading(true);
      setFeedback('');
      try {
        await updateDoc(doc(db, 'arquivos', arquivo.id), {
          uid_cliente: formData.uid_cliente,
          titulo: formData.titulo,
          categoria: formData.categoria,
          downloadURL: formData.downloadURL,
          descricao: formData.descricao,
          storagePath: formData.storagePath,
        });
        setFeedback('Arquivo atualizado com sucesso!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } catch (error: any) {
        setFeedback(error.message || 'Erro ao salvar arquivo');
      } finally {
        setLoading(false);
      }
    } else {
      // Se está criando novo, usa a nova função
      await saveToDatabase();
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

          {!arquivo && (
            <div>
              <FileUpload
                label="Arquivo"
                folder={`arquivos/${formData.uid_cliente || 'temp'}`}
                onUploadComplete={(downloadURL, storagePath, fileName) => {
                  setFormData({
                    ...formData,
                    downloadURL,
                    storagePath,
                    titulo: formData.titulo || fileName,
                  });
                  setUploadSuccess(true);
                  setUploadError('');
                }}
                onError={(error) => {
                  setUploadError(error);
                  setUploadSuccess(false);
                }}
                disabled={!formData.uid_cliente}
              />
              {uploadSuccess && formData.downloadURL && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-green-500 text-sm font-medium">
                    ✅ Upload concluído! Agora clique em "Compartilhar com Cliente" abaixo.
                  </p>
                </div>
              )}
            </div>
          )}

          {arquivo && (
            <>
              <Input
                label="URL do Arquivo"
                type="url"
                value={formData.downloadURL}
                onChange={(e) => setFormData({ ...formData, downloadURL: e.target.value })}
                required
                disabled
              />

              <Input
                label="Caminho de Armazenamento"
                value={formData.storagePath}
                onChange={(e) => setFormData({ ...formData, storagePath: e.target.value })}
                required
                disabled
              />
            </>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Descrição (opcional)</label>
            <textarea
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-4 py-3 bg-gray-800 border border-border rounded-lg text-white min-h-[80px]"
            />
          </div>

          {uploadError && (
            <p className="text-red-500 text-sm text-center">{uploadError}</p>
          )}

          {!formData.uid_cliente && !arquivo && (
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-500 text-sm font-medium">
                ⚠️ Selecione um cliente antes de fazer upload
              </p>
            </div>
          )}

          {!arquivo && formData.uid_cliente && !formData.downloadURL && (
            <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-blue-400 text-sm">
                📋 <strong>Passo a passo:</strong>
              </p>
              <ol className="text-blue-400 text-sm mt-2 space-y-1 list-decimal list-inside">
                <li>Selecione o arquivo clicando na área acima</li>
                <li>Clique em "Fazer Upload" para enviar ao servidor</li>
                <li>Após o upload, clique em "Compartilhar com Cliente"</li>
              </ol>
            </div>
          )}

          <div className="flex gap-4 mt-6">
            <Button
              type="submit"
              disabled={loading || (!arquivo && !formData.downloadURL)}
              className="flex-1"
            >
              {loading ? 'Salvando...' : arquivo ? 'Salvar Alterações' : '📤 Compartilhar com Cliente'}
            </Button>
            <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
          </div>

          {feedback && (
            <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${
              feedback.includes('✅') || feedback.includes('sucesso')
                ? 'bg-green-500/10 border border-green-500/30 text-green-500'
                : 'bg-red-500/10 border border-red-500/30 text-red-500'
            }`}>
              {feedback}
            </div>
          )}
        </form>
      </div>
    </div>
  );
}