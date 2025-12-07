import { Pie, PieChart, Cell, ResponsiveContainer, Legend } from "recharts";
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

interface BudgetPieChartProps {
  needsActual: number;
  wantsActual: number;
  futureActual: number;
  totalIncome: number;
  currency: string;
  language: string;
}

const chartConfig = {
  needs: {
    label: "Necesidades",
    color: "hsl(var(--needs))",
  },
  wants: {
    label: "Deseos",
    color: "hsl(var(--desires))",
  },
  future: {
    label: "Futuro",
    color: "hsl(var(--future))",
  },
} satisfies ChartConfig;

export function BudgetPieChart({ 
  needsActual, 
  wantsActual, 
  futureActual, 
  totalIncome,
  currency, 
  language 
}: BudgetPieChartProps) {
  const symbol = currency === 'EUR' ? '€' : '$';
  const total = needsActual + wantsActual + futureActual;
  
  // Calculate percentages based on actual spending vs total income
  const needsPercent = totalIncome > 0 ? (needsActual / totalIncome) * 100 : 0;
  const wantsPercent = totalIncome > 0 ? (wantsActual / totalIncome) * 100 : 0;
  const futurePercent = totalIncome > 0 ? (futureActual / totalIncome) * 100 : 0;

  const chartData = [
    { 
      name: language === 'es' ? "Necesidades" : "Needs", 
      value: needsActual, 
      percent: needsPercent,
      target: 50,
      fill: "hsl(var(--needs))" 
    },
    { 
      name: language === 'es' ? "Deseos" : "Wants", 
      value: wantsActual, 
      percent: wantsPercent,
      target: 30,
      fill: "hsl(var(--desires))" 
    },
    { 
      name: language === 'es' ? "Futuro" : "Future", 
      value: futureActual, 
      percent: futurePercent,
      target: 20,
      fill: "hsl(var(--future))" 
    },
  ];

  const getStatusColor = (actual: number, target: number) => {
    if (actual <= target) return 'text-green-600';
    if (actual <= target * 1.1) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getStatusText = (actual: number, target: number, language: string) => {
    const diff = actual - target;
    if (diff <= 0) {
      return language === 'es' ? `${Math.abs(diff).toFixed(1)}% bajo` : `${Math.abs(diff).toFixed(1)}% under`;
    }
    return language === 'es' ? `${diff.toFixed(1)}% sobre` : `${diff.toFixed(1)}% over`;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{language === 'es' ? 'Distribución 50/30/20' : '50/30/20 Distribution'}</CardTitle>
        <CardDescription>
          {language === 'es' ? 'Gasto real vs objetivo' : 'Actual spending vs target'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              label={({ percent }) => `${percent.toFixed(0)}%`}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartTooltip
              content={<ChartTooltipContent />}
            />
          </PieChart>
        </ChartContainer>
        
        <div className="space-y-2 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-sm" 
                  style={{ backgroundColor: item.fill }} 
                />
                <span>{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground">
                  {symbol}{item.value.toFixed(2)}
                </span>
                <span className={`font-medium ${getStatusColor(item.percent, item.target)}`}>
                  {item.percent.toFixed(1)}% / {item.target}%
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t space-y-1">
          {chartData.map((item) => (
            <div key={`status-${item.name}`} className="flex justify-between text-xs">
              <span className="text-muted-foreground">{item.name}:</span>
              <span className={getStatusColor(item.percent, item.target)}>
                {getStatusText(item.percent, item.target, language)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
