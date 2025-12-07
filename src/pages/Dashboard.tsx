import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Calendar, ArrowRight, DollarSign, Receipt, Landmark } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getMonthName, getTableName, MONTH_INFO } from '@/utils/monthUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  date: string;
}

interface TransactionItem {
  id: string;
  description: string;
  amount: number;
  date: string;
  categories?: { name: string; emoji: string } | null;
}

interface DebtItem {
  id: string;
  starting_balance: number;
  payment_made: number;
  ending_balance: number;
  accounts?: { name: string } | null;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { config } = useApp();
  const t = translations[config.language];
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Current month data
  const currentMonth = new Date().getMonth() + 1;
  const [recentIncome, setRecentIncome] = useState<IncomeItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [currentDebts, setCurrentDebts] = useState<DebtItem[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load monthly summary view
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('view_monthly_summary')
        .select('*')
        .order('month_id', { ascending: true });

      if (monthlyError) throw monthlyError;
      setMonthlySummaries(monthlyData || []);

      // Load annual summary view - filter by user_id
      const { data: annualData, error: annualError } = await supabase
        .from('view_annual_summary')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (annualError) throw annualError;
      setAnnualSummary(annualData);

      // Load current month data
      await loadCurrentMonthData(user.id);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentMonthData = async (userId: string) => {
    const incomeTable = getTableName('monthly_income', currentMonth) as any;
    const transactionsTable = getTableName('monthly_transactions', currentMonth) as any;
    const debtsTable = getTableName('monthly_debts', currentMonth) as any;

    // Load recent income
    const { data: incomeData } = await (supabase as any)
      .from(incomeTable)
      .select('id, source, amount, date')
      .eq('user_id', userId)
      .eq('month_id', currentMonth)
      .order('date', { ascending: false })
      .limit(5);
    setRecentIncome((incomeData as IncomeItem[]) || []);

    // Load recent transactions
    const { data: transactionsData } = await (supabase as any)
      .from(transactionsTable)
      .select('id, description, amount, date, categories(name, emoji)')
      .eq('user_id', userId)
      .eq('month_id', currentMonth)
      .order('date', { ascending: false })
      .limit(5);
    setRecentTransactions((transactionsData as TransactionItem[]) || []);

    // Load current debts
    const { data: debtsData } = await (supabase as any)
      .from(debtsTable)
      .select('id, starting_balance, payment_made, ending_balance, accounts(name)')
      .eq('user_id', userId)
      .eq('month_id', currentMonth);
    setCurrentDebts((debtsData as DebtItem[]) || []);
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

        {/* Current Month Dynamic Tables */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {config.language === 'es' ? 'Datos del Mes Actual' : 'Current Month Data'} - {getMonthName(currentMonth, config.language)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="income" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="income" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  {config.language === 'es' ? 'Ingresos' : 'Income'}
                </TabsTrigger>
                <TabsTrigger value="expenses" className="flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  {config.language === 'es' ? 'Gastos' : 'Expenses'}
                </TabsTrigger>
                <TabsTrigger value="debts" className="flex items-center gap-2">
                  <Landmark className="h-4 w-4" />
                  {config.language === 'es' ? 'Deudas' : 'Debts'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="income" className="mt-4">
                {recentIncome.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{config.language === 'es' ? 'Fuente' : 'Source'}</TableHead>
                        <TableHead>{config.language === 'es' ? 'Fecha' : 'Date'}</TableHead>
                        <TableHead className="text-right">{config.language === 'es' ? 'Monto' : 'Amount'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentIncome.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.source}</TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(item.amount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {config.language === 'es' ? 'No hay ingresos registrados este mes' : 'No income recorded this month'}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="expenses" className="mt-4">
                {recentTransactions.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{config.language === 'es' ? 'Descripción' : 'Description'}</TableHead>
                        <TableHead>{config.language === 'es' ? 'Categoría' : 'Category'}</TableHead>
                        <TableHead>{config.language === 'es' ? 'Fecha' : 'Date'}</TableHead>
                        <TableHead className="text-right">{config.language === 'es' ? 'Monto' : 'Amount'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.description}</TableCell>
                          <TableCell>
                            {item.categories?.emoji} {item.categories?.name || '-'}
                          </TableCell>
                          <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right text-destructive">{formatCurrency(Math.abs(item.amount))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {config.language === 'es' ? 'No hay gastos registrados este mes' : 'No expenses recorded this month'}
                  </p>
                )}
              </TabsContent>

              <TabsContent value="debts" className="mt-4">
                {currentDebts.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{config.language === 'es' ? 'Cuenta' : 'Account'}</TableHead>
                        <TableHead className="text-right">{config.language === 'es' ? 'Saldo Inicial' : 'Starting Balance'}</TableHead>
                        <TableHead className="text-right">{config.language === 'es' ? 'Pago Realizado' : 'Payment Made'}</TableHead>
                        <TableHead className="text-right">{config.language === 'es' ? 'Saldo Final' : 'Ending Balance'}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentDebts.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.accounts?.name || '-'}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.starting_balance)}</TableCell>
                          <TableCell className="text-right text-green-600">{formatCurrency(item.payment_made || 0)}</TableCell>
                          <TableCell className="text-right text-destructive">{formatCurrency(item.ending_balance || item.starting_balance)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {config.language === 'es' ? 'No hay deudas registradas este mes' : 'No debts recorded this month'}
                  </p>
                )}
              </TabsContent>
            </Tabs>
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
