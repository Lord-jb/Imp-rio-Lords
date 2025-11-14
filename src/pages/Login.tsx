// FILE: src/pages/Login.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const navigate = useNavigate();
  const { session, profile, loading, error, signInWithGoogle } = useAuth();
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (!loading && session && profile) {
      if (!profile.active) {
        setUnauthorized(true);
      } else if (profile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/client');
      }
    }
  }, [session, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl">
                <Zap className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white">Marketing Hub</h1>
            <p className="text-gray-400 text-sm">Gerencie suas campanhas e análises em um só lugar</p>
          </div>

          {unauthorized && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-200 text-sm text-center">
              Acesso Negado. Sua conta não está autorizada a usar esta aplicação.
            </div>
          )}

          {error && !unauthorized && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          <button
            onClick={signInWithGoogle}
            disabled={loading || unauthorized}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Entrando...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Entrar com Google
              </>
            )}
          </button>

          <div className="text-center text-gray-500 text-xs pt-4 border-t border-gray-700">
            <p>Apenas usuários pré-autorizados podem acessar esta aplicação</p>
          </div>
        </div>
      </div>
    </div>
  );
};