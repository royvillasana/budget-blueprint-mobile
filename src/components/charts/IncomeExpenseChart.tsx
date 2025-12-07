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

interface IncomeExpenseChartProps {
  income: number;
  expenses: number;
  currency: string;
  language: string;
  masked?: boolean;
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

export function IncomeExpenseChart({ income, expenses, currency, language, masked = false }: IncomeExpenseChartProps) {
  const symbol = currency === 'EUR' ? '€' : '$';
  const formatValue = (value: number) => masked ? '••••••' : `${symbol}${value.toFixed(2)}`;
  
  const chartData = [
    { category: language === 'es' ? "Ingresos" : "Income", value: income, fill: "var(--color-income)" },
    { category: language === 'es' ? "Gastos" : "Expenses", value: expenses, fill: "var(--color-expenses)" },
  ];

  const barData = [
    { 
      name: language === 'es' ? "Resumen" : "Summary", 
      income: income, 
      expenses: expenses 
    },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{language === 'es' ? 'Ingresos vs Gastos' : 'Income vs Expenses'}</CardTitle>
        <CardDescription>
          {language === 'es' ? 'Comparación mensual' : 'Monthly comparison'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart
            accessibilityLayer
            data={barData}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${symbol}${value}`}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dot" />}
            />
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
            />
            <Area
              dataKey="expenses"
              type="natural"
              fill="url(#fillExpenses)"
              fillOpacity={0.4}
              stroke="var(--color-expenses)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-1))' }} />
            <span className="text-sm text-muted-foreground">
              {language === 'es' ? 'Ingresos' : 'Income'}: {formatValue(income)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'hsl(var(--chart-2))' }} />
            <span className="text-sm text-muted-foreground">
              {language === 'es' ? 'Gastos' : 'Expenses'}: {formatValue(expenses)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
