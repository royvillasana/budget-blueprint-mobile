import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Button } from './ui/button';
import { Globe, DollarSign, Euro, Calendar } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getMonthName, MONTH_INFO } from '@/utils/monthUtils';

export const Header = () => {
  const { config, updateConfig } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const t = translations[config.language];

  const currentMonth = params.month ? parseInt(params.month) : null;

  const toggleLanguage = () => {
    updateConfig({ language: config.language === 'es' ? 'en' : 'es' });
  };

  const toggleCurrency = () => {
    updateConfig({ currency: config.currency === 'EUR' ? 'USD' : 'EUR' });
  };

  const isActive = (path: string) => location.pathname === path;
  const isBudgetRoute = location.pathname.startsWith('/budget');

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            {/* Logo/Brand */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-foreground hidden sm:block">Budget Pro</span>
            </Link>

            <nav className="flex gap-4 items-center">
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors hover:text-primary px-3 py-1.5 rounded-md ${
                  isActive('/dashboard') || isActive('/') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {t.dashboard}
              </Link>
              
              {/* Month Selector Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 ${
                      isBudgetRoute 
                        ? 'text-primary bg-primary/10' 
                        : 'text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>
                      {currentMonth ? getMonthName(currentMonth, config.language) : t.budget}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48 bg-card border-border/50">
                  {Object.entries(MONTH_INFO).map(([num, info]) => (
                    <DropdownMenuItem
                      key={num}
                      onClick={() => navigate(`/budget/2025/${num}`)}
                      className={currentMonth === parseInt(num) ? 'bg-primary/10 text-primary' : ''}
                    >
                      {getMonthName(parseInt(num), config.language)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link
                to="/catalog"
                className={`text-sm font-medium transition-colors hover:text-primary px-3 py-1.5 rounded-md ${
                  isActive('/catalog') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {config.language === 'es' ? 'Catálogo' : 'Catalog'}
              </Link>
              <Link
                to="/settings"
                className={`text-sm font-medium transition-colors hover:text-primary px-3 py-1.5 rounded-md ${
                  isActive('/settings') 
                    ? 'text-primary bg-primary/10' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
              >
                {t.settings}
              </Link>
            </nav>
          </div>

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
