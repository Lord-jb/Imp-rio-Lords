import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const navigate = useNavigate();
  const {
    session,
    profile,
    loading,
    error,
    signInWithGoogle,
    signInWithEmailPassword
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    if (loading || !session || !profile) return;

    if (!profile.active) {
      setUnauthorized(true);
      return;
    }

    navigate(profile.role === 'admin' ? '/admin' : '/client');
  }, [session, profile, loading, navigate]);

  const handleEmailLogin = () => {
    if (!email || !password) return;
    signInWithEmailPassword(email, password);
  };

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
            <p className="text-gray-400 text-sm">Gerencie suas campanhas</p>
          </div>

          {unauthorized && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-200 text-sm text-center">
              Sua conta está desativada.
            </div>
          )}

          {error && !unauthorized && (
            <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-4 text-red-200 text-sm text-center">
              {error}
            </div>
          )}

          {/* INPUT EMAIL */}
          <input
            type="email"
            placeholder="Seu e-mail"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* INPUT SENHA */}
          <input
            type="password"
            placeholder="Senha"
            className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            onClick={handleEmailLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            Entrar com E-mail
          </button>

          <div className="text-center text-gray-400">ou</div>

          {/* LOGIN GOOGLE */}
          <button
            onClick={signInWithGoogle}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 py-3 text-white rounded-lg flex items-center justify-center gap-2"
          >
            <img src="/google.png" className="w-5" />
            Entrar com Google
          </button>

          <div className="text-center text-gray-500 text-xs pt-4 border-t border-gray-700">
            Apenas usuários pré-autorizados podem acessar.
          </div>
        </div>
      </div>
    </div>
  );
};
