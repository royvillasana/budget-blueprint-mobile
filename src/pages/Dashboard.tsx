import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, CreditCard } from 'lucide-react';

const Dashboard = () => {
  const { config, budgetCategories } = useApp();
  const t = translations[config.language];

  const formatCurrency = (amount: number) => {
    const symbol = config.currency === 'EUR' ? '€' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const totalSpent = Object.values(budgetCategories).reduce(
    (sum, category) => sum + category.categories.reduce((catSum, cat) => catSum + cat.spent, 0),
    0
  );

  const totalBudgeted = Object.values(budgetCategories).reduce(
    (sum, category) => sum + category.categories.reduce((catSum, cat) => catSum + cat.budgeted, 0),
    0
  );

  const savingsAmount = budgetCategories.future.categories.reduce(
    (sum, cat) => sum + cat.budgeted,
    0
  );

  const debtPayments = budgetCategories.debts.categories.reduce(
    (sum, cat) => sum + cat.spent,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {config.ownerName ? `${config.ownerName}'s ${t.dashboard}` : t.dashboard}
          </h1>
          <p className="text-muted-foreground">
            {t.annualSummary} - 2025
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.income}</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(config.monthlyIncome)}</div>
              <p className="text-xs text-muted-foreground">Mensual</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.expenses}</CardTitle>
              <TrendingDown className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {((totalSpent / config.monthlyIncome) * 100).toFixed(1)}% del ingreso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.savings}</CardTitle>
              <PiggyBank className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(savingsAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {((savingsAmount / config.monthlyIncome) * 100).toFixed(1)}% del ingreso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t.debtPayments}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(debtPayments)}</div>
              <p className="text-xs text-muted-foreground">
                {((debtPayments / config.monthlyIncome) * 100).toFixed(1)}% del ingreso
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.monthlyBreakdown}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(budgetCategories).map(([key, category]) => {
                const categoryTotal = category.categories.reduce(
                  (sum, cat) => sum + cat.budgeted,
                  0
                );
                const categorySpent = category.categories.reduce(
                  (sum, cat) => sum + cat.spent,
                  0
                );
                
                return (
                  <div key={key} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <p className="font-medium">{category.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {category.percentage}% del ingreso
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(categorySpent)}</p>
                      <p className="text-sm text-muted-foreground">
                        de {formatCurrency(categoryTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Dashboard;
