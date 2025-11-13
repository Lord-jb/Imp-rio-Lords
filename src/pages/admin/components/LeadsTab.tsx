// pages/admin/components/LeadsTab.tsx
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import type { Cliente, Lead } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';

interface LeadsTabProps {
  clientes: Cliente[];
  leads: Lead[];
  selectedCliente: string;
  setSelectedCliente: (uid: string) => void;
}

export function LeadsTab({ clientes, leads, selectedCliente, setSelectedCliente }: LeadsTabProps) {
  return (
    <>
      <div className="mb-6">
        <Select
          value={selectedCliente}
          onChange={(e) => setSelectedCliente(e.target.value)}
          className="max-w-md"
        >
          <option key="all" value="">Todos os clientes</option>
          {clientes.map((c, i) => (
            <option key={c.uid || `cliente-${i}`} value={c.uid}>{c.nome}</option>
          ))}
        </Select>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Lead</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Contato</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cidade</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Status</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Valor</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead, i) => {
                const cliente = clientes.find((c) => c.uid === lead.uid_cliente);
                const rowKey = lead.id || `${lead.uid_cliente}-${lead.email}-${i}`;
                return (
                  <tr key={rowKey} className="border-b border-border hover:bg-gray-800/50">
                    <td className="py-3 px-4">{cliente?.nome || 'N/A'}</td>
                    <td className="py-3 px-4 font-semibold">{lead.nome}</td>
                    <td className="py-3 px-4 text-sm">
                      <div>{lead.email}</div>
                      <div className="text-gray-400">{lead.telefone}</div>
                    </td>
                    <td className="py-3 px-4">{lead.cidade}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        lead.status === 'ganho' ? 'bg-green-500/20 text-green-500' :
                        lead.status === 'em_negociacao' ? 'bg-blue-500/20 text-blue-500' :
                        lead.status === 'perdido' ? 'bg-red-500/20 text-red-500' :
                        'bg-gray-500/20 text-gray-500'
                      }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {lead.valor_potencial ? formatCurrency(lead.valor_potencial) : '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-400">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
