import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Info, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatDate } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface NotificationCenterProps {
  userId: string;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications(userId);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const getIcon = (tipo: string) => {
    switch (tipo) {
      case 'sucesso':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'alerta':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'erro':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const recentNotifications = notifications.slice(0, 10);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 hover:bg-neutral-800 rounded-lg transition-colors group"
      >
        <Bell size={20} className="text-neutral-400 group-hover:text-secondary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 rounded-full text-white text-xs font-bold flex items-center justify-center px-1.5">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-14 w-96 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-lg">Notificações</h3>
              {unreadCount > 0 && (
                <p className="text-xs text-neutral-400 mt-0.5">
                  {unreadCount} não {unreadCount === 1 ? 'lida' : 'lidas'}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1.5 text-xs text-secondary hover:text-secondary/80 transition-colors"
              >
                <CheckCheck size={14} />
                Marcar todas
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
                <p className="text-neutral-500 text-sm">Nenhuma notificação</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {recentNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 hover:bg-neutral-800/50 transition-colors ${
                      !notif.lido ? 'bg-primary-500/5' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(notif.tipo)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-semibold text-sm text-neutral-100">
                            {notif.titulo}
                          </h4>
                          {!notif.lido && (
                            <button
                              onClick={() => notif.id && markAsRead(notif.id)}
                              className="flex-shrink-0 p-1 hover:bg-neutral-700 rounded transition-colors"
                              title="Marcar como lida"
                            >
                              <Check size={14} className="text-neutral-400" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-neutral-400 mb-2 line-clamp-2">
                          {notif.mensagem}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-neutral-600">
                            {formatDate(notif.createdAt)}
                          </span>
                          {notif.link && (
                            <Link
                              to={notif.link}
                              onClick={() => {
                                setIsOpen(false);
                                notif.id && markAsRead(notif.id);
                              }}
                              className="text-xs text-secondary hover:text-secondary/80 font-medium"
                            >
                              Ver detalhes →
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 10 && (
            <div className="p-3 border-t border-neutral-800 text-center">
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-secondary hover:text-secondary/80 font-medium"
              >
                Ver todas ({notifications.length})
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
