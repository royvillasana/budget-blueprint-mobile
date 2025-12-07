import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DailyDataPoint {
  date: string;
  amount: number;
  type: 'income' | 'expense';
}

interface IncomeExpenseChartProps {
  income: number;
  expenses: number;
  currency: string;
  language: string;
  masked?: boolean;
  incomeItems?: { date: string; amount: number }[];
  transactionItems?: { date: string; amount: number }[];
}

const chartConfig = {
  income: {
    label: "Ingresos",
    color: "hsl(var(--chart-1))",
  },
  expenses: {
    label: "Gastos",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function IncomeExpenseChart({ 
  income, 
  expenses, 
  currency, 
  language, 
  masked = false,
  incomeItems = [],
  transactionItems = []
}: IncomeExpenseChartProps) {
  const symbol = currency === 'EUR' ? '€' : '$';
  const formatValue = (value: number) => masked ? '••••••' : `${symbol}${value.toFixed(2)}`;
  
  // Build daily data from income and transaction items
  const buildDailyData = () => {
    const dailyMap: Record<string, { income: number; expenses: number }> = {};
    
    // Process income items
    incomeItems.forEach(item => {
      const day = new Date(item.date).getDate();
      const key = String(day);
      if (!dailyMap[key]) {
        dailyMap[key] = { income: 0, expenses: 0 };
      }
      dailyMap[key].income += Math.abs(item.amount);
    });
    
    // Process transaction items (expenses)
    transactionItems.forEach(item => {
      const day = new Date(item.date).getDate();
      const key = String(day);
      if (!dailyMap[key]) {
        dailyMap[key] = { income: 0, expenses: 0 };
      }
      dailyMap[key].expenses += Math.abs(item.amount);
    });
    
    // Sort by day and convert to array
    const sortedDays = Object.keys(dailyMap)
      .map(Number)
      .sort((a, b) => a - b);
    
    return sortedDays.map(day => ({
      day: String(day),
      income: dailyMap[String(day)].income,
      expenses: dailyMap[String(day)].expenses,
    }));
  };

  const dailyData = buildDailyData();
  const hasData = dailyData.length > 0;

  // Fallback to summary data if no daily data
  const fallbackData = [
    { 
      day: language === 'es' ? "Total" : "Total", 
      income: income, 
      expenses: expenses 
    },
  ];

  const chartData = hasData ? dailyData : fallbackData;

  return (
    <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{language === 'es' ? 'Ingresos vs Gastos' : 'Income vs Expenses'}</CardTitle>
        <CardDescription>
          {language === 'es' 
            ? (hasData ? 'Movimientos por día' : 'Comparación mensual')
            : (hasData ? 'Daily transactions' : 'Monthly comparison')
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => masked ? '••' : `${symbol}${value >= 1000 ? `${(value/1000).toFixed(0)}K` : value}`}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
            <defs>
              <linearGradient id="fillIncomeDaily" x1="0" y1="0" x2="0" y2="1">
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
              <linearGradient id="fillExpensesDaily" x1="0" y1="0" x2="0" y2="1">
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
              fill="url(#fillIncomeDaily)"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
            />
            <Area
              dataKey="expenses"
              type="monotone"
              fill="url(#fillExpensesDaily)"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <span className="text-sm text-muted-foreground">
              {language === 'es' ? 'Ingresos' : 'Income'}: {formatValue(income)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span className="text-sm text-muted-foreground">
              {language === 'es' ? 'Gastos' : 'Expenses'}: {formatValue(expenses)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}