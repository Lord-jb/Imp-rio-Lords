// pages/admin/components/FinanceiroTab.tsx
import { useMemo, useState } from 'react';
import { where, orderBy } from 'firebase/firestore';
import { Card } from '../../../components/ui/Card';
import { Select } from '../../../components/ui/Select';
import { Button } from '../../../components/ui/Button';
import { useFirestoreCollection } from '../../../hooks/useFirestore';
import type { Cliente, Financeiro } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';

interface Props {
  clientes: Cliente[];
}

const MESES = [
  { key: '01', label: 'Jan' },
  { key: '02', label: 'Fev' },
  { key: '03', label: 'Mar' },
  { key: '04', label: 'Abr' },
  { key: '05', label: 'Mai' },
  { key: '06', label: 'Jun' },
  { key: '07', label: 'Jul' },
  { key: '08', label: 'Ago' },
  { key: '09', label: 'Set' },
  { key: '10', label: 'Out' },
  { key: '11', label: 'Nov' },
  { key: '12', label: 'Dez' },
];

export function FinanceiroTab({ clientes }: Props) {
  const [clienteUid, setClienteUid] = useState<string>('');
  const [mes, setMes] = useState<string>('');
  const [ano, setAno] = useState<string>(new Date().getFullYear().toString());

  const filtros = useMemo(() => {
    const arr: any[] = [orderBy('createdAt', 'desc')];
    if (clienteUid) arr.unshift(where('uid_cliente', '==', clienteUid));
    if (mes) arr.unshift(where('mes', '==', Number(mes)));
    if (ano) arr.unshift(where('ano', '==', Number(ano)));
    return arr;
  }, [clienteUid, mes, ano]);

  const { data: lancamentos } = useFirestoreCollection<Financeiro>('financeiro', filtros);

  const totalCredito = lancamentos.filter(l => l.tipo === 'credito').reduce((s, l) => s + (l.valor || 0), 0);
  const totalDebito = lancamentos.filter(l => l.tipo === 'debito').reduce((s, l) => s + (l.valor || 0), 0);
  const saldo = totalCredito - totalDebito;

  const anosRange = useMemo(() => {
    const y = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => (y - i).toString());
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Select
          value={clienteUid}
          onChange={(e) => setClienteUid(e.target.value)}
          className="bg-gray-800 border border-border rounded-lg px-3 py-2"
        >
          <option key="all-clientes" value="">Todos os clientes</option>
          {clientes.map((c, i) => (
            <option key={c.uid || `cliente-opt-${i}`} value={c.uid}>{c.nome}</option>
          ))}
        </Select>

        <Select
          value={mes}
          onChange={(e) => setMes(e.target.value)}
          className="bg-gray-800 border border-border rounded-lg px-3 py-2"
        >
          <option key="all-meses" value="">Todos os meses</option>
          {MESES.map((m) => (
            <option key={`mes-${m.key}`} value={m.key}>{m.label}</option>
          ))}
        </Select>

        <Select
          value={ano}
          onChange={(e) => setAno(e.target.value)}
          className="bg-gray-800 border border-border rounded-lg px-3 py-2"
        >
          {anosRange.map((y) => (
            <option key={`ano-${y}`} value={y}>{y}</option>
          ))}
        </Select>

        <Button
          variant="secondary"
          onClick={() => { setClienteUid(''); setMes(''); setAno(new Date().getFullYear().toString()); }}
          className="w-full"
        >
          Limpar filtros
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-5">
          <p className="text-gray-400 text-sm uppercase font-semibold">Créditos</p>
          <p className="text-3xl font-bold text-green-500">{formatCurrency(totalCredito)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-gray-400 text-sm uppercase font-semibold">Débitos</p>
          <p className="text-3xl font-bold text-red-500">{formatCurrency(totalDebito)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-gray-400 text-sm uppercase font-semibold">Saldo</p>
          <p className={`text-3xl font-bold ${saldo >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(saldo)}</p>
        </Card>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Tipo</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Categoria</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Descrição</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Valor</th>
                <th className="text-left py-3 px-4 text-gray-400 font-semibold">Data</th>
              </tr>
            </thead>
            <tbody>
              {lancamentos.map((l, i) => {
                const cli = clientes.find(c => c.uid === l.uid_cliente);
                const k = l.id || `${l.uid_cliente}-${l.descricao || 'desc'}-${l.valor}-${i}`;
                return (
                  <tr key={k} className="border-b border-border hover:bg-gray-800/50">
                    <td className="py-3 px-4">{cli?.nome || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        l.tipo === 'credito' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {l.tipo}
                      </span>
                    </td>
                    <td className="py-3 px-4">{l.categoria}</td>
                    <td className="py-3 px-4">{l.descricao}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(l.valor)}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{formatDate(l.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
