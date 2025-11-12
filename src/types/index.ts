export interface User {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}

export interface Cliente {
  id?: string;
  uid: string;
  nome: string;
  email_login: string;
  saldo_carteira: number;
  plano_artes_total: number;
  artes_usadas: number;
  plano_nome: string;
  status_site: string;
  permissoes: {
    podeSolicitarDesign: boolean;
    recebeLeads: boolean;
  };
  createdAt: any;
  updatedAt: any;
}

export interface Campanha {
  id: string;
  uid_cliente: string;
  nome_campanha: string;
  status: 'Ativa' | 'Pausada' | 'Finalizada';
  investimento: number;
  resultado: string;
  metricas: {
    cliques: number;
    leads: number;
  };
  createdAt: any;
  updatedAt: any;
}

export interface SolicitacaoDesign {
  id: string;
  uid_cliente: string;
  titulo: string;
  briefing: string;
  referencia_url?: string;
  prazo?: string;
  status: 'novo' | 'em_producao' | 'revisao' | 'entregue';
  entregas: Array<{
    nome: string;
    url: string;
    storagePath: string;
    entregueEm: any;
  }>;
  createdAt: any;
  updatedAt: any;
}

export interface Lead {
  id: string;
  uid_cliente: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  status: 'novo' | 'contatado' | 'em_negociacao' | 'ganho' | 'perdido';
  createdAt: any;
  updatedAt: any;
}

export interface Notificacao {
  id: string;
  uid_cliente: string;
  mensagem: string;
  tipo: 'info' | 'campanha' | 'design' | 'agenda' | 'arquivo';
  lido: boolean;
  createdAt: any;
}

export interface Agenda {
  id: string;
  uid_cliente: string;
  data: string;
  hora: string;
  local: string;
  descricao: string;
  data_horario: any;
  createdAt: any;
  updatedAt: any;
}

export interface ArquivoCompartilhado {
  id: string;
  uid_cliente: string;
  titulo: string;
  descricao: string;
  storagePath: string;
  downloadURL: string;
  createdAt: any;
}

export interface Insight {
  id: string;
  titulo: string;
  descricao: string;
  ativo: boolean;
  createdAt: any;
}