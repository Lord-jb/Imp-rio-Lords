// FILE: src/pages/admin/components/DesignTab.tsx
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import type { Cliente, SolicitacaoDesign } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface DesignTabProps {
  clientes: Cliente[];
  solicitacoes: SolicitacaoDesign[];
}

export function DesignTab({ clientes, solicitacoes }: DesignTabProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {solicitacoes.map((sol) => {
        const cliente = clientes.find((c) => c.uid === sol.uid_cliente);
        return (
          <Card key={sol.id}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                  sol.prioridade === 'urgente' ? 'bg-red-500/20 text-red-500' :
                  sol.prioridade === 'alta' ? 'bg-orange-500/20 text-orange-500' :
                  sol.prioridade === 'media' ? 'bg-yellow-500/20 text-yellow-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {sol.prioridade}
                </span>
                <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                  sol.status === 'entregue' ? 'bg-green-500/20 text-green-500' :
                  sol.status === 'em_producao' ? 'bg-blue-500/20 text-blue-500' :
                  'bg-gray-500/20 text-gray-500'
                }`}>
                  {sol.status}
                </span>
              </div>
              <Button size="sm" variant="secondary">Gerenciar</Button>
            </div>
            <h3 className="font-semibold text-lg mb-2">{sol.titulo}</h3>
            <p className="text-gray-400 mb-2">Cliente: {cliente?.nome || 'N/A'}</p>
            <p className="text-sm text-gray-500 mb-3">Tipo: {sol.tipo}</p>
            <p className="text-sm text-gray-400 mb-3">{sol.briefing}</p>
            {sol.prazo && <p className="text-xs text-gray-500">Prazo: {sol.prazo}</p>}
            <p className="text-xs text-gray-600 mt-2">Criado em {formatDate(sol.createdAt)}</p>
          </Card>
        );
      })}
    </div>
  );
}