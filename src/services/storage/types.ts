import { AppConfig, Category, Transaction } from '@/contexts/AppContext';
export type { AppConfig, Category, Transaction };

export interface MonthlySummary {
  month_name: string | null;
  month_id: number | null;
  year: number | null;
  total_income: number | null;
  total_expenses: number | null;
  net_cash_flow: number | null;
  needs_actual: number | null;
  wants_actual: number | null;
  future_actual: number | null;
  debt_payments: number | null;
}

export interface AnnualSummary {
  annual_income: number | null;
  annual_expenses: number | null;
  annual_net_cash_flow: number | null;
  annual_needs_actual: number | null;
  annual_wants_actual: number | null;
  annual_future_actual: number | null;
  annual_debt_payments: number | null;
}

export interface IncomeItem {
  id: string;
  source: string;
  amount: number;
  date: string;
  month_id: number;
  year: number;
  user_id: string;
  currency_code?: string;
}

export interface TransactionItem {
  id: string;
  month_id: number;
  year: number;
  user_id: string;
  category_id: string;
  description: string;
  amount: number;
  date: string;
  direction: 'INCOME' | 'EXPENSE';
  currency_code: string;
  payment_method_id?: string;
  account_id?: string;
  notes?: string;
  created_at?: string;
  goal_id?: string;
  categories?: {
    name: string;
    emoji: string;
  } | null;
  // Alternative format from views
  category_name?: string;
  category_emoji?: string;
  payment_method_name?: string;
  account_name?: string;
}

export interface DebtItem {
  id: string;
  starting_balance: number;
  payment_made: number;
  ending_balance: number;
  month_id: number;
  year: number;
  user_id: string;
  debt_account_id: string;
  interest_rate_apr: number;
  min_payment: number;
  accounts?: {
    name: string;
  } | null;
  // Alternative format from views
  account_name?: string;
}

export interface WishItem {
  id: string;
  item: string;
  estimated_cost: number;
  priority: string;
  month_id: number;
  year: number;
  user_id: string;
}

export interface FinancialGoal {
  id: string;
  user_id: string;
  month_id: number;
  goal_type: 'savings' | 'debt_reduction' | 'expense_limit' | 'income_increase';
  target_amount: number;
  current_amount: number;
  description: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface StorageService {
  // Dashboard Data
  getMonthlySummaries(userId: string): Promise<MonthlySummary[]>;
  getAnnualSummary(userId: string): Promise<AnnualSummary | null>;
  
  // Current Month Data
  getRecentIncome(userId: string, monthId: number): Promise<IncomeItem[]>;
  getRecentTransactions(userId: string, monthId: number): Promise<TransactionItem[]>;
  getCurrentDebts(userId: string, monthId: number): Promise<DebtItem[]>;
  
  // Operations
  addIncome(income: Omit<IncomeItem, 'id'>): Promise<void>;
  addTransaction(transaction: Omit<TransactionItem, 'id' | 'categories'>): Promise<void>;
  addDebt(debt: Omit<DebtItem, 'id' | 'accounts'>): Promise<void>;
  addWish(wish: Omit<WishItem, 'id'>): Promise<void>;
  
  // Settings
  getSettings(userId: string): Promise<AppConfig | null>;
  saveSettings(userId: string, settings: Partial<AppConfig>): Promise<void>;
  
  // Metadata
  getCategories(userId: string): Promise<any[]>;
  getAccounts(userId: string): Promise<any[]>;
  getPaymentMethods(userId: string): Promise<any[]>;
  getFinancialGoals(userId: string): Promise<FinancialGoal[]>;
}
