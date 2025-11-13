// pages/admin/components/ArquivosTab.tsx
import { Card } from '../../../components/ui/Card';
import { Download, FileText } from 'lucide-react';
import type { Cliente, ArquivoCompartilhado } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface ArquivosTabProps {
  clientes: Cliente[];
  arquivos: ArquivoCompartilhado[];
}

export function ArquivosTab({ clientes, arquivos }: ArquivosTabProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {arquivos.map((arquivo) => {
        const cliente = clientes.find((c) => c.uid === arquivo.uid_cliente);
        return (
          <Card key={arquivo.id}>
            <div className="flex items-start justify-between mb-3">
              <FileText className="text-secondary" size={32} />
              <span className="px-2 py-1 bg-secondary/20 text-secondary rounded text-xs font-semibold">
                {arquivo.categoria}
              </span>
            </div>
            <h3 className="font-semibold text-lg mb-2">{arquivo.titulo}</h3>
            <p className="text-sm text-gray-400 mb-3">{arquivo.descricao}</p>
            <p className="text-sm text-gray-500 mb-3">Cliente: {cliente?.nome || 'N/A'}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-600">{formatDate(arquivo.createdAt)}</span>
            <a
              href={arquivo.downloadURL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-secondary hover:text-yellow-500"
            >
              <Download size={20} />
            </a>
            </div>
          </Card>
        );
      })}
    </div>
  );
}