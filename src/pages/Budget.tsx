import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';
import { getMonthName, MONTH_INFO } from '@/utils/monthUtils';

const Budget = () => {
  const navigate = useNavigate();
  const { config } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Budget: mounting');
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
        return;
      }
      setLoading(false);

      // Auto-redirect to current month
      const now = new Date();
      const currentMonth = now.getMonth() + 1; // 1-12
      const currentYear = now.getFullYear();

      // Only redirect if it's 2025, otherwise show month selector
      if (currentYear === 2025) {
        navigate(`/budget/2025/${currentMonth}`, { replace: true });
      }
    });
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p>Cargando...</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Selecciona un Mes</h1>
          <p className="text-muted-foreground">Elige el mes que deseas gestionar</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Presupuestos Mensuales 2025
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(MONTH_INFO).map(([num, info]) => (
                <Button
                  key={num}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary hover:text-primary-foreground transition-all"
                  onClick={() => navigate(`/budget/2025/${num}`)}
                >
                  <span className="text-lg font-semibold">
                    {getMonthName(parseInt(num), config.language)}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Budget;
