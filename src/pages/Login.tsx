import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'Nenhum usuário encontrado com este e-mail.',
        'auth/wrong-password': 'E-mail ou senha incorretos.',
        'auth/invalid-email': 'Formato de e-mail inválido.',
      };
      setError(errorMessages[err.code] || 'Erro ao tentar fazer login.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Área Restrita</h2>
        <p className="text-center text-gray-400 mb-6">
          Acesse seu portal de cliente ou o painel administrativo.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <Input
            type="password"
            label="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>

          {error && (
            <p className="text-red-500 text-center text-sm font-semibold">
              {error}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}