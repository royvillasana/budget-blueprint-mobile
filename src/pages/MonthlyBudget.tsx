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
import { Plus, Trash2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { getMonthName, getTableName } from '@/utils/monthUtils';

const MonthlyBudget = () => {
  const { year, month } = useParams<{ year: string; month: string }>();
  const navigate = useNavigate();
  const { config } = useApp();
  const t = translations[config.language];
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [monthId, setMonthId] = useState<number>(0);
  const [userId, setUserId] = useState<string>('');
  const [currentMonth, setCurrentMonth] = useState<number>(1);
  const [currentYear, setCurrentYear] = useState<number>(2025);
  
  // Settings
  const [challenge, setChallenge] = useState('');
  const [carryover, setCarryover] = useState(0);
  const [budgetMode, setBudgetMode] = useState<'ZERO_BASED' | 'COPY_PREVIOUS'>('ZERO_BASED');
  const [unassignedPool, setUnassignedPool] = useState(0);

  // Income
  const [incomeItems, setIncomeItems] = useState<any[]>([]);
  const [newIncomeOpen, setNewIncomeOpen] = useState(false);
  const [newIncome, setNewIncome] = useState({ source: '', amount: 0, date: '' });

  // Budget categories
  const [categories, setCategories] = useState<any[]>([]);
  const [budgetItems, setBudgetItems] = useState<any[]>([]);

  // Transactions
  const [transactions, setTransactions] = useState<any[]>([]);
  const [newTxnOpen, setNewTxnOpen] = useState(false);
  const [newTxn, setNewTxn] = useState({ 
    category_id: '', 
    description: '', 
    amount: 0, 
    date: '',
    payment_method_id: '',
    account_id: ''
  });

  // Payment methods & accounts
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  // Debts
  const [debts, setDebts] = useState<any[]>([]);
  const [newDebtOpen, setNewDebtOpen] = useState(false);
  const [newDebt, setNewDebt] = useState({
    debt_account_id: '',
    starting_balance: 0,
    interest_rate_apr: 0,
    payment_made: 0,
    min_payment: 0,
  });

  // Wishlist
  const [wishlist, setWishlist] = useState<any[]>([]);
  const [newWishOpen, setNewWishOpen] = useState(false);
  const [newWish, setNewWish] = useState({ item: '', estimated_cost: 0, priority: 1 });

  useEffect(() => {
    const monthNum = parseInt(month || '1');
    const yearNum = parseInt(year || '2025');
    setCurrentMonth(monthNum);
    setCurrentYear(yearNum);
    loadMonthData();
  }, [year, month]);

  const loadMonthData = async () => {
    try {
      const userResponse = await supabase.auth.getUser() as any;
      const user = userResponse.data?.user;
      
      if (!user) {
        navigate('/');
        return;
      }
      
      setUserId(user.id);

      // Get month record
      const monthResponse = await (supabase as any)
        .from('months')
        .select('id')
        .eq('year', parseInt(year || '2025'))
        .eq('month_number', parseInt(month || '1'))
        .single();
      
      const monthData = monthResponse.data;

      if (!monthData) {
        toast({ title: 'Error', description: 'Month not found', variant: 'destructive' });
        return;
      }

      setMonthId(monthData.id);

      // Load all data for January (month 1)
      await Promise.all([
        loadSettings(monthData.id),
        loadIncome(monthData.id),
        loadBudget(monthData.id),
        loadTransactions(monthData.id),
        loadDebts(monthData.id),
        loadWishlist(monthData.id),
        loadCategories(),
        loadPaymentMethods(),
        loadAccounts(),
      ]);
    } catch (error) {
      console.error('Error loading month data:', error);
      toast({ title: 'Error', description: 'Failed to load data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadSettings = async (monthId: number) => {
    const tableName = getTableName('monthly_settings', currentMonth) as any;
    const { data } = await (supabase as any)
      .from(tableName)
      .select('*')
      .eq('month_id', monthId)
      .maybeSingle();

    if (data) {
      setChallenge(data.monthly_challenge || '');
      setCarryover(Number(data.carryover_prev_balance) || 0);
      setBudgetMode((data.budget_mode as 'ZERO_BASED' | 'COPY_PREVIOUS') || 'ZERO_BASED');
      setUnassignedPool(Number(data.unassigned_pool) || 0);
    }
  };

  const loadIncome = async (monthId: number) => {
    const tableName = getTableName('monthly_income', currentMonth) as any;
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .eq('month_id', monthId)
      .order('date', { ascending: false });
    setIncomeItems(data || []);
  };

  const loadBudget = async (monthId: number) => {
    const tableName = getTableName('monthly_budget', currentMonth) as any;
    const { data } = await supabase
      .from(tableName)
      .select(`
        *,
        categories(name, emoji, bucket_50_30_20)
      `)
      .eq('month_id', monthId);
    setBudgetItems(data || []);
  };

  const loadTransactions = async (monthId: number) => {
    const tableName = getTableName('monthly_transactions', currentMonth) as any;
    const { data } = await supabase
      .from(tableName)
      .select(`
        *,
        categories(name, emoji),
        payment_methods(name),
        accounts(name)
      `)
      .eq('month_id', monthId)
      .order('date', { ascending: false });
    setTransactions(data || []);
  };

  const loadDebts = async (monthId: number) => {
    const tableName = getTableName('monthly_debts', currentMonth) as any;
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .eq('month_id', monthId);
    setDebts(data || []);
  };

  const loadWishlist = async (monthId: number) => {
    const tableName = getTableName('monthly_wishlist', currentMonth) as any;
    const { data } = await supabase
      .from(tableName)
      .select('*')
      .eq('month_id', monthId);
    setWishlist(data || []);
  };

  const loadCategories = async () => {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
    setCategories(data || []);
  };

  const loadPaymentMethods = async () => {
    const { data } = await supabase.from('payment_methods').select('*');
    setPaymentMethods(data || []);
  };

  const loadAccounts = async () => {
    const { data } = await supabase.from('accounts').select('*');
    setAccounts(data || []);
  };

  const saveSettings = async () => {
    const tableName = getTableName('monthly_settings', currentMonth) as any;
    const { data: existing } = await (supabase as any)
      .from(tableName)
      .select('id')
      .eq('month_id', monthId)
      .maybeSingle();

    const settingsData: any = {
      month_id: monthId,
      user_id: userId,
      monthly_challenge: challenge,
      carryover_prev_balance: carryover,
      budget_mode: budgetMode,
      unassigned_pool: unassignedPool,
    };

    if (existing) {
      await supabase
        .from(tableName)
        .update(settingsData)
        .eq('id', existing.id);
    } else {
      await supabase
        .from(tableName)
        .insert([settingsData]);
    }

    toast({ title: 'Guardado', description: 'Configuración guardada' });
  };

  const addIncome = async () => {
    const tableName = getTableName('monthly_income', currentMonth) as any;
    await supabase.from(tableName).insert([{
      month_id: monthId,
      user_id: userId,
      source: newIncome.source,
      amount: newIncome.amount,
      date: newIncome.date,
      currency_code: config.currency,
    }]);
    setNewIncomeOpen(false);
    setNewIncome({ source: '', amount: 0, date: '' });
    loadIncome(monthId);
    toast({ title: 'Agregado', description: 'Ingreso agregado' });
  };

  const deleteIncome = async (id: string) => {
    const tableName = getTableName('monthly_income', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadIncome(monthId);
    toast({ title: 'Eliminado', description: 'Ingreso eliminado' });
  };

  const updateBudgetItem = async (id: string, field: string, value: number) => {
    const tableName = getTableName('monthly_budget', currentMonth) as any;
    await supabase
      .from(tableName)
      .update({ [field]: value })
      .eq('id', id);
    loadBudget(monthId);
  };

  const addTransaction = async () => {
    const tableName = getTableName('monthly_transactions', currentMonth) as any;
    await supabase.from(tableName).insert([{
      month_id: monthId,
      user_id: userId,
      category_id: newTxn.category_id,
      description: newTxn.description,
      amount: -Math.abs(newTxn.amount), // Negative for expenses
      date: newTxn.date,
      direction: 'EXPENSE',
      currency_code: config.currency,
      payment_method_id: newTxn.payment_method_id || null,
      account_id: newTxn.account_id || null,
    }]);
    setNewTxnOpen(false);
    setNewTxn({ category_id: '', description: '', amount: 0, date: '', payment_method_id: '', account_id: '' });
    loadTransactions(monthId);
    toast({ title: 'Agregado', description: 'Transacción agregada' });
  };

  const deleteTransaction = async (id: string) => {
    const tableName = getTableName('monthly_transactions', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadTransactions(monthId);
    toast({ title: 'Eliminado', description: 'Transacción eliminada' });
  };

  const addDebt = async () => {
    const tableName = getTableName('monthly_debts', currentMonth) as any;
    await supabase.from(tableName).insert([{
      month_id: monthId,
      user_id: userId,
      debt_account_id: newDebt.debt_account_id,
      starting_balance: newDebt.starting_balance,
      interest_rate_apr: newDebt.interest_rate_apr,
      payment_made: newDebt.payment_made,
      min_payment: newDebt.min_payment,
    }]);
    setNewDebtOpen(false);
    setNewDebt({ debt_account_id: '', starting_balance: 0, interest_rate_apr: 0, payment_made: 0, min_payment: 0 });
    loadDebts(monthId);
    toast({ title: 'Agregado', description: 'Deuda agregada' });
  };

  const deleteDebt = async (id: string) => {
    const tableName = getTableName('monthly_debts', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadDebts(monthId);
    toast({ title: 'Eliminado', description: 'Deuda eliminada' });
  };

  const addWish = async () => {
    const tableName = getTableName('monthly_wishlist', currentMonth) as any;
    await supabase.from(tableName).insert([{
      month_id: monthId,
      user_id: userId,
      item: newWish.item,
      estimated_cost: newWish.estimated_cost,
      priority: String(newWish.priority),
    }]);
    setNewWishOpen(false);
    setNewWish({ item: '', estimated_cost: 0, priority: 1 });
    loadWishlist(monthId);
    toast({ title: 'Agregado', description: 'Deseo agregado' });
  };

  const deleteWish = async (id: string) => {
    const tableName = getTableName('monthly_wishlist', currentMonth) as any;
    await supabase.from(tableName).delete().eq('id', id);
    loadWishlist(monthId);
    toast({ title: 'Eliminado', description: 'Deseo eliminado' });
  };

  const formatCurrency = (amount: number) => {
    const symbol = config.currency === 'EUR' ? '€' : '$';
    return `${symbol}${Math.abs(amount).toFixed(2)}`;
  };

  const totalIncome = incomeItems.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalExpenses = transactions.reduce((sum, txn) => sum + Math.abs(Number(txn.amount || 0)), 0);
  const netCashFlow = totalIncome - totalExpenses;

  const needsBudget = budgetItems.filter(b => b.categories?.bucket_50_30_20 === 'NEEDS');
  const wantsBudget = budgetItems.filter(b => b.categories?.bucket_50_30_20 === 'WANTS');
  const futureBudget = budgetItems.filter(b => b.categories?.bucket_50_30_20 === 'FUTURE');

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="animate-pulse">Cargando...</div>
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
            {getMonthName(currentMonth, config.language)} {currentYear}
          </h1>
          <p className="text-muted-foreground">Presupuesto mensual detallado</p>
        </div>

        {/* KPIs */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Gastos Totales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Flujo Neto</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                {formatCurrency(netCashFlow)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Configuración del Mes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Mi mayor reto para este mes</Label>
              <Input 
                value={challenge} 
                onChange={(e) => setChallenge(e.target.value)}
                placeholder="Escribe tu reto..."
              />
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>Saldo del mes anterior</Label>
                <Input 
                  type="number" 
                  value={carryover} 
                  onChange={(e) => setCarryover(Number(e.target.value))}
                />
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
                <Input 
                  type="number" 
                  value={unassignedPool} 
                  onChange={(e) => setUnassignedPool(Number(e.target.value))}
                />
              </div>
            </div>
            <Button onClick={saveSettings}>
              <Save className="w-4 h-4 mr-2" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        {/* Income */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Ingresos</CardTitle>
            <Dialog open={newIncomeOpen} onOpenChange={setNewIncomeOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Ingreso
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Ingreso</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Fuente</Label>
                    <Input value={newIncome.source} onChange={(e) => setNewIncome({...newIncome, source: e.target.value})} />
                  </div>
                  <div>
                    <Label>Monto</Label>
                    <Input type="number" value={newIncome.amount} onChange={(e) => setNewIncome({...newIncome, amount: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Fecha</Label>
                    <Input type="date" value={newIncome.date} onChange={(e) => setNewIncome({...newIncome, date: e.target.value})} />
                  </div>
                  <Button onClick={addIncome}>Agregar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
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
                {incomeItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.source}</TableCell>
                    <TableCell>{item.date}</TableCell>
                    <TableCell className="text-right">{formatCurrency(item.amount)}</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="ghost" onClick={() => deleteIncome(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Budget 50/30/20 */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Presupuesto 50/30/20</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Needs */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-needs" />
                Necesidades (50%)
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Estimado</TableHead>
                    <TableHead className="text-right">Asignado</TableHead>
                    <TableHead className="text-right">Real</TableHead>
                    <TableHead className="text-right">Varianza</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {needsBudget.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.categories?.emoji} {item.categories?.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 text-right"
                          value={item.estimated || 0}
                          onChange={(e) => updateBudgetItem(item.id, 'estimated', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 text-right"
                          value={item.assigned || 0}
                          onChange={(e) => updateBudgetItem(item.id, 'assigned', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.actual || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.variance || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Wants */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-desires" />
                Deseos (30%)
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Estimado</TableHead>
                    <TableHead className="text-right">Asignado</TableHead>
                    <TableHead className="text-right">Real</TableHead>
                    <TableHead className="text-right">Varianza</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wantsBudget.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.categories?.emoji} {item.categories?.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 text-right"
                          value={item.estimated || 0}
                          onChange={(e) => updateBudgetItem(item.id, 'estimated', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 text-right"
                          value={item.assigned || 0}
                          onChange={(e) => updateBudgetItem(item.id, 'assigned', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.actual || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.variance || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Future */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-future" />
                Futuro (20%)
              </h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Categoría</TableHead>
                    <TableHead className="text-right">Estimado</TableHead>
                    <TableHead className="text-right">Asignado</TableHead>
                    <TableHead className="text-right">Real</TableHead>
                    <TableHead className="text-right">Varianza</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {futureBudget.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.categories?.emoji} {item.categories?.name}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 text-right"
                          value={item.estimated || 0}
                          onChange={(e) => updateBudgetItem(item.id, 'estimated', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          className="w-24 text-right"
                          value={item.assigned || 0}
                          onChange={(e) => updateBudgetItem(item.id, 'assigned', Number(e.target.value))}
                        />
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.actual || 0)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.variance || 0)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transacciones</CardTitle>
            <Dialog open={newTxnOpen} onOpenChange={setNewTxnOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Transacción
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Transacción</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Categoría</Label>
                    <Select value={newTxn.category_id} onValueChange={(v) => setNewTxn({...newTxn, category_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.emoji} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Input value={newTxn.description} onChange={(e) => setNewTxn({...newTxn, description: e.target.value})} />
                  </div>
                  <div>
                    <Label>Monto</Label>
                    <Input type="number" value={newTxn.amount} onChange={(e) => setNewTxn({...newTxn, amount: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Fecha</Label>
                    <Input type="date" value={newTxn.date} onChange={(e) => setNewTxn({...newTxn, date: e.target.value})} />
                  </div>
                  <Button onClick={addTransaction}>Agregar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
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
              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.id}>
                    <TableCell>{txn.date}</TableCell>
                    <TableCell>{txn.categories?.emoji} {txn.categories?.name}</TableCell>
                    <TableCell>{txn.description}</TableCell>
                    <TableCell className="text-right text-destructive">{formatCurrency(txn.amount)}</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="ghost" onClick={() => deleteTransaction(txn.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Debts */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Deudas</CardTitle>
            <Dialog open={newDebtOpen} onOpenChange={setNewDebtOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Deuda
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nueva Deuda</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Cuenta de deuda</Label>
                    <Select value={newDebt.debt_account_id} onValueChange={(v) => setNewDebt({...newDebt, debt_account_id: v})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar cuenta" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.filter(a => a.type === 'CREDIT_CARD' || a.type === 'LOAN').map(acc => (
                          <SelectItem key={acc.id} value={acc.id}>
                            {acc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Saldo inicial</Label>
                    <Input type="number" value={newDebt.starting_balance} onChange={(e) => setNewDebt({...newDebt, starting_balance: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Tasa de interés (APR %)</Label>
                    <Input type="number" value={newDebt.interest_rate_apr} onChange={(e) => setNewDebt({...newDebt, interest_rate_apr: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Pago mínimo</Label>
                    <Input type="number" value={newDebt.min_payment} onChange={(e) => setNewDebt({...newDebt, min_payment: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Pago realizado</Label>
                    <Input type="number" value={newDebt.payment_made} onChange={(e) => setNewDebt({...newDebt, payment_made: Number(e.target.value)})} />
                  </div>
                  <Button onClick={addDebt}>Agregar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
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
              <TableBody>
                {debts.map((debt) => (
                  <TableRow key={debt.id}>
                    <TableCell>{accounts.find(a => a.id === debt.debt_account_id)?.name}</TableCell>
                    <TableCell className="text-right">{formatCurrency(debt.starting_balance)}</TableCell>
                    <TableCell className="text-right">{debt.interest_rate_apr}%</TableCell>
                    <TableCell className="text-right">{formatCurrency(debt.payment_made)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(debt.ending_balance)}</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="ghost" onClick={() => deleteDebt(debt.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Wishlist */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Lista de Deseos</CardTitle>
            <Dialog open={newWishOpen} onOpenChange={setNewWishOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Deseo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nuevo Deseo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Artículo</Label>
                    <Input value={newWish.item} onChange={(e) => setNewWish({...newWish, item: e.target.value})} />
                  </div>
                  <div>
                    <Label>Costo estimado</Label>
                    <Input type="number" value={newWish.estimated_cost} onChange={(e) => setNewWish({...newWish, estimated_cost: Number(e.target.value)})} />
                  </div>
                  <div>
                    <Label>Prioridad (1-5)</Label>
                    <Input type="number" min={1} max={5} value={newWish.priority} onChange={(e) => setNewWish({...newWish, priority: Number(e.target.value)})} />
                  </div>
                  <Button onClick={addWish}>Agregar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead className="text-right">Costo Estimado</TableHead>
                  <TableHead className="text-center">Prioridad</TableHead>
                  <TableHead className="text-center">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {wishlist.map((wish) => (
                  <TableRow key={wish.id}>
                    <TableCell>{wish.item}</TableCell>
                    <TableCell className="text-right">{formatCurrency(wish.estimated_cost)}</TableCell>
                    <TableCell className="text-center">{wish.priority}</TableCell>
                    <TableCell className="text-center">
                      <Button size="sm" variant="ghost" onClick={() => deleteWish(wish.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MonthlyBudget;
