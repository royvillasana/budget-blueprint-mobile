import { Link, useLocation } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Button } from './ui/button';
import { Globe, DollarSign, Euro } from 'lucide-react';

export const Header = () => {
  const { config, updateConfig } = useApp();
  const location = useLocation();
  const t = translations[config.language];

  const toggleLanguage = () => {
    updateConfig({ language: config.language === 'es' ? 'en' : 'es' });
  };

  const toggleCurrency = () => {
    updateConfig({ currency: config.currency === 'EUR' ? 'USD' : 'EUR' });
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <nav className="flex gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t.dashboard}
            </Link>
            <Link
              to="/budget"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/budget') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t.budget}
            </Link>
            <Link
              to="/catalog"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/catalog') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Catalog
            </Link>
            <Link
              to="/settings"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/settings') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {t.settings}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title={config.language === 'es' ? 'Switch to English' : 'Cambiar a Español'}
            >
              <Globe className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleCurrency}
              title={config.currency === 'EUR' ? 'Switch to USD' : 'Cambiar a EUR'}
            >
              {config.currency === 'EUR' ? (
                <Euro className="h-4 w-4" />
              ) : (
                <DollarSign className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
