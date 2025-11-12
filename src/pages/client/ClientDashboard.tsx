import { Wallet, Globe, Palette, Calendar } from 'lucide-react';
import { where, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../../hooks/useAuth';
import { useFirestoreCollection } from '../../hooks/useFirestore';
import { Header } from '../../components/layout/Header';
import { Card } from '../../components/ui/Card';
import type { Cliente, Campanha } from '../../types';
import { formatCurrency } from '../../lib/utils';

export function ClientDashboard() {
  const { user } = useAuth();

  const { data: clientes } = useFirestoreCollection<Cliente>('clientes');
  const cliente = clientes.find((c) => c.uid === user?.uid);

  const { data: campanhas } = useFirestoreCollection<Campanha>('campanhas', [
    where('uid_cliente', '==', user?.uid || ''),
    orderBy('createdAt', 'desc'),
  ]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-bold">
            Olá, <span className="text-secondary">{cliente?.nome.split(' ')[0] || 'Cliente'}</span>
          </h1>
          <p className="text-gray-400 mt-2">
            Bem-vindo ao seu centro de controle. Tudo que o time atualiza aparece aqui em tempo real.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="flex items-center gap-4">
            <div className="bg-secondary/10 rounded-full p-4">
              <Wallet className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Saldo (Tráfego)</h3>
              <p className="text-2xl font-bold text-green-500">
                {formatCurrency(cliente?.saldo_carteira || 0)}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="bg-secondary/10 rounded-full p-4">
              <Globe className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Status do Site</h3>
              <p className="text-xl font-bold">{cliente?.status_site || '-'}</p>
              <small className="text-gray-500">{cliente?.plano_nome}</small>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="bg-secondary/10 rounded-full p-4">
              <Palette className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Artes do Plano</h3>
              <p className="text-xl font-bold">
                {cliente?.artes_usadas || 0} / {cliente?.plano_artes_total || 0}
              </p>
            </div>
          </Card>

          <Card className="flex items-center gap-4">
            <div className="bg-secondary/10 rounded-full p-4">
              <Calendar className="text-secondary" size={28} />
            </div>
            <div>
              <h3 className="text-sm text-gray-400 uppercase font-semibold">Gravações</h3>
              <p className="text-xl font-bold">0 agendadas</p>
            </div>
          </Card>
        </div>

        <Card>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="text-secondary">●</span> Campanhas Ativas
          </h3>
          
          {campanhas.length === 0 ? (
            <p className="text-gray-400">Nenhuma campanha ativa.</p>
          ) : (
            <div className="space-y-3">
              {campanhas.map((campanha) => (
                <div
                  key={campanha.id}
                  className="flex justify-between items-center border-b border-border pb-3"
                >
                  <div>
                    <p className="font-semibold">{campanha.nome_campanha}</p>
                    <p className="text-sm text-gray-400">{campanha.status}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(campanha.investimento)}</p>
                    <p className="text-sm text-gray-400">{campanha.resultado || '-'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </main>
    </div>
  );
}