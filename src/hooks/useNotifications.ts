import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Notificacao } from '../types';

interface UseNotificationsReturn {
  notifications: Notificacao[];
  unreadCount: number;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  loading: boolean;
}

export function useNotifications(userId: string): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    // Query para notificações do usuário, ordenadas por data
    const q = query(
      collection(db, 'notificacoes'),
      where('uid_destinatario', '==', userId),
      orderBy('createdAt', 'desc')
    );

    // Listener em tempo real
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs: Notificacao[] = [];
      snapshot.forEach((doc) => {
        notifs.push({
          id: doc.id,
          ...doc.data(),
        } as Notificacao);
      });
      setNotifications(notifs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  const unreadCount = notifications.filter((n) => !n.lido).length;

  const markAsRead = async (notificationId: string) => {
    try {
      await updateDoc(doc(db, 'notificacoes', notificationId), {
        lido: true,
        lido_em: Timestamp.now(),
      });
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.lido);
      await Promise.all(
        unreadNotifications.map((n) =>
          n.id ? updateDoc(doc(db, 'notificacoes', n.id), {
            lido: true,
            lido_em: Timestamp.now(),
          }) : Promise.resolve()
        )
      );
    } catch (error) {
      console.error('Erro ao marcar todas como lidas:', error);
    }
  };

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    loading,
  };
}

// Função helper para criar notificações
export async function createNotification(data: {
  uid_destinatario: string;
  tipo: 'info' | 'sucesso' | 'alerta' | 'erro';
  titulo: string;
  mensagem: string;
  link?: string;
  uid_remetente?: string;
}) {
  try {
    await addDoc(collection(db, 'notificacoes'), {
      ...data,
      lido: false,
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
  }
}
