import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [config, setConfig] = useState<AppConfig>({
    ownerName: '',
    currency: 'EUR',
    monthlyIncome: 0,
    language: 'es',
  });

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

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => ({ ...prev, ...newConfig }));
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
