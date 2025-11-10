import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Calendar, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getMonthName, MONTH_INFO } from '@/utils/monthUtils';

interface MonthlySummary {
  month_name: string | null;
  month_id: number | null;
  total_income: number | null;
  total_expenses: number | null;
  net_cash_flow: number | null;
  needs_actual: number | null;
  wants_actual: number | null;
  future_actual: number | null;
  debt_payments: number | null;
}

interface AnnualSummary {
  annual_income: number | null;
  annual_expenses: number | null;
  annual_net_cash_flow: number | null;
  annual_needs_actual: number | null;
  annual_wants_actual: number | null;
  annual_future_actual: number | null;
  annual_debt_payments: number | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { config } = useApp();
  const t = translations[config.language];
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Load monthly summary view
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('view_monthly_summary')
        .select('*')
        .order('month_num', { ascending: true });

      if (monthlyError) throw monthlyError;
      setMonthlySummaries(monthlyData || []);

      // Load annual summary view
      const { data: annualData, error: annualError } = await supabase
        .from('view_annual_summary')
        .select('*')
        .single();

      if (annualError) throw annualError;
      setAnnualSummary(annualData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number | null) => {
    const value = amount || 0;
    const symbol = config.currency === 'EUR' ? '€' : '$';
    return `${symbol}${Math.abs(value).toFixed(2)}`;
  };

  const getLocalizedMonthName = (monthName: string) => {
    const monthMap: Record<string, string> = {
      'January': config.language === 'es' ? 'Enero' : 'January',
      'February': config.language === 'es' ? 'Febrero' : 'February',
      'March': config.language === 'es' ? 'Marzo' : 'March',
      'April': config.language === 'es' ? 'Abril' : 'April',
      'May': config.language === 'es' ? 'Mayo' : 'May',
      'June': config.language === 'es' ? 'Junio' : 'June',
      'July': config.language === 'es' ? 'Julio' : 'July',
      'August': config.language === 'es' ? 'Agosto' : 'August',
      'September': config.language === 'es' ? 'Septiembre' : 'September',
      'October': config.language === 'es' ? 'Octubre' : 'October',
      'November': config.language === 'es' ? 'Noviembre' : 'November',
      'December': config.language === 'es' ? 'Diciembre' : 'December',
    };
    return monthMap[monthName] || monthName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.dashboard}</h1>
          <p className="text-muted-foreground">{t.annualSummary} - 2025</p>
        </div>

        {/* Quick Month Navigation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Navegación Rápida de Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {Object.entries(MONTH_INFO).map(([num, info]) => (
                <Button
                  key={num}
                  variant="outline"
                  className="flex items-center justify-between"
                  onClick={() => navigate(`/budget/2025/${num}`)}
                >
                  <span>{getMonthName(parseInt(num), config.language)}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Annual KPIs */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.income}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_income)}</div>
              <p className="text-xs text-muted-foreground">Anual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.expenses}</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_expenses)}</div>
              <p className="text-xs text-muted-foreground">Anual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.future}</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_future_actual)}</div>
              <p className="text-xs text-muted-foreground">Ahorros + Inversiones</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.debts}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_debt_payments)}</div>
              <p className="text-xs text-muted-foreground">Pagos de deudas</p>
            </CardContent>
          </Card>
        </div>

        {/* 50/30/20 Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Distribución Anual 50/30/20</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-needs" />
                  <p className="font-medium">{t.needs} (50%)</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(annualSummary?.annual_needs_actual)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-desires" />
                  <p className="font-medium">{t.desires} (30%)</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(annualSummary?.annual_wants_actual)}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-future" />
                  <p className="font-medium">{t.future} (20%)</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(annualSummary?.annual_future_actual)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Breakdown Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{t.monthlyBreakdown}</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-right">Ingresos</TableHead>
                  <TableHead className="text-right">Gastos</TableHead>
                  <TableHead className="text-right">Flujo Neto</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlySummaries.map((month) => (
                  <TableRow key={month.month_id}>
                    <TableCell className="font-medium">{getLocalizedMonthName(month.month_name || '')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.total_income)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.total_expenses)}</TableCell>
                    <TableCell className={`text-right ${(month.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {formatCurrency(month.net_cash_flow)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/budget/2025/${month.month_id}`)}
                      >
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
