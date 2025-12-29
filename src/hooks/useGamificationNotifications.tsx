import { useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, TrendingUp, Award } from 'lucide-react';

export const useXPNotifications = () => {
    const { toast } = useToast();

    useEffect(() => {
        const channel = supabase
            .channel('xp_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'xp_ledger',
                    filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
                },
                (payload) => {
                    const xpData = payload.new;
                    const amount = xpData.amount;
                    const actionType = xpData.action_type;

                    // Map action types to friendly messages
                    const actionMessages: Record<string, string> = {
                        'transaction_created': 'Transacción registrada',
                        'bank_connected': '¡Banco conectado!',
                        'goal_created': 'Meta creada',
                        'goal_completed': '¡Meta completada!',
                        'chat_turn': 'Conversación con IA',
                        'daily_checkin': 'Check-in diario',
                        'challenge_completed': '¡Desafío completado!',
                        'badge_earned': '¡Insignia ganada!',
                    };

                    const message = actionMessages[actionType] || 'Acción completada';

                    // Show toast notification
                    toast({
                        title: (
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-yellow-500" />
                                <span>+{amount} XP</span>
                            </div>
                        ),
                        description: message,
                        duration: 3000,
                        className: 'bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20',
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [toast]);
};

// Hook for level up notifications
export const useLevelUpNotifications = () => {
    const { toast } = useToast();

    useEffect(() => {
        const channel = supabase
            .channel('level_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'user_gamification',
                    filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
                },
                (payload) => {
                    const oldData = payload.old;
                    const newData = payload.new;

                    // Check if level increased
                    if (newData.current_level > oldData.current_level) {
                        const { getLevelTitle } = require('@/utils/gamification');
                        const { title, icon, tier } = getLevelTitle(newData.current_level);

                        toast({
                            title: (
                                <div className="flex items-center gap-2">
                                    <Award className="h-5 w-5 text-yellow-500 animate-bounce" />
                                    <span className="text-lg font-bold">¡Subiste de Nivel!</span>
                                </div>
                            ),
                            description: (
                                <div className="space-y-1">
                                    <p className="text-base">
                                        Nivel {newData.current_level}: <span className="font-semibold">{title}</span>
                                    </p>
                                    <p className="text-sm text-muted-foreground">{tier}</p>
                                    <p className="text-2xl">{icon}</p>
                                </div>
                            ),
                            duration: 5000,
                            className: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30',
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [toast]);
};

// Hook for badge notifications
export const useBadgeNotifications = () => {
    const { toast } = useToast();

    useEffect(() => {
        const channel = supabase
            .channel('badge_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'user_badges',
                    filter: `user_id=eq.${supabase.auth.getUser().then(u => u.data.user?.id)}`
                },
                async (payload) => {
                    const badgeData = payload.new;
                    
                    // Fetch badge details
                    const { data: badge } = await supabase
                        .from('badges')
                        .select('*')
                        .eq('id', badgeData.badge_id)
                        .single();

                    if (badge) {
                        toast({
                            title: (
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-green-500" />
                                    <span className="text-lg font-bold">¡Insignia Desbloqueada!</span>
                                </div>
                            ),
                            description: (
                                <div className="space-y-1">
                                    <p className="text-base font-semibold">{badge.name}</p>
                                    <p className="text-sm text-muted-foreground">{badge.description}</p>
                                    <p className="text-3xl">{badge.icon_url}</p>
                                </div>
                            ),
                            duration: 5000,
                            className: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30',
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [toast]);
};

// Combined hook for all gamification notifications
export const useGamificationNotifications = () => {
    useXPNotifications();
    useLevelUpNotifications();
    useBadgeNotifications();
};
