import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { FinancialDataService, ComprehensiveFinancialData } from '@/services/FinancialDataService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  PiggyBank,
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Trophy,
  Activity,
  Plus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';

interface FinancialGoal {
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

interface AIRecommendation {
  category: string;
  priority: string;
  title: string;
  description: string;
  action: string;
  impact: string;
}

const SAVINGS_CATEGORIES = [
  'Fondo de Emergencia',
  'Vacaciones',
  'Coche',
  'Vivienda/Entrada',
  'Educación',
  'Salud/Seguros',
  'Inversiones',
  'Jubilación',
  'Electrónicos/Gadgets',
  'Regalos/Eventos',
  'Otros'
];

export const FinancialHealth = () => {
  const { config } = useApp();
  const { toast } = useToast();
  const [financialData, setFinancialData] = useState<ComprehensiveFinancialData | null>(null);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    description: SAVINGS_CATEGORIES[0],
    amount: '',
    type: 'savings' as const
  });

  useEffect(() => {
    console.log('FinancialHealth: mounting');
    loadFinancialData();

    // Listen for goals updates from AI Chat
    const handleGoalsUpdate = () => {
      if (userId) {
        loadGoals(userId);
      }
    };

    // Listen for AI recommendations from AI Chat
    const handleAIRecommendations = (event: Event) => {
      const customEvent = event as CustomEvent<{ recommendations: AIRecommendation[] }>;
      if (customEvent.detail?.recommendations) {
        setAiRecommendations(customEvent.detail.recommendations);
        toast({
          title: 'Recomendaciones actualizadas',
          description: `Se han generado ${customEvent.detail.recommendations.length} recomendaciones personalizadas.`,
        });
      }
    };

    window.addEventListener('financial-goals-updated', handleGoalsUpdate);
    window.addEventListener('ai-recommendations-generated', handleAIRecommendations as EventListener);

    return () => {
      window.removeEventListener('financial-goals-updated', handleGoalsUpdate);
      window.removeEventListener('ai-recommendations-generated', handleAIRecommendations as EventListener);
    };
  }, [userId]);

  const loadFinancialData = async () => {
    setIsLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        setUserId(userData.user.id);

        // Load persisted recommendations
        const savedRecommendations = localStorage.getItem(`ai_recommendations_${userData.user.id}`);
        if (savedRecommendations) {
          try {
            setAiRecommendations(JSON.parse(savedRecommendations));
          } catch (e) {
            console.error("Error parsing saved recommendations", e);
          }
        }

        const financialService = new FinancialDataService();
        const data = await financialService.getComprehensiveFinancialData(userData.user.id);
        setFinancialData(data);

        // Load goals
        await loadGoals(userData.user.id);
      }
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cargar la información financiera',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoals = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('financial_goals')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const createAutoGoals = async () => {
    if (!userId || !financialData) return;

    const today = new Date();
    const currentMonth = today.getMonth() + 1;

    try {
      const newGoals: Omit<FinancialGoal, 'id' | 'created_at' | 'updated_at'>[] = [];

      // Meta 1: Ahorro mensual (20% de ingresos según regla 50/30/20)
      const targetSavings = financialData.financialHealth.averageMonthlyIncome * 0.20;
      newGoals.push({
        user_id: userId,
        month_id: currentMonth,
        goal_type: 'savings',
        target_amount: targetSavings,
        current_amount: financialData.financialHealth.averageMonthlySavings,
        description: `Ahorrar ${targetSavings.toFixed(2)}€ este mes (20% de ingresos)`,
        is_completed: financialData.financialHealth.averageMonthlySavings >= targetSavings
      });

      // Meta 2: Reducción de deuda (si hay deudas)
      if (financialData.financialHealth.totalDebt > 0) {
        const monthlyDebtReduction = financialData.financialHealth.averageMonthlyDebtPayment * 1.1; // 10% más
        newGoals.push({
          user_id: userId,
          month_id: currentMonth,
          goal_type: 'debt_reduction',
          target_amount: monthlyDebtReduction,
          current_amount: financialData.financialHealth.averageMonthlyDebtPayment,
          description: `Pagar ${monthlyDebtReduction.toFixed(2)}€ en deudas este mes`,
          is_completed: false
        });
      }

      // Meta 3: Limitar gastos variables (deseos) al 30%
      const maxDesires = financialData.financialHealth.averageMonthlyIncome * 0.30;
      const currentDesires = financialData.monthlySummaries[financialData.monthlySummaries.length - 1]?.total_expenses * 0.3 || 0;
      newGoals.push({
        user_id: userId,
        month_id: currentMonth,
        goal_type: 'expense_limit',
        target_amount: maxDesires,
        current_amount: currentDesires,
        description: `Mantener gastos en deseos bajo ${maxDesires.toFixed(2)}€ (30% de ingresos)`,
        is_completed: currentDesires <= maxDesires
      });

      // Meta 4: Fondo de emergencia (6 meses de gastos)
      const emergencyFund = financialData.financialHealth.averageMonthlyExpenses * 6;
      const currentEmergencyFund = financialData.financialHealth.averageMonthlySavings * 12; // Aproximación
      newGoals.push({
        user_id: userId,
        month_id: currentMonth,
        goal_type: 'savings',
        target_amount: emergencyFund,
        current_amount: currentEmergencyFund,
        description: `Fondo de emergencia: ${emergencyFund.toFixed(2)}€ (6 meses de gastos)`,
        is_completed: currentEmergencyFund >= emergencyFund
      });

      // Insertar metas en la base de datos
      const { error } = await supabase
        .from('financial_goals')
        .insert(newGoals as any);

      if (error) throw error;

      toast({
        title: 'Metas creadas',
        description: `Se han creado ${newGoals.length} metas financieras para este mes`,
      });

      await loadGoals(userId);
    } catch (error) {
      console.error('Error creating goals:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron crear las metas',
        variant: 'destructive'
      });
    }
  };

  const updateGoalProgress = async (goalId: string, currentAmount: number) => {
    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({
          current_amount: currentAmount,
          is_completed: currentAmount >= goals.find(g => g.id === goalId)!.target_amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId);

      if (error) throw error;

      await loadGoals(userId!);
      toast({
        title: 'Progreso actualizado',
        description: 'El progreso de la meta ha sido actualizado',
      });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const createManualGoal = async () => {
    if (!newGoal.description || !newGoal.amount) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive'
      });
      return;
    }

    if (!userId) return;

    const currentMonth = new Date().getMonth() + 1;

    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          user_id: userId,
          month_id: currentMonth,
          goal_type: newGoal.type,
          target_amount: parseFloat(newGoal.amount),
          current_amount: 0,
          description: newGoal.description,
          is_completed: false
        } as any);

      if (error) throw error;

      toast({
        title: 'Meta creada',
        description: 'La meta se ha creado exitosamente',
      });

      setIsDialogOpen(false);
      setNewGoal({ description: '', amount: '', type: 'savings' });
      await loadGoals(userId);

    } catch (error) {
      console.error('Error creating manual goal:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear la meta',
        variant: 'destructive'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Cargando tu salud financiera...</p>
        </div>
      </div>
    );
  }

  if (!financialData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Sin datos</CardTitle>
            <CardDescription>No hay suficiente información financiera para mostrar</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const healthScore = financialData.financialHealth.overallHealthScore;
  const getHealthStatus = (score: number) => {
    if (score >= 80) return { label: 'Excelente', color: 'text-green-500', bg: 'bg-green-500' };
    if (score >= 60) return { label: 'Buena', color: 'text-blue-500', bg: 'bg-blue-500' };
    if (score >= 40) return { label: 'Regular', color: 'text-yellow-500', bg: 'bg-yellow-500' };
    return { label: 'Necesita Atención', color: 'text-red-500', bg: 'bg-red-500' };
  };

  const healthStatus = getHealthStatus(healthScore);
  const currentMonthGoals = goals.filter(g => g.month_id === new Date().getMonth() + 1);
  const completedGoals = currentMonthGoals.filter(g => g.is_completed).length;

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 max-w-7xl pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Salud Financiera</h1>
          <p className="text-muted-foreground">
            Gestiona tu bienestar económico y alcanza tus objetivos financieros
          </p>
        </div>

        {/* Puntuación General */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Puntuación de Salud Financiera</CardTitle>
                <CardDescription>Estado general de tu economía</CardDescription>
              </div>
              <Trophy className={`h-12 w-12 ${healthStatus.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl font-bold">{healthScore.toFixed(0)}</div>
              <div className="flex-1">
                <Progress value={healthScore} className="h-4 mb-2" />
                <p className={`text-sm font-semibold ${healthStatus.color}`}>{healthStatus.label}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {financialData.financialHealth.healthScoreBreakdown.debtManagement.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Gestión de Deudas</p>
              </div>
              <div className="text-center">
                <PiggyBank className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {financialData.financialHealth.healthScoreBreakdown.savingsHabits.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Hábitos de Ahorro</p>
              </div>
              <div className="text-center">
                <Target className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {financialData.financialHealth.healthScoreBreakdown.budgetDiscipline.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Disciplina Presupuestaria</p>
              </div>
              <div className="text-center">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">
                  {financialData.financialHealth.healthScoreBreakdown.incomeStability.toFixed(0)}
                </div>
                <p className="text-xs text-muted-foreground">Estabilidad de Ingresos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="goals">Metas</TabsTrigger>
            <TabsTrigger value="insights">Análisis</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Métricas Clave */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Control del Día a Día */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Control del Día a Día
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Ingresos Promedio</span>
                      <span className="font-semibold">
                        {financialData.financialHealth.averageMonthlyIncome.toFixed(2)} {config.currency}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Gastos Promedio</span>
                      <span className="font-semibold">
                        {financialData.financialHealth.averageMonthlyExpenses.toFixed(2)} {config.currency}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Balance Neto</span>
                      <span className={`font-semibold ${financialData.financialHealth.averageMonthlySavings > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {financialData.financialHealth.averageMonthlySavings.toFixed(2)} {config.currency}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {financialData.financialHealth.expenseTrend === 'increasing' && (
                        <>
                          <TrendingUp className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-500">Gastos en aumento</span>
                        </>
                      )}
                      {financialData.financialHealth.expenseTrend === 'decreasing' && (
                        <>
                          <TrendingDown className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-500">Gastos en reducción</span>
                        </>
                      )}
                      {financialData.financialHealth.expenseTrend === 'stable' && (
                        <>
                          <Minus className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-blue-500">Gastos estables</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Gestión de Deudas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Gestión de Deudas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Deuda Total</span>
                      <span className="font-semibold">
                        {financialData.financialHealth.totalDebt.toFixed(2)} {config.currency}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Ratio Deuda/Ingreso</span>
                      <span className="font-semibold">
                        {(financialData.financialHealth.debtToIncomeRatio * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Pago Mensual</span>
                      <span className="font-semibold">
                        {financialData.financialHealth.averageMonthlyDebtPayment.toFixed(2)} {config.currency}
                      </span>
                    </div>
                  </div>
                  {financialData.financialHealth.totalDebt > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          {financialData.financialHealth.debtPayoffProjection === 999
                            ? 'Sin plan de pago activo'
                            : `Liquidación en ~${financialData.financialHealth.debtPayoffProjection} meses`}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ahorro */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <PiggyBank className="h-5 w-5" />
                    Creación de Ahorro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Ahorro Mensual</span>
                      <span className="font-semibold">
                        {financialData.financialHealth.averageMonthlySavings.toFixed(2)} {config.currency}
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Tasa de Ahorro</span>
                      <span className="font-semibold">
                        {financialData.financialHealth.savingsRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-muted-foreground">Proyección Anual</span>
                      <span className="font-semibold">
                        {financialData.financialHealth.projectedAnnualSavings.toFixed(2)} {config.currency}
                      </span>
                    </div>
                  </div>
                  <div className="pt-2 border-t">
                    <Progress
                      value={Math.min(financialData.financialHealth.savingsRate / 20 * 100, 100)}
                      className="h-2 mb-2"
                    />
                    <p className="text-xs text-muted-foreground">
                      Meta: 20% de ahorro (Regla 50/30/20)
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Regla 50/30/20 */}
            <Card>
              <CardHeader>
                <CardTitle>Distribución Presupuestaria (Regla 50/30/20)</CardTitle>
                <CardDescription>
                  Cómo deberías distribuir tus ingresos según la metodología financiera recomendada
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Necesidades (50%)</span>
                      <span className="text-muted-foreground">
                        {(financialData.financialHealth.averageMonthlyIncome * 0.5).toFixed(2)} {config.currency}
                      </span>
                    </div>
                    <Progress value={50} className="h-3 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Vivienda, alimentación, transporte, seguros, servicios básicos
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Deseos (30%)</span>
                      <span className="text-muted-foreground">
                        {(financialData.financialHealth.averageMonthlyIncome * 0.3).toFixed(2)} {config.currency}
                      </span>
                    </div>
                    <Progress value={30} className="h-3 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Entretenimiento, hobbies, restaurantes, compras no esenciales
                    </p>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Ahorro/Deudas (20%)</span>
                      <span className="text-muted-foreground">
                        {(financialData.financialHealth.averageMonthlyIncome * 0.2).toFixed(2)} {config.currency}
                      </span>
                    </div>
                    <Progress value={20} className="h-3 mb-2" />
                    <p className="text-xs text-muted-foreground">
                      Fondo de emergencia, inversiones, pago extra de deudas
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alertas */}
            {(financialData.financialHealth.overBudgetCategories.length > 0 ||
              financialData.financialHealth.underutilizedCategories.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-500" />
                      Áreas de Atención
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {financialData.financialHealth.overBudgetCategories.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-500">Categorías con sobregasto</h4>
                        <div className="flex flex-wrap gap-2">
                          {financialData.financialHealth.overBudgetCategories.map((cat, idx) => (
                            <Badge key={idx} variant="destructive">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {financialData.financialHealth.underutilizedCategories.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-500">Categorías subutilizadas</h4>
                        <div className="flex flex-wrap gap-2">
                          {financialData.financialHealth.underutilizedCategories.map((cat, idx) => (
                            <Badge key={idx} variant="secondary">{cat}</Badge>
                          ))}
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">
                          Considera reasignar estos fondos a ahorro o pago de deudas
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold">Metas Mensuales</h3>
                <p className="text-sm text-muted-foreground">
                  {completedGoals} de {currentMonthGoals.length} metas completadas este mes
                </p>
              </div>
              <div className="flex gap-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      Crear Meta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Nueva Meta Financiera</DialogTitle>
                      <DialogDescription>
                        Establece un objetivo para este mes.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">Tipo de Meta</Label>
                        <Select
                          value={newGoal.type}
                          onValueChange={(value: any) => {
                            setNewGoal({
                              ...newGoal,
                              type: value,
                              description: value === 'savings' ? SAVINGS_CATEGORIES[0] : ''
                            });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="savings">Ahorro</SelectItem>
                            <SelectItem value="debt_reduction">Reducción de Deuda</SelectItem>
                            <SelectItem value="expense_limit">Límite de Gasto</SelectItem>
                            <SelectItem value="income_increase">Aumento de Ingresos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        {newGoal.type === 'savings' ? (
                          <Select
                            value={newGoal.description}
                            onValueChange={(value) => setNewGoal({ ...newGoal, description: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar categoría de ahorro" />
                            </SelectTrigger>
                            <SelectContent>
                              {SAVINGS_CATEGORIES.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="description"
                            placeholder="Ej: Pagar tarjeta VISA"
                            value={newGoal.description}
                            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                          />
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Cantidad Objetivo ({config.currency})</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newGoal.amount}
                          onChange={(e) => setNewGoal({ ...newGoal, amount: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={createManualGoal}>Crear Meta</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <Button onClick={createAutoGoals}>
                  <Target className="h-4 w-4 mr-2" />
                  Generar Metas Automáticas
                </Button>
              </div>
            </div>

            {currentMonthGoals.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay metas para este mes</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Crea metas automáticas basadas en tu situación financiera
                  </p>
                  <Button onClick={createAutoGoals}>Generar Metas</Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {currentMonthGoals.map((goal) => {
                  const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                  const getGoalIcon = () => {
                    switch (goal.goal_type) {
                      case 'savings': return <PiggyBank className="h-5 w-5" />;
                      case 'debt_reduction': return <CreditCard className="h-5 w-5" />;
                      case 'expense_limit': return <DollarSign className="h-5 w-5" />;
                      case 'income_increase': return <TrendingUp className="h-5 w-5" />;
                    }
                  };

                  return (
                    <Card key={goal.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3 flex-1">
                            <div className={`p-2 rounded-lg ${goal.is_completed ? 'bg-green-100' : 'bg-blue-100'}`}>
                              {getGoalIcon()}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{goal.description}</h4>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span>
                                  {goal.current_amount.toFixed(2)} / {goal.target_amount.toFixed(2)} {config.currency}
                                </span>
                                <span>•</span>
                                <span>{progress.toFixed(0)}%</span>
                              </div>
                            </div>
                          </div>
                          {goal.is_completed && (
                            <CheckCircle2 className="h-6 w-6 text-green-500" />
                          )}
                        </div>
                        <Progress value={progress} className="h-2" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recomendaciones Personalizadas</CardTitle>
                <CardDescription>
                  Acciones específicas para mejorar tu salud financiera {aiRecommendations.length > 0 && '(generadas por IA)'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AI Generated Recommendations */}
                {aiRecommendations.length > 0 ? (
                  <>
                    {aiRecommendations.map((rec, index) => {
                      const priorityColors = {
                        critical: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', desc: 'text-red-600' },
                        high: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700', desc: 'text-orange-600' },
                        medium: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', desc: 'text-yellow-600' },
                        low: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', desc: 'text-blue-600' },
                        positive: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', desc: 'text-green-600' }
                      };
                      const colors = priorityColors[rec.impact as keyof typeof priorityColors] || priorityColors.medium;

                      return (
                        <div key={index} className={`p-4 border rounded-lg ${colors.bg} ${colors.border}`}>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className={`font-semibold ${colors.text}`}>{rec.title}</h4>
                            <Badge variant="outline" className={`text-xs ${colors.text} border-current`}>
                              {rec.category}
                            </Badge>
                          </div>
                          <p className={`text-sm ${colors.desc} mb-2`}>
                            {rec.description}
                          </p>
                          <div className={`text-sm ${colors.text} font-medium mt-2 flex items-start gap-2`}>
                            <span className="shrink-0">→</span>
                            <span>{rec.action}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/30 rounded-md">
                      💡 Estas recomendaciones fueron generadas por el asistente IA basándose en tu perfil financiero completo.
                      Puedes solicitar recomendaciones más específicas preguntándole al asistente.
                    </div>
                  </>
                ) : (
                  <>
                    {/* Default Static Recommendations */}
                    <div className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-md">
                      💡 Pregúntale al asistente IA para obtener recomendaciones personalizadas basadas en tu situación financiera.
                      Puedes pedirle: "Dame recomendaciones para mejorar mi salud financiera"
                    </div>

                    {/* Deuda alta */}
                    {financialData.financialHealth.debtToIncomeRatio > 1.5 && (
                      <div className="p-4 border rounded-lg bg-red-50 border-red-200">
                        <h4 className="font-semibold text-red-700 mb-2">Prioriza el pago de deudas</h4>
                        <p className="text-sm text-red-600">
                          Tu ratio deuda-ingreso es alto ({(financialData.financialHealth.debtToIncomeRatio * 100).toFixed(0)}%).
                          Considera usar el método avalancha o bola de nieve para reducir deudas más rápido.
                        </p>
                      </div>
                    )}

                    {/* Bajo ahorro */}
                    {financialData.financialHealth.savingsRate < 10 && (
                      <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
                        <h4 className="font-semibold text-yellow-700 mb-2">Aumenta tu tasa de ahorro</h4>
                        <p className="text-sm text-yellow-600">
                          Tu tasa de ahorro es {financialData.financialHealth.savingsRate.toFixed(1)}%,
                          por debajo del 20% recomendado. Busca áreas donde reducir gastos no esenciales.
                        </p>
                      </div>
                    )}

                    {/* Gastos en aumento */}
                    {financialData.financialHealth.expenseTrend === 'increasing' && (
                      <div className="p-4 border rounded-lg bg-orange-50 border-orange-200">
                        <h4 className="font-semibold text-orange-700 mb-2">Controla el crecimiento de gastos</h4>
                        <p className="text-sm text-orange-600">
                          Tus gastos están en tendencia creciente. Revisa las categorías con sobregasto y
                          establece límites más estrictos.
                        </p>
                      </div>
                    )}

                    {/* Buena salud */}
                    {healthScore >= 80 && (
                      <div className="p-4 border rounded-lg bg-green-50 border-green-200">
                        <h4 className="font-semibold text-green-700 mb-2">¡Excelente trabajo!</h4>
                        <p className="text-sm text-green-600">
                          Tu salud financiera es excelente. Considera explorar opciones de inversión
                          para hacer crecer tu capital a largo plazo.
                        </p>
                      </div>
                    )}

                    {/* Fondo de emergencia */}
                    {financialData.financialHealth.averageMonthlySavings * 12 <
                      financialData.financialHealth.averageMonthlyExpenses * 6 && (
                        <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                          <h4 className="font-semibold text-blue-700 mb-2">Construye tu fondo de emergencia</h4>
                          <p className="text-sm text-blue-600">
                            Necesitas {(financialData.financialHealth.averageMonthlyExpenses * 6).toFixed(2)} {config.currency}
                            para un fondo de emergencia de 6 meses. Actual: {(financialData.financialHealth.averageMonthlySavings * 12).toFixed(2)} {config.currency}
                          </p>
                        </div>
                      )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};
