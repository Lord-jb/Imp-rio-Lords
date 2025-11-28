// components/layout/Header.tsx
import { Link } from 'react-router-dom';
import {
  LogOut,
  User,
  ChevronDown,
  Zap,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { NotificationCenter } from '../notifications/NotificationCenter';

export function Header() {
  const { session, profile, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isAdmin = profile?.role === 'admin';
  const dashboardPath = isAdmin ? '/admin' : '/client';

  return (
    <header className="bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 sticky top-0 z-50 shadow-xl">
      <div className="px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={dashboardPath} 
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-secondary/30 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
              <div className="relative w-11 h-11 bg-gradient-to-br from-secondary via-secondary to-yellow-600 rounded-xl flex items-center justify-center transform group-hover:scale-105 transition-transform shadow-lg">
                <Zap className="text-background" size={22} strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Marketing <span className="text-secondary">Hub</span>
              </h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest font-semibold -mt-0.5">
                by Lords
              </p>
            </div>
          </Link>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Notifications - Desktop */}
            <div className="hidden md:block">
              {session?.uid && <NotificationCenter userId={session.uid} />}
            </div>

            {/* User Menu - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800/70 transition-all group"
              >
                {/* Avatar */}
                <div className="relative">
                  {profile?.avatar ? (
                    <>
                      <div className="absolute inset-0 bg-secondary/30 rounded-full blur-sm"></div>
                      <img
                        src={profile.avatar}
                        alt="avatar"
                        className="relative w-9 h-9 rounded-full object-cover ring-2 ring-gray-700 group-hover:ring-secondary/50 transition-all"
                      />
                    </>
                  ) : (
                    <div className="w-9 h-9 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-full flex items-center justify-center ring-2 ring-gray-700 group-hover:ring-secondary/50 transition-all">
                      <User className="text-secondary" size={18} />
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
                </div>

                {/* User Info */}
                <div className="text-left">
                  <p className="text-sm font-semibold leading-tight">
                    {profile?.name?.split(' ')[0] || 'Usuário'}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isAdmin 
                        ? 'bg-purple-500/20 text-purple-400' 
                        : 'bg-blue-500/20 text-blue-400'
                    }`}>
                      {isAdmin ? 'Admin' : 'Cliente'}
                    </span>
                  </div>
                </div>

                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowUserMenu(false)}
                  ></div>
                  <div className="absolute right-0 top-14 w-72 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl py-2 z-50 animate-fadeIn">
                    {/* User Info Section */}
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="font-semibold text-sm mb-0.5">
                        {profile?.name || session?.displayName || 'Usuário'}
                      </p>
                      <p className="text-xs text-gray-400 mb-2">
                        {session?.email}
                      </p>
                      <span className={`inline-block text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                        isAdmin 
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {isAdmin ? 'Administrador' : 'Cliente'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut size={18} />
                        <span className="font-medium">Sair da conta</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-800 py-4 animate-slideDown">
            {/* User Info Mobile */}
            <div className="flex items-center gap-3 px-2 py-3 mb-4 bg-gray-800/50 rounded-lg">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt="avatar"
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-secondary/30"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-full flex items-center justify-center ring-2 ring-secondary/30">
                  <User className="text-secondary" size={22} />
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold text-sm">
                  {profile?.name || 'Usuário'}
                </p>
                <p className="text-xs text-gray-400 mb-1">
                  {session?.email}
                </p>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                  isAdmin 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {isAdmin ? 'Admin' : 'Cliente'}
                </span>
              </div>
            </div>

            {/* Notifications Mobile */}
            <div className="mb-2">
              {session?.uid && <NotificationCenter userId={session.uid} />}
            </div>

            {/* Logout Mobile */}
            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-2 py-3 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Sair da conta</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.96);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }

        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
      `}</style>
    </header>
  );
}