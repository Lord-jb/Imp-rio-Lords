// FILE: src/types/index.ts
export interface User {
  uid: string;
  email: string;
  displayName: string;
  isAdmin: boolean;
}


export interface UserClient {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  avatar?: string;
  planoNome?: string;
  saldo?: number;
  artesTotal?: number;
  artesUsadas?: number;
  ultimoResetArtes?: any; // Timestamp do último reset mensal
  statusSite?: string;
  permissoes?: {
    podeSolicitarDesign: boolean;
    recebeLeads: boolean;
  };
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
  id?: string;
  uid_cliente: string;
  nome_campanha: string;
  status: 'Ativa' | 'Pausada' | 'Finalizada';
  investimento: number;
  resultado: string;
  metricas: {
    cliques: number;
    leads: number;
    conversoes?: number;
    cpc?: number;
    cpl?: number;
    roas?: number;
  };
  periodo: {
    inicio: any;
    fim?: any;
  };
  plataforma?: string;
  objetivo?: string;
  observacoes?: string;
  createdAt: any;
  updatedAt: any;
}

export interface SolicitacaoDesign {
  id?: string;
  uid_cliente: string;
  titulo: string;
  briefing: string;
  tipo: 'feed' | 'stories' | 'banner' | 'logo' | 'video' | 'outro';
  dimensoes?: string;
  referencia_url?: string;
  prazo?: string;
  prioridade: 'baixa' | 'media' | 'alta' | 'urgente';
  status: 'novo' | 'em_producao' | 'revisao' | 'entregue' | 'cancelado'| 'pendente';
  responsavel?: string;
  entregas: Array<{
    nome: string;
    url: string;
    storagePath: string;
    versao: number;
    entregueEm: any;
  }>;
  links_entrega?: string[]; // URLs diretas de entrega (compatibilidade)
  comentarios?: Array<{
    autor: string;
    mensagem: string;
    data: any;
  }>;
  createdAt: any;
  updatedAt: any;
}
 
export interface Lead {
  id?: string;
  uid_cliente: string;
  nome: string;
  email: string;
  telefone: string;
  cidade: string;
  origem?: string;
  status: 'novo' | 'contatado' | 'em_negociacao' | 'ganho' | 'perdido';
  valor_potencial?: number;
  observacoes?: string;
  print_url?: string; // URL do print/screenshot do lead
  motivo_desinteresse?: string; // Motivo se status for 'perdido'
  data_contato?: any;
  data_conversao?: any;
  createdAt: any;
  updatedAt: any;
}

export interface Notificacao {
  id?: string;
  uid_cliente: string;
  mensagem: string;
  tipo: 'info' | 'campanha' | 'design' | 'agenda' | 'arquivo' | 'lead' | 'financeiro';
  lido: boolean;
  link?: string;
  createdAt: any;
}

export interface Agenda {
  id?: string;
  uid_cliente: string;
  data: string;
  hora: string;
  local: string;
  descricao: string;
  tipo: 'gravacao' | 'reuniao' | 'entrega' | 'outro';
  status: 'agendado' | 'confirmado' | 'realizado' | 'cancelado';
  link_meet?: string;
  data_horario: any;
  createdAt: any;
  updatedAt: any;
}

export interface ArquivoCompartilhado {
  id?: string;
  uid_cliente: string;
  titulo: string;
  descricao: string;
  categoria: 'contrato' | 'relatorio' | 'design' | 'video' | 'outro';
  storagePath: string;
  downloadURL: string;
  tamanho?: number;
  tipo_arquivo?: string;
  createdAt: any;
}

export interface Insight {
  id?: string;
  titulo: string;
  descricao: string;
  categoria: 'dica' | 'oferta' | 'atualizacao' | 'tendencia';
  ativo: boolean;
  destaque?: boolean;
  link_externo?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Ideia {
  id?: string;
  uid_cliente: string;
  titulo: string;
  descricao: string;
  categoria?: string;
  status: 'novo' | 'em_analise' | 'aprovado' | 'implementado' | 'arquivado' | 'rejeitado';
  prioridade?: 'baixa' | 'media' | 'alta';
  resposta_admin?: string;
  createdAt: any;
  updatedAt: any;
}

export interface Financeiro {
  id?: string;
  uid_cliente: string;
  tipo: 'credito' | 'debito';
  valor: number;
  descricao: string;
  categoria: 'trafego' | 'plano' | 'extra' | 'estorno';
  referencia?: string;
  saldo_anterior: number;
  saldo_novo: number;
  createdAt: any;
}

export interface RelatorioMensal {
  id?: string;
  uid_cliente: string;
  mes: number;
  ano: number;
  investimento_total: number;
  leads_gerados: number;
  conversoes: number;
  ticket_medio: number;
  roi: number;
  observacoes?: string;
  arquivos?: Array<{
    nome: string;
    url: string;
  }>;
  createdAt: any;
}