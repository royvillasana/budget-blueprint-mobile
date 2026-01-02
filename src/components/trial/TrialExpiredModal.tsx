import { useEffect, useState } from 'react';
import { useTrial } from '@/hooks/useTrial';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PLAN_FEATURES } from '@/services/SubscriptionService';

export const TrialExpiredModal = () => {
  const { trialStatus, trialExpired } = useTrial();
  const { config } = useApp();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const t = config.language === 'es' ? {
    title: '¡Tu período de prueba ha finalizado!',
    description: '¿Disfrutaste las funcionalidades premium? Elige un plan para continuar disfrutando de todas las ventajas.',
    free: {
      title: 'Continuar Gratis',
      description: 'Funcionalidades básicas',
      features: PLAN_FEATURES.free.features,
      cta: 'Continuar con plan gratuito',
    },
    essential: {
      title: 'Essential',
      price: '$4.99/mes',
      description: 'Ideal para usuarios activos',
      features: PLAN_FEATURES.essential.features,
      cta: 'Elegir Essential',
    },
    pro: {
      title: 'Pro',
      price: '$8.99/mes',
      description: 'Para los que quieren más',
      badge: 'Más popular',
      features: PLAN_FEATURES.pro.features,
      cta: 'Elegir Pro',
    },
    later: 'Lo decidiré después',
  } : {
    title: 'Your trial period has ended!',
    description: 'Did you enjoy the premium features? Choose a plan to continue enjoying all the benefits.',
    free: {
      title: 'Continue Free',
      description: 'Basic features',
      features: PLAN_FEATURES.free.features,
      cta: 'Continue with free plan',
    },
    essential: {
      title: 'Essential',
      price: '$4.99/month',
      description: 'Perfect for active users',
      features: PLAN_FEATURES.essential.features,
      cta: 'Choose Essential',
    },
    pro: {
      title: 'Pro',
      price: '$8.99/month',
      description: 'For those who want more',
      badge: 'Most popular',
      features: PLAN_FEATURES.pro.features,
      cta: 'Choose Pro',
    },
    later: "I'll decide later",
  };

  useEffect(() => {
    // Show modal when trial expires
    if (trialExpired && trialStatus?.current_status === 'trialing') {
      setIsOpen(true);
    }
  }, [trialExpired, trialStatus]);

  const handleSelectPlan = (plan: 'free' | 'essential' | 'pro') => {
    if (plan === 'free') {
      // User chose free plan, just close modal
      setIsOpen(false);
    } else {
      // Navigate to pricing page to complete checkout
      navigate(`/pricing?plan=${plan}`);
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-purple-600" />
            <DialogTitle className="text-2xl">{t.title}</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {/* Free Plan */}
          <div className="border rounded-lg p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{t.free.title}</h3>
              <p className="text-2xl font-bold text-muted-foreground">$0</p>
              <p className="text-sm text-muted-foreground mt-1">{t.free.description}</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {t.free.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => handleSelectPlan('free')}
            >
              {t.free.cta}
            </Button>
          </div>

          {/* Essential Plan */}
          <div className="border rounded-lg p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{t.essential.title}</h3>
              <p className="text-2xl font-bold text-primary">{t.essential.price}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.essential.description}</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {t.essential.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full"
              onClick={() => handleSelectPlan('essential')}
            >
              {t.essential.cta}
            </Button>
          </div>

          {/* Pro Plan */}
          <div className="border-2 border-purple-600 rounded-lg p-6 flex flex-col relative bg-purple-50/50 dark:bg-purple-950/20">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              {t.pro.badge}
            </div>

            <div className="mb-4 mt-4">
              <h3 className="text-xl font-bold mb-1">{t.pro.title}</h3>
              <p className="text-2xl font-bold text-purple-600">{t.pro.price}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.pro.description}</p>
            </div>

            <ul className="space-y-2 mb-6 flex-1">
              {t.pro.features.map((feature, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => handleSelectPlan('pro')}
            >
              {t.pro.cta}
            </Button>
          </div>
        </div>

        <div className="mt-4 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            {t.later}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
