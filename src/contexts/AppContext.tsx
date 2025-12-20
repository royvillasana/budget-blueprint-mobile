import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useStorage } from '@/contexts/StorageContext';

export type Currency = 'EUR' | 'USD';
export type Language = 'es' | 'en';

export interface Category {
  id: string;
  name: string;
  budgeted: number;
  spent: number;
}

export interface BudgetCategory {
  name: string;
  percentage: number;
  amount: number;
  categories: Category[];
}

export interface Transaction {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  goalId?: string;
}

export interface AppConfig {
  ownerName: string;
  currency: Currency;
  monthlyIncome: number;
  language: Language;
  openaiApiKey?: string;
}

interface AppContextType {
  config: AppConfig;
  updateConfig: (config: Partial<AppConfig>) => void;
  budgetCategories: {
    needs: BudgetCategory;
    desires: BudgetCategory;
    future: BudgetCategory;
    debts: BudgetCategory;
  };
  updateCategory: (type: keyof AppContextType['budgetCategories'], categoryId: string, updates: Partial<Category>) => void;
  addCategory: (type: keyof AppContextType['budgetCategories'], category: Omit<Category, 'id'>) => void;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<Transaction>;
  exchangeRate: number;
  loadingSettings: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig>({
    ownerName: '',
    currency: 'EUR',
    monthlyIncome: 0,
    language: 'es',
    openaiApiKey: '',
  });

  const [loadingSettings, setLoadingSettings] = useState(true);
  const [exchangeRate] = useState(1.09); // EUR to USD rate

  const [budgetCategories, setBudgetCategories] = useState({
    needs: {
      name: 'Necesidades',
      percentage: 51,
      amount: 0,
      categories: [
        { id: 'rent', name: 'Alquiler/Hipoteca', budgeted: 0, spent: 0 },
        { id: 'utilities', name: 'Servicios públicos', budgeted: 0, spent: 0 },
        { id: 'groceries', name: 'Alimentación', budgeted: 0, spent: 0 },
        { id: 'transport', name: 'Transporte', budgeted: 0, spent: 0 },
      ],
    },
    desires: {
      name: 'Deseos',
      percentage: 19.8,
      amount: 0,
      categories: [
        { id: 'entertainment', name: 'Entretenimiento', budgeted: 0, spent: 0 },
        { id: 'dining', name: 'Restaurantes', budgeted: 0, spent: 0 },
        { id: 'shopping', name: 'Compras', budgeted: 0, spent: 0 },
      ],
    },
    future: {
      name: 'Futuro',
      percentage: 16,
      amount: 0,
      categories: [
        { id: 'savings', name: 'Ahorros', budgeted: 0, spent: 0 },
        { id: 'investments', name: 'Inversiones', budgeted: 0, spent: 0 },
        { id: 'emergency', name: 'Fondo de emergencia', budgeted: 0, spent: 0 },
      ],
    },
    debts: {
      name: 'Deudas',
      percentage: 13.2,
      amount: 0,
      categories: [
        { id: 'credit-card', name: 'Tarjeta de crédito', budgeted: 0, spent: 0 },
        { id: 'loans', name: 'Préstamos', budgeted: 0, spent: 0 },
      ],
    },
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const { storage } = useStorage();

  // Load user settings from database
  useEffect(() => {
    const loadUserSettings = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setLoadingSettings(false);
          return;
        }

        const settings = await storage.getSettings(user.id);

        if (settings) {
          setConfig({
            ownerName: settings.ownerName || '',
            currency: (settings.currency as Currency) || 'EUR',
            monthlyIncome: Number(settings.monthlyIncome) || 0,
            language: (settings.language as Language) || 'es',
            openaiApiKey: settings.openaiApiKey || '',
          });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadUserSettings();

    // Load categories
    const loadCategories = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true);

        if (error) throw error;

        if (categoriesData) {
          const newCategories = {
            needs: { ...budgetCategories.needs, categories: [] as Category[] },
            desires: { ...budgetCategories.desires, categories: [] as Category[] },
            future: { ...budgetCategories.future, categories: [] as Category[] },
            debts: { ...budgetCategories.debts, categories: [] as Category[] },
          };

          categoriesData.forEach(cat => {
            const category: Category = {
              id: cat.id,
              name: cat.name,
              budgeted: 0, // These would need to be loaded from monthly budget if we want them accurate
              spent: 0,
            };

            if (cat.bucket_50_30_20 === 'NEEDS') {
              newCategories.needs.categories.push(category);
            } else if (cat.bucket_50_30_20 === 'WANTS') {
              newCategories.desires.categories.push(category);
            } else if (cat.bucket_50_30_20 === 'FUTURE') {
              newCategories.future.categories.push(category);
            } else if (cat.bucket_50_30_20 === 'DEBTS') {
              newCategories.debts.categories.push(category);
            }
          });

          setBudgetCategories(prev => ({
            ...prev,
            needs: { ...prev.needs, categories: newCategories.needs.categories },
            desires: { ...prev.desires, categories: newCategories.desires.categories },
            future: { ...prev.future, categories: newCategories.future.categories },
            debts: { ...prev.debts, categories: newCategories.debts.categories },
          }));
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          loadUserSettings();
          loadCategories();
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setConfig({
          ownerName: '',
          currency: 'EUR',
          monthlyIncome: 0,
          language: 'es',
          openaiApiKey: '',
        });
      }
    });

    // Initial load if already signed in
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        loadCategories();
      }
    });

    return () => subscription.unsubscribe();
  }, [storage]);

  const updateConfig = async (newConfig: Partial<AppConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await storage.saveSettings(user.id, updatedConfig);
    } catch (error) {
      console.error('Error updating config:', error);
    }
  };

  const updateCategory = (
    type: keyof typeof budgetCategories,
    categoryId: string,
    updates: Partial<Category>
  ) => {
    setBudgetCategories((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        categories: prev[type].categories.map((cat) =>
          cat.id === categoryId ? { ...cat, ...updates } : cat
        ),
      },
    }));
  };

  const addCategory = (
    type: keyof typeof budgetCategories,
    category: Omit<Category, 'id'>
  ) => {
    const newCategory = {
      ...category,
      id: `${type}-${Date.now()}`,
    };
    setBudgetCategories((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        categories: [...prev[type].categories, newCategory],
      },
    }));
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const date = new Date(transaction.date);
      const monthNum = date.getMonth() + 1;

      // Dynamic import to avoid circular dependencies if any, or just standard import if possible.
      // Since we are in a context, standard import should be fine if we add it to the top.
      // But for now, let's assume getTableName is imported.
      const { getTableName } = await import('@/utils/monthUtils');
      const tableName = getTableName('monthly_transactions', monthNum);

      const newTxnData = {
        month_id: monthNum, // Note: This assumes month_id matches month number (1-12) which seems to be the case in MonthlyBudget.tsx
        user_id: user.id,
        category_id: transaction.category,
        description: transaction.description,
        amount: transaction.type === 'expense' ? -Math.abs(transaction.amount) : Math.abs(transaction.amount),
        date: transaction.date,
        direction: transaction.type === 'expense' ? 'EXPENSE' : 'INCOME',
        currency_code: config.currency,
        goal_id: transaction.goalId,
      };

      console.log('Attempting to save transaction:', { tableName, newTxnData });

      const { data, error } = await (supabase as any).from(tableName).insert([newTxnData]).select().single();

      if (error) {
        console.error('Supabase insert error:', error);
        throw error;
      }

      console.log('Transaction saved successfully:', data);

      const newTransaction: Transaction = {
        id: data.id,
        date: data.date,
        category: data.category_id,
        description: data.description,
        amount: Math.abs(data.amount),
        type: data.amount < 0 ? 'expense' : 'income',
        goalId: data.goal_id,
      };

      setTransactions((prev) => [...prev, newTransaction]);
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      // Fallback to local state for optimistic UI if needed, but better to fail loud in dev
      const fallbackTxn = {
        ...transaction,
        id: `txn-${Date.now()}`,
      };
      setTransactions((prev) => [...prev, fallbackTxn]);
      return fallbackTxn;
    }
  };

  return (
    <AppContext.Provider
      value={{
        config,
        updateConfig,
        budgetCategories,
        updateCategory,
        addCategory,
        transactions,
        addTransaction,
        exchangeRate,
        loadingSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};
