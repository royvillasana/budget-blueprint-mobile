import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { useApp } from '@/contexts/AppContext';

interface BudgetCardProps {
  title: string;
  budgeted: number;
  spent: number;
  color: string;
}

export const BudgetCard = ({ title, budgeted, spent, color }: BudgetCardProps) => {
  const { config } = useApp();
  const percentage = budgeted > 0 ? (spent / budgeted) * 100 : 0;
  const remaining = budgeted - spent;
  
  const formatCurrency = (amount: number) => {
    const symbol = config.currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full bg-${color}`} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gastado</span>
            <span className="font-medium">{formatCurrency(spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Presupuestado</span>
            <span className="font-medium">{formatCurrency(budgeted)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Restante</span>
            <span className={`font-medium ${remaining < 0 ? 'text-destructive' : 'text-green-600'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
        </div>
        <Progress value={Math.min(percentage, 100)} className="h-2" />
        <p className="text-xs text-muted-foreground text-right">
          {percentage.toFixed(1)}% utilizado
        </p>
      </CardContent>
    </Card>
  );
};
