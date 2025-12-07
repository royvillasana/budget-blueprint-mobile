import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard, Calendar, DollarSign, Receipt, Landmark, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { getMonthName, getTableName, MONTH_INFO } from '@/utils/monthUtils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, RadialBarChart, RadialBar, PolarRadiusAxis, Label } from 'recharts';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

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

  const formatCurrency = (amount: number | null, compact = false) => {
    const value = amount || 0;
    const symbol = config.currency === 'EUR' ? '€' : '$';
    if (compact && Math.abs(value) >= 1000) {
      return `${symbol}${(Math.abs(value) / 1000).toFixed(1)}K`;
    }
    return `${symbol}${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
      'December': config.language === 'es' ? 'Diciembre' : 'December',
    };
    return monthMap[monthName] || monthName;
  };

  // Calculate income rate (mock calculation - you can adjust)
  const incomeGrowthRate = annualSummary?.annual_income 
    ? ((annualSummary.annual_income / 12) / ((annualSummary.annual_income / 12) || 1) * 100 - 100) 
    : 0;
  const savingsRate = annualSummary?.annual_income 
    ? (Math.abs(annualSummary.annual_future_actual || 0) / annualSummary.annual_income * 100) 
    : 0;

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
      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {(() => {
                const firstName = config.ownerName?.split(' ')[0] || '';
                const greetingsEs = [
                  `Hola ${firstName}`,
                  `Bienvenido de vuelta ${firstName}`,
                  `Vas bien ${firstName}`,
                  `Qué tal ${firstName}`,
                  `Buenos días ${firstName}`,
                ];
                const greetingsEn = [
                  `Hello ${firstName}`,
                  `Welcome back ${firstName}`,
                  `You're doing great ${firstName}`,
                  `How's it going ${firstName}`,
                  `Good to see you ${firstName}`,
                ];
                const greetings = config.language === 'es' ? greetingsEs : greetingsEn;
                const randomIndex = Math.floor(Date.now() / 60000) % greetings.length;
                return `${greetings[randomIndex]} 👋`;
              })()}
            </h1>
            <p className="text-muted-foreground mt-1">
              {config.language === 'es' 
                ? 'Controla tus finanzas y alcanza tus metas' 
                : 'Track your finances and reach your goals'}
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
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_income, true)}</span>
                <span className="badge-success text-xs">
                  <TrendingUp className="h-3 w-3" />
                  {config.language === 'es' ? 'Anual' : 'Annual'}
                </span>
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
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_expenses, true)}</span>
                <span className="badge-destructive text-xs">
                  <TrendingDown className="h-3 w-3" />
                  {config.language === 'es' ? 'Gastos' : 'Spent'}
                </span>
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
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_future_actual, true)}</span>
                <span className="badge-success text-xs">
                  {savingsRate.toFixed(1)}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Debts KPI */}
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-chart-4/50 to-transparent" />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
                {t.debts}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_debt_payments, true)}</span>
                <span className="text-xs text-muted-foreground">
                  {config.language === 'es' ? 'Pagado' : 'Paid'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Chart + Side Stats */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Chart - Takes 2 columns */}
          <Card className="lg:col-span-2 border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">
                  {config.language === 'es' ? 'Ingresos totales' : 'Total revenue'}
                </CardTitle>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-bold">{formatCurrency(annualSummary?.annual_income, true)}</span>
                  <span className="badge-success text-xs">
                    <TrendingUp className="h-3 w-3" />
                    {config.language === 'es' ? 'vs año anterior' : 'vs last year'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                  <span className="text-muted-foreground">{config.language === 'es' ? 'Ingresos' : 'Revenue'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                  <span className="text-muted-foreground">{config.language === 'es' ? 'Gastos' : 'Expenses'}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer 
                config={{
                  income: {
                    label: config.language === 'es' ? 'Ingresos' : 'Income',
                    color: 'hsl(var(--chart-1))',
                  },
                  expenses: {
                    label: config.language === 'es' ? 'Gastos' : 'Expenses',
                    color: 'hsl(var(--chart-2))',
                  },
                } satisfies ChartConfig}
                className="h-[300px] w-full"
              >
                <AreaChart
                  accessibilityLayer
                  data={monthlySummaries.map(m => ({
                    month: getMonthName(m.month_id || 1, config.language),
                    income: m.total_income || 0,
                    expenses: Math.abs(m.total_expenses || 0),
                  }))}
                  margin={{
                    left: 12,
                    right: 12,
                    top: 12,
                    bottom: 12,
                  }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${config.currency === 'EUR' ? '€' : '$'}${(value / 1000).toFixed(0)}K`}
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-1))"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                    <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0.6}
                      />
                      <stop
                        offset="95%"
                        stopColor="hsl(var(--chart-2))"
                        stopOpacity={0.05}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="income"
                    type="monotone"
                    fill="url(#fillIncome)"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                  />
                  <Area
                    dataKey="expenses"
                    type="monotone"
                    fill="url(#fillExpenses)"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Side Stats Cards */}
          <div className="flex flex-col gap-4">
            {/* Net Cash Flow Card */}
            <Card className="flex-1 border-border/50 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-success" />
                  {config.language === 'es' ? 'Flujo neto' : 'Net cash flow'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_net_cash_flow, true)}</span>
                  <span className="badge-success text-xs">
                    <TrendingUp className="h-3 w-3" />
                    {config.language === 'es' ? 'Positivo' : 'Positive'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {config.language === 'es' ? 'Últimos 12 meses' : 'Last 12 months'}
                </p>
              </CardContent>
            </Card>

            {/* Needs Card */}
            <Card className="flex-1 border-border/50 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  {t.needs}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_needs_actual, true)}</span>
                  <span className="text-xs text-muted-foreground">50%</span>
                </div>
              </CardContent>
            </Card>

            {/* Wants Card */}
            <Card className="flex-1 border-border/50 bg-gradient-to-br from-card to-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-accent" />
                  {t.desires}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_wants_actual, true)}</span>
                  <span className="text-xs text-muted-foreground">30%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 50/30/20 Summary with Stacked Radial Charts */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Needs Card */}
          <Card className="flex flex-col border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardHeader className="items-center pb-0">
              <CardTitle>{t.needs}</CardTitle>
              <CardDescription>50% {config.language === 'es' ? 'del presupuesto' : 'of budget'}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
              <ChartContainer
                config={{
                  actual: {
                    label: config.language === 'es' ? 'Real' : 'Actual',
                    color: 'hsl(var(--chart-1))',
                  },
                  target: {
                    label: config.language === 'es' ? 'Objetivo' : 'Target',
                    color: 'hsl(var(--chart-4))',
                  },
                }}
                className="mx-auto aspect-square w-full max-w-[250px]"
              >
                <RadialBarChart
                  data={[{ 
                    category: 'needs', 
                    actual: Math.abs(annualSummary?.annual_needs_actual || 0),
                    target: (annualSummary?.annual_income || 0) * 0.5
                  }]}
                  endAngle={180}
                  innerRadius={80}
                  outerRadius={130}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const actual = Math.abs(annualSummary?.annual_needs_actual || 0);
                          const target = (annualSummary?.annual_income || 0) * 0.5;
                          const total = actual + target;
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {formatCurrency(actual)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 4}
                                className="fill-muted-foreground"
                              >
                                {t.needs}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  <RadialBar
                    dataKey="actual"
                    stackId="a"
                    cornerRadius={5}
                    fill="var(--color-actual)"
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="target"
                    fill="var(--color-target)"
                    stackId="a"
                    cornerRadius={5}
                    className="stroke-transparent stroke-2"
                  />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
            <div className="flex justify-center gap-4 pb-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Real' : 'Actual'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Objetivo' : 'Target'}</span>
              </div>
            </div>
          </Card>

          {/* Wants Card */}
          <Card className="flex flex-col border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardHeader className="items-center pb-0">
              <CardTitle>{t.desires}</CardTitle>
              <CardDescription>30% {config.language === 'es' ? 'del presupuesto' : 'of budget'}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
              <ChartContainer
                config={{
                  actual: {
                    label: config.language === 'es' ? 'Real' : 'Actual',
                    color: 'hsl(var(--chart-2))',
                  },
                  target: {
                    label: config.language === 'es' ? 'Objetivo' : 'Target',
                    color: 'hsl(var(--chart-5))',
                  },
                }}
                className="mx-auto aspect-square w-full max-w-[250px]"
              >
                <RadialBarChart
                  data={[{ 
                    category: 'wants', 
                    actual: Math.abs(annualSummary?.annual_wants_actual || 0),
                    target: (annualSummary?.annual_income || 0) * 0.3
                  }]}
                  endAngle={180}
                  innerRadius={80}
                  outerRadius={130}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const actual = Math.abs(annualSummary?.annual_wants_actual || 0);
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {formatCurrency(actual)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 4}
                                className="fill-muted-foreground"
                              >
                                {t.desires}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  <RadialBar
                    dataKey="actual"
                    stackId="a"
                    cornerRadius={5}
                    fill="var(--color-actual)"
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="target"
                    fill="var(--color-target)"
                    stackId="a"
                    cornerRadius={5}
                    className="stroke-transparent stroke-2"
                  />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
            <div className="flex justify-center gap-4 pb-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Real' : 'Actual'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-5))' }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Objetivo' : 'Target'}</span>
              </div>
            </div>
          </Card>

          {/* Future Card */}
          <Card className="flex flex-col border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardHeader className="items-center pb-0">
              <CardTitle>{t.future}</CardTitle>
              <CardDescription>20% {config.language === 'es' ? 'del presupuesto' : 'of budget'}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center pb-0">
              <ChartContainer
                config={{
                  actual: {
                    label: config.language === 'es' ? 'Real' : 'Actual',
                    color: 'hsl(var(--chart-3))',
                  },
                  target: {
                    label: config.language === 'es' ? 'Objetivo' : 'Target',
                    color: 'hsl(var(--chart-4))',
                  },
                }}
                className="mx-auto aspect-square w-full max-w-[250px]"
              >
                <RadialBarChart
                  data={[{ 
                    category: 'future', 
                    actual: Math.abs(annualSummary?.annual_future_actual || 0),
                    target: (annualSummary?.annual_income || 0) * 0.2
                  }]}
                  endAngle={180}
                  innerRadius={80}
                  outerRadius={130}
                >
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                    <Label
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          const actual = Math.abs(annualSummary?.annual_future_actual || 0);
                          return (
                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) - 16}
                                className="fill-foreground text-2xl font-bold"
                              >
                                {formatCurrency(actual)}
                              </tspan>
                              <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 4}
                                className="fill-muted-foreground"
                              >
                                {t.future}
                              </tspan>
                            </text>
                          )
                        }
                      }}
                    />
                  </PolarRadiusAxis>
                  <RadialBar
                    dataKey="actual"
                    stackId="a"
                    cornerRadius={5}
                    fill="var(--color-actual)"
                    className="stroke-transparent stroke-2"
                  />
                  <RadialBar
                    dataKey="target"
                    fill="var(--color-target)"
                    stackId="a"
                    cornerRadius={5}
                    className="stroke-transparent stroke-2"
                  />
                </RadialBarChart>
              </ChartContainer>
            </CardContent>
            <div className="flex justify-center gap-4 pb-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-3))' }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Real' : 'Actual'}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-4))' }} />
                <span className="text-muted-foreground">{config.language === 'es' ? 'Objetivo' : 'Target'}</span>
              </div>
            </div>
          </Card>
        </div>

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
                          <TableCell className="text-right text-success">{formatCurrency(item.amount)}</TableCell>
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
                          <TableCell className="text-right text-success">{formatCurrency(item.payment_made || 0)}</TableCell>
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
                            {config.language === 'es' ? 'Ver' : 'View'}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      </main>
    </div>
  );
};

export default Dashboard;
