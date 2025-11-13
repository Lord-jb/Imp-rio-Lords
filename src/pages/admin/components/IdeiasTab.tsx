// pages/admin/components/IdeiasTab.tsx
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { Cliente, Ideia } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface IdeiasTabProps {
  clientes: Cliente[];
  ideias: Ideia[];
}

export function IdeiasTab({ clientes, ideias }: IdeiasTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {ideias.map((ideia) => {
        const cliente = clientes.find((c) => c.uid === ideia.uid_cliente);
        return (
          <Card key={ideia.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  ideia.prioridade === 'alta' ? 'bg-red-500/20 text-red-500' :
                  ideia.prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {ideia.prioridade || 'sem prioridade'}
                </span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                  ideia.status === 'aprovado' ? 'bg-green-500/20 text-green-500' :
                  ideia.status === 'em_analise' ? 'bg-blue-500/20 text-blue-500' :
                  ideia.status === 'implementado' ? 'bg-purple-500/20 text-purple-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {ideia.status}
                </span>
              </div>
              <Button size="sm" variant="secondary">Responder</Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">{ideia.titulo}</h3>
            <p className="text-sm text-gray-400 mb-3">{ideia.descricao}</p>
            <p className="text-sm text-gray-500 mb-2">Cliente: {cliente?.nome || 'N/A'}</p>
            {ideia.categoria && (
              <p className="text-xs text-gray-600 mb-2">Categoria: {ideia.categoria}</p>
            )}
            {ideia.resposta_admin && (
              <div className="mt-3 p-3 bg-secondary/10 rounded-lg">
                <p className="text-xs text-gray-400 mb-1">Resposta do admin:</p>
                <p className="text-sm">{ideia.resposta_admin}</p>
              </div>
            )}
            <p className="text-xs text-gray-600 mt-3">Enviado em {formatDate(ideia.createdAt)}</p>
          </Card>
        );
      })}
    </div>
  );
}