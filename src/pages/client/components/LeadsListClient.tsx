import { useState } from 'react';
import { Users, Phone, Mail, DollarSign, CheckCircle, XCircle, Clock, AlertCircle, ChevronDown } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Select } from '../../../components/ui/Select';
import type { Lead } from '../../../types';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { db } from '../../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface LeadsListClientProps {
  leads: Lead[];
}

export function LeadsListClient({ leads }: LeadsListClientProps) {
  const [expandedLead, setExpandedLead] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    if (!leadId) return;

    setUpdatingStatus(leadId);
    try {
      await updateDoc(doc(db, 'leads', leadId), {
        status: newStatus,
        updated_at: new Date(),
      });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status do lead');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'novo':
        return {
          label: 'Novo',
          color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          icon: <Clock className="w-4 h-4" />,
        };
      case 'em_contato':
        return {
          label: 'Em Contato',
          color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
          icon: <Phone className="w-4 h-4" />,
        };
      case 'atendido':
        return {
          label: 'Atendido',
          color: 'bg-green-500/20 text-green-400 border-green-500/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'convertido':
        return {
          label: 'Convertido',
          color: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
          icon: <CheckCircle className="w-4 h-4" />,
        };
      case 'cliente_recusou':
        return {
          label: 'Cliente Recusou',
          color: 'bg-red-500/20 text-red-400 border-red-500/30',
          icon: <XCircle className="w-4 h-4" />,
        };
      case 'sem_interesse':
        return {
          label: 'Sem Interesse',
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: <XCircle className="w-4 h-4" />,
        };
      default:
        return {
          label: status,
          color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
          icon: <AlertCircle className="w-4 h-4" />,
        };
    }
  };

  if (leads.length === 0) {
    return (
      <Card className="text-center py-12">
        <Users className="mx-auto text-gray-600 mb-4" size={48} />
        <p className="text-gray-400 mb-2">Nenhum lead disponível</p>
        <p className="text-sm text-gray-500">
          Quando houver leads da sua conta, eles aparecerão aqui
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {leads.map((lead) => {
        const statusInfo = getStatusInfo(lead.status);
        const isExpanded = expandedLead === lead.id;

        return (
          <Card key={lead.id} className="hover:border-secondary/50 transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-secondary/30 to-secondary/10 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{lead.nome}</h3>
                    <p className="text-xs text-gray-500">{formatDate(lead.createdAt)}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border flex items-center gap-2 ${statusInfo.color}`}>
                    {statusInfo.icon}
                    {statusInfo.label}
                  </div>
                </div>

                {/* Informações básicas sempre visíveis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Mail className="w-4 h-4 text-secondary" />
                    {lead.email}
                  </div>
                  {lead.telefone && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Phone className="w-4 h-4 text-secondary" />
                      {lead.telefone}
                    </div>
                  )}
                  {lead.valor_potencial && (
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <DollarSign className="w-4 h-4 text-green-500" />
                      <span className="text-green-500 font-semibold">
                        {formatCurrency(lead.valor_potencial)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Detalhes expandíveis */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-border space-y-3 animate-slideDown">
                    {lead.origem && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Origem:</p>
                        <p className="text-sm text-white">{lead.origem}</p>
                      </div>
                    )}
                    {lead.mensagem && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Mensagem:</p>
                        <p className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded-lg">
                          {lead.mensagem}
                        </p>
                      </div>
                    )}
                    {lead.print_url && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Comprovante:</p>
                        <a
                          href={lead.print_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-secondary hover:underline"
                        >
                          Ver anexo →
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Alterar Status */}
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <label className="text-sm text-gray-400 font-medium">
                      Alterar status:
                    </label>
                    <div className="flex-1 sm:max-w-xs">
                      <Select
                        value={lead.status}
                        onChange={(e) => lead.id && handleStatusChange(lead.id, e.target.value)}
                        disabled={updatingStatus === lead.id}
                        className="w-full"
                      >
                        <option value="novo">🆕 Novo</option>
                        <option value="em_contato">📞 Em Contato</option>
                        <option value="atendido">✅ Atendido</option>
                        <option value="convertido">🎉 Convertido</option>
                        <option value="cliente_recusou">❌ Cliente Recusou</option>
                        <option value="sem_interesse">🚫 Sem Interesse</option>
                      </Select>
                    </div>
                    {updatingStatus === lead.id && (
                      <span className="text-xs text-gray-500">Atualizando...</span>
                    )}
                  </div>
                </div>

                {/* Botão expandir/recolher */}
                <button
                  onClick={() => setExpandedLead(isExpanded ? null : lead.id || null)}
                  className="mt-3 text-sm text-secondary hover:text-secondary/80 flex items-center gap-2 transition-colors"
                >
                  <ChevronDown
                    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                  />
                  {isExpanded ? 'Ver menos' : 'Ver mais detalhes'}
                </button>
              </div>
            </div>
          </Card>
        );
      })}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 500px;
          }
        }

        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
