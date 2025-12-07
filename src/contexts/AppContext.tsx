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
}

export interface AppConfig {
  ownerName: string;
  currency: Currency;
  monthlyIncome: number;
  language: Language;
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
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
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
          });
        }
      } catch (error) {
        console.error('Error loading user settings:', error);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadUserSettings();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setTimeout(() => {
          loadUserSettings();
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setConfig({
          ownerName: '',
          currency: 'EUR',
          monthlyIncome: 0,
          language: 'es',
        });
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

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = {
      ...transaction,
      id: `txn-${Date.now()}`,
    };
    setTransactions((prev) => [...prev, newTransaction]);
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
