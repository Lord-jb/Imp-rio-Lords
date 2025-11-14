import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

interface CreateClientData {
  nome: string;
  email: string;
  senha: string;
  role: string;
  active:boolean;
  planoNome: string;
  saldo: number;
  artesTotal: number;
  statusSite: string;
  permissoes: {
    podeSolicitarDesign: boolean;
    recebeLeads: boolean;
  };
}

export function useCreateClient() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createClient(data: CreateClientData) {
    setLoading(true);
    setError(null);

    try {
      // Validações
      if (!data.email || !data.senha || !data.nome) {
        throw new Error('Email, senha e nome são obrigatórios.');
      }
      if (data.senha.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      // Criar usuário no Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.senha
      );

      const newUser = userCredential.user;

      // Atualizar displayName
      await updateProfile(newUser, {
        displayName: data.nome,
      });

      // Criar documento do cliente no Firestore
      await setDoc(doc(db, 'clientes', newUser.uid), {
        uid: newUser.uid,
        nome: data.nome,
        email_login: data.email,
        saldo_carteira: data.saldo,
        plano_artes_total: data.artesTotal,
        artes_usadas: 0,
        plano_nome: data.planoNome,
        status_site: data.statusSite,
        permissoes: data.permissoes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { success: true, uid: newUser.uid };
    } catch (err: any) {
      const errorMessage = err.code === 'auth/email-already-in-use'
        ? 'Este e-mail já está em uso.'
        : err.message || 'Erro ao criar cliente.';
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return { createClient, loading, error };
}