import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { useStorage } from '@/contexts/StorageContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Calendar, DollarSign, Receipt, Landmark, ChevronDown, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label as FormLabel } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getMonthName, MONTH_INFO } from '@/utils/monthUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, RadialBarChart, RadialBar, PolarRadiusAxis, PolarGrid, Label } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
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
  categories?: {
    name: string;
    emoji: string;
  } | null;
}
interface DebtItem {
  id: string;
  starting_balance: number;
  payment_made: number;
  ending_balance: number;
  accounts?: {
    name: string;
  } | null;
}
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    config
  } = useApp();
  const { storage } = useStorage();
  const t = translations[config.language];
  const [monthlySummaries, setMonthlySummaries] = useState<MonthlySummary[]>([]);
  const [annualSummary, setAnnualSummary] = useState<AnnualSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Current month data
  const currentMonth = new Date().getMonth() + 1;
  const [recentIncome, setRecentIncome] = useState<IncomeItem[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<TransactionItem[]>([]);
  const [currentDebts, setCurrentDebts] = useState<DebtItem[]>([]);

  // FAB Dialog state
  const [fabDialogOpen, setFabDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedAddType, setSelectedAddType] = useState<'income' | 'transaction' | 'debt' | 'wishlist' | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [userId, setUserId] = useState<string>('');

  // Form states
  const [newIncome, setNewIncome] = useState({ source: '', amount: 0, date: '' });
  const [newTxn, setNewTxn] = useState({ category_id: '', description: '', amount: 0, date: '', payment_method_id: '', account_id: '' });
  const [newDebt, setNewDebt] = useState({ debt_account_id: '', starting_balance: 0, interest_rate_apr: 0, payment_made: 0, min_payment: 0 });
  const [newWish, setNewWish] = useState({ item: '', estimated_cost: 0, priority: 1 });
  useEffect(() => {
    loadDashboardData();
  }, []);
  const loadDashboardData = async () => {
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      // Load categories, accounts, payment methods for FAB
      const [categoriesRes, accountsRes, paymentMethodsRes] = await Promise.all([
        storage.getCategories(user.id),
        storage.getAccounts(user.id),
        storage.getPaymentMethods(user.id)
      ]);
      setCategories(categoriesRes || []);
      setAccounts(accountsRes || []);
      setPaymentMethods(paymentMethodsRes || []);

      // Load monthly summary view
      const monthlyData = await storage.getMonthlySummaries(user.id);
      setMonthlySummaries(monthlyData || []);

      // Load annual summary view - filter by user_id
      const annualData = await storage.getAnnualSummary(user.id);
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
    // Load recent income
    const incomeData = await storage.getRecentIncome(userId, currentMonth);
    setRecentIncome(incomeData);

    // Load recent transactions
    const transactionsData = await storage.getRecentTransactions(userId, currentMonth);
    setRecentTransactions(transactionsData);

    // Load current debts
    const debtsData = await storage.getCurrentDebts(userId, currentMonth);
    setCurrentDebts(debtsData);
  };
  const formatCurrency = (amount: number | null, compact = false) => {
    const value = amount || 0;
    const symbol = config.currency === 'EUR' ? '€' : '$';
    if (compact && Math.abs(value) >= 1000) {
      return `${symbol}${(Math.abs(value) / 1000).toFixed(1)}K`;
    }
    return `${symbol}${Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
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
      'December': config.language === 'es' ? 'Diciembre' : 'December'
    };
    return monthMap[monthName] || monthName;
  };

  const resetFabDialog = () => {
    setFabDialogOpen(false);
    setSelectedMonth(null);
    setSelectedAddType(null);
    setNewIncome({ source: '', amount: 0, date: '' });
    setNewTxn({ category_id: '', description: '', amount: 0, date: '', payment_method_id: '', account_id: '' });
    setNewDebt({ debt_account_id: '', starting_balance: 0, interest_rate_apr: 0, payment_made: 0, min_payment: 0 });
    setNewWish({ item: '', estimated_cost: 0, priority: 1 });
  };

  const addIncome = async () => {
    if (!selectedMonth) return;
    await storage.addIncome({
      month_id: selectedMonth,
      user_id: userId,
      source: newIncome.source,
      amount: newIncome.amount,
      date: newIncome.date,
      currency_code: config.currency
    });
    resetFabDialog();
    loadDashboardData();
  };

  const addTransaction = async () => {
    if (!selectedMonth) return;
    await storage.addTransaction({
      month_id: selectedMonth,
      user_id: userId,
      category_id: newTxn.category_id,
      description: newTxn.description,
      amount: -Math.abs(newTxn.amount),
      date: newTxn.date,
      direction: 'EXPENSE',
      currency_code: config.currency,
      payment_method_id: newTxn.payment_method_id || null,
      account_id: newTxn.account_id || null
    });
    resetFabDialog();
    loadDashboardData();
  };

  const addDebt = async () => {
    if (!selectedMonth) return;
    await storage.addDebt({
      month_id: selectedMonth,
      user_id: userId,
      debt_account_id: newDebt.debt_account_id,
      starting_balance: newDebt.starting_balance,
      interest_rate_apr: newDebt.interest_rate_apr,
      payment_made: newDebt.payment_made,
      min_payment: newDebt.min_payment,
      ending_balance: newDebt.starting_balance - newDebt.payment_made
    });
    resetFabDialog();
    loadDashboardData();
  };

  const addWish = async () => {
    if (!selectedMonth) return;
    await storage.addWish({
      month_id: selectedMonth,
      user_id: userId,
      item: newWish.item,
      estimated_cost: newWish.estimated_cost,
      priority: String(newWish.priority)
    });
    resetFabDialog();
    loadDashboardData();
  };

  // Calculate income rate (mock calculation - you can adjust)
  const incomeGrowthRate = annualSummary?.annual_income ? annualSummary.annual_income / 12 / (annualSummary.annual_income / 12 || 1) * 100 - 100 : 0;
  const savingsRate = annualSummary?.annual_income ? Math.abs(annualSummary.annual_future_actual || 0) / annualSummary.annual_income * 100 : 0;
  if (loading) {
    return <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Loading...</div>
      </main>
    </div>;
  }
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-8 space-y-8">

      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {(() => {
              const firstName = config.ownerName?.split(' ')[0] || '';
              const greetingsEs = [`Hola ${firstName}`, `Bienvenido de vuelta ${firstName}`, `Vas bien ${firstName}`, `Qué tal ${firstName}`, `Buenos días ${firstName}`];
              const greetingsEn = [`Hello ${firstName}`, `Welcome back ${firstName}`, `You're doing great ${firstName}`, `How's it going ${firstName}`, `Good to see you ${firstName}`];
              const greetings = config.language === 'es' ? greetingsEs : greetingsEn;
              const randomIndex = Math.floor(Date.now() / 60000) % greetings.length;
              return `${greetings[randomIndex]} 👋`;
            })()}
          </h1>
          <p className="text-muted-foreground mt-1">
            {config.language === 'es' ? 'Controla tus finanzas y alcanza tus metas' : 'Track your finances and reach your goals'}
          </p>
        </div>
        <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
          {config.language === 'es' ? 'Ver reportes' : 'View reports'}
        </Button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Income KPI */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary" />
              {t.income}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_income, true)}</div>
                <span className="badge-success text-xs mt-1 inline-flex">
                  <TrendingUp className="h-3 w-3" />
                  {config.language === 'es' ? 'Anual' : 'Annual'}
                </span>
              </div>
              <ChartContainer config={{
                actual: {
                  label: config.language === 'es' ? 'Actual' : 'Actual',
                  color: 'hsl(var(--primary))'
                },
                remaining: {
                  label: config.language === 'es' ? 'Meta' : 'Target',
                  color: 'hsl(var(--muted))'
                }
              }} className="aspect-square w-[80px]">
                <RadialBarChart data={[{
                  actual: annualSummary?.annual_income || 0,
                  remaining: Math.max((annualSummary?.annual_income || 0) * 0.2, 0)
                }]} endAngle={180} innerRadius={25} outerRadius={40}>
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label content={({
                      viewBox
                    }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 2} className="fill-foreground text-xs font-bold">
                            100%
                          </tspan>
                        </text>;
                      }
                    }} />
                  </PolarRadiusAxis>
                  <RadialBar dataKey="actual" stackId="a" cornerRadius={3} fill="var(--color-actual)" className="stroke-transparent stroke-2" />
                  <RadialBar dataKey="remaining" stackId="a" cornerRadius={3} fill="var(--color-remaining)" className="stroke-transparent stroke-2" />
                </RadialBarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expenses KPI */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              {t.expenses}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_expenses, true)}</div>
                <span className="badge-destructive text-xs mt-1 inline-flex">
                  <TrendingDown className="h-3 w-3" />
                  {config.language === 'es' ? 'Gastos' : 'Spent'}
                </span>
              </div>
              <ChartContainer config={{
                expenses: {
                  label: config.language === 'es' ? 'Gastos' : 'Expenses',
                  color: 'hsl(var(--accent))'
                },
                income: {
                  label: config.language === 'es' ? 'Ingresos' : 'Income',
                  color: 'hsl(var(--muted))'
                }
              }} className="aspect-square w-[80px]">
                <RadialBarChart data={[{
                  expenses: annualSummary?.annual_expenses || 0,
                  income: Math.max((annualSummary?.annual_income || 0) - (annualSummary?.annual_expenses || 0), 0)
                }]} endAngle={180} innerRadius={25} outerRadius={40}>
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label content={({
                      viewBox
                    }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const expenseRate = annualSummary?.annual_income ? ((annualSummary?.annual_expenses || 0) / annualSummary.annual_income * 100).toFixed(0) : 0;
                        return <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 2} className="fill-foreground text-xs font-bold">
                            {expenseRate}%
                          </tspan>
                        </text>;
                      }
                    }} />
                  </PolarRadiusAxis>
                  <RadialBar dataKey="expenses" stackId="a" cornerRadius={3} fill="var(--color-expenses)" className="stroke-transparent stroke-2" />
                  <RadialBar dataKey="income" stackId="a" cornerRadius={3} fill="var(--color-income)" className="stroke-transparent stroke-2" />
                </RadialBarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Savings KPI */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-success/50 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success" />
              {t.future}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_future_actual, true)}</div>
                <span className="badge-success text-xs mt-1 inline-flex">
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
              <ChartContainer config={{
                savings: {
                  label: config.language === 'es' ? 'Ahorros' : 'Savings',
                  color: 'hsl(var(--success))'
                },
                target: {
                  label: config.language === 'es' ? 'Meta' : 'Target',
                  color: 'hsl(var(--muted))'
                }
              }} className="aspect-square w-[80px]">
                <RadialBarChart data={[{
                  savings: annualSummary?.annual_future_actual || 0,
                  target: Math.max((annualSummary?.annual_income || 0) * 0.2 - (annualSummary?.annual_future_actual || 0), 0)
                }]} endAngle={180} innerRadius={25} outerRadius={40}>
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label content={({
                      viewBox
                    }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        return <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 2} className="fill-foreground text-xs font-bold">
                            {savingsRate.toFixed(0)}%
                          </tspan>
                        </text>;
                      }
                    }} />
                  </PolarRadiusAxis>
                  <RadialBar dataKey="savings" stackId="a" cornerRadius={3} fill="var(--color-savings)" className="stroke-transparent stroke-2" />
                  <RadialBar dataKey="target" stackId="a" cornerRadius={3} fill="var(--color-target)" className="stroke-transparent stroke-2" />
                </RadialBarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        {/* Debts KPI */}
        <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-chart-4/50 to-transparent" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{
                backgroundColor: 'hsl(var(--chart-4))'
              }} />
              {t.debts}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-0">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_debt_payments, true)}</div>
                <span className="text-xs text-muted-foreground mt-1 inline-block">
                  {config.language === 'es' ? 'Pagado' : 'Paid'}
                </span>
              </div>
              <ChartContainer config={{
                paid: {
                  label: config.language === 'es' ? 'Pagado' : 'Paid',
                  color: 'hsl(var(--chart-4))'
                },
                remaining: {
                  label: config.language === 'es' ? 'Restante' : 'Remaining',
                  color: 'hsl(var(--muted))'
                }
              }} className="aspect-square w-[80px]">
                <RadialBarChart data={[{
                  paid: annualSummary?.annual_debt_payments || 0,
                  remaining: Math.max((annualSummary?.annual_debt_payments || 0) * 0.5, 1000)
                }]} endAngle={180} innerRadius={25} outerRadius={40}>
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label content={({
                      viewBox
                    }) => {
                      if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                        const debtRate = annualSummary?.annual_income ? ((annualSummary?.annual_debt_payments || 0) / annualSummary.annual_income * 100).toFixed(0) : 0;
                        return <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                          <tspan x={viewBox.cx} y={(viewBox.cy || 0) - 2} className="fill-foreground text-xs font-bold">
                            {debtRate}%
                          </tspan>
                        </text>;
                      }
                    }} />
                  </PolarRadiusAxis>
                  <RadialBar dataKey="paid" stackId="a" cornerRadius={3} fill="var(--color-paid)" className="stroke-transparent stroke-2" />
                  <RadialBar dataKey="remaining" stackId="a" cornerRadius={3} fill="var(--color-remaining)" className="stroke-transparent stroke-2" />
                </RadialBarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Chart + Side Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Chart - Takes 2 columns on large screens, full width on mobile */}
        <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-card to-card/80 overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">
                {config.language === 'es' ? 'Ingresos totales' : 'Total revenue'}
              </CardTitle>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-bold">{formatCurrency(annualSummary?.annual_income, true)}</span>
                <span className="badge-success text-xs">
                  <TrendingUp className="h-3 w-3" />
                  {config.language === 'es' ? 'vs año anterior' : 'vs last year'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: 'hsl(var(--chart-1))'
                }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Ingresos' : 'Revenue'}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{
                  backgroundColor: 'hsl(var(--chart-2))'
                }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Gastos' : 'Expenses'}</span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{
              income: {
                label: config.language === 'es' ? 'Ingresos' : 'Income',
                color: 'hsl(var(--chart-1))'
              },
              expenses: {
                label: config.language === 'es' ? 'Gastos' : 'Expenses',
                color: 'hsl(var(--chart-2))'
              }
            } satisfies ChartConfig} className="h-[250px] sm:h-[300px] w-full">
              <AreaChart accessibilityLayer data={monthlySummaries.map(m => ({
                month: getMonthName(m.month_id || 1, config.language),
                income: m.total_income || 0,
                expenses: Math.abs(m.total_expenses || 0)
              }))} margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 12
              }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={value => value.slice(0, 3)} stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={value => `${config.currency === 'EUR' ? '€' : '$'}${(value / 1000).toFixed(0)}K`} stroke="hsl(var(--muted-foreground))" width={50} fontSize={12} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <defs>
                  <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.05} />
                  </linearGradient>
                  <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <Area dataKey="income" type="monotone" fill="url(#fillIncome)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                <Area dataKey="expenses" type="monotone" fill="url(#fillExpenses)" stroke="hsl(var(--chart-2))" strokeWidth={2} />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Side Stats - Net Cash Flow Card with Radial Chart */}
        <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
          <CardHeader className="items-center pb-0">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" />
              {config.language === 'es' ? 'Flujo neto' : 'Net cash flow'}
            </CardTitle>
            <CardDescription>
              {config.language === 'es' ? 'Últimos 12 meses' : 'Last 12 months'}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer config={{
              netFlow: {
                label: config.language === 'es' ? 'Flujo neto' : 'Net flow',
                color: 'hsl(var(--success))'
              }
            }} className="mx-auto aspect-square max-h-[250px]">
              <RadialBarChart data={[{
                netFlow: Math.max(annualSummary?.annual_net_cash_flow || 0, 0),
                fill: 'var(--color-netFlow)'
              }]} startAngle={0} endAngle={(() => {
                const income = annualSummary?.annual_income || 1;
                const netFlow = annualSummary?.annual_net_cash_flow || 0;
                const percentage = Math.min(netFlow / income * 100, 100);
                return percentage / 100 * 360;
              })()} innerRadius={80} outerRadius={110}>
                <PolarGrid gridType="circle" radialLines={false} stroke="none" className="first:fill-muted last:fill-background" polarRadius={[86, 74]} />
                <RadialBar dataKey="netFlow" background cornerRadius={10} />
                <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                  <Label content={({
                    viewBox
                  }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                          {formatCurrency(annualSummary?.annual_net_cash_flow, true)}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-muted-foreground text-sm">
                          {config.language === 'es' ? 'Positivo' : 'Positive'}
                        </tspan>
                      </text>;
                    }
                  }} />
                </PolarRadiusAxis>
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
          <div className="flex flex-col gap-2 text-sm p-6 pt-0">
            <div className="flex items-center justify-center gap-2 leading-none font-medium text-success">
              <TrendingUp className="h-4 w-4" />
              {(() => {
                const income = annualSummary?.annual_income || 1;
                const netFlow = annualSummary?.annual_net_cash_flow || 0;
                return `${(netFlow / income * 100).toFixed(1)}% ${config.language === 'es' ? 'de ingresos ahorrados' : 'of income saved'}`;
              })()}
            </div>
            <div className="text-muted-foreground leading-none text-center">
              {config.language === 'es' ? 'Ingresos - Gastos' : 'Income - Expenses'}
            </div>
          </div>
        </Card>
      </div>

      {/* 50/30/20 Summary with Stacked Radial Charts */}


      {/* Current Month Dynamic Tables */}
      <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {config.language === 'es' ? 'Datos del Mes Actual' : 'Current Month Data'} - {getMonthName(currentMonth, config.language)}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="income" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted/50">
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
              {recentIncome.length > 0 ? <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{config.language === 'es' ? 'Fuente' : 'Source'}</TableHead>
                    <TableHead>{config.language === 'es' ? 'Fecha' : 'Date'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Monto' : 'Amount'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentIncome.map(item => <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.source}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right text-success">{formatCurrency(item.amount)}</TableCell>
                  </TableRow>)}
                </TableBody>
              </Table> : <p className="text-center text-muted-foreground py-8">
                {config.language === 'es' ? 'No hay ingresos registrados este mes' : 'No income recorded this month'}
              </p>}
            </TabsContent>

            <TabsContent value="expenses" className="mt-4">
              {recentTransactions.length > 0 ? <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{config.language === 'es' ? 'Descripción' : 'Description'}</TableHead>
                    <TableHead>{config.language === 'es' ? 'Categoría' : 'Category'}</TableHead>
                    <TableHead>{config.language === 'es' ? 'Fecha' : 'Date'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Monto' : 'Amount'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map(item => <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell>
                      {item.categories?.emoji} {item.categories?.name || '-'}
                    </TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(Math.abs(item.amount))}</TableCell>
                  </TableRow>)}
                </TableBody>
              </Table> : <p className="text-center text-muted-foreground py-8">
                {config.language === 'es' ? 'No hay gastos registrados este mes' : 'No expenses recorded this month'}
              </p>}
            </TabsContent>

            <TabsContent value="debts" className="mt-4">
              {currentDebts.length > 0 ? <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{config.language === 'es' ? 'Cuenta' : 'Account'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Saldo Inicial' : 'Starting Balance'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Pago Realizado' : 'Payment Made'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Saldo Final' : 'Ending Balance'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentDebts.map(item => <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.accounts?.name || '-'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.starting_balance)}</TableCell>
                    <TableCell className="text-right text-success">{formatCurrency(item.payment_made || 0)}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(item.ending_balance || item.starting_balance)}</TableCell>
                  </TableRow>)}
                </TableBody>
              </Table> : <p className="text-center text-muted-foreground py-8">
                {config.language === 'es' ? 'No hay deudas registradas este mes' : 'No debts recorded this month'}
              </p>}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Monthly Breakdown Table - Collapsible */}
      <Collapsible defaultOpen className="mb-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="flex flex-row items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {t.monthlyBreakdown}
              </CardTitle>
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{config.language === 'es' ? 'Mes' : 'Month'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Ingresos' : 'Income'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Gastos' : 'Expenses'}</TableHead>
                    <TableHead className="text-right">{config.language === 'es' ? 'Flujo Neto' : 'Net Flow'}</TableHead>
                    <TableHead className="text-center">{config.language === 'es' ? 'Acción' : 'Action'}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySummaries.map(month => <TableRow key={month.month_id}>
                    <TableCell className="font-medium">{getLocalizedMonthName(month.month_name || '')}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.total_income)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(month.total_expenses)}</TableCell>
                    <TableCell className={`text-right ${(month.net_cash_flow || 0) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                      {formatCurrency(month.net_cash_flow)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/budget/2025/${month.month_id}`)}>
                        {config.language === 'es' ? 'Ver' : 'View'}
                      </Button>
                    </TableCell>
                  </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </main>

    {/* FAB Button */}
    <Button onClick={() => setFabDialogOpen(true)} className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50">
      <Plus className="w-6 h-6 text-primary-foreground" />
    </Button>

    {/* FAB Dialog */}
    <Dialog open={fabDialogOpen} onOpenChange={open => {
      if (!open) resetFabDialog(); else setFabDialogOpen(true);
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {!selectedMonth ? 'Seleccionar mes' : !selectedAddType ? 'Agregar nuevo' : selectedAddType === 'income' ? 'Nuevo Ingreso' : selectedAddType === 'transaction' ? 'Nueva Transacción' : selectedAddType === 'debt' ? 'Nueva Deuda' : 'Nuevo Deseo'}
          </DialogTitle>
        </DialogHeader>

        {!selectedMonth ? (
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(MONTH_INFO).map(([id, month]) => (
              <Button
                key={id}
                variant="outline"
                className="h-12"
                onClick={() => setSelectedMonth(Number(id))}
              >
                {config.language === 'es' ? month.name.slice(0, 3) : month.nameEn.slice(0, 3)}
              </Button>
            ))}
          </div>
        ) : !selectedAddType ? (
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedAddType('income')}>
              <span className="text-2xl">💰</span>
              <span>Ingreso</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedAddType('transaction')}>
              <span className="text-2xl">💸</span>
              <span>Transacción</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedAddType('debt')}>
              <span className="text-2xl">💳</span>
              <span>Deuda</span>
            </Button>
            <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedAddType('wishlist')}>
              <span className="text-2xl">⭐</span>
              <span>Lista de Deseos</span>
            </Button>
          </div>
        ) : selectedAddType === 'income' ? (
          <div className="space-y-4">
            <div>
              <FormLabel>Fuente</FormLabel>
              <Input value={newIncome.source} onChange={e => setNewIncome({ ...newIncome, source: e.target.value })} />
            </div>
            <div>
              <FormLabel>Monto</FormLabel>
              <Input type="number" value={newIncome.amount} onChange={e => setNewIncome({ ...newIncome, amount: Number(e.target.value) })} />
            </div>
            <div>
              <FormLabel>Fecha</FormLabel>
              <Input type="date" value={newIncome.date} onChange={e => setNewIncome({ ...newIncome, date: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedAddType(null)}>Atrás</Button>
              <Button className="flex-1" onClick={addIncome}>Agregar</Button>
            </div>
          </div>
        ) : selectedAddType === 'transaction' ? (
          <div className="space-y-4">
            <div>
              <FormLabel>Categoría</FormLabel>
              <Select value={newTxn.category_id} onValueChange={v => setNewTxn({ ...newTxn, category_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FormLabel>Descripción</FormLabel>
              <Input value={newTxn.description} onChange={e => setNewTxn({ ...newTxn, description: e.target.value })} />
            </div>
            <div>
              <FormLabel>Monto</FormLabel>
              <Input type="number" value={newTxn.amount} onChange={e => setNewTxn({ ...newTxn, amount: Number(e.target.value) })} />
            </div>
            <div>
              <FormLabel>Fecha</FormLabel>
              <Input type="date" value={newTxn.date} onChange={e => setNewTxn({ ...newTxn, date: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedAddType(null)}>Atrás</Button>
              <Button className="flex-1" onClick={addTransaction}>Agregar</Button>
            </div>
          </div>
        ) : selectedAddType === 'debt' ? (
          <div className="space-y-4">
            <div>
              <FormLabel>Cuenta de deuda</FormLabel>
              <Select value={newDebt.debt_account_id} onValueChange={v => setNewDebt({ ...newDebt, debt_account_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map(acc => (
                    <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <FormLabel>Saldo inicial</FormLabel>
              <Input type="number" value={newDebt.starting_balance} onChange={e => setNewDebt({ ...newDebt, starting_balance: Number(e.target.value) })} />
            </div>
            <div>
              <FormLabel>Tasa APR (%)</FormLabel>
              <Input type="number" value={newDebt.interest_rate_apr} onChange={e => setNewDebt({ ...newDebt, interest_rate_apr: Number(e.target.value) })} />
            </div>
            <div>
              <FormLabel>Pago realizado</FormLabel>
              <Input type="number" value={newDebt.payment_made} onChange={e => setNewDebt({ ...newDebt, payment_made: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedAddType(null)}>Atrás</Button>
              <Button className="flex-1" onClick={addDebt}>Agregar</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <FormLabel>Artículo</FormLabel>
              <Input value={newWish.item} onChange={e => setNewWish({ ...newWish, item: e.target.value })} />
            </div>
            <div>
              <FormLabel>Costo estimado</FormLabel>
              <Input type="number" value={newWish.estimated_cost} onChange={e => setNewWish({ ...newWish, estimated_cost: Number(e.target.value) })} />
            </div>
            <div>
              <FormLabel>Prioridad (1-5)</FormLabel>
              <Input type="number" min={1} max={5} value={newWish.priority} onChange={e => setNewWish({ ...newWish, priority: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSelectedAddType(null)}>Atrás</Button>
              <Button className="flex-1" onClick={addWish}>Agregar</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  </div>;
};
export default Dashboard;