import { useTrial } from '@/hooks/useTrial';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { AlertCircle, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export const TrialBanner = () => {
  const { trialStatus, isTrialing, daysRemaining } = useTrial();
  const { config } = useApp();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  const t = config.language === 'es' ? {
    trial: {
      active: '¡Período de prueba activo!',
      daysRemaining: 'Quedan',
      days: 'días',
      day: 'día',
      enjoying: 'de tu prueba gratuita del plan Pro. ¿Disfrutando las funcionalidades premium?',
      viewPlans: 'Ver planes',
      dismiss: 'Descartar',
    }
  } : {
    trial: {
      active: 'Trial period active!',
      daysRemaining: 'You have',
      days: 'days',
      day: 'day',
      enjoying: 'left in your Pro plan trial. Enjoying premium features?',
      viewPlans: 'View plans',
      dismiss: 'Dismiss',
    }
  };

  // Don't show banner if not trialing or dismissed
  if (!isTrialing || dismissed || !trialStatus) {
    return null;
  }

  const daysText = daysRemaining === 1 ? t.trial.day : t.trial.days;

  return (
    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <Sparkles className="h-5 w-5 flex-shrink-0" />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="font-semibold">{t.trial.active}</span>
              <span className="text-sm sm:text-base">
                {t.trial.daysRemaining} <strong>{daysRemaining} {daysText}</strong> {t.trial.enjoying}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate('/pricing')}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
            >
              {t.trial.viewPlans}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setDismissed(true)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">{t.trial.dismiss}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
