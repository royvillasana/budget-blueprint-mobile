import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface IncomeItem {
  id?: string;
  concept: string;
  estimated: number;
  actual: number;
}

interface BudgetCategoryItem {
  id?: string;
  category_name: string;
  estimated: number;
  actual: number;
  icon?: string;
}

interface Transaction {
  id?: string;
  category: string;
  amount: number;
  transaction_date: string;
  concept: string;
}

interface WishItem {
  id?: string;
  wish_text: string;
  is_completed: boolean;
}

interface TodoItem {
  id?: string;
  task_text: string;
  is_completed: boolean;
}

const MonthlyBudget = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const { config } = useApp();
  const t = translations[config.language];
  const { toast } = useToast();

  const [monthlyBudgetId, setMonthlyBudgetId] = useState<string | null>(null);
  const [monthlyGoal, setMonthlyGoal] = useState('');
  const [previousBalance, setPreviousBalance] = useState(0);
  const [addPreviousBalance, setAddPreviousBalance] = useState(false);
  const [budgetFromScratch, setBudgetFromScratch] = useState(true);
  const [debtContribution, setDebtContribution] = useState(0);

  const [incomeItems, setIncomeItems] = useState<IncomeItem[]>([
    { concept: t.fixedSalary, estimated: 0, actual: 0 },
    { concept: t.independent, estimated: 0, actual: 0 },
    { concept: t.passive, estimated: 0, actual: 0 },
    { concept: t.bonus, estimated: 0, actual: 0 },
  ]);

  const [needsCategories, setNeedsCategories] = useState<BudgetCategoryItem[]>([]);
  const [desiresCategories, setDesiresCategories] = useState<BudgetCategoryItem[]>([]);
  const [savingsCategories, setSavingsCategories] = useState<BudgetCategoryItem[]>([]);
  const [investmentsCategories, setInvestmentsCategories] = useState<BudgetCategoryItem[]>([]);
  const [debtsCategories, setDebtsCategories] = useState<BudgetCategoryItem[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [wishList, setWishList] = useState<WishItem[]>([]);
  const [todoList, setTodoList] = useState<TodoItem[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMonthlyBudget();
  }, [year, month]);

  const loadMonthlyBudget = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/');
        return;
      }

      // Load or create monthly budget
      const { data: existingBudget, error: budgetError } = await supabase
        .from('monthly_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('year', year)
        .eq('month', month)
        .maybeSingle();

      if (budgetError) throw budgetError;

      if (existingBudget) {
        setMonthlyBudgetId(existingBudget.id);
        setMonthlyGoal(existingBudget.monthly_goal || '');
        setPreviousBalance(parseFloat(existingBudget.previous_balance) || 0);
        setAddPreviousBalance(existingBudget.add_previous_balance);
        setBudgetFromScratch(existingBudget.budget_from_scratch);
        setDebtContribution(parseFloat(existingBudget.debt_contribution) || 0);

        // Load all related data
        await Promise.all([
          loadIncomeItems(existingBudget.id),
          loadBudgetCategories(existingBudget.id),
          loadTransactions(existingBudget.id),
          loadWishList(existingBudget.id),
          loadTodoList(existingBudget.id),
        ]);
      } else {
        // Create new monthly budget
        const { data: newBudget, error: createError } = await supabase
          .from('monthly_budgets')
          .insert({
            user_id: user.id,
            year: year,
            month: month,
          })
          .select()
          .single();

        if (createError) throw createError;
        setMonthlyBudgetId(newBudget.id);
      }
    } catch (error) {
      console.error('Error loading monthly budget:', error);
      toast({
        title: 'Error',
        description: 'Failed to load monthly budget',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadIncomeItems = async (budgetId: string) => {
    const { data, error } = await supabase
      .from('income_items')
      .select('*')
      .eq('monthly_budget_id', budgetId);

    if (!error && data && data.length > 0) {
      setIncomeItems(data.map(item => ({
        id: item.id,
        concept: item.concept,
        estimated: parseFloat(item.estimated) || 0,
        actual: parseFloat(item.actual) || 0,
      })));
    }
  };

  const loadBudgetCategories = async (budgetId: string) => {
    const { data, error } = await supabase
      .from('budget_categories')
      .select('*')
      .eq('monthly_budget_id', budgetId);

    if (!error && data) {
      setNeedsCategories(data.filter(c => c.type === 'needs').map(c => ({
        id: c.id,
        category_name: c.category_name,
        estimated: parseFloat(c.estimated) || 0,
        actual: parseFloat(c.actual) || 0,
        icon: c.icon,
      })));
      setDesiresCategories(data.filter(c => c.type === 'desires').map(c => ({
        id: c.id,
        category_name: c.category_name,
        estimated: parseFloat(c.estimated) || 0,
        actual: parseFloat(c.actual) || 0,
        icon: c.icon,
      })));
      setSavingsCategories(data.filter(c => c.type === 'savings').map(c => ({
        id: c.id,
        category_name: c.category_name,
        estimated: parseFloat(c.estimated) || 0,
        actual: parseFloat(c.actual) || 0,
        icon: c.icon,
      })));
      setInvestmentsCategories(data.filter(c => c.type === 'investments').map(c => ({
        id: c.id,
        category_name: c.category_name,
        estimated: parseFloat(c.estimated) || 0,
        actual: parseFloat(c.actual) || 0,
        icon: c.icon,
      })));
      setDebtsCategories(data.filter(c => c.type === 'debts').map(c => ({
        id: c.id,
        category_name: c.category_name,
        estimated: parseFloat(c.estimated) || 0,
        actual: parseFloat(c.actual) || 0,
        icon: c.icon,
      })));
    }
  };

  const loadTransactions = async (budgetId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('monthly_budget_id', budgetId)
      .order('transaction_date', { ascending: false });

    if (!error && data) {
      setTransactions(data.map(t => ({
        id: t.id,
        category: t.category,
        amount: parseFloat(t.amount),
        transaction_date: t.transaction_date,
        concept: t.concept,
      })));
    }
  };

  const loadWishList = async (budgetId: string) => {
    const { data, error } = await supabase
      .from('wish_list')
      .select('*')
      .eq('monthly_budget_id', budgetId);

    if (!error && data) {
      setWishList(data.map(w => ({
        id: w.id,
        wish_text: w.wish_text,
        is_completed: w.is_completed,
      })));
    }
  };

  const loadTodoList = async (budgetId: string) => {
    const { data, error } = await supabase
      .from('todo_list')
      .select('*')
      .eq('monthly_budget_id', budgetId);

    if (!error && data) {
      setTodoList(data.map(t => ({
        id: t.id,
        task_text: t.task_text,
        is_completed: t.is_completed,
      })));
    }
  };

  const saveMonthlyBudget = async () => {
    if (!monthlyBudgetId) return;

    try {
      const totalIncomeEstimated = incomeItems.reduce((sum, item) => sum + item.estimated, 0);
      const totalIncomeActual = incomeItems.reduce((sum, item) => sum + item.actual, 0);
      const budgetAllocated = 
        needsCategories.reduce((sum, c) => sum + c.estimated, 0) +
        desiresCategories.reduce((sum, c) => sum + c.estimated, 0) +
        savingsCategories.reduce((sum, c) => sum + c.estimated, 0) +
        investmentsCategories.reduce((sum, c) => sum + c.estimated, 0);

      // Update monthly budget
      await supabase
        .from('monthly_budgets')
        .update({
          monthly_goal: monthlyGoal,
          previous_balance: previousBalance,
          add_previous_balance: addPreviousBalance,
          budget_from_scratch: budgetFromScratch,
          total_income_estimated: totalIncomeEstimated,
          total_income_actual: totalIncomeActual,
          debt_contribution: debtContribution,
          budget_allocated: budgetAllocated,
        })
        .eq('id', monthlyBudgetId);

      // Save income items
      await Promise.all(incomeItems.map(item => {
        if (item.id) {
          return supabase
            .from('income_items')
            .update({
              concept: item.concept,
              estimated: item.estimated,
              actual: item.actual,
            })
            .eq('id', item.id);
        } else {
          return supabase
            .from('income_items')
            .insert({
              monthly_budget_id: monthlyBudgetId,
              concept: item.concept,
              estimated: item.estimated,
              actual: item.actual,
            });
        }
      }));

      toast({
        title: 'Guardado',
        description: 'Presupuesto mensual guardado exitosamente',
      });
    } catch (error) {
      console.error('Error saving monthly budget:', error);
      toast({
        title: 'Error',
        description: 'Error al guardar el presupuesto mensual',
        variant: 'destructive',
      });
    }
  };

  const addCategory = async (type: string, categoryName: string) => {
    if (!monthlyBudgetId || !categoryName.trim()) return;

    try {
      const { data, error } = await supabase
        .from('budget_categories')
        .insert({
          monthly_budget_id: monthlyBudgetId,
          type,
          category_name: categoryName,
          estimated: 0,
          actual: 0,
        })
        .select()
        .single();

      if (error) throw error;

      const newCategory: BudgetCategoryItem = {
        id: data.id,
        category_name: data.category_name,
        estimated: 0,
        actual: 0,
      };

      switch (type) {
        case 'needs':
          setNeedsCategories([...needsCategories, newCategory]);
          break;
        case 'desires':
          setDesiresCategories([...desiresCategories, newCategory]);
          break;
        case 'savings':
          setSavingsCategories([...savingsCategories, newCategory]);
          break;
        case 'investments':
          setInvestmentsCategories([...investmentsCategories, newCategory]);
          break;
        case 'debts':
          setDebtsCategories([...debtsCategories, newCategory]);
          break;
      }

      toast({
        title: 'Categoría agregada',
        description: 'La categoría se ha agregado exitosamente',
      });
    } catch (error) {
      console.error('Error adding category:', error);
      toast({
        title: 'Error',
        description: 'Error al agregar la categoría',
        variant: 'destructive',
      });
    }
  };

  const updateCategory = async (categoryId: string, field: 'estimated' | 'actual', value: number, type: string) => {
    try {
      await supabase
        .from('budget_categories')
        .update({ [field]: value })
        .eq('id', categoryId);

      const updateFn = (categories: BudgetCategoryItem[]) =>
        categories.map(c => c.id === categoryId ? { ...c, [field]: value } : c);

      switch (type) {
        case 'needs':
          setNeedsCategories(updateFn);
          break;
        case 'desires':
          setDesiresCategories(updateFn);
          break;
        case 'savings':
          setSavingsCategories(updateFn);
          break;
        case 'investments':
          setInvestmentsCategories(updateFn);
          break;
        case 'debts':
          setDebtsCategories(updateFn);
          break;
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!monthlyBudgetId) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          monthly_budget_id: monthlyBudgetId,
          ...transaction,
        })
        .select()
        .single();

      if (error) throw error;

      setTransactions([{
        id: data.id,
        category: data.category,
        amount: parseFloat(data.amount),
        transaction_date: data.transaction_date,
        concept: data.concept,
      }, ...transactions]);

      toast({
        title: 'Transacción agregada',
        description: 'La transacción se ha registrado exitosamente',
      });
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Error',
        description: 'Error al agregar la transacción',
        variant: 'destructive',
      });
    }
  };

  const totalIncomeEstimated = incomeItems.reduce((sum, item) => sum + item.estimated, 0);
  const totalIncomeActual = incomeItems.reduce((sum, item) => sum + item.actual, 0);
  const totalNeedsEstimated = needsCategories.reduce((sum, c) => sum + c.estimated, 0);
  const totalNeedsActual = needsCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalDesiresEstimated = desiresCategories.reduce((sum, c) => sum + c.estimated, 0);
  const totalDesiresActual = desiresCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalSavingsEstimated = savingsCategories.reduce((sum, c) => sum + c.estimated, 0);
  const totalSavingsActual = savingsCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalInvestmentsEstimated = investmentsCategories.reduce((sum, c) => sum + c.estimated, 0);
  const totalInvestmentsActual = investmentsCategories.reduce((sum, c) => sum + c.actual, 0);
  const totalDebtsEstimated = debtsCategories.reduce((sum, c) => sum + c.estimated, 0);
  const totalDebtsActual = debtsCategories.reduce((sum, c) => sum + c.actual, 0);

  const budgetAllocated = totalNeedsEstimated + totalDesiresEstimated + totalSavingsEstimated + totalInvestmentsEstimated;
  const pendingToAllocate = totalIncomeActual - debtContribution - budgetAllocated;
  const totalSpent = totalNeedsActual + totalDesiresActual;
  const availableToSpend = budgetAllocated - totalSpent;

  const monthNames = config.language === 'es' 
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
    : ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  const monthIndex = month ? parseInt(month) - 1 : 0;
  const yearNumber = year ? parseInt(year) : new Date().getFullYear();

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
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {monthNames[monthIndex]} {yearNumber}
          </h1>
          <p className="text-muted-foreground">{t.monthlyBudget}</p>
        </div>

        {/* Monthly Goal */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t.myGoalForThisMonth}</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={monthlyGoal}
              onChange={(e) => setMonthlyGoal(e.target.value)}
              onBlur={saveMonthlyBudget}
              placeholder="Escribe tu meta principal para este mes..."
              className="min-h-[60px]"
            />
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Previous Month Balance */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.fromPreviousMonth}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Input
                  type="number"
                  value={previousBalance}
                  onChange={(e) => setPreviousBalance(parseFloat(e.target.value) || 0)}
                  onBlur={saveMonthlyBudget}
                  className="flex-1"
                />
                <span className="text-muted-foreground">{currencySymbol}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="add-previous"
                  checked={addPreviousBalance}
                  onCheckedChange={(checked) => {
                    setAddPreviousBalance(checked as boolean);
                    setTimeout(saveMonthlyBudget, 100);
                  }}
                />
                <Label htmlFor="add-previous">{t.addToThisMonth}</Label>
              </div>
            </CardContent>
          </Card>

          {/* Budget Creation Method */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t.thisMonthBudget}</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={budgetFromScratch ? 'scratch' : 'copy'}
                onValueChange={(value) => {
                  setBudgetFromScratch(value === 'scratch');
                  setTimeout(saveMonthlyBudget, 100);
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="scratch" id="scratch" />
                  <Label htmlFor="scratch">{t.fromScratch}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="copy" id="copy" />
                  <Label htmlFor="copy">{t.copyPreviousMonth}</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Income Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.myIncome}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t.concept}</TableHead>
                  <TableHead className="text-right">{t.estimated}</TableHead>
                  <TableHead className="text-right">{t.actual}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.concept}</TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.estimated}
                        onChange={(e) => {
                          const newItems = [...incomeItems];
                          newItems[index].estimated = parseFloat(e.target.value) || 0;
                          setIncomeItems(newItems);
                        }}
                        onBlur={saveMonthlyBudget}
                        className="w-24 ml-auto text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <Input
                        type="number"
                        value={item.actual}
                        onChange={(e) => {
                          const newItems = [...incomeItems];
                          newItems[index].actual = parseFloat(e.target.value) || 0;
                          setIncomeItems(newItems);
                        }}
                        onBlur={saveMonthlyBudget}
                        className="w-24 ml-auto text-right"
                      />
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell>{t.total}</TableCell>
                  <TableCell className="text-right">
                    {currencySymbol} {totalIncomeEstimated.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    {currencySymbol} {totalIncomeActual.toFixed(2)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Budget Summary */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t.totalIncome}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currencySymbol} {totalIncomeActual.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t.debtContribution}</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                value={debtContribution}
                onChange={(e) => setDebtContribution(parseFloat(e.target.value) || 0)}
                onBlur={saveMonthlyBudget}
                className="text-2xl font-bold h-auto p-2"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t.allocatedForBudget}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currencySymbol} {budgetAllocated.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t.pendingToAllocate}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold ${pendingToAllocate < 0 ? 'text-destructive' : 'text-primary'}`}>
                {currencySymbol} {pendingToAllocate.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t.availableToSpend}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currencySymbol} {availableToSpend.toFixed(2)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">{t.spentSoFar}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{currencySymbol} {totalSpent.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Categories Tables */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          {/* Needs */}
          <CategoryTable
            title={t.needs}
            categories={needsCategories}
            type="needs"
            currencySymbol={currencySymbol}
            onUpdate={updateCategory}
            onAdd={(name) => addCategory('needs', name)}
            t={t}
          />

          {/* Desires */}
          <CategoryTable
            title={t.desires}
            categories={desiresCategories}
            type="desires"
            currencySymbol={currencySymbol}
            onUpdate={updateCategory}
            onAdd={(name) => addCategory('desires', name)}
            t={t}
          />

          {/* Savings */}
          <CategoryTable
            title={t.savings}
            categories={savingsCategories}
            type="savings"
            currencySymbol={currencySymbol}
            onUpdate={updateCategory}
            onAdd={(name) => addCategory('savings', name)}
            t={t}
          />

          {/* Investments */}
          <CategoryTable
            title={t.investments}
            categories={investmentsCategories}
            type="investments"
            currencySymbol={currencySymbol}
            onUpdate={updateCategory}
            onAdd={(name) => addCategory('investments', name)}
            t={t}
          />

          {/* Debts */}
          <CategoryTable
            title={t.debts}
            categories={debtsCategories}
            type="debts"
            currencySymbol={currencySymbol}
            onUpdate={updateCategory}
            onAdd={(name) => addCategory('debts', name)}
            t={t}
          />
        </div>

        {/* Transactions Registry */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{t.transactionRegistry}</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionForm onAdd={addTransaction} currencySymbol={currencySymbol} t={t} />
            <div className="mt-6">
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">{t.noTransactionsYet}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t.category}</TableHead>
                      <TableHead>{t.amount}</TableHead>
                      <TableHead>{t.date}</TableHead>
                      <TableHead>{t.concept}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{currencySymbol} {transaction.amount.toFixed(2)}</TableCell>
                        <TableCell>{new Date(transaction.transaction_date).toLocaleDateString()}</TableCell>
                        <TableCell>{transaction.concept}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Budget 50/30/20 */}
        <Card>
          <CardHeader>
            <CardTitle>{t.currentBudget}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <BudgetProgressRow
                label={t.needs}
                used={totalNeedsActual}
                total={totalIncomeActual}
                remaining={totalNeedsEstimated - totalNeedsActual}
                currencySymbol={currencySymbol}
                color="needs"
              />
              <BudgetProgressRow
                label={t.desires}
                used={totalDesiresActual}
                total={totalIncomeActual}
                remaining={totalDesiresEstimated - totalDesiresActual}
                currencySymbol={currencySymbol}
                color="desires"
              />
              <BudgetProgressRow
                label={t.future}
                used={totalSavingsActual + totalInvestmentsActual}
                total={totalIncomeActual}
                remaining={(totalSavingsEstimated + totalInvestmentsEstimated) - (totalSavingsActual + totalInvestmentsActual)}
                currencySymbol={currencySymbol}
                color="future"
              />
              <BudgetProgressRow
                label={t.debts}
                used={totalDebtsActual}
                total={totalIncomeActual}
                remaining={debtContribution - totalDebtsActual}
                currencySymbol={currencySymbol}
                color="debt"
              />
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

// Helper Components
const CategoryTable = ({ 
  title, 
  categories, 
  type, 
  currencySymbol, 
  onUpdate, 
  onAdd,
  t 
}: { 
  title: string; 
  categories: BudgetCategoryItem[]; 
  type: string; 
  currencySymbol: string;
  onUpdate: (id: string, field: 'estimated' | 'actual', value: number, type: string) => void;
  onAdd: (name: string) => void;
  t: any;
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const totalEstimated = categories.reduce((sum, c) => sum + c.estimated, 0);
  const totalActual = categories.reduce((sum, c) => sum + c.actual, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.category}</TableHead>
              <TableHead className="text-right">{t.estimated}</TableHead>
              <TableHead className="text-right">{t.actual}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>{category.category_name}</TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={category.estimated}
                    onChange={(e) => onUpdate(category.id!, 'estimated', parseFloat(e.target.value) || 0, type)}
                    className="w-24 ml-auto text-right"
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Input
                    type="number"
                    value={category.actual}
                    onChange={(e) => onUpdate(category.id!, 'actual', parseFloat(e.target.value) || 0, type)}
                    className="w-24 ml-auto text-right"
                  />
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="font-bold">
              <TableCell>{t.total}</TableCell>
              <TableCell className="text-right">{currencySymbol} {totalEstimated.toFixed(2)}</TableCell>
              <TableCell className="text-right">{currencySymbol} {totalActual.toFixed(2)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <div className="flex gap-2 mt-4">
          <Input
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Nueva categoría..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && newCategoryName.trim()) {
                onAdd(newCategoryName);
                setNewCategoryName('');
              }
            }}
          />
          <Button
            size="sm"
            onClick={() => {
              if (newCategoryName.trim()) {
                onAdd(newCategoryName);
                setNewCategoryName('');
              }
            }}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TransactionForm = ({ onAdd, currencySymbol, t }: { onAdd: (transaction: Omit<Transaction, 'id'>) => void; currencySymbol: string; t: any }) => {
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [concept, setConcept] = useState('');

  const handleSubmit = () => {
    if (!category || !amount || !date || !concept) return;

    onAdd({
      category,
      amount: parseFloat(amount),
      transaction_date: date,
      concept,
    });

    setCategory('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setConcept('');
  };

  return (
    <div className="grid gap-4 md:grid-cols-5">
      <Input
        placeholder={t.category}
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />
      <Input
        type="number"
        placeholder={t.amount}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <Input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
      <Input
        placeholder={t.concept}
        value={concept}
        onChange={(e) => setConcept(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
      />
      <Button onClick={handleSubmit} className="w-full">
        <Plus className="h-4 w-4 mr-2" /> {t.add}
      </Button>
    </div>
  );
};

const BudgetProgressRow = ({
  label,
  used,
  total,
  remaining,
  currencySymbol,
  color,
}: {
  label: string;
  used: number;
  total: number;
  remaining: number;
  currencySymbol: string;
  color: string;
}) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{percentage.toFixed(1)}%</span>
      </div>
      <Progress value={percentage} className={`bg-${color}/20`} />
      <div className="flex justify-between mt-1 text-sm">
        <span>{currencySymbol} {used.toFixed(2)}</span>
        <span className="text-muted-foreground">{currencySymbol} {remaining.toFixed(2)} restante</span>
      </div>
    </div>
  );
};

export default MonthlyBudget;