import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Save, ChevronDown, Eye, EyeOff, HelpCircle, Pencil, Check, ChevronsUpDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { DatePicker } from '@/components/ui/date-picker';
import { getMonthName, getTableName } from '@/utils/monthUtils';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { BudgetPieChart } from '@/components/charts/BudgetPieChart';
import { VirtualizedTable } from '@/components/ui/VirtualizedTable';
const MonthlyBudget = () => {
  const {
    year,
    month
  } = useParams<{
    year: string;
    month: string;
  }>();
  const navigate = useNavigate();
  const {
    config
  } = useApp();
  const t = translations[config.language];
  const {
    toast
  } = useToast();
  const [loading, setLoading] = useState(true);
  const [monthId, setMonthId] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [currentYear, setCurrentYear] = useState<number>(new Date().getFullYear());

  // Settings
  const [challenge, setChallenge] = useState('');
  const [carryover, setCarryover] = useState(0);
  const [budgetMode, setBudgetMode] = useState<'ZERO_BASED' | 'COPY_PREVIOUS'>('ZERO_BASED');
  const [unassignedPool, setUnassignedPool] = useState(0);

  // Income
  const [incomeItems, setIncomeItems] = useState<any[]>([]);

  // Budget categories
  const [categories, setCategories] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  // Transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [debts, setDebts] = useState<any[]>([]);
  const [financialGoals, setFinancialGoals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  // Wishlist
  const [wishlist, setWishlist] = useState<any[]>([]);

  // Collapsible states
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [incomeOpen, setIncomeOpen] = useState(false);
  const [budgetOpen, setBudgetOpen] = useState(true);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [debtsOpen, setDebtsOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);

  // Data masking state
  const [dataMasked, setDataMasked] = useState(false);

  // Edit states
  const [editTransactionDialog, setEditTransactionDialog] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [editIncomeDialog, setEditIncomeDialog] = useState(false);
  const [editingIncome, setEditingIncome] = useState<any>(null);
  const [editDebtDialog, setEditDebtDialog] = useState(false);
  const [editingDebt, setEditingDebt] = useState<any>(null);
  const [editWishDialog, setEditWishDialog] = useState(false);
  const [editingWish, setEditingWish] = useState<any>(null);

  // Combobox states
  const [editCategoryComboOpen, setEditCategoryComboOpen] = useState(false);

  useEffect(() => {
    const handleRefresh = () => {
      loadMonthData(monthId, currentMonth);
    };

    window.addEventListener('transaction-added', handleRefresh);
    return () => {
      window.removeEventListener('transaction-added', handleRefresh);
    };
  }, [monthId, currentMonth]);

  useEffect(() => {
    const monthNum = parseInt(month || '1');
    const yearNum = parseInt(year || String(new Date().getFullYear()));
    setCurrentMonth(monthNum);
    setCurrentYear(yearNum);
    loadMonthData();

    const handleBudgetUpdate = (event: CustomEvent) => {
      loadMonthData();
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.transactionId) {
        // Wait for data to reload then scroll and highlight
        setTimeout(() => {
          const element = document.getElementById(`txn-${customEvent.detail.transactionId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-yellow-100', 'dark:bg-yellow-900/30', 'transition-colors', 'duration-1000');
            setTimeout(() => {
              element.classList.remove('bg-yellow-100', 'dark:bg-yellow-900/30');
            }, 3000);
          }
        }, 1000); // Delay to allow fetch and render
      }
    };

    window.addEventListener('budget-update', handleBudgetUpdate);
    return () => {
      window.removeEventListener('budget-update', handleBudgetUpdate);
    };
  }, [year, month]);
  const loadMonthData = async () => {
    try {
      const userResponse = (await supabase.auth.getUser()) as any;
      const user = userResponse.data?.user;
      if (!user) {
        navigate('/auth');
        return;
      }
      setUserId(user.id);

      // Get month number from URL params
      const monthNum = parseInt(month || '1');

      // Get month record - use id directly since months table has id = 1-12 for each month
      const monthResponse = await (supabase as any).from('months').select('id, name, year').eq('id', monthNum).single();
      const monthData = monthResponse.data;
      if (!monthData) {
        toast({
          title: 'Error',
          description: 'Month not found',
          variant: 'destructive'
        });
        return;
      }
      setMonthId(monthData.id);

      // Load all data for the month - pass monthNum directly instead of using state
      await Promise.all([loadSettings(monthData.id, monthNum), loadIncome(monthData.id, monthNum), loadBudget(monthData.id, monthNum, user.id), loadTransactions(monthData.id, user.id, monthNum), loadDebts(monthData.id, user.id, monthNum), loadWishlist(monthData.id, monthNum), loadCategories(), loadPaymentMethods(), loadAccounts(), loadFinancialGoals(user.id)]);
    } catch (error) {
      console.error('Error loading month data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const loadSettings = async (monthId: number, monthNum: number) => {
    const tableName = getTableName('monthly_settings', monthNum) as any;
    const {
      data
    } = await (supabase as any).from(tableName).select('*').eq('month_id', monthId).maybeSingle();
    if (data) {
      setChallenge(data.monthly_challenge || '');
      setCarryover(Number(data.carryover_prev_balance) || 0);
      setBudgetMode(data.budget_mode as 'ZERO_BASED' | 'COPY_PREVIOUS' || 'ZERO_BASED');
      setUnassignedPool(Number(data.unassigned_pool) || 0);
    }
  };
  const loadIncome = async (monthId: number, monthNum: number) => {
    const tableName = getTableName('monthly_income', monthNum) as any;
    const {
      data
    } = await supabase.from(tableName).select('*').eq('month_id', monthId).order('date', {
      ascending: false
    });
    setIncomeItems(data || []);
  };
  const loadBudget = async (monthId: number, monthNum: number, uid?: string) => {
    const { data, error } = await (supabase as any)
      .rpc('get_user_budget', { p_user_id: uid || userId, p_month_id: monthId });
    if (error) console.error('Error loading budget:', error);

    // If no budget items exist, create them from categories
    if (!data || data.length === 0) {
      const userIdToUse = uid || userId;
      if (userIdToUse) {
        const {
          data: allCategories
        } = await supabase.from('categories').select('*').eq('is_active', true);
        if (allCategories && allCategories.length > 0) {
          // De-duplicate categories by name and emoji
          const uniqueCategories = allCategories.filter((cat, index, self) =>
            index === self.findIndex((c) =>
              c.name === cat.name && c.emoji === cat.emoji
            )
          );

          const tableName = getTableName('monthly_budget', monthNum) as any;
          const budgetEntries = uniqueCategories.map(cat => ({
            month_id: monthId,
            user_id: userIdToUse,
            category_id: cat.id,
            bucket_50_30_20: cat.bucket_50_30_20,
            planned_amount: cat.monthly_budget || 0,
            spent_amount: 0,
            variance: 0
          }));
          await supabase.from(tableName).insert(budgetEntries);

          // Reload after inserting
          const { data: newData } = await (supabase as any)
            .rpc('get_user_budget', { p_user_id: userIdToUse, p_month_id: monthId });
          setBudgetItems(newData || []);
          return;
        }
      }
    }
    setBudgetItems(data || []);
  };
  const loadTransactions = async (monthId: number, uid: string, monthNum: number) => {
    const { data, error } = await (supabase as any)
      .rpc('get_user_transactions', { p_user_id: uid, p_month_id: monthId });
    if (error) console.error('Error loading transactions:', error);
    setTransactions(data || []);
  };
  const loadDebts = async (monthId: number, uid: string, monthNum: number) => {
    const { data, error } = await (supabase as any)
      .rpc('get_user_debts', { p_user_id: uid, p_month_id: monthId });
    if (error) console.error('Error loading debts:', error);
    setDebts(data || []);
  };
  const loadWishlist = async (monthId: number, monthNum: number) => {
    const tableName = getTableName('monthly_wishlist', monthNum) as any;
    const {
      data
    } = await supabase.from(tableName).select('*').eq('month_id', monthId);
    setWishlist(data || []);
  };
  const loadCategories = async () => {
    const {
      data
    } = await supabase.from('categories').select('*').eq('is_active', true);

    // Remove duplicates by keeping only the first occurrence of each name+emoji combination
    const uniqueCategories = data ? data.filter((category, index, self) =>
      index === self.findIndex((c) =>
        c.name === category.name && c.emoji === category.emoji
      )
    ) : [];

    setCategories(uniqueCategories);
  };
  const loadPaymentMethods = async () => {
    const {
      data
    } = await supabase.from('payment_methods').select('*');
    setPaymentMethods(data || []);
  };
  const loadAccounts = async () => {
    const {
      data: {
        user
      }
    } = await supabase.auth.getUser();
    if (!user) return;
    const {
      data
    } = await supabase.from('accounts').select('*').eq('user_id', user.id);
    setAccounts(data || []);
  };
  const loadFinancialGoals = async (uid: string) => {
    const {
      data,
      error
    } = await supabase.from('financial_goals').select('*').eq('user_id', uid).eq('is_completed', false);
    if (error) console.error('Error loading financial goals:', error);
    setFinancialGoals(data || []);
  };
  const saveSettings = async () => {
    const tableName = getTableName('monthly_settings', currentMonth) as any;
    const {
      data: existing
    } = await (supabase as any).from(tableName).select('id').eq('month_id', monthId).maybeSingle();
    const settingsData: any = {
      month_id: monthId,
      user_id: userId,
      monthly_challenge: challenge,
      carryover_prev_balance: carryover,
      budget_mode: budgetMode,
      unassigned_pool: unassignedPool
    };
    if (existing) {
      await supabase.from(tableName).update(settingsData).eq('id', existing.id);
    } else {
      await supabase.from(tableName).insert([settingsData]);
    }
    toast({
      title: 'Guardado',
      description: 'Configuración guardada'
    });
  };
  // Helper function to get transaction type name in Spanish
  const getTransactionTypeName = (type: 'income' | 'transaction' | 'debt' | 'wishlist') => {
    const names = {
      'income': 'ingreso',
      'transaction': 'gasto',
      'debt': 'deuda',
      'wishlist': 'deseo'
    };
    return names[type];
  };

  const deleteIncome = async (id: string) => {
    const tableName = getTableName('monthly_income', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadIncome(monthId, currentMonth);
    toast({
      title: 'Eliminado',
      description: 'Ingreso eliminado'
    });
  };
  const updateIncome = async () => {
    if (!editingIncome) return;
    const tableName = getTableName('monthly_income', currentMonth) as any;
    await supabase.from(tableName).update({
      source: editingIncome.source,
      amount: editingIncome.amount,
      date: editingIncome.date
    }).eq('id', editingIncome.id);
    setEditIncomeDialog(false);
    setEditingIncome(null);
    loadIncome(monthId, currentMonth);
    toast({
      title: 'Actualizado',
      description: 'Ingreso actualizado'
    });
  };
  const updateBudgetItem = async (id: string, field: string, value: number) => {
    const tableName = getTableName('monthly_budget', currentMonth) as any;
    await supabase.from(tableName).update({
      [field]: value
    }).eq('id', id);
    loadBudget(monthId, currentMonth);
  };
  const deleteTransaction = async (id: string) => {
    const tableName = getTableName('monthly_transactions', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadTransactions(monthId, userId, currentMonth);
    toast({
      title: 'Eliminado',
      description: 'Transacción eliminada'
    });
  };
  const updateTransaction = async () => {
    if (!editingTransaction) return;
    const tableName = getTableName('monthly_transactions', currentMonth) as any;
    await supabase.from(tableName).update({
      category_id: editingTransaction.category_id,
      description: editingTransaction.description,
      amount: -Math.abs(editingTransaction.amount),
      date: editingTransaction.date,
      payment_method_id: editingTransaction.payment_method_id || null,
      account_id: editingTransaction.account_id || null
    }).eq('id', editingTransaction.id);
    setEditTransactionDialog(false);
    setEditingTransaction(null);
    setEditCategoryComboOpen(false);
    loadTransactions(monthId, userId, currentMonth);
    toast({
      title: 'Actualizado',
      description: 'Transacción actualizada'
    });
  };
  const deleteDebt = async (id: string) => {
    const tableName = getTableName('monthly_debts', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadDebts(monthId, userId, currentMonth);
    toast({
      title: 'Eliminado',
      description: 'Deuda eliminada'
    });
  };
  const updateDebt = async () => {
    if (!editingDebt) return;
    const tableName = getTableName('monthly_debts', currentMonth) as any;
    await supabase.from(tableName).update({
      debt_account_id: editingDebt.debt_account_id,
      starting_balance: editingDebt.starting_balance,
      interest_rate_apr: editingDebt.interest_rate_apr,
      payment_made: editingDebt.payment_made,
      min_payment: editingDebt.min_payment
    }).eq('id', editingDebt.id);
    setEditDebtDialog(false);
    setEditingDebt(null);
    loadDebts(monthId, userId, currentMonth);
    toast({
      title: 'Actualizado',
      description: 'Deuda actualizada'
    });
  };
  const deleteWish = async (id: string) => {
    const tableName = getTableName('monthly_wishlist', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadWishlist(monthId, currentMonth);
    toast({
      title: 'Eliminado',
      description: 'Deseo eliminado'
    });
  };
  const updateWish = async () => {
    if (!editingWish) return;
    const tableName = getTableName('monthly_wishlist', currentMonth) as any;
    await supabase.from(tableName).update({
      item: editingWish.item,
      estimated_cost: editingWish.estimated_cost,
      priority: String(editingWish.priority)
    }).eq('id', editingWish.id);
    setEditWishDialog(false);
    setEditingWish(null);
    loadWishlist(monthId, currentMonth);
    toast({
      title: 'Actualizado',
      description: 'Deseo actualizado'
    });
  };
  const formatCurrency = (amount: number) => {
    if (dataMasked) {
      return '••••••';
    }
    const symbol = config.currency === 'EUR' ? '€' : '$';
    return `${symbol}${Math.abs(amount).toFixed(2)}`;
  };
  const totalIncome = incomeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = transactions.reduce((sum, txn) => sum + Math.abs(Number(txn.amount || 0)), 0);
  const netCashFlow = totalIncome - totalExpenses;

  // Calculate actual spending per category from transactions
  const getActualByCategory = (categoryId: string) => {
    return transactions.filter(txn => txn.category_id === categoryId).reduce((sum, txn) => sum + Math.abs(Number(txn.amount || 0)), 0);
  };

  // Enrich budget items with calculated actual values
  const enrichBudgetItems = (items: any[]) => {
    return items.map(item => {
      const actual = getActualByCategory(item.category_id);
      return {
        ...item,
        calculatedActual: actual,
        calculatedDifference: (item.planned_amount || 0) - actual
      };
    });
  };
  // De-duplicate budget items for the UI by category name and emoji
  const uniqueBudgetItems = budgetItems.reduce((acc: any[], current) => {
    const isDuplicate = acc.some(item =>
      (item.category_name || item.categories?.name) === (current.category_name || current.categories?.name) &&
      (item.category_emoji || item.categories?.emoji) === (current.category_emoji || current.categories?.emoji)
    );
    if (!isDuplicate) {
      acc.push(current);
    }
    return acc;
  }, []);

  const needsBudget = enrichBudgetItems(uniqueBudgetItems.filter(b => (b.bucket_50_30_20 || b.categories?.bucket_50_30_20) === 'NEEDS'));
  const wantsBudget = enrichBudgetItems(uniqueBudgetItems.filter(b => (b.bucket_50_30_20 || b.categories?.bucket_50_30_20) === 'WANTS'));
  const futureBudget = enrichBudgetItems(uniqueBudgetItems.filter(b => (b.bucket_50_30_20 || b.categories?.bucket_50_30_20) === 'FUTURE'));

  // Calculate totals for charts
  const needsActual = needsBudget.reduce((sum, item) => sum + (item.calculatedActual || 0), 0);
  const wantsActual = wantsBudget.reduce((sum, item) => sum + (item.calculatedActual || 0), 0);
  const futureActual = futureBudget.reduce((sum, item) => sum + (item.calculatedActual || 0), 0);
  if (loading) {
    return <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">Cargando...</div>
      </main>
    </div>;
  }
  return <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {getMonthName(currentMonth, config.language)} {currentYear}
          </h1>
          <p className="text-muted-foreground">Presupuesto mensual detallado</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setDataMasked(!dataMasked)} className="h-10 w-10" title={dataMasked ? 'Mostrar datos' : 'Ocultar datos'}>
          {dataMasked ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Suma de todos los ingresos registrados para este mes, incluyendo salario, bonos y otras fuentes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Suma de todos los gastos registrados en este mes.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">Diferencia entre ingresos y gastos. Un valor positivo indica ahorro, negativo indica déficit.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary-dark">{formatCurrency(netCashFlow)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <IncomeExpenseChart income={totalIncome} expenses={totalExpenses} currency={config.currency} language={config.language} masked={dataMasked} incomeItems={incomeItems.map(item => ({
          date: item.date,
          amount: item.amount
        }))} transactionItems={transactions.map(txn => ({
          date: txn.date,
          amount: txn.amount
        }))} />
        <BudgetPieChart needsActual={needsActual} wantsActual={wantsActual} futureActual={futureActual} totalIncome={totalIncome} currency={config.currency} language={config.language} masked={dataMasked} />
      </div>

      {/* Settings */}
      <Collapsible open={settingsOpen} onOpenChange={setSettingsOpen} className="mb-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Configuración del Mes</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Define tu reto mensual, saldo inicial del mes anterior, modo de presupuesto y monto no asignado.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${settingsOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div>
                <Label>Mi mayor reto para este mes</Label>
                <Input value={challenge} onChange={e => setChallenge(e.target.value)} placeholder="Escribe tu reto..." />
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Saldo del mes anterior</Label>
                  <Input type="number" value={carryover} onChange={e => setCarryover(Number(e.target.value))} />
                </div>
                <div>
                  <Label>Modo de presupuesto</Label>
                  <Select value={budgetMode} onValueChange={(v: any) => setBudgetMode(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZERO_BASED">Desde cero</SelectItem>
                      <SelectItem value="COPY_PREVIOUS">Copiar del mes anterior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Monto no asignado</Label>
                  <Input type="number" value={unassignedPool} onChange={e => setUnassignedPool(Number(e.target.value))} />
                </div>
              </div>
              <Button onClick={saveSettings}>
                <Save className="w-4 h-4 mr-2" />
                Guardar Configuración
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Budget 50/30/20 */}
      <Collapsible open={budgetOpen} onOpenChange={setBudgetOpen} className="mb-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Presupuesto 50/30/20</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Metodología de presupuesto: 50% para necesidades, 30% para deseos y 20% para ahorro/futuro. Define montos estimados y compara con gastos reales.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${budgetOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Tabs defaultValue="needs" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="needs" className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-needs" />
                    Necesidades
                  </TabsTrigger>
                  <TabsTrigger value="wants" className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-desires" />
                    Deseos
                  </TabsTrigger>
                  <TabsTrigger value="future" className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-future" />
                    Futuro
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="needs">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Categoría</TableHead>
                        <TableHead className="text-center">Estimado</TableHead>
                        <TableHead className="text-center">Real</TableHead>
                        <TableHead className="text-center">Diferencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {needsBudget.map(item => <TableRow key={item.id}>
                        <TableCell className="text-center"><span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm">{item.category_emoji || item.categories?.emoji} {item.category_name || item.categories?.name}</span></TableCell>
                        <TableCell className="text-center">
                          <Input type="number" className="w-24 text-center mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.planned_amount || 0} onChange={e => updateBudgetItem(item.id, 'planned_amount', Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="text-center">{formatCurrency(item.calculatedActual || 0)}</TableCell>
                        <TableCell className="text-center text-primary">
                          {formatCurrency(item.calculatedDifference || 0)}
                        </TableCell>
                      </TableRow>)}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="wants">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Categoría</TableHead>
                        <TableHead className="text-center">Estimado</TableHead>
                        <TableHead className="text-center">Real</TableHead>
                        <TableHead className="text-center">Diferencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wantsBudget.map(item => <TableRow key={item.id}>
                        <TableCell className="text-center"><span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm">{item.category_emoji || item.categories?.emoji} {item.category_name || item.categories?.name}</span></TableCell>
                        <TableCell className="text-center">
                          <Input type="number" className="w-24 text-center mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.planned_amount || 0} onChange={e => updateBudgetItem(item.id, 'planned_amount', Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="text-center">{formatCurrency(item.calculatedActual || 0)}</TableCell>
                        <TableCell className="text-center text-primary">
                          {formatCurrency(item.calculatedDifference || 0)}
                        </TableCell>
                      </TableRow>)}
                    </TableBody>
                  </Table>
                </TabsContent>

                <TabsContent value="future">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-center">Categoría</TableHead>
                        <TableHead className="text-center">Estimado</TableHead>
                        <TableHead className="text-center">Real</TableHead>
                        <TableHead className="text-center">Diferencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {futureBudget.map(item => <TableRow key={item.id}>
                        <TableCell className="text-center"><span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm">{item.category_emoji || item.categories?.emoji} {item.category_name || item.categories?.name}</span></TableCell>
                        <TableCell className="text-center">
                          <Input type="number" className="w-24 text-center mx-auto [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" value={item.planned_amount || 0} onChange={e => updateBudgetItem(item.id, 'planned_amount', Number(e.target.value))} />
                        </TableCell>
                        <TableCell className="text-center">{formatCurrency(item.calculatedActual || 0)}</TableCell>
                        <TableCell className="text-center text-primary">
                          {formatCurrency(item.calculatedDifference || 0)}
                        </TableCell>
                      </TableRow>)}
                    </TableBody>
                  </Table>
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Income */}
      <Collapsible open={incomeOpen} onOpenChange={setIncomeOpen} className="mb-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Ingresos</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Registra todas tus fuentes de ingreso del mes: salario, freelance, inversiones, etc.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${incomeOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fuente</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Monto</TableHead>
                    <TableHead className="text-center">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incomeItems.map(item => <TableRow key={item.id}>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex gap-1 justify-center">
                        <Button size="sm" variant="ghost" onClick={() => {
                          setEditingIncome(item);
                          setEditIncomeDialog(true);
                        }}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => deleteIncome(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>)}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Transactions */}
      <Collapsible open={transactionsOpen} onOpenChange={setTransactionsOpen} className="mb-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Gastos</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Registro detallado de todos tus gastos del mes. Cada gasto se asigna a una categoría para el análisis.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${transactionsOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Categoría</TableHead>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                      <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                {transactions.length > 0 ? (
                  <VirtualizedTable
                    data={transactions}
                    rowHeight={60}
                    containerHeight={Math.min(transactions.length * 60, 400)}
                    renderRow={(txn) => (
                      <div
                        id={`txn-${txn.id}`}
                        className="grid grid-cols-5 border-b border-border hover:bg-muted/50 transition-colors"
                        style={{ minHeight: '60px' }}
                      >
                        <div className="px-4 py-3 flex items-center text-sm">{txn.date}</div>
                        <div className="px-4 py-3 flex items-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-sm">
                            {txn.category_emoji || txn.categories?.emoji} {txn.category_name || txn.categories?.name}
                          </span>
                        </div>
                        <div className="px-4 py-3 flex items-center text-sm">
                          {txn.description}
                          {txn.goal_id && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              🎯 Meta
                            </span>
                          )}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-end text-sm text-desires">
                          {formatCurrency(txn.amount)}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-center">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingTransaction(txn);
                                setEditTransactionDialog(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteTransaction(txn.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No hay transacciones registradas
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Debts */}
      <Collapsible open={debtsOpen} onOpenChange={setDebtsOpen} className="mb-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Deudas</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Seguimiento de préstamos y deudas. Registra pagos realizados para ver el progreso en la reducción de saldos.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${debtsOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuenta</TableHead>
                      <TableHead className="text-right">Saldo Inicial</TableHead>
                      <TableHead className="text-right">Interés APR</TableHead>
                      <TableHead className="text-right">Pago</TableHead>
                      <TableHead className="text-right">Saldo Final</TableHead>
                      <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                {debts.length > 0 ? (
                  <VirtualizedTable
                    data={debts}
                    rowHeight={60}
                    containerHeight={Math.min(debts.length * 60, 300)}
                    renderRow={(debt) => (
                      <div
                        className="grid grid-cols-6 border-b border-border hover:bg-muted/50 transition-colors"
                        style={{ minHeight: '60px' }}
                      >
                        <div className="px-4 py-3 flex items-center text-sm">
                          {accounts.find(a => a.id === debt.debt_account_id)?.name}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-end text-sm">
                          {formatCurrency(debt.starting_balance)}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-end text-sm">
                          {debt.interest_rate_apr}%
                        </div>
                        <div className="px-4 py-3 flex items-center justify-end text-sm">
                          {formatCurrency(debt.payment_made)}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-end text-sm">
                          {formatCurrency(debt.ending_balance)}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-center">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingDebt(debt);
                                setEditDebtDialog(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteDebt(debt.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No hay deudas registradas
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Wishlist */}
      <Collapsible open={wishlistOpen} onOpenChange={setWishlistOpen} className="mb-8">
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CardTitle>Lista de Deseos</CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="max-w-xs">Artículos o experiencias que deseas adquirir. Prioriza y planifica tus compras futuras.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <ChevronDown className={`h-5 w-5 transition-transform ${wishlistOpen ? 'rotate-180' : ''}`} />
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artículo</TableHead>
                      <TableHead className="text-right">Costo Estimado</TableHead>
                      <TableHead className="text-center">Prioridad</TableHead>
                      <TableHead className="text-center">Acción</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                {wishlist.length > 0 ? (
                  <VirtualizedTable
                    data={wishlist}
                    rowHeight={60}
                    containerHeight={Math.min(wishlist.length * 60, 300)}
                    renderRow={(wish) => (
                      <div
                        className="grid grid-cols-4 border-b border-border hover:bg-muted/50 transition-colors"
                        style={{ minHeight: '60px' }}
                      >
                        <div className="px-4 py-3 flex items-center text-sm">
                          {wish.item}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-end text-sm">
                          {formatCurrency(wish.estimated_cost)}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-center text-sm">
                          {wish.priority}
                        </div>
                        <div className="px-4 py-3 flex items-center justify-center">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingWish(wish);
                                setEditWishDialog(true);
                              }}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => deleteWish(wish.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  />
                ) : (
                  <div className="p-4 text-center text-muted-foreground text-sm">
                    No hay artículos en la lista de deseos
                  </div>
                )}
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </main>

    {/* Edit Transaction Dialog */}
    <Dialog open={editTransactionDialog} onOpenChange={setEditTransactionDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Gasto</DialogTitle>
          <DialogDescription>
            Modifica los detalles de este gasto.
          </DialogDescription>
        </DialogHeader>
        {editingTransaction && <div className="space-y-4">
          <div>
            <Label>Categoría</Label>
            <Popover open={editCategoryComboOpen} onOpenChange={setEditCategoryComboOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={editCategoryComboOpen}
                  className="w-full justify-between"
                >
                  {editingTransaction.category_id
                    ? (() => {
                      const cat = categories.find(c => c.id === editingTransaction.category_id);
                      return cat ? `${cat.emoji} ${cat.name}` : "Seleccionar categoría...";
                    })()
                    : "Seleccionar categoría..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput placeholder="Buscar categoría..." />
                  <CommandList>
                    <CommandEmpty>No se encontró la categoría.</CommandEmpty>
                    <CommandGroup>
                      {categories.map(cat => (
                        <CommandItem
                          key={cat.id}
                          value={`${cat.emoji} ${cat.name}`}
                          onSelect={() => {
                            setEditingTransaction({
                              ...editingTransaction,
                              category_id: cat.id
                            });
                            setEditCategoryComboOpen(false);
                          }}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${editingTransaction.category_id === cat.id ? "opacity-100" : "opacity-0"
                              }`}
                          />
                          {cat.emoji} {cat.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label htmlFor="edit-txn-description">Descripción</Label>
            <Input id="edit-txn-description" value={editingTransaction.description} onChange={e => setEditingTransaction({
              ...editingTransaction,
              description: e.target.value
            })} />
          </div>
          <div>
            <Label htmlFor="edit-txn-amount">Monto</Label>
            <Input id="edit-txn-amount" type="number" value={Math.abs(editingTransaction.amount)} onChange={e => setEditingTransaction({
              ...editingTransaction,
              amount: Number(e.target.value)
            })} />
          </div>
          <div>
            <Label>Fecha</Label>
            <DatePicker
              value={editingTransaction.date}
              onChange={(date) => setEditingTransaction({
                ...editingTransaction,
                date
              })}
              placeholder="Seleccionar fecha"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditTransactionDialog(false);
              setEditingTransaction(null);
              setEditCategoryComboOpen(false);
            }}>Cancelar</Button>
            <Button className="flex-1" onClick={updateTransaction}>Actualizar</Button>
          </div>
        </div>}
      </DialogContent>
    </Dialog>

    {/* Edit Income Dialog */}
    <Dialog open={editIncomeDialog} onOpenChange={setEditIncomeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Ingreso</DialogTitle>
          <DialogDescription>
            Modifica los detalles de este ingreso.
          </DialogDescription>
        </DialogHeader>
        {editingIncome && <div className="space-y-4">
          <div>
            <Label htmlFor="edit-income-source">Fuente</Label>
            <Input id="edit-income-source" value={editingIncome.source} onChange={e => setEditingIncome({
              ...editingIncome,
              source: e.target.value
            })} />
          </div>
          <div>
            <Label htmlFor="edit-income-amount">Monto</Label>
            <Input id="edit-income-amount" type="number" value={editingIncome.amount} onChange={e => setEditingIncome({
              ...editingIncome,
              amount: Number(e.target.value)
            })} />
          </div>
          <div>
            <Label>Fecha</Label>
            <DatePicker
              value={editingIncome.date}
              onChange={(date) => setEditingIncome({
                ...editingIncome,
                date
              })}
              placeholder="Seleccionar fecha"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditIncomeDialog(false);
              setEditingIncome(null);
            }}>Cancelar</Button>
            <Button className="flex-1" onClick={updateIncome}>Actualizar</Button>
          </div>
        </div>}
      </DialogContent>
    </Dialog>

    {/* Edit Debt Dialog */}
    <Dialog open={editDebtDialog} onOpenChange={setEditDebtDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Deuda</DialogTitle>
          <DialogDescription>
            Modifica la información de esta deuda.
          </DialogDescription>
        </DialogHeader>
        {editingDebt && <div className="space-y-4">
          <div>
            <Label>Cuenta de deuda</Label>
            <Select value={editingDebt.debt_account_id} onValueChange={v => setEditingDebt({
              ...editingDebt,
              debt_account_id: v
            })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.filter(a => a.type === 'CREDIT_CARD' || a.type === 'LOAN').map(acc => <SelectItem key={acc.id} value={acc.id}>
                  {acc.name}
                </SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-debt-balance">Saldo inicial</Label>
            <Input id="edit-debt-balance" type="number" value={editingDebt.starting_balance} onChange={e => setEditingDebt({
              ...editingDebt,
              starting_balance: Number(e.target.value)
            })} />
          </div>
          <div>
            <Label htmlFor="edit-debt-apr">Tasa de interés (APR %)</Label>
            <Input id="edit-debt-apr" type="number" value={editingDebt.interest_rate_apr} onChange={e => setEditingDebt({
              ...editingDebt,
              interest_rate_apr: Number(e.target.value)
            })} />
          </div>
          <div>
            <Label htmlFor="edit-debt-min-payment">Pago mínimo</Label>
            <Input id="edit-debt-min-payment" type="number" value={editingDebt.min_payment} onChange={e => setEditingDebt({
              ...editingDebt,
              min_payment: Number(e.target.value)
            })} />
          </div>
          <div>
            <Label htmlFor="edit-debt-payment">Pago realizado</Label>
            <Input id="edit-debt-payment" type="number" value={editingDebt.payment_made} onChange={e => setEditingDebt({
              ...editingDebt,
              payment_made: Number(e.target.value)
            })} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditDebtDialog(false);
              setEditingDebt(null);
            }}>Cancelar</Button>
            <Button className="flex-1" onClick={updateDebt}>Actualizar</Button>
          </div>
        </div>}
      </DialogContent>
    </Dialog>

    {/* Edit Wishlist Dialog */}
    <Dialog open={editWishDialog} onOpenChange={setEditWishDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Deseo</DialogTitle>
          <DialogDescription>
            Modifica los detalles de este item en tu lista de deseos.
          </DialogDescription>
        </DialogHeader>
        {editingWish && <div className="space-y-4">
          <div>
            <Label htmlFor="edit-wish-item">Artículo</Label>
            <Input id="edit-wish-item" value={editingWish.item} onChange={e => setEditingWish({
              ...editingWish,
              item: e.target.value
            })} />
          </div>
          <div>
            <Label htmlFor="edit-wish-cost">Costo estimado</Label>
            <Input id="edit-wish-cost" type="number" value={editingWish.estimated_cost} onChange={e => setEditingWish({
              ...editingWish,
              estimated_cost: Number(e.target.value)
            })} />
          </div>
          <div>
            <Label htmlFor="edit-wish-priority">Prioridad (1-5)</Label>
            <Input id="edit-wish-priority" type="number" min={1} max={5} value={editingWish.priority} onChange={e => setEditingWish({
              ...editingWish,
              priority: Number(e.target.value)
            })} />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => {
              setEditWishDialog(false);
              setEditingWish(null);
            }}>Cancelar</Button>
            <Button className="flex-1" onClick={updateWish}>Actualizar</Button>
          </div>
        </div>}
      </DialogContent>
    </Dialog>
  </div>;
};
export default MonthlyBudget;