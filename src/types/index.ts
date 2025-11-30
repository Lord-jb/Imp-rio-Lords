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

export interface ComentarioSolicitacao {
  id?: string;
  solicitacao_id: string;
  uid_autor: string;
  nome_autor: string;
  role_autor: 'admin' | 'client';
  avatar_autor?: string;
  mensagem: string;
  createdAt: any;
}
export interface Lead {
  id?: string;
  uid_cliente: string;
  nome: string;
  email: string;
  telefone: string;
  cidade?: string;
  status: 'novo' | 'contatado' | 'em_negociacao' | 'ganho' | 'perdido' | 'em_contato' | 'atendido' | 'convertido' | 'cliente_recusou' | 'sem_interesse';
  valor_potencial?: number;
  origem?: string;
  mensagem?: string;
  print_url?: string;
  motivo_desinteresse?: string;
  observacoes?: Array<{
    texto: string;
    data: any;
    autor: string;
    anexo_url?: string;
  }>;
  createdAt: any;
  updated_at?: any;
} 

export interface Notificacao {
  id?: string;
  uid_destinatario: string; // Renomeado de uid_cliente para ser mais genérico
  uid_cliente?: string; // Mantido para compatibilidade
  uid_remetente?: string; // Quem criou a notificação
  titulo: string; // Novo campo
  mensagem: string;
  tipo: 'info' | 'sucesso' | 'alerta' | 'erro' | 'campanha' | 'design' | 'agenda' | 'arquivo' | 'lead' | 'financeiro';
  lido: boolean;
  lido_em?: any; // Timestamp quando foi lida
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

export interface IntegracaoAPI {
  id?: string;
  uid_cliente: string;
  plataforma: 'meta_ads' | 'google_ads' | 'tiktok_ads';
  nome_conexao: string; // Nome dado pelo usuário
  conta_id: string; // ID da conta na plataforma
  access_token?: string; // Armazenado criptografado
  refresh_token?: string;
  token_expira_em?: any;
  status: 'ativa' | 'expirada' | 'erro';
  ultima_sincronizacao?: any;
  metricas_permissoes: string[]; // Quais métricas pode acessar
  createdAt: any;
  updatedAt: any;
}

export interface MetricasPlataforma {
  id?: string;
  integracao_id: string;
  uid_cliente: string;
  plataforma: 'meta_ads' | 'google_ads' | 'tiktok_ads';
  data_referencia: any; // Data das métricas
  impressoes: number;
  cliques: number;
  ctr: number;
  investimento: number;
  conversoes: number;
  custo_por_conversao: number;
  roas: number;
  alcance: number;
  dados_completos: any; // JSON com todos os dados da API
  sincronizado_em: any;
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