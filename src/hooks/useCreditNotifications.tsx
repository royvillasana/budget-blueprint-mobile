/**
 * useCreditNotifications Hook
 * Subscribes to realtime credit transactions and displays toast notifications
 *
 * Features:
 * - Realtime Supabase subscriptions to credit ledger
 * - Differentiated toast styles per source type
 * - Only shows notifications for earned credits (not spent)
 * - Auto-cleanup on unmount
 */

import { useEffect } from 'react';
import { toast } from 'sonner';
import { MessageCreditsService, CreditTransaction } from '@/services/MessageCreditsService';
import { Gift, Sparkles, Trophy, Users, Zap } from 'lucide-react';

/**
 * Get icon and style for different credit sources
 */
function getCreditSourceDisplay(source: CreditTransaction['source']) {
  const displays = {
    xp_conversion: {
      icon: Zap,
      title: 'XP Convertido',
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
    daily_checkin: {
      icon: Gift,
      title: 'Check-in Diario',
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    challenge_completion: {
      icon: Trophy,
      title: 'Desafío Completado',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-500/10',
    },
    referral_reward: {
      icon: Users,
      title: 'Recompensa de Referido',
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    chat_message: {
      icon: Sparkles,
      title: 'Mensaje Enviado',
      color: 'text-gray-600',
      bgColor: 'bg-gray-500/10',
    },
  };

  return displays[source] || displays.xp_conversion;
}

/**
 * Hook to enable realtime credit notifications
 *
 * Simply call this hook in your component to enable notifications.
 * No return value needed.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   useCreditNotifications(); // That's it!
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export function useCreditNotifications(): void {
  useEffect(() => {
    // Subscribe to credit transactions
    const unsubscribe = MessageCreditsService.subscribeToTransactions(
      (transaction: CreditTransaction) => {
        // Only show notifications for earned credits
        if (transaction.transaction_type !== 'earned') {
          return;
        }

        const display = getCreditSourceDisplay(transaction.source);
        const Icon = display.icon;

        // Build message based on metadata
        let message = `+${transaction.amount} ${transaction.amount === 1 ? 'crédito' : 'créditos'}`;

        // Add contextual information
        if (transaction.source === 'daily_checkin' && transaction.metadata?.consecutive_days) {
          message += ` • Racha de ${transaction.metadata.consecutive_days} días`;
        } else if (transaction.source === 'challenge_completion' && transaction.metadata?.challenge_type) {
          const type = transaction.metadata.challenge_type;
          message += ` • ${type.charAt(0) + type.slice(1).toLowerCase()}`;
        } else if (transaction.source === 'xp_conversion' && transaction.metadata?.xp_converted) {
          message += ` • ${transaction.metadata.xp_converted} XP convertido`;
        } else if (transaction.source === 'referral_reward' && transaction.metadata?.type) {
          const isReferrer = transaction.metadata.type === 'referrer';
          message += isReferrer ? ' • Referido exitoso' : ' • Bienvenida';
        }

        // Show toast notification with custom styling
        toast(
          <div className="flex items-start gap-3">
            <div className={`${display.bgColor} p-2 rounded-full`}>
              <Icon className={`h-5 w-5 ${display.color}`} />
            </div>
            <div className="flex-1">
              <p className="font-semibold">{display.title}</p>
              <p className="text-sm text-muted-foreground">{message}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Balance: {transaction.balance_after} {transaction.balance_after === 1 ? 'crédito' : 'créditos'}
              </p>
            </div>
          </div>,
          {
            duration: 4000,
            position: 'top-right',
          }
        );
      }
    );

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);
}
