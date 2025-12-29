import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Wallet, Shield, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';

declare global {
  interface Window {
    UnicornStudio?: {
      init: () => void;
    };
  }
}

const Index = () => {
  const navigate = useNavigate();
  const { config } = useApp();
  const t = translations[config.language];

  useEffect(() => {
    // Redirect to dashboard if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/dashboard');
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Force Unicorn Studio to re-scan for data-us-project elements after React mounts
    const timer = setTimeout(() => {
      if (window.UnicornStudio && typeof window.UnicornStudio.init === 'function') {
        window.UnicornStudio.init();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, []);


  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 px-4 md:py-32 overflow-hidden" style={{ minHeight: '700px' }}>
        <div
          data-us-project="De8YNf7Nr44PNL3ZLFTf"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100%',
            minHeight: '700px',
            zIndex: 0
          }}
        />
        <div className="container mx-auto max-w-5xl text-center relative" style={{ zIndex: 10 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            {t.landing.heroBadge}
          </div>

          {/* Hero Title Container with Gradient Border */}
          <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-white/20 backdrop-blur-md p-8 md:p-12 mb-8 mx-auto max-w-4xl">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />

            <div className="flex justify-center mb-8">
              <img src="/assets/logo.png" alt="RialNexus Logo" className="h-24 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-background">
              {t.landing.heroTitle} <span className="text-background">{t.landing.heroTitleSpan}</span>.
            </h1>
            <p className="text-xl text-background font-semibold leading-relaxed">
              {t.landing.heroDescription}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="w-full sm:w-auto text-lg h-12 px-8"
              onClick={() => navigate('/auth')}
            >
              {t.landing.getStarted} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto text-lg h-12 px-8"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.landing.learnMore}
            </Button>
          </div>
        </div>
      </section>

      {/* Main Features Grid */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/30 transition-colors">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader>
                <Shield className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl">{t.landing.features.flexibleStorage}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.landing.features.flexibleStorageDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-accent/30 transition-colors">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
              <CardHeader>
                <LayoutDashboard className="h-10 w-10 text-accent mb-4" />
                <CardTitle className="text-xl">{t.landing.features.visualAnalytics}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.landing.features.visualAnalyticsDesc}
                </p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80 hover:border-primary/30 transition-colors">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
              <CardHeader>
                <Wallet className="h-10 w-10 text-primary mb-4" />
                <CardTitle className="text-xl">{t.landing.features.smartBudgeting}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {t.landing.features.smartBudgetingDesc}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Detailed Benefits */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">{t.landing.whyChoose}</h2>
              <ul className="space-y-4">
                {t.landing.benefits.map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative p-8 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 border border-border/50">
              <div className="absolute -top-4 -right-4 bg-background p-4 rounded-xl shadow-lg border border-border">
                <Globe className="h-8 w-8 text-primary animate-pulse" />
              </div>
              <div className="space-y-4">
                <h3 className="text-xl font-semibold">{t.landing.privacyTitle}</h3>
                <p className="text-muted-foreground">
                  {t.landing.privacyDesc}
                </p>
                <Button variant="link" className="p-0 h-auto font-semibold text-primary" onClick={() => navigate('/auth')}>
                  {t.landing.startJourney}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-border/50">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>&copy; {new Date().getFullYear()} RialNexus. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
