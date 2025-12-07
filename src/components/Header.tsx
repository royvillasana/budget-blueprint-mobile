import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useStorage } from '@/contexts/StorageContext';
import { translations } from '@/i18n/translations';
import { Button } from './ui/button';
import { Globe, DollarSign, Euro, Calendar, Menu, X, Cloud, Smartphone } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { getMonthName, MONTH_INFO } from '@/utils/monthUtils';

export const Header = () => {
  const { config, updateConfig } = useApp();
  const { storageType, setStorageType } = useStorage();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const t = translations[config.language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentMonth = params.month ? parseInt(params.month) : null;

  const toggleLanguage = () => {
    updateConfig({ language: config.language === 'es' ? 'en' : 'es' });
  };

  const toggleCurrency = () => {
    updateConfig({ currency: config.currency === 'EUR' ? 'USD' : 'EUR' });
  };

  const isActive = (path: string) => location.pathname === path;
  const isBudgetRoute = location.pathname.startsWith('/budget');

  const NavLinks = ({ mobile = false, onClose = () => { } }) => (
    <>
      <Link
        to="/dashboard"
        onClick={onClose}
        className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${mobile ? 'block w-full' : ''
          } ${isActive('/dashboard') || isActive('/')
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
            className={`flex items-center gap-2 ${mobile ? 'w-full justify-start' : ''} ${isBudgetRoute
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
              onClick={() => {
                navigate(`/budget/2025/${num}`);
                onClose();
              }}
              className={currentMonth === parseInt(num) ? 'bg-primary/10 text-primary' : ''}
            >
              {getMonthName(parseInt(num), config.language)}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Link
        to="/catalog"
        onClick={onClose}
        className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${mobile ? 'block w-full' : ''
          } ${isActive('/catalog')
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:bg-muted/50'
          }`}
      >
        {config.language === 'es' ? 'Catálogo' : 'Catalog'}
      </Link>
      <Link
        to="/settings"
        onClick={onClose}
        className={`text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md ${mobile ? 'block w-full' : ''
          } ${isActive('/settings')
            ? 'text-primary bg-primary/10'
            : 'text-muted-foreground hover:bg-muted/50'
          }`}
      >
        {t.settings}
      </Link>
    </>
  );

  return (
    <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Logo/Brand */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-foreground hidden sm:block">Budget Pro</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-2 items-center">
              <NavLinks />
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

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" title={storageType === 'supabase' ? 'Cloud Storage' : 'Local Storage'}>
                  {storageType === 'supabase' ? <Cloud className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStorageType('supabase')}>
                  <Cloud className="mr-2 h-4 w-4" />
                  <span>Cloud (Supabase)</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStorageType('local')}>
                  <Smartphone className="mr-2 h-4 w-4" />
                  <span>Local (Device)</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px]">
                <nav className="flex flex-col gap-2 mt-8">
                  <NavLinks mobile onClose={() => setMobileMenuOpen(false)} />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};