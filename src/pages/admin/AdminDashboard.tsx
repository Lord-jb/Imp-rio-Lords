import { Users, DollarSign, TrendingUp, Palette } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import type { Cliente, Campanha } from '../../types';
import { formatCurrency } from '../../lib/utils';

export function AdminDashboard() {
  const { data: clientes } = useFirestoreCollection<Cliente>('clientes');
  const { data: campanhas } = useFirestoreCollection<Campanha>('campanhas');

  const saldoTotal = clientes.reduce((sum, c) => sum + (c.saldo_carteira || 0), 0);
  const campanhasAtivas = campanhas.filter(c => c.status === 'Ativa').length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Visão Geral</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase font-semibold">Clientes Ativos</p>
                <p className="text-3xl font-bold text-secondary">{clientes.length}</p>
              </div>
              <Users className="text-secondary" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase font-semibold">Saldo em Carteira</p>
                <p className="text-3xl font-bold text-secondary">{formatCurrency(saldoTotal)}</p>
              </div>
              <DollarSign className="text-secondary" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase font-semibold">Campanhas Ativas</p>
                <p className="text-3xl font-bold text-secondary">{campanhasAtivas}</p>
              </div>
              <TrendingUp className="text-secondary" size={40} />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm uppercase font-semibold">Artes Pendentes</p>
                <p className="text-3xl font-bold text-secondary">0</p>
              </div>
              <Palette className="text-secondary" size={40} />
            </div>
          </Card>
        </div>

        <Card>
          <h2 className="text-xl font-semibold mb-4">Clientes Recentes</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Cliente</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">E-mail</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Plano</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-semibold">Saldo</th>
                </tr>
              </thead>
              <tbody>
                {clientes.slice(0, 5).map((cliente) => (
                  <tr key={cliente.uid} className="border-b border-border hover:bg-gray-800/50">
                    <td className="py-3 px-4">{cliente.nome}</td>
                    <td className="py-3 px-4 text-gray-400">{cliente.email_login}</td>
                    <td className="py-3 px-4">{cliente.plano_nome}</td>
                    <td className="py-3 px-4 font-semibold">{formatCurrency(cliente.saldo_carteira)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}