import { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, User } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import type { ComentarioSolicitacao } from '../../types';
import { formatDate } from '../../lib/utils';
import { Button } from '../ui/Button';

interface CommentsSectionProps {
  solicitacaoId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'admin' | 'client';
  currentUserAvatar?: string;
}

export function CommentsSection({
  solicitacaoId,
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
}: CommentsSectionProps) {
  const [comments, setComments] = useState<ComentarioSolicitacao[]>([]);
  const [newComment, setNewComment] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Listener em tempo real para comentários
  useEffect(() => {
    const q = query(
      collection(db, 'comentarios_solicitacoes'),
      where('solicitacao_id', '==', solicitacaoId),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const comentarios: ComentarioSolicitacao[] = [];
      snapshot.forEach((doc) => {
        comentarios.push({
          id: doc.id,
          ...doc.data(),
        } as ComentarioSolicitacao);
      });
      setComments(comentarios);

      // Scroll para o final quando novos comentários chegarem
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [solicitacaoId]);

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'comentarios_solicitacoes'), {
        solicitacao_id: solicitacaoId,
        uid_autor: currentUserId,
        nome_autor: currentUserName,
        role_autor: currentUserRole,
        avatar_autor: currentUserAvatar || '',
        mensagem: newComment.trim(),
        createdAt: Timestamp.now(),
      });
      setNewComment('');
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      alert('Erro ao enviar comentário');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-neutral-800 bg-neutral-950">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          <h3 className="font-semibold">Comentários</h3>
          <span className="text-xs text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
            {comments.length}
          </span>
        </div>
      </div>

      {/* Comments List */}
      <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-neutral-700 mx-auto mb-3" />
            <p className="text-neutral-500 text-sm">Nenhum comentário ainda</p>
            <p className="text-neutral-600 text-xs mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <>
            {comments.map((comment) => {
              const isCurrentUser = comment.uid_autor === currentUserId;
              const isAdmin = comment.role_autor === 'admin';

              return (
                <div
                  key={comment.id}
                  className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {comment.avatar_autor ? (
                      <img
                        src={comment.avatar_autor}
                        alt={comment.nome_autor}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-neutral-800"
                      />
                    ) : (
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ring-2 ring-neutral-800 ${
                        isAdmin ? 'bg-purple-500/20' : 'bg-blue-500/20'
                      }`}>
                        <User className={`w-4 h-4 ${
                          isAdmin ? 'text-purple-500' : 'text-blue-500'
                        }`} />
                      </div>
                    )}
                  </div>

                  {/* Message */}
                  <div className={`flex-1 max-w-[75%] ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-medium ${
                        isAdmin ? 'text-purple-400' : 'text-blue-400'
                      }`}>
                        {comment.nome_autor}
                        {isAdmin && (
                          <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-purple-500/20 rounded">
                            Admin
                          </span>
                        )}
                      </span>
                      <span className="text-xs text-neutral-600">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>
                    <div className={`px-4 py-2.5 rounded-lg ${
                      isCurrentUser
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-800 text-neutral-100'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {comment.mensagem}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendComment} className="p-4 border-t border-neutral-800 bg-neutral-950">
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Digite seu comentário..."
            className="flex-1 px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-primary-500 transition-colors"
            disabled={sending}
          />
          <Button
            type="submit"
            size="md"
            disabled={!newComment.trim() || sending}
            className="px-4"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
