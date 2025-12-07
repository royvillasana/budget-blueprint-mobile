import { useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { useStorage } from '@/contexts/StorageContext';
import { translations } from '@/i18n/translations';
import { Button } from './ui/button';
import { Calendar, Menu, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getMonthName, MONTH_INFO } from '@/utils/monthUtils';

export const Header = () => {
  const { config } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const params = useParams();
  const t = translations[config.language];
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useState(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email || null);
    });
  });

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const currentMonth = params.month ? parseInt(params.month) : null;



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

            {/* Desktop Navigation - Only show if logged in */}
            {userEmail && (
              <nav className="hidden md:flex gap-2 items-center">
                <NavLinks />
              </nav>
            )}
          </div>

          <div className="flex items-center gap-2">
            {userEmail ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt={userEmail || ''} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {userEmail ? userEmail.charAt(0).toUpperCase() : <User className="h-4 w-4" />}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    {userEmail && (
                      <>
                        <div className="flex items-center justify-start gap-2 p-2">
                          <div className="flex flex-col space-y-1 leading-none">
                            <p className="font-medium text-sm leading-none">{userEmail}</p>
                          </div>
                        </div>
                        <div className="h-px bg-muted my-1" />
                      </>
                    )}
                    <DropdownMenuItem onClick={() => navigate('/settings')}>
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>{t.settings}</span>
                    </DropdownMenuItem>
                    <div className="h-px bg-muted my-1" />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{config.language === 'es' ? 'Cerrar Sesión' : 'Log Out'}</span>
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
                      <Button
                        variant="ghost"
                        className="justify-start px-3"
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        {config.language === 'es' ? 'Cerrar Sesión' : 'Log Out'}
                      </Button>
                    </nav>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')} variant="default" size="sm">
                {config.language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};