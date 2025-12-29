import Dexie, { Table } from 'dexie';
import { 
  StorageService, 
  MonthlySummary, 
  AnnualSummary, 
  IncomeItem, 
  TransactionItem, 
  DebtItem, 
  WishItem,
  AppConfig
} from './types';
import { MONTH_INFO } from '@/utils/monthUtils';

class BudgetDatabase extends Dexie {
  income!: Table<IncomeItem>;
  transactions!: Table<TransactionItem>;
  debts!: Table<DebtItem>;
  wishlist!: Table<WishItem>;
  settings!: Table<any>;
  categories!: Table<any>;
  accounts!: Table<any>;
  paymentMethods!: Table<any>;
  financialGoals!: Table<any>;

  constructor() {
    super('BudgetBlueprintDB');
    this.version(1).stores({
      income: '++id, user_id, month_id, date',
      transactions: '++id, user_id, month_id, date, category_id',
      debts: '++id, user_id, month_id',
      wishlist: '++id, user_id, month_id',
      settings: 'user_id',
      categories: '++id, user_id, is_active',
      accounts: '++id, user_id',
      paymentMethods: '++id, user_id',
      financialGoals: '++id, user_id, is_completed'
    });
  }
}

export class LocalStorage implements StorageService {
  private db = new BudgetDatabase();

  async getMonthlySummaries(userId: string): Promise<MonthlySummary[]> {
    // We need to aggregate data for all months
    const summaries: MonthlySummary[] = [];

    for (let monthId = 1; monthId <= 12; monthId++) {
      const income = await this.db.income
        .where({ user_id: userId, month_id: monthId })
        .toArray();
        
      const transactions = await this.db.transactions
        .where({ user_id: userId, month_id: monthId })
        .toArray();
        
      const debts = await this.db.debts
        .where({ user_id: userId, month_id: monthId })
        .toArray();

      const totalIncome = income.reduce((sum, item) => sum + (item.amount || 0), 0);
      const totalExpenses = transactions.reduce((sum, item) => sum + Math.abs(item.amount || 0), 0);
      const debtPayments = debts.reduce((sum, item) => sum + (item.payment_made || 0), 0);
      
      // Calculate needs, wants, future based on categories (simplified for now as we don't have joined category types easily)
      // In a real app we'd join with categories table to get types. 
      // For now, we'll just sum total expenses.
      
      if (totalIncome > 0 || totalExpenses > 0 || debtPayments > 0) {
        summaries.push({
          month_id: monthId,
          month_name: MONTH_INFO[monthId as keyof typeof MONTH_INFO].name,
          total_income: totalIncome,
          total_expenses: totalExpenses,
          net_cash_flow: totalIncome - totalExpenses,
          needs_actual: 0, // To be implemented with category joins
          wants_actual: 0,
          future_actual: 0,
          debt_payments: debtPayments
        });
      }
    }

    return summaries;
  }

  async getAnnualSummary(userId: string): Promise<AnnualSummary | null> {
    const income = await this.db.income.where('user_id').equals(userId).toArray();
    const transactions = await this.db.transactions.where('user_id').equals(userId).toArray();
    const debts = await this.db.debts.where('user_id').equals(userId).toArray();

    const totalIncome = income.reduce((sum, item) => sum + (item.amount || 0), 0);
    const totalExpenses = transactions.reduce((sum, item) => sum + Math.abs(item.amount || 0), 0);
    const debtPayments = debts.reduce((sum, item) => sum + (item.payment_made || 0), 0);

    return {
      annual_income: totalIncome,
      annual_expenses: totalExpenses,
      annual_net_cash_flow: totalIncome - totalExpenses,
      annual_needs_actual: 0,
      annual_wants_actual: 0,
      annual_future_actual: 0,
      annual_debt_payments: debtPayments
    };
  }

  async getRecentIncome(userId: string, monthId: number): Promise<IncomeItem[]> {
    return await this.db.income
      .where({ user_id: userId, month_id: monthId })
      .reverse()
      .sortBy('date')
      .then(items => items.slice(0, 5));
  }

  async getRecentTransactions(userId: string, monthId: number): Promise<TransactionItem[]> {
    const transactions = await this.db.transactions
      .where({ user_id: userId, month_id: monthId })
      .reverse()
      .sortBy('date')
      .then(items => items.slice(0, 5));

    // Manually join categories
    const categories = await this.db.categories.toArray();
    const categoryMap = new Map(categories.map(c => [c.id, c]));

    return transactions.map(t => ({
      ...t,
      categories: t.category_id ? {
        name: categoryMap.get(t.category_id)?.name || 'Unknown',
        emoji: categoryMap.get(t.category_id)?.emoji || '📝'
      } : null
    }));
  }

  async getCurrentDebts(userId: string, monthId: number): Promise<DebtItem[]> {
    const debts = await this.db.debts
      .where({ user_id: userId, month_id: monthId })
      .toArray();

    const accounts = await this.db.accounts.toArray();
    const accountMap = new Map(accounts.map(a => [a.id, a]));

    return debts.map(d => ({
      ...d,
      accounts: d.debt_account_id ? {
        name: accountMap.get(d.debt_account_id)?.name || 'Unknown'
      } : null
    }));
  }

  async addIncome(income: Omit<IncomeItem, 'id'>): Promise<void> {
    await this.db.income.add({
      ...income,
      id: crypto.randomUUID()
    } as IncomeItem);
  }

  async addTransaction(transaction: Omit<TransactionItem, 'id' | 'categories'>): Promise<void> {
    await this.db.transactions.add({
      ...transaction,
      id: crypto.randomUUID()
    } as TransactionItem);
  }

  async addDebt(debt: Omit<DebtItem, 'id' | 'accounts'>): Promise<void> {
    await this.db.debts.add({
      ...debt,
      id: crypto.randomUUID()
    } as DebtItem);
  }

  async addWish(wish: Omit<WishItem, 'id'>): Promise<void> {
    await this.db.wishlist.add({
      ...wish,
      id: crypto.randomUUID()
    } as WishItem);
  }

  async getSettings(userId: string): Promise<AppConfig | null> {
    const settings = await this.db.settings.get({ user_id: userId });
    if (!settings) return null;
    
    return {
      ownerName: settings.owner_name || '',
      currency: settings.currency || 'EUR',
      monthlyIncome: Number(settings.monthly_income) || 0,
      language: settings.language || 'es',
      avatarUrl: settings.avatar_url || '',
    };
  }

  async saveSettings(userId: string, settings: Partial<AppConfig>): Promise<void> {
    const existing = await this.db.settings.get({ user_id: userId });
    await this.db.settings.put({
      ...existing,
      user_id: userId,
      owner_name: settings.ownerName,
      currency: settings.currency,
      language: settings.language,
      monthly_income: settings.monthlyIncome,
      avatar_url: settings.avatarUrl,
      updated_at: new Date().toISOString(),
    });
  }

  async getCategories(userId: string): Promise<any[]> {
    return await this.db.categories
      .where({ user_id: userId })
      .filter(c => c.is_active !== false)
      .toArray();
  }

  async getAccounts(userId: string): Promise<any[]> {
    return await this.db.accounts
      .where({ user_id: userId })
      .toArray();
  }

  async getPaymentMethods(userId: string): Promise<any[]> {
    return await this.db.paymentMethods
      .where({ user_id: userId })
      .toArray();
  }

  async getFinancialGoals(userId: string): Promise<any[]> {
    return await this.db.financialGoals
      .where({ user_id: userId })
      .filter(g => g.is_completed !== true)
      .toArray();
  }
}
