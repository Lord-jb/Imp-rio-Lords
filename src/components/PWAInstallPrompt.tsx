import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verificar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Verificar se foi instalado via window.navigator
    if ((window.navigator as any).standalone === true) {
      setIsInstalled(true);
      return;
    }

    // Listener para o evento beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);

      // Mostrar prompt após 3 segundos (para não ser intrusivo)
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    // Listener para quando o app é instalado
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Mostrar o prompt de instalação
    deferredPrompt.prompt();

    // Aguardar escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('PWA instalado com sucesso');
    } else {
      console.log('Usuário recusou a instalação');
    }

    // Limpar o prompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salvar no localStorage que o usuário dispensou (opcional)
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Não mostrar se já está instalado ou se não tem prompt disponível
  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slideUp">
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl shadow-2xl p-5 border-2 border-white/10">
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Fechar"
        >
          <X className="w-4 h-4 text-white" />
        </button>

        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white rounded-xl flex items-center justify-center">
            <Download className="w-6 h-6 text-primary-600" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-white font-bold text-lg mb-1">
              Instalar IMPERIO
            </h3>
            <p className="text-white/80 text-sm mb-4">
              Acesse rapidamente sem abrir o navegador. Funciona offline!
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-white text-primary-600 font-bold py-2.5 px-4 rounded-lg hover:bg-white/90 transition-all shadow-lg"
              >
                Instalar Agora
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2.5 text-white/90 hover:text-white text-sm font-medium transition-colors"
              >
                Depois
              </button>
            </div>
          </div>
        </div>

        {/* Benefícios */}
        <div className="mt-4 pt-4 border-t border-white/10">
          <ul className="space-y-2 text-xs text-white/70">
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-white/50 rounded-full" />
              Acesso rápido da tela inicial
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-white/50 rounded-full" />
              Funciona offline
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1 h-1 bg-white/50 rounded-full" />
              Notificações em tempo real
            </li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(100px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}
