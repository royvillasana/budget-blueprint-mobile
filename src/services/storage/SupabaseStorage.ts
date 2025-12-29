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
    const { data, error } = await supabase
      .from('view_monthly_summary')
      .select('*')
      .eq('user_id', userId)
      .order('month_id', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getAnnualSummary(userId: string): Promise<AnnualSummary | null> {
    const { data, error } = await supabase
      .from('view_annual_summary')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
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
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    return data || [];
  }
}
