/**
 * DailyCheckinWidget Component
 * UI widget for daily check-in rewards
 *
 * Features:
 * - Shows check-in status for today
 * - Displays consecutive days streak
 * - Button to claim daily check-in
 * - Visual feedback for successful check-in
 * - Streak milestone indicators
 */

import { useState, useEffect } from 'react';
import { MessageCreditsService } from '@/services/MessageCreditsService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Calendar, Flame, Gift, Sparkles } from 'lucide-react';

export function DailyCheckinWidget() {
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [consecutiveDays, setConsecutiveDays] = useState(0);
  const [nextCheckin, setNextCheckin] = useState('');

  /**
   * Fetch check-in status
   */
  const fetchStatus = async () => {
    try {
      setLoading(true);
      const status = await MessageCreditsService.getDailyCheckinStatus();
      setCheckedInToday(status.checked_in_today);
      setConsecutiveDays(status.consecutive_days);
      setNextCheckin(status.next_checkin);
    } catch (error) {
      console.error('[DailyCheckin] Error fetching status:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Claim daily check-in
   */
  const handleCheckin = async () => {
    if (checkedInToday || claiming) return;

    try {
      setClaiming(true);
      const result = await MessageCreditsService.processDailyCheckin();

      if (result.success) {
        setCheckedInToday(true);
        setConsecutiveDays(result.consecutive_days || 0);

        // Show success toast
        const isMilestone = result.consecutive_days && result.consecutive_days % 7 === 0;

        toast.success(
          <div className="flex items-start gap-3">
            <div className="bg-blue-500/10 p-2 rounded-full">
              <Gift className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">¡Check-in Completado!</p>
              <p className="text-sm text-muted-foreground">
                +{result.credits_awarded} {result.credits_awarded === 1 ? 'crédito' : 'créditos'}
                {result.xp_awarded && ` • +${result.xp_awarded} XP`}
              </p>
              {isMilestone && (
                <p className="text-sm font-semibold text-blue-600 mt-1">
                  ¡Bonus de racha de {result.consecutive_days} días!
                </p>
              )}
            </div>
          </div>,
          {
            duration: 5000,
          }
        );

        // Refresh status
        await fetchStatus();
      } else {
        toast.error(result.message || 'No se pudo completar el check-in');
      }
    } catch (error: any) {
      console.error('[DailyCheckin] Error claiming:', error);
      toast.error(error.message || 'Error al procesar check-in');
    } finally {
      setClaiming(false);
    }
  };

  // Load status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 animate-pulse" />
            <span>Cargando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate streak milestone progress (next milestone at multiples of 7)
  const nextMilestone = Math.ceil(consecutiveDays / 7) * 7;
  const daysUntilBonus = nextMilestone - consecutiveDays;

  return (
    <Card className={checkedInToday ? 'border-blue-500/50 bg-blue-500/5' : ''}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold">Check-in Diario</h3>
            </div>
            {consecutiveDays > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 text-orange-600 px-2 py-1 rounded-full">
                <Flame className="h-3 w-3" />
                <span className="text-sm font-semibold">{consecutiveDays} días</span>
              </div>
            )}
          </div>

          {/* Status */}
          {checkedInToday ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span>Ya completaste tu check-in de hoy</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Regresa mañana para continuar tu racha
              </p>
              {daysUntilBonus > 0 && (
                <div className="mt-2 p-2 bg-orange-500/10 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">
                    ¡Bonus de racha en {daysUntilBonus} {daysUntilBonus === 1 ? 'día' : 'días'}!
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cada 7 días recibes +1 crédito extra
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Gana créditos y XP con tu check-in diario
              </p>

              {/* Rewards preview */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Gift className="h-4 w-4 text-blue-600" />
                  <span>1+ crédito</span>
                </div>
                <div className="flex items-center gap-1">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span>10+ XP</span>
                </div>
              </div>

              {/* Streak info */}
              {consecutiveDays > 0 && daysUntilBonus > 0 && (
                <div className="p-2 bg-orange-500/10 rounded-lg">
                  <p className="text-xs text-orange-600 font-medium">
                    ¡Bonus de racha en {daysUntilBonus} {daysUntilBonus === 1 ? 'día' : 'días'}!
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Cada 7 días recibes +1 crédito extra
                  </p>
                </div>
              )}

              {/* Check-in button */}
              <Button
                onClick={handleCheckin}
                disabled={claiming}
                className="w-full"
                size="sm"
              >
                {claiming ? (
                  <>
                    <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Gift className="h-4 w-4 mr-2" />
                    Reclamar Check-in
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
