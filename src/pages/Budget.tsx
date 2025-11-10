import { Header } from '@/components/Header';
import { BudgetCard } from '@/components/BudgetCard';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';

const Budget = () => {
  const { config, budgetCategories } = useApp();
  const t = translations[config.language];

  const calculateTotals = (categories: typeof budgetCategories.needs.categories) => {
    return {
      budgeted: categories.reduce((sum, cat) => sum + cat.budgeted, 0),
      spent: categories.reduce((sum, cat) => sum + cat.spent, 0),
    };
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.budget}</h1>
          <p className="text-muted-foreground">
            Gestiona tu presupuesto mensual por categorías
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <BudgetCard
            title={t.needs}
            {...calculateTotals(budgetCategories.needs.categories)}
            color="needs"
          />
          <BudgetCard
            title={t.desires}
            {...calculateTotals(budgetCategories.desires.categories)}
            color="desires"
          />
          <BudgetCard
            title={t.future}
            {...calculateTotals(budgetCategories.future.categories)}
            color="future"
          />
          <BudgetCard
            title={t.debts}
            {...calculateTotals(budgetCategories.debts.categories)}
            color="debt"
          />
        </div>
      </main>
    </div>
  );
};

export default Budget;
