import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

type Category = {
  id: string;
  name: string;
  emoji: string;
  bucket_50_30_20: 'NEEDS' | 'WANTS' | 'FUTURE';
  is_active: boolean;
};

type PaymentMethod = {
  id: string;
  name: string;
  type: 'CASH' | 'CREDIT' | 'DEBIT' | 'TRANSFER' | 'OTHER';
};

type Account = {
  id: string;
  name: string;
  type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'LOAN' | 'OTHER';
  currency_code: string;
};

const Catalog = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Category form state
  const [categoryDialog, setCategoryDialog] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState<{
    name: string;
    emoji: string;
    bucket_50_30_20: 'NEEDS' | 'WANTS' | 'FUTURE';
    is_active: boolean;
  }>({
    name: '',
    emoji: '📦',
    bucket_50_30_20: 'NEEDS',
    is_active: true,
  });

  // Payment method form state
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState<{
    name: string;
    type: 'CASH' | 'CREDIT' | 'DEBIT' | 'TRANSFER' | 'OTHER';
  }>({
    name: '',
    type: 'OTHER',
  });

  // Account form state
  const [accountDialog, setAccountDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accountForm, setAccountForm] = useState<{
    name: string;
    type: 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'LOAN' | 'OTHER';
    currency_code: string;
  }>({
    name: '',
    type: 'CHECKING',
    currency_code: 'USD',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    
    await Promise.all([loadCategories(), loadPaymentMethods(), loadAccounts()]);
    setLoading(false);
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'Error loading categories', description: error.message, variant: 'destructive' });
    } else {
      setCategories((data || []) as Category[]);
    }
  };

  const loadPaymentMethods = async () => {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'Error loading payment methods', description: error.message, variant: 'destructive' });
    } else {
      setPaymentMethods((data || []) as PaymentMethod[]);
    }
  };

  const loadAccounts = async () => {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('name');
    
    if (error) {
      toast({ title: 'Error loading accounts', description: error.message, variant: 'destructive' });
    } else {
      setAccounts((data || []) as Account[]);
    }
  };

  // Category CRUD
  const saveCategory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update(categoryForm)
        .eq('id', editingCategory.id);
      
      if (error) {
        toast({ title: 'Error updating category', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Category updated successfully' });
        loadCategories();
        resetCategoryForm();
      }
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ ...categoryForm, user_id: user.id });
      
      if (error) {
        toast({ title: 'Error creating category', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Category created successfully' });
        loadCategories();
        resetCategoryForm();
      }
    }
  };

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Category deleted successfully' });
      loadCategories();
    }
  };

  const resetCategoryForm = () => {
    setCategoryForm({ name: '', emoji: '📦', bucket_50_30_20: 'NEEDS', is_active: true });
    setEditingCategory(null);
    setCategoryDialog(false);
  };

  // Payment method CRUD
  const savePaymentMethod = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingPayment) {
      const { error } = await supabase
        .from('payment_methods')
        .update(paymentForm)
        .eq('id', editingPayment.id);
      
      if (error) {
        toast({ title: 'Error updating payment method', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Payment method updated successfully' });
        loadPaymentMethods();
        resetPaymentForm();
      }
    } else {
      const { error } = await supabase
        .from('payment_methods')
        .insert({ ...paymentForm, user_id: user.id });
      
      if (error) {
        toast({ title: 'Error creating payment method', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Payment method created successfully' });
        loadPaymentMethods();
        resetPaymentForm();
      }
    }
  };

  const deletePaymentMethod = async (id: string) => {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error deleting payment method', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Payment method deleted successfully' });
      loadPaymentMethods();
    }
  };

  const resetPaymentForm = () => {
    setPaymentForm({ name: '', type: 'OTHER' });
    setEditingPayment(null);
    setPaymentDialog(false);
  };

  // Account CRUD
  const saveAccount = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editingAccount) {
      const { error } = await supabase
        .from('accounts')
        .update(accountForm)
        .eq('id', editingAccount.id);
      
      if (error) {
        toast({ title: 'Error updating account', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Account updated successfully' });
        loadAccounts();
        resetAccountForm();
      }
    } else {
      const { error } = await supabase
        .from('accounts')
        .insert({ ...accountForm, user_id: user.id });
      
      if (error) {
        toast({ title: 'Error creating account', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Account created successfully' });
        loadAccounts();
        resetAccountForm();
      }
    }
  };

  const deleteAccount = async (id: string) => {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Error deleting account', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Account deleted successfully' });
      loadAccounts();
    }
  };

  const resetAccountForm = () => {
    setAccountForm({ name: '', type: 'CHECKING', currency_code: 'USD' });
    setEditingAccount(null);
    setAccountDialog(false);
  };

  const getBucketBadge = (bucket: string) => {
    const colors = {
      NEEDS: 'bg-needs text-needs-foreground',
      WANTS: 'bg-desires text-desires-foreground',
      FUTURE: 'bg-future text-future-foreground',
    };
    return colors[bucket as keyof typeof colors] || 'bg-muted';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Catalog Management</h1>
          <p className="text-muted-foreground">
            Manage your categories, payment methods, and accounts
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Categories */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Categories</CardTitle>
                  <CardDescription>Organize expenses by category</CardDescription>
                </div>
                <Dialog open={categoryDialog} onOpenChange={setCategoryDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => {
                      resetCategoryForm();
                      setCategoryDialog(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? 'Edit Category' : 'New Category'}</DialogTitle>
                      <DialogDescription>
                        {editingCategory ? 'Update category details' : 'Create a new expense category'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cat-name">Name</Label>
                        <Input
                          id="cat-name"
                          value={categoryForm.name}
                          onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                          placeholder="e.g., Groceries"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-emoji">Emoji</Label>
                        <Input
                          id="cat-emoji"
                          value={categoryForm.emoji}
                          onChange={(e) => setCategoryForm({ ...categoryForm, emoji: e.target.value })}
                          placeholder="🛒"
                          maxLength={2}
                        />
                      </div>
                      <div>
                        <Label htmlFor="cat-bucket">50/30/20 Bucket</Label>
                        <Select
                          value={categoryForm.bucket_50_30_20}
                          onValueChange={(value) => setCategoryForm({ ...categoryForm, bucket_50_30_20: value as 'NEEDS' | 'WANTS' | 'FUTURE' })}
                        >
                          <SelectTrigger id="cat-bucket">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="NEEDS">Needs (50%)</SelectItem>
                            <SelectItem value="WANTS">Wants (30%)</SelectItem>
                            <SelectItem value="FUTURE">Future (20%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="cat-active"
                          checked={categoryForm.is_active}
                          onCheckedChange={(checked) => setCategoryForm({ ...categoryForm, is_active: checked })}
                        />
                        <Label htmlFor="cat-active">Active</Label>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={resetCategoryForm}>Cancel</Button>
                      <Button onClick={saveCategory}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories yet</p>
                ) : (
                  categories.map((cat) => (
                    <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{cat.emoji}</span>
                        <div>
                          <p className="font-medium">{cat.name}</p>
                          <Badge className={getBucketBadge(cat.bucket_50_30_20)} variant="secondary">
                            {cat.bucket_50_30_20}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingCategory(cat);
                            setCategoryForm({
                              name: cat.name,
                              emoji: cat.emoji,
                              bucket_50_30_20: cat.bucket_50_30_20,
                              is_active: cat.is_active,
                            });
                            setCategoryDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteCategory(cat.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>How you pay for things</CardDescription>
                </div>
                <Dialog open={paymentDialog} onOpenChange={setPaymentDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => {
                      resetPaymentForm();
                      setPaymentDialog(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingPayment ? 'Edit Payment Method' : 'New Payment Method'}</DialogTitle>
                      <DialogDescription>
                        {editingPayment ? 'Update payment method details' : 'Create a new payment method'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="pm-name">Name</Label>
                        <Input
                          id="pm-name"
                          value={paymentForm.name}
                          onChange={(e) => setPaymentForm({ ...paymentForm, name: e.target.value })}
                          placeholder="e.g., Chase Credit Card"
                        />
                      </div>
                      <div>
                        <Label htmlFor="pm-type">Type</Label>
                        <Select
                          value={paymentForm.type}
                          onValueChange={(value) => setPaymentForm({ ...paymentForm, type: value as 'CASH' | 'CREDIT' | 'DEBIT' | 'TRANSFER' | 'OTHER' })}
                        >
                          <SelectTrigger id="pm-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CASH">Cash</SelectItem>
                            <SelectItem value="CREDIT">Credit Card</SelectItem>
                            <SelectItem value="DEBIT">Debit Card</SelectItem>
                            <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={resetPaymentForm}>Cancel</Button>
                      <Button onClick={savePaymentMethod}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {paymentMethods.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No payment methods yet</p>
                ) : (
                  paymentMethods.map((pm) => (
                    <div key={pm.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{pm.name}</p>
                        <Badge variant="secondary">{pm.type}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingPayment(pm);
                            setPaymentForm({ name: pm.name, type: pm.type });
                            setPaymentDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deletePaymentMethod(pm.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Accounts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Accounts</CardTitle>
                  <CardDescription>Bank accounts, credit cards, and loans</CardDescription>
                </div>
                <Dialog open={accountDialog} onOpenChange={setAccountDialog}>
                  <DialogTrigger asChild>
                    <Button size="sm" onClick={() => {
                      resetAccountForm();
                      setAccountDialog(true);
                    }}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingAccount ? 'Edit Account' : 'New Account'}</DialogTitle>
                      <DialogDescription>
                        {editingAccount ? 'Update account details' : 'Create a new financial account'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="acc-name">Name</Label>
                        <Input
                          id="acc-name"
                          value={accountForm.name}
                          onChange={(e) => setAccountForm({ ...accountForm, name: e.target.value })}
                          placeholder="e.g., Chase Checking"
                        />
                      </div>
                      <div>
                        <Label htmlFor="acc-type">Type</Label>
                        <Select
                          value={accountForm.type}
                          onValueChange={(value) => setAccountForm({ ...accountForm, type: value as 'CHECKING' | 'SAVINGS' | 'CREDIT_CARD' | 'LOAN' | 'OTHER' })}
                        >
                          <SelectTrigger id="acc-type">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CHECKING">Checking Account</SelectItem>
                            <SelectItem value="SAVINGS">Savings Account</SelectItem>
                            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                            <SelectItem value="LOAN">Loan</SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="acc-currency">Currency</Label>
                        <Select
                          value={accountForm.currency_code}
                          onValueChange={(value) => setAccountForm({ ...accountForm, currency_code: value })}
                        >
                          <SelectTrigger id="acc-currency">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">USD ($)</SelectItem>
                            <SelectItem value="EUR">EUR (€)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={resetAccountForm}>Cancel</Button>
                      <Button onClick={saveAccount}>Save</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2">
                {accounts.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No accounts yet</p>
                ) : (
                  accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                      <div>
                        <p className="font-medium">{acc.name}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{acc.type}</Badge>
                          <Badge variant="outline">{acc.currency_code}</Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingAccount(acc);
                            setAccountForm({
                              name: acc.name,
                              type: acc.type,
                              currency_code: acc.currency_code,
                            });
                            setAccountDialog(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteAccount(acc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Catalog;
