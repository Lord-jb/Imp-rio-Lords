import { LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <h2 className="text-xl font-semibold text-secondary">
            {user?.isAdmin ? 'Painel Admin' : 'Portal do Cliente'}
          </h2>
          <button
            onClick={signOut}
            className="text-gray-400 hover:text-secondary transition-colors"
            title="Sair"
          >
            <LogOut size={24} />
          </button>
        </div>
      </div>
    </header>
  );
}