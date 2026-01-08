import { supabase } from '@/integrations/supabase/client';
import { getTableName } from '@/utils/monthUtils';
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

export class SupabaseStorage implements StorageService {
  async getMonthlySummaries(userId: string): Promise<MonthlySummary[]> {
    // Get data for the last 12 months (rolling window)
    // Example: If today is Jan 2026, get data from Feb 2025 to Jan 2026
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // 1-12

    // Calculate 12 months ago
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(now.getMonth() - 11); // -11 to include current month
    const startYear = twelveMonthsAgo.getFullYear();
    const startMonth = twelveMonthsAgo.getMonth() + 1; // 1-12

    // Fetch data for the last 12 months
    const { data, error } = await supabase
      .from('view_monthly_summary')
      .select('*')
      .eq('user_id', userId)
      .or(`and(year.eq.${startYear},month_id.gte.${startMonth}),and(year.eq.${currentYear},month_id.lte.${currentMonth})`)
      .order('year', { ascending: true })
      .order('month_id', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAnnualSummary(userId: string): Promise<AnnualSummary | null> {
    // Calculate summary for the last 12 months (rolling window)
    // This gives more meaningful data than just current year
    const monthlySummaries = await this.getMonthlySummaries(userId);

    if (!monthlySummaries || monthlySummaries.length === 0) {
      return null;
    }

    // Sum all values from the last 12 months
    const summary = monthlySummaries.reduce((acc, month) => ({
      annual_income: (acc.annual_income || 0) + (month.total_income || 0),
      annual_expenses: (acc.annual_expenses || 0) + (month.total_expenses || 0),
      annual_net_cash_flow: (acc.annual_net_cash_flow || 0) + (month.net_cash_flow || 0),
      annual_needs_actual: (acc.annual_needs_actual || 0) + (month.needs_actual || 0),
      annual_wants_actual: (acc.annual_wants_actual || 0) + (month.wants_actual || 0),
      annual_future_actual: (acc.annual_future_actual || 0) + (month.future_actual || 0),
      annual_debt_payments: (acc.annual_debt_payments || 0) + (month.debt_payments || 0),
    }), {
      annual_income: 0,
      annual_expenses: 0,
      annual_net_cash_flow: 0,
      annual_needs_actual: 0,
      annual_wants_actual: 0,
      annual_future_actual: 0,
      annual_debt_payments: 0,
    });

    return summary;
  }

  async getRecentIncome(userId: string, monthId: number): Promise<IncomeItem[]> {
    const tableName = getTableName('monthly_income', monthId);
    const { data, error } = await (supabase as any)
      .from(tableName)
      .select('id, source, amount, date, month_id, user_id')
      .eq('user_id', userId)
      .eq('month_id', monthId)
      .order('date', { ascending: false })
      .limit(5);

    if (error) throw error;
    return data as IncomeItem[] || [];
  }

  async getRecentTransactions(userId: string, monthId: number): Promise<TransactionItem[]> {
    const { data, error } = await (supabase as any)
      .rpc('get_user_transactions', { p_user_id: userId, p_month_id: monthId });

    if (error) throw error;
    return data as TransactionItem[] || [];
  }

  async getCurrentDebts(userId: string, monthId: number): Promise<DebtItem[]> {
    const { data, error } = await (supabase as any)
      .rpc('get_user_debts', { p_user_id: userId, p_month_id: monthId });

    if (error) throw error;
    return data as DebtItem[] || [];
  }

  async addIncome(income: Omit<IncomeItem, 'id'>): Promise<void> {
    const tableName = getTableName('monthly_income', income.month_id);
    const { error } = await (supabase as any)
      .from(tableName)
      .insert([income]);

    if (error) throw error;
  }

  async addTransaction(transaction: Omit<TransactionItem, 'id' | 'categories'>): Promise<void> {
    const tableName = getTableName('monthly_transactions', transaction.month_id);
    const { error } = await (supabase as any)
      .from(tableName)
      .insert([transaction]);

    if (error) throw error;
  }

  async addDebt(debt: Omit<DebtItem, 'id' | 'accounts'>): Promise<void> {
    const tableName = getTableName('monthly_debts', debt.month_id);
    const { error } = await (supabase as any)
      .from(tableName)
      .insert([debt]);

    if (error) throw error;
  }

  async addWish(wish: Omit<WishItem, 'id'>): Promise<void> {
    const tableName = getTableName('monthly_wishlist', wish.month_id);
    const { error } = await (supabase as any)
      .from(tableName)
      .insert([wish]);

    if (error) throw error;
  }

  async getSettings(userId: string): Promise<AppConfig | null> {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading settings:', error);
      return null;
    }

    if (!data) return null;

    return {
      ownerName: data.owner_name || '',
      currency: (data.currency as any) || 'EUR',
      monthlyIncome: Number(data.monthly_income) || 0,
      language: (data.language as any) || 'es',
      avatarUrl: (data as any).avatar_url || '',
    };
  }

  async saveSettings(userId: string, settings: Partial<AppConfig>): Promise<void> {
    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        owner_name: settings.ownerName,
        currency: settings.currency,
        language: settings.language,
        monthly_income: settings.monthlyIncome,
        avatar_url: settings.avatarUrl,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (error) throw error;
  }

  async getCategories(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('is_active', true);
      
    if (error) throw error;
    return data || [];
  }

  async getAccounts(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data || [];
  }

  async getPaymentMethods(userId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    return data || [];
  }

  async getFinancialGoals(userId: string): Promise<any[]> {
    const { data, error } = await (supabase as any)
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
}
