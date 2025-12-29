import React, { useState, useEffect } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Check, ChevronsUpDown } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { useStorage } from '@/contexts/StorageContext';
import { useApp } from '@/contexts/AppContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const GlobalFABDialog = () => {
    const location = useLocation();
    const { year: urlYear, month: urlMonth } = useParams();
    const { storage } = useStorage();
    const { config } = useApp();
    const { toast } = useToast();

    const [open, setOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<'income' | 'transaction' | 'debt' | 'wishlist' | null>(null);
    const [showAddAnother, setShowAddAnother] = useState(false);
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);

    // Metadata
    const [categories, setCategories] = useState<any[]>([]);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
    const [financialGoals, setFinancialGoals] = useState<any[]>([]);
    const [categoryComboOpen, setCategoryComboOpen] = useState(false);

    // Form States
    const [newIncome, setNewIncome] = useState({ source: '', amount: 0, date: new Date().toISOString().split('T')[0] });
    const [newTxn, setNewTxn] = useState({ category_id: '', description: '', amount: 0, date: new Date().toISOString().split('T')[0], payment_method_id: '', account_id: '', goal_id: 'none' });
    const [newDebt, setNewDebt] = useState({ debt_account_id: '', starting_balance: 0, interest_rate_apr: 0, payment_made: 0, min_payment: 0 });
    const [newWish, setNewWish] = useState({ item: '', estimated_cost: 0, priority: '1' });

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserId(user.id);
                loadMetadata(user.id);
            } else {
                setUserId(null);
            }
        };
        fetchUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session?.user) {
                setUserId(session.user.id);
                loadMetadata(session.user.id);
            } else {
                setUserId(null);
                setCategories([]);
                setAccounts([]);
                setPaymentMethods([]);
                setFinancialGoals([]);
            }
        });

        const handleOpenEvent = () => {
            console.log('GlobalFABDialog: opening');
            setOpen(true);
        };

        window.addEventListener('open-add-transaction-dialog', handleOpenEvent);
        return () => {
            window.removeEventListener('open-add-transaction-dialog', handleOpenEvent);
            subscription.unsubscribe();
        };
    }, []);

    const loadMetadata = async (uid: string) => {
        try {
            const [cats, accs, pms, goals] = await Promise.all([
                storage.getCategories(uid),
                storage.getAccounts(uid),
                storage.getPaymentMethods(uid),
                storage.getFinancialGoals(uid)
            ]);
            const uniqueCategories = cats.filter((cat, index, self) =>
                index === self.findIndex((c) =>
                    c.name === cat.name && c.emoji === cat.emoji
                )
            );
            setCategories(uniqueCategories);
            setAccounts(accs);
            setPaymentMethods(pms);
            setFinancialGoals(goals);
        } catch (error) {
            console.error('Error loading metadata:', error);
        }
    };

    // Helper to get active month/year
    const getActivePeriod = () => {
        // Current system date as default
        const now = new Date();
        let month = now.getMonth() + 1;
        let year = now.getFullYear();

        // If we are on Periodic Budget page
        if (urlMonth && urlYear) {
            month = parseInt(urlMonth);
            year = parseInt(urlYear);
        }

        return { month, year };
    };

    const resetForms = () => {
        const today = new Date().toISOString().split('T')[0];
        setNewIncome({ source: '', amount: 0, date: today });
        setNewTxn({ category_id: '', description: '', amount: 0, date: today, payment_method_id: '', account_id: '', goal_id: 'none' });
        setNewDebt({ debt_account_id: '', starting_balance: 0, interest_rate_apr: 0, payment_made: 0, min_payment: 0 });
        setNewWish({ item: '', estimated_cost: 0, priority: '1' });
        setSelectedType(null);
        setShowAddAnother(false);
    };

    const handleClose = (isOpen: boolean) => {
        if (!isOpen) {
            resetForms();
        }
        setOpen(isOpen);
    };

    const handleAdd = async () => {
        if (!userId) return;
        setLoading(true);
        const { month: activeMonth } = getActivePeriod();

        try {
            if (selectedType === 'income') {
                const dateObj = new Date(newIncome.date);
                // getMonth() returns 0-11, so we add 1. If date is invalid, fall back to activeMonth
                const targetMonth = !isNaN(dateObj.getTime()) ? dateObj.getMonth() + 1 : activeMonth;
                await storage.addIncome({ ...newIncome, user_id: userId, month_id: targetMonth, currency_code: config.currency });
            } else if (selectedType === 'transaction') {
                const dateObj = new Date(newTxn.date);
                const targetMonth = !isNaN(dateObj.getTime()) ? dateObj.getMonth() + 1 : activeMonth;
                await storage.addTransaction({
                    ...newTxn,
                    user_id: userId,
                    month_id: targetMonth,
                    amount: -Math.abs(newTxn.amount),
                    direction: 'EXPENSE',
                    currency_code: config.currency,
                    goal_id: newTxn.goal_id === 'none' ? undefined : newTxn.goal_id,
                    payment_method_id: newTxn.payment_method_id || undefined,
                    account_id: newTxn.account_id || undefined
                });
            } else if (selectedType === 'debt') {
                // Debts and Wishlist don't have a date picker, so we keep using the active view's month
                await storage.addDebt({
                    ...newDebt,
                    user_id: userId,
                    month_id: activeMonth,
                    ending_balance: newDebt.starting_balance - newDebt.payment_made
                });
            } else if (selectedType === 'wishlist') {
                await storage.addWish({ ...newWish, user_id: userId, month_id: activeMonth });
            }

            toast({ title: 'Agregado', description: 'Registro guardado exitosamente' });

            // Trigger refresh events
            window.dispatchEvent(new Event('transaction-added'));
            if (selectedType === 'transaction' && newTxn.goal_id !== 'none') {
                window.dispatchEvent(new Event('financial-goals-updated'));
            }

            setShowAddAnother(true);
        } catch (error: any) {
            toast({ title: 'Error', description: error.message, variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        const symbol = config.currency === 'EUR' ? '€' : '$';
        return `${symbol}${Math.abs(amount).toFixed(2)}`;
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {!selectedType ? 'Agregar nuevo' :
                            selectedType === 'income' ? 'Nuevo Ingreso' :
                                selectedType === 'transaction' ? 'Nuevo Gasto' :
                                    selectedType === 'debt' ? 'Nueva Deuda' : 'Nuevo Deseo'}
                    </DialogTitle>
                    <DialogDescription>
                        {selectedType === 'income' ? 'Registra un nuevo ingreso de dinero.' :
                            selectedType === 'transaction' ? 'Registra un nuevo gasto o salida de dinero.' :
                                selectedType === 'debt' ? 'Añade una nueva cuenta de deuda para seguimiento.' :
                                    selectedType === 'wishlist' ? 'Añade un item a tu lista de deseos.' :
                                        'Selecciona el tipo de registro que deseas agregar a tu presupuesto.'}
                    </DialogDescription>
                </DialogHeader>

                {!selectedType ? (
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedType('income')}>
                            <span className="text-2xl">💰</span>
                            <span>Ingreso</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedType('transaction')}>
                            <span className="text-2xl">💸</span>
                            <span>Gasto</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedType('debt')}>
                            <span className="text-2xl">💳</span>
                            <span>Deuda</span>
                        </Button>
                        <Button variant="outline" className="h-24 flex flex-col gap-2" onClick={() => setSelectedType('wishlist')}>
                            <span className="text-2xl">⭐</span>
                            <span>Deseo</span>
                        </Button>
                    </div>
                ) : showAddAnother ? (
                    <div className="space-y-4 text-center py-4">
                        <p className="text-lg">¿Quieres agregar otro más?</p>
                        <div className="flex gap-2">
                            <Button variant="outline" className="flex-1" onClick={() => handleClose(false)}>No</Button>
                            <Button className="flex-1" onClick={() => {
                                const today = new Date().toISOString().split('T')[0];
                                resetForms();
                                // We keep the type but reset fields
                                if (selectedType === 'income') setNewIncome({ source: '', amount: 0, date: today });
                                if (selectedType === 'transaction') setNewTxn({ category_id: '', description: '', amount: 0, date: today, payment_method_id: '', account_id: '', goal_id: 'none' });
                                if (selectedType === 'debt') setNewDebt({ debt_account_id: '', starting_balance: 0, interest_rate_apr: 0, payment_made: 0, min_payment: 0 });
                                if (selectedType === 'wishlist') setNewWish({ item: '', estimated_cost: 0, priority: '1' });
                                setSelectedType(selectedType);
                                setShowAddAnother(false);
                            }}>Sí</Button>
                        </div>
                    </div>
                ) : selectedType === 'income' ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="income-source">Fuente</Label>
                            <Input id="income-source" value={newIncome.source} onChange={e => setNewIncome({ ...newIncome, source: e.target.value })} autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="income-amount">Monto</Label>
                            <Input id="income-amount" type="number" value={newIncome.amount} onChange={e => setNewIncome({ ...newIncome, amount: Number(e.target.value) })} autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="income-date">Fecha</Label>
                            <DatePicker id="income-date" value={newIncome.date} onChange={date => setNewIncome({ ...newIncome, date })} />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedType(null)}>Atrás</Button>
                            <Button className="flex-1" onClick={handleAdd} disabled={loading}>Agregar</Button>
                        </div>
                    </div>
                ) : selectedType === 'transaction' ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="category-trigger">Categoría</Label>
                            <Popover open={categoryComboOpen} onOpenChange={setCategoryComboOpen}>
                                <PopoverTrigger asChild>
                                    <Button id="category-trigger" variant="outline" role="combobox" className="w-full justify-between">
                                        {newTxn.category_id ? categories.find(c => c.id === newTxn.category_id)?.emoji + ' ' + categories.find(c => c.id === newTxn.category_id)?.name : "Seleccionar..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" onOpenAutoFocus={(e) => e.preventDefault()}>
                                    <Command>
                                        <CommandInput placeholder="Buscar..." autoComplete="off" />
                                        <CommandList>
                                            <CommandEmpty>No se encontró.</CommandEmpty>
                                            <CommandGroup>
                                                {categories.map(cat => (
                                                    <CommandItem key={cat.id} onSelect={() => {
                                                        setNewTxn({ ...newTxn, category_id: cat.id });
                                                        setCategoryComboOpen(false);
                                                    }}>
                                                        <Check className={`mr-2 h-4 w-4 ${newTxn.category_id === cat.id ? "opacity-100" : "opacity-0"}`} />
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
                            <Label htmlFor="txn-description">Descripción</Label>
                            <Input id="txn-description" value={newTxn.description} onChange={e => setNewTxn({ ...newTxn, description: e.target.value })} autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="txn-amount">Monto</Label>
                            <Input id="txn-amount" type="number" value={newTxn.amount} onChange={e => setNewTxn({ ...newTxn, amount: Number(e.target.value) })} autoComplete="off" />
                        </div>
                        {(() => {
                            const selectedCat = categories.find(c => c.id === newTxn.category_id);
                            const isSavings = selectedCat?.name?.toLowerCase().includes('ahorro') || selectedCat?.emoji === '💰' || selectedCat?.emoji === '🏦' || selectedCat?.emoji === '🐷';

                            if (isSavings) {
                                return (
                                    <div>
                                        <Label htmlFor="goal-selector">Categoría de Ahorro (Opcional)</Label>
                                        <Select value={newTxn.goal_id} onValueChange={v => {
                                            const selectedGoal = financialGoals.find(g => g.id === v);
                                            setNewTxn({
                                                ...newTxn,
                                                goal_id: v,
                                                description: selectedGoal ? selectedGoal.description : newTxn.description
                                            });
                                        }}>
                                            <SelectTrigger id="goal-selector">
                                                <SelectValue placeholder="Seleccionar meta" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">Ninguna</SelectItem>
                                                {financialGoals.map(goal => (
                                                    <SelectItem key={goal.id} value={goal.id}>
                                                        {goal.description} ({formatCurrency(goal.target_amount)})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                        <div>
                            <Label htmlFor="txn-date">Fecha</Label>
                            <DatePicker id="txn-date" value={newTxn.date} onChange={date => setNewTxn({ ...newTxn, date })} />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedType(null)}>Atrás</Button>
                            <Button className="flex-1" onClick={handleAdd} disabled={loading}>Agregar</Button>
                        </div>
                    </div>
                ) : selectedType === 'debt' ? (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="debt-account-selector">Cuenta de deuda</Label>
                            <Select value={newDebt.debt_account_id} onValueChange={v => setNewDebt({ ...newDebt, debt_account_id: v })}>
                                <SelectTrigger id="debt-account-selector"><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                                <SelectContent>
                                    {accounts.filter(a => a.type === 'CREDIT_CARD' || a.type === 'LOAN').map(acc => (
                                        <SelectItem key={acc.id} value={acc.id}>{acc.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="debt-balance">Saldo Inicial</Label>
                            <Input id="debt-balance" type="number" value={newDebt.starting_balance} onChange={e => setNewDebt({ ...newDebt, starting_balance: Number(e.target.value) })} autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="debt-payment">Pago realizado</Label>
                            <Input id="debt-payment" type="number" value={newDebt.payment_made} onChange={e => setNewDebt({ ...newDebt, payment_made: Number(e.target.value) })} autoComplete="off" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedType(null)}>Atrás</Button>
                            <Button className="flex-1" onClick={handleAdd} disabled={loading}>Agregar</Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="wish-item">Deseo / Item</Label>
                            <Input id="wish-item" value={newWish.item} onChange={e => setNewWish({ ...newWish, item: e.target.value })} autoComplete="off" />
                        </div>
                        <div>
                            <Label htmlFor="wish-cost">Costo estimado</Label>
                            <Input id="wish-cost" type="number" value={newWish.estimated_cost} onChange={e => setNewWish({ ...newWish, estimated_cost: Number(e.target.value) })} autoComplete="off" />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => setSelectedType(null)}>Atrás</Button>
                            <Button className="flex-1" onClick={handleAdd} disabled={loading}>Agregar</Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};
