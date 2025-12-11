import { supabase } from '@/integrations/supabase/client';

export interface ComprehensiveFinancialData {
  // All historical data
  allTransactions: TransactionData[];
  allIncome: IncomeData[];
  allBudgets: BudgetData[];
  allDebts: DebtData[];

  // Summary data
  monthlySummaries: MonthlySummaryData[];
  annualSummary: AnnualSummaryData | null;

  // Financial health metrics
  financialHealth: FinancialHealthMetrics;

  // Reference data
  categories: CategoryData[];
  accounts: AccountData[];
  paymentMethods: PaymentMethodData[];
}

export interface TransactionData {
  id: string;
  month_id: number;
  month_name?: string;
  user_id: string;
  date: string;
  description: string;
  category_id: string;
  category_name?: string;
  category_emoji?: string;
  amount: number;
  direction: string;
  payment_method_id?: string;
  payment_method_name?: string;
  account_id?: string;
  account_name?: string;
  currency_code: string;
  notes?: string;
  created_at: string;
}

export interface IncomeData {
  id: string;
  month_id: number;
  month_name?: string;
  user_id: string;
  source: string;
  amount: number;
  date: string;
  currency_code: string;
  notes?: string;
  created_at: string;
}

export interface BudgetData {
  id: string;
  month_id: number;
  month_name?: string;
  user_id: string;
  category_id: string;
  category_name?: string;
  category_emoji?: string;
  bucket_50_30_20?: string;
  assigned: number;
  actual: number;
  created_at: string;
  updated_at: string;
}

export interface DebtData {
  id: string;
  month_id: number;
  month_name?: string;
  user_id: string;
  debt_account_id: string;
  account_name?: string;
  starting_balance: number;
  payment_made: number;
  ending_balance: number;
  interest_rate_apr: number;
  min_payment: number;
  due_day: number;
  created_at: string;
}

export interface MonthlySummaryData {
  month_id: number;
  month_name: string;
  user_id: string;
  total_income: number;
  total_expenses: number;
  net_cash_flow: number;
  savings_rate: number;
  budget_assigned: number;
  budget_actual: number;
  budget_variance: number;
  total_debt: number;
}

export interface AnnualSummaryData {
  user_id: string;
  annual_income: number;
  annual_expenses: number;
  annual_net_cash_flow: number;
  annual_savings_rate: number;
  annual_budget_assigned: number;
  annual_budget_actual: number;
  annual_budget_variance: number;
  annual_total_debt: number;
}

export interface FinancialHealthMetrics {
  // Debt metrics
  debtToIncomeRatio: number;
  totalDebt: number;
  averageMonthlyDebtPayment: number;
  debtPayoffProjection: number; // months to pay off at current rate

  // Savings metrics
  savingsRate: number;
  averageMonthlySavings: number;
  projectedAnnualSavings: number;

  // Budget adherence
  budgetAdherenceRate: number; // percentage of budget categories on track
  overBudgetCategories: string[];
  underutilizedCategories: string[];

  // Spending patterns
  averageMonthlyExpenses: number;
  highestExpenseCategory: { name: string; amount: number } | null;
  expenseTrend: 'increasing' | 'decreasing' | 'stable';

  // Income stability
  averageMonthlyIncome: number;
  incomeVariability: number; // coefficient of variation
  incomeGrowthRate: number; // percentage change over time

  // Overall health score (0-100)
  overallHealthScore: number;
  healthScoreBreakdown: {
    debtManagement: number;
    savingsHabits: number;
    budgetDiscipline: number;
    incomeStability: number;
  };
}

export interface CategoryData {
  id: string;
  name: string;
  emoji: string;
  bucket_50_30_20: string;
  is_active: boolean;
}

export interface AccountData {
  id: string;
  name: string;
  type: string;
  currency_code: string;
}

export interface PaymentMethodData {
  id: string;
  name: string;
  type: string;
}

export class FinancialDataService {
  /**
   * Fetches all comprehensive financial data for a user
   */
  async getComprehensiveFinancialData(userId: string): Promise<ComprehensiveFinancialData> {
    // Fetch all data in parallel for performance
    const [
      allTransactions,
      allIncome,
      allBudgets,
      allDebts,
      monthlySummaries,
      annualSummary,
      categories,
      accounts,
      paymentMethods,
      months
    ] = await Promise.all([
      this.getAllTransactions(userId),
      this.getAllIncome(userId),
      this.getAllBudgets(userId),
      this.getAllDebts(userId),
      this.getMonthlySummaries(userId),
      this.getAnnualSummary(userId),
      this.getCategories(userId),
      this.getAccounts(userId),
      this.getPaymentMethods(userId),
      this.getMonths()
    ]);

    // Create a month lookup map
    const monthMap = new Map(months.map(m => [m.id, m.name]));

    // Enrich data with month names
    const enrichedTransactions = allTransactions.map(t => ({
      ...t,
      month_name: monthMap.get(t.month_id)
    }));

    const enrichedIncome = allIncome.map(i => ({
      ...i,
      month_name: monthMap.get(i.month_id)
    }));

    const enrichedBudgets = allBudgets.map(b => ({
      ...b,
      month_name: monthMap.get(b.month_id)
    }));

    const enrichedDebts = allDebts.map(d => ({
      ...d,
      month_name: monthMap.get(d.month_id)
    }));

    // Calculate financial health metrics
    const financialHealth = this.calculateFinancialHealth(
      enrichedTransactions,
      enrichedIncome,
      enrichedBudgets,
      enrichedDebts,
      monthlySummaries,
      annualSummary,
      categories
    );

    return {
      allTransactions: enrichedTransactions,
      allIncome: enrichedIncome,
      allBudgets: enrichedBudgets,
      allDebts: enrichedDebts,
      monthlySummaries,
      annualSummary,
      financialHealth,
      categories,
      accounts,
      paymentMethods
    };
  }

  private async getAllTransactions(userId: string): Promise<TransactionData[]> {
    const { data, error } = await supabase
      .from('view_transactions_all')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching all transactions:', error);
      return [];
    }
    return data || [];
  }

  private async getAllIncome(userId: string): Promise<IncomeData[]> {
    const { data, error } = await supabase
      .from('view_income_all')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching all income:', error);
      return [];
    }
    return data || [];
  }

  private async getAllBudgets(userId: string): Promise<BudgetData[]> {
    const { data, error } = await supabase
      .from('view_budget_all')
      .select('*')
      .eq('user_id', userId)
      .order('month_id', { ascending: false });

    if (error) {
      console.error('Error fetching all budgets:', error);
      return [];
    }
    return data || [];
  }

  private async getAllDebts(userId: string): Promise<DebtData[]> {
    const { data, error } = await supabase
      .from('view_debts_all')
      .select('*')
      .eq('user_id', userId)
      .order('month_id', { ascending: false });

    if (error) {
      console.error('Error fetching all debts:', error);
      return [];
    }
    return data || [];
  }

  private async getMonthlySummaries(userId: string): Promise<MonthlySummaryData[]> {
    const { data, error } = await supabase
      .from('view_monthly_summary')
      .select('*')
      .eq('user_id', userId)
      .order('month_id', { ascending: true });

    if (error) {
      console.error('Error fetching monthly summaries:', error);
      return [];
    }
    return data || [];
  }

  private async getAnnualSummary(userId: string): Promise<AnnualSummaryData | null> {
    const { data, error } = await supabase
      .from('view_annual_summary')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching annual summary:', error);
      return null;
    }
    return data;
  }

  private async getCategories(userId: string): Promise<CategoryData[]> {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
    return data || [];
  }

  private async getAccounts(userId: string): Promise<AccountData[]> {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
    return data || [];
  }

  private async getPaymentMethods(userId: string): Promise<PaymentMethodData[]> {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching payment methods:', error);
      return [];
    }
    return data || [];
  }

  private async getMonths(): Promise<Array<{ id: number; name: string }>> {
    const { data, error } = await supabase
      .from('months')
      .select('id, name')
      .order('id', { ascending: true });

    if (error) {
      console.error('Error fetching months:', error);
      return [];
    }
    return data || [];
  }

  /**
   * Calculates comprehensive financial health metrics
   */
  private calculateFinancialHealth(
    transactions: TransactionData[],
    income: IncomeData[],
    budgets: BudgetData[],
    debts: DebtData[],
    monthlySummaries: MonthlySummaryData[],
    annualSummary: AnnualSummaryData | null,
    categories: CategoryData[]
  ): FinancialHealthMetrics {
    // DEBT METRICS
    const currentMonthDebts = debts.length > 0
      ? debts.filter(d => d.month_id === Math.max(...debts.map(d => d.month_id)))
      : [];
    const totalDebt = currentMonthDebts.reduce((sum, d) => sum + Number(d.ending_balance), 0);
    const averageMonthlyDebtPayment = debts.length > 0
      ? debts.reduce((sum, d) => sum + Number(d.payment_made), 0) / new Set(debts.map(d => d.month_id)).size
      : 0;

    const averageMonthlyIncome = annualSummary && Number(annualSummary.annual_income) > 0
      ? Number(annualSummary.annual_income) / 12
      : 0;
    const debtToIncomeRatio = averageMonthlyIncome > 0 ? (totalDebt / averageMonthlyIncome) : 0;
    const debtPayoffProjection = averageMonthlyDebtPayment > 0 ? Math.ceil(totalDebt / averageMonthlyDebtPayment) : 999;

    // SAVINGS METRICS
    const savingsRate = annualSummary ? Number(annualSummary.annual_savings_rate) : 0;
    const averageMonthlySavings = annualSummary ? Number(annualSummary.annual_net_cash_flow) / 12 : 0;
    const projectedAnnualSavings = averageMonthlySavings * 12;

    // BUDGET ADHERENCE
    const currentMonthBudgets = budgets.length > 0
      ? budgets.filter(b => b.month_id === Math.max(...budgets.map(b => b.month_id)))
      : [];
    const budgetedCategories = currentMonthBudgets.filter(b => Number(b.assigned) > 0);
    const onTrackCategories = budgetedCategories.filter(b => Number(b.actual) <= Number(b.assigned));
    const budgetAdherenceRate = budgetedCategories.length > 0
      ? Math.max(30, (onTrackCategories.length / budgetedCategories.length) * 100)
      : 70; // Default reasonable score if no budget set yet

    const overBudgetCategories = currentMonthBudgets
      .filter(b => Number(b.actual) > Number(b.assigned) && Number(b.assigned) > 0)
      .map(b => b.category_name || 'Unknown')
      .filter(name => name !== 'Unknown');

    const underutilizedCategories = currentMonthBudgets
      .filter(b => Number(b.actual) < Number(b.assigned) * 0.5 && Number(b.assigned) > 0)
      .map(b => b.category_name || 'Unknown')
      .filter(name => name !== 'Unknown');

    // SPENDING PATTERNS
    const averageMonthlyExpenses = annualSummary ? Number(annualSummary.annual_expenses) / 12 : 0;

    // Calculate highest expense category from current month transactions
    const currentMonth = transactions.length > 0 ? Math.max(...transactions.map(t => t.month_id)) : 0;
    const currentMonthTransactions = transactions.filter(t => t.month_id === currentMonth);
    const categoryTotals = new Map<string, { name: string; total: number }>();

    currentMonthTransactions.forEach(t => {
      const categoryName = t.category_name || 'Uncategorized';
      if (!categoryTotals.has(categoryName)) {
        categoryTotals.set(categoryName, { name: categoryName, total: 0 });
      }
      categoryTotals.get(categoryName)!.total += Number(t.amount);
    });

    const highestExpenseCategory = Array.from(categoryTotals.values())
      .sort((a, b) => b.total - a.total)[0] || null;

    // Calculate expense trend (last 3 months)
    const recentMonths = monthlySummaries.slice(-3);
    const expenseTrend = this.calculateTrend(recentMonths.map(m => Number(m.total_expenses)));

    // INCOME STABILITY
    const monthlyIncomes = monthlySummaries.map(m => Number(m.total_income));
    const incomeVariability = this.calculateCoefficientOfVariation(monthlyIncomes);
    const incomeGrowthRate = this.calculateGrowthRate(monthlyIncomes);

    // HEALTH SCORES (0-100)
    const debtManagementScore = this.calculateDebtScore(debtToIncomeRatio, averageMonthlyDebtPayment, totalDebt);
    const savingsHabitsScore = this.calculateSavingsScore(savingsRate, averageMonthlySavings, averageMonthlyIncome);
    const budgetDisciplineScore = budgetAdherenceRate;
    const incomeStabilityScore = this.calculateIncomeStabilityScore(incomeVariability, incomeGrowthRate);

    const overallHealthScore = (
      debtManagementScore * 0.25 +
      savingsHabitsScore * 0.30 +
      budgetDisciplineScore * 0.25 +
      incomeStabilityScore * 0.20
    );

    return {
      // Debt metrics
      debtToIncomeRatio,
      totalDebt,
      averageMonthlyDebtPayment,
      debtPayoffProjection,

      // Savings metrics
      savingsRate,
      averageMonthlySavings,
      projectedAnnualSavings,

      // Budget adherence
      budgetAdherenceRate,
      overBudgetCategories,
      underutilizedCategories,

      // Spending patterns
      averageMonthlyExpenses,
      highestExpenseCategory: highestExpenseCategory ? {
        name: highestExpenseCategory.name,
        amount: highestExpenseCategory.total
      } : null,
      expenseTrend,

      // Income stability
      averageMonthlyIncome,
      incomeVariability,
      incomeGrowthRate,

      // Overall health score
      overallHealthScore,
      healthScoreBreakdown: {
        debtManagement: debtManagementScore,
        savingsHabits: savingsHabitsScore,
        budgetDiscipline: budgetDisciplineScore,
        incomeStability: incomeStabilityScore
      }
    };
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const changePercent = ((secondAvg - firstAvg) / firstAvg) * 100;

    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  private calculateCoefficientOfVariation(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    if (mean === 0) return 0;

    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return (stdDev / mean) * 100;
  }

  private calculateGrowthRate(values: number[]): number {
    if (values.length < 2) return 0;

    const first = values[0];
    const last = values[values.length - 1];

    if (first === 0) return 0;

    return ((last - first) / first) * 100;
  }

  private calculateDebtScore(debtToIncome: number, monthlyPayment: number, totalDebt: number): number {
    // No debt is excellent
    if (totalDebt === 0) return 100;

    // Start from a middle baseline
    let score = 60;

    // Penalize high debt-to-income ratio
    if (debtToIncome > 3) score -= 35;
    else if (debtToIncome > 2) score -= 25;
    else if (debtToIncome > 1) score -= 15;
    else if (debtToIncome > 0.5) score -= 5;
    else score += 10; // Reward low debt ratio

    // Reward consistent payments
    if (monthlyPayment > 0) score += 15;

    // Ensure minimum score of 20 if there's debt (not 0)
    return Math.max(20, Math.min(100, score));
  }

  private calculateSavingsScore(savingsRate: number, monthlySavings: number, monthlyIncome: number): number {
    // Start with a baseline score
    let score = 30; // Everyone starts with potential

    // Savings rate scoring (adds 0-50 points on top of baseline)
    if (savingsRate >= 20) score += 50;
    else if (savingsRate >= 15) score += 40;
    else if (savingsRate >= 10) score += 30;
    else if (savingsRate >= 5) score += 20;
    else if (savingsRate > 0) score += (savingsRate / 5) * 20;
    else score -= 10; // Small penalty for no savings, but not severe

    // Consistency bonus (0-20 points)
    if (monthlySavings > 0) {
      const savingsToIncomeRatio = monthlyIncome > 0 ? (monthlySavings / monthlyIncome) : 0;
      score += Math.min(20, savingsToIncomeRatio * 100);
    }

    return Math.max(20, Math.min(100, score));
  }

  private calculateIncomeStabilityScore(variability: number, growthRate: number): number {
    // Start at a good baseline (stable income is default assumption)
    let score = 70;

    // Penalize high variability
    if (variability > 30) score -= 30;
    else if (variability > 20) score -= 20;
    else if (variability > 10) score -= 10;
    else if (variability > 5) score -= 5;
    else if (variability === 0) score += 10; // Perfect stability

    // Reward positive growth
    if (growthRate > 10) score += 15;
    else if (growthRate > 5) score += 10;
    else if (growthRate > 0) score += 5;

    // Penalize negative growth
    if (growthRate < -10) score -= 15;
    else if (growthRate < -5) score -= 10;

    // Ensure minimum score of 30 (income stability has some baseline value)
    return Math.max(30, Math.min(100, score));
  }

  /**
   * Get detailed debt analysis and payoff strategies
   */
  async getDebtAnalysis(userId: string): Promise<DebtAnalysis> {
    const debts = await this.getAllDebts(userId);
    const income = await this.getAllIncome(userId);

    if (debts.length === 0) {
      return {
        totalDebt: 0,
        debts: [],
        strategies: [],
        recommendations: ['¡Excelente! No tienes deudas registradas.']
      };
    }

    // Get current month debts
    const currentMonth = Math.max(...debts.map(d => d.month_id));
    const currentDebts = debts.filter(d => d.month_id === currentMonth);

    const totalDebt = currentDebts.reduce((sum, d) => sum + Number(d.ending_balance), 0);
    const totalMonthlyIncome = income
      .filter(i => i.month_id === currentMonth)
      .reduce((sum, i) => sum + Number(i.amount), 0);

    // Calculate payoff strategies
    const strategies = [
      this.calculateSnowballStrategy(currentDebts),
      this.calculateAvalancheStrategy(currentDebts),
      this.calculateHighestBalanceStrategy(currentDebts)
    ];

    // Generate recommendations
    const recommendations = this.generateDebtRecommendations(currentDebts, totalMonthlyIncome);

    return {
      totalDebt,
      debts: currentDebts.map(d => ({
        id: d.id,
        name: d.account_name || 'Unknown',
        balance: Number(d.ending_balance),
        interestRate: Number(d.interest_rate_apr),
        minPayment: Number(d.min_payment),
        dueDay: d.due_day
      })),
      strategies,
      recommendations
    };
  }

  private calculateSnowballStrategy(debts: DebtData[]): PayoffStrategy {
    const sortedDebts = [...debts].sort((a, b) => Number(a.ending_balance) - Number(b.ending_balance));

    return {
      name: 'Método Bola de Nieve',
      description: 'Paga primero las deudas más pequeñas para ganar momentum psicológico',
      order: sortedDebts.map(d => d.account_name || 'Unknown'),
      estimatedMonths: this.estimatePayoffTime(sortedDebts),
      totalInterest: this.calculateTotalInterest(sortedDebts)
    };
  }

  private calculateAvalancheStrategy(debts: DebtData[]): PayoffStrategy {
    const sortedDebts = [...debts].sort((a, b) => Number(b.interest_rate_apr) - Number(a.interest_rate_apr));

    return {
      name: 'Método Avalancha',
      description: 'Paga primero las deudas con mayor interés para ahorrar dinero',
      order: sortedDebts.map(d => d.account_name || 'Unknown'),
      estimatedMonths: this.estimatePayoffTime(sortedDebts),
      totalInterest: this.calculateTotalInterest(sortedDebts)
    };
  }

  private calculateHighestBalanceStrategy(debts: DebtData[]): PayoffStrategy {
    const sortedDebts = [...debts].sort((a, b) => Number(b.ending_balance) - Number(a.ending_balance));

    return {
      name: 'Método Balance Mayor',
      description: 'Paga primero las deudas más grandes para reducir el balance total rápidamente',
      order: sortedDebts.map(d => d.account_name || 'Unknown'),
      estimatedMonths: this.estimatePayoffTime(sortedDebts),
      totalInterest: this.calculateTotalInterest(sortedDebts)
    };
  }

  private estimatePayoffTime(debts: DebtData[]): number {
    const totalPayment = debts.reduce((sum, d) => sum + Number(d.payment_made), 0);
    const totalBalance = debts.reduce((sum, d) => sum + Number(d.ending_balance), 0);

    if (totalPayment === 0) return 999;

    return Math.ceil(totalBalance / totalPayment);
  }

  private calculateTotalInterest(debts: DebtData[]): number {
    // Simplified interest calculation
    return debts.reduce((sum, d) => {
      const monthlyRate = Number(d.interest_rate_apr) / 12 / 100;
      const months = this.estimatePayoffTime(debts);
      const interest = Number(d.ending_balance) * monthlyRate * months;
      return sum + interest;
    }, 0);
  }

  private generateDebtRecommendations(debts: DebtData[], monthlyIncome: number): string[] {
    const recommendations: string[] = [];
    const totalDebt = debts.reduce((sum, d) => sum + Number(d.ending_balance), 0);
    const debtToIncome = monthlyIncome > 0 ? totalDebt / monthlyIncome : 0;

    if (debtToIncome > 2) {
      recommendations.push('⚠️ Tu ratio deuda-ingreso es alto (>200%). Considera consolidar tus deudas.');
    }

    const highInterestDebts = debts.filter(d => Number(d.interest_rate_apr) > 15);
    if (highInterestDebts.length > 0) {
      recommendations.push(`💡 Tienes ${highInterestDebts.length} deuda(s) con interés alto (>15%). Prioriza pagarlas primero.`);
    }

    const minPaymentTotal = debts.reduce((sum, d) => sum + Number(d.min_payment), 0);
    if (minPaymentTotal > monthlyIncome * 0.3) {
      recommendations.push('⚠️ Tus pagos mínimos superan el 30% de tu ingreso. Busca formas de aumentar tus ingresos o reducir gastos.');
    }

    if (debts.some(d => Number(d.payment_made) === Number(d.min_payment))) {
      recommendations.push('💡 Intenta pagar más del mínimo cuando sea posible para reducir el tiempo de pago y los intereses.');
    }

    return recommendations;
  }
}

export interface DebtAnalysis {
  totalDebt: number;
  debts: Array<{
    id: string;
    name: string;
    balance: number;
    interestRate: number;
    minPayment: number;
    dueDay: number;
  }>;
  strategies: PayoffStrategy[];
  recommendations: string[];
}

export interface PayoffStrategy {
  name: string;
  description: string;
  order: string[];
  estimatedMonths: number;
  totalInterest: number;
}
