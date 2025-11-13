// components/layout/Header.tsx
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '../ui/Button';

export function Header() {
  const { session, profile, signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={profile?.role === 'admin' ? '/admin' : '/client'} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
              <span className="text-background font-bold text-xl">M</span>
            </div>
            <h1 className="text-xl font-bold">
              Marketing <span className="text-secondary">Hub</span>
            </h1>
          </Link>

          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate(profile?.role === 'admin' ? '/admin' : '/client')}
              className="gap-2 hidden md:inline-flex"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Button>

            <div className="hidden sm:flex flex-col items-end leading-tight">
              <p className="text-sm font-semibold">{profile?.name || session?.displayName || 'Usuário'}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{session?.email || profile?.email}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${profile?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {profile?.role === 'admin' ? 'Administrador' : 'Cliente'}
                </span>
              </div>
            </div>

            {profile?.avatar ? (
              <img
                src={profile.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover ring-2 ring-secondary/30"
              />
            ) : (
              <div className="w-8 h-8 bg-secondary/20 rounded-full flex items-center justify-center">
                <User className="text-secondary" size={18} />
              </div>
            )}

            <Button
              size="sm"
              variant="ghost"
              onClick={signOut}
              className="gap-2"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
