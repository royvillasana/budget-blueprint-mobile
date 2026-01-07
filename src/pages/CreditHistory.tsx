/**
 * CreditHistory Page
 * Full page view of credit transaction history
 *
 * Features:
 * - List of all credit transactions (earned and spent)
 * - Filters by transaction type
 * - Icons and colors per source type
 * - Relative timestamps
 * - Transaction metadata display
 * - Infinite scroll support (future enhancement)
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageCreditsService, CreditTransaction } from '@/services/MessageCreditsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Gift, Sparkles, Trophy, Users, Zap, MessageCircle, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Get display info for transaction source
 */
function getSourceDisplay(transaction: CreditTransaction) {
  const displays = {
    xp_conversion: {
      icon: Zap,
      label: 'XP Convertido',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    daily_checkin: {
      icon: Gift,
      label: 'Check-in Diario',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    challenge_completion: {
      icon: Trophy,
      label: 'Desafío Completado',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    referral_reward: {
      icon: Users,
      label: 'Referido',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    chat_message: {
      icon: MessageCircle,
      label: 'Mensaje IA',
      color: 'text-gray-600',
      bgColor: 'bg-gray-500/10',
    },
  };

  return displays[transaction.source] || displays.xp_conversion;
}

/**
 * Get description from metadata
 */
function getDescription(transaction: CreditTransaction): string {
  const { source, metadata } = transaction;

  if (source === 'xp_conversion' && metadata?.xp_converted) {
    return `${metadata.xp_converted} XP convertido`;
  }

  if (source === 'daily_checkin' && metadata?.consecutive_days) {
    return `Racha de ${metadata.consecutive_days} días`;
  }

  if (source === 'challenge_completion' && metadata?.challenge_type) {
    const type = metadata.challenge_type;
    return `Desafío ${type.charAt(0) + type.slice(1).toLowerCase()}`;
  }

  if (source === 'referral_reward' && metadata?.type) {
    return metadata.type === 'referrer' ? 'Referido exitoso' : 'Bono de bienvenida';
  }

  return '';
}

export default function CreditHistory() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'earned' | 'spent'>('all');

  /**
   * Fetch transaction history
   */
  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await MessageCreditsService.getCreditHistory(100);
      setTransactions(data);
    } catch (error) {
      console.error('[CreditHistory] Error fetching history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // Filter transactions
  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    return t.transaction_type === filter;
  });

  // Group by date
  const groupedTransactions = filteredTransactions.reduce((acc, transaction) => {
    const date = new Date(transaction.created_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!acc[date]) {
      acc[date] = [];
    }

    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, CreditTransaction[]>);

  return (
    <div className="min-h-screen bg-background p-4 pb-20">
      {/* Header */}
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Historial de Créditos</h1>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('all')}
          >
            <Filter className="h-4 w-4 mr-2" />
            Todos
          </Button>
          <Button
            variant={filter === 'earned' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('earned')}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ganados
          </Button>
          <Button
            variant={filter === 'spent' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter('spent')}
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            Gastados
          </Button>
        </div>

        {/* Loading state */}
        {loading && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Sparkles className="h-8 w-8 mx-auto mb-2 animate-pulse" />
              <p>Cargando historial...</p>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {!loading && filteredTransactions.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No hay transacciones</p>
              <p className="text-sm mt-1">
                {filter === 'all'
                  ? 'Aún no tienes transacciones de créditos'
                  : `No tienes créditos ${filter === 'earned' ? 'ganados' : 'gastados'}`}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Transaction list */}
        {!loading && Object.keys(groupedTransactions).length > 0 && (
          <div className="space-y-6">
            {Object.entries(groupedTransactions).map(([date, dateTransactions]) => (
              <div key={date} className="space-y-2">
                {/* Date header */}
                <h2 className="text-sm font-semibold text-muted-foreground px-2">
                  {date}
                </h2>

                {/* Transactions for this date */}
                <Card>
                  <CardContent className="p-0 divide-y">
                    {dateTransactions.map((transaction) => {
                      const display = getSourceDisplay(transaction);
                      const Icon = display.icon;
                      const description = getDescription(transaction);
                      const isEarned = transaction.transaction_type === 'earned';

                      return (
                        <div
                          key={transaction.id}
                          className="p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors"
                        >
                          {/* Icon */}
                          <div className={`${display.bgColor} p-2 rounded-full shrink-0`}>
                            <Icon className={`h-4 w-4 ${display.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">{display.label}</p>
                                {description && (
                                  <p className="text-xs text-muted-foreground mt-0.5">
                                    {description}
                                  </p>
                                )}
                              </div>

                              {/* Amount */}
                              <Badge
                                variant={isEarned ? 'default' : 'secondary'}
                                className={
                                  isEarned
                                    ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20'
                                    : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                                }
                              >
                                {isEarned ? '+' : ''}
                                {transaction.amount}
                              </Badge>
                            </div>

                            {/* Timestamp and balance */}
                            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                              <span>
                                {formatDistanceToNow(new Date(transaction.created_at), {
                                  addSuffix: true,
                                  locale: es,
                                })}
                              </span>
                              <span>•</span>
                              <span>Balance: {transaction.balance_after}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
