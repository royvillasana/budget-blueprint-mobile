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

        {/* Annual Income vs Expenses Chart + KPI Cards */}
        <div className="grid gap-6 lg:grid-cols-3 mb-8">
          {/* Chart - Takes 2 columns */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{config.language === 'es' ? 'Ingresos vs Gastos Anuales' : 'Annual Income vs Expenses'}</CardTitle>
              <CardDescription>
                {config.language === 'es' ? 'Visualización mensual del año 2025' : 'Monthly visualization for 2025'}
              </CardDescription>
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
                className="h-[350px] w-full"
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
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => `${config.currency === 'EUR' ? '€' : '$'}${value}`}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <defs>
                    <linearGradient id="fillIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-income)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-income)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient id="fillExpenses" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor="var(--color-expenses)"
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor="var(--color-expenses)"
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    dataKey="income"
                    type="natural"
                    fill="url(#fillIncome)"
                    fillOpacity={0.4}
                    stroke="var(--color-income)"
                    strokeWidth={2}
                    stackId="a"
                  />
                  <Area
                    dataKey="expenses"
                    type="natural"
                    fill="url(#fillExpenses)"
                    fillOpacity={0.4}
                    stroke="var(--color-expenses)"
                    strokeWidth={2}
                    stackId="b"
                  />
                </AreaChart>
              </ChartContainer>
              <div className="flex justify-center gap-8 mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
                  <span className="text-sm font-medium">
                    {config.language === 'es' ? 'Ingresos' : 'Income'}: {formatCurrency(annualSummary?.annual_income)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
                  <span className="text-sm font-medium">
                    {config.language === 'es' ? 'Gastos' : 'Expenses'}: {formatCurrency(annualSummary?.annual_expenses)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards - Right side */}
          <div className="flex flex-col gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.income}</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_income)}</div>
                <p className="text-xs text-muted-foreground">{config.language === 'es' ? 'Anual' : 'Annual'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.expenses}</CardTitle>
                <TrendingDown className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_expenses)}</div>
                <p className="text-xs text-muted-foreground">{config.language === 'es' ? 'Anual' : 'Annual'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.future}</CardTitle>
                <PiggyBank className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_future_actual)}</div>
                <p className="text-xs text-muted-foreground">{config.language === 'es' ? 'Ahorros + Inversiones' : 'Savings + Investments'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t.debts}</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(annualSummary?.annual_debt_payments)}</div>
                <p className="text-xs text-muted-foreground">{config.language === 'es' ? 'Pagos de deudas' : 'Debt Payments'}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 50/30/20 Summary with Stacked Radial Charts */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Needs Card */}
          <Card className="flex flex-col">
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
          <Card className="flex flex-col">
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
          <Card className="flex flex-col">
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
