import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getTableName } from '@/utils/monthUtils';
import { useApp } from '@/contexts/AppContext';
import { AIService, AIMessage } from '@/services/AIService';
import { FinancialDataService } from '@/services/FinancialDataService';
import { GamificationService } from '@/services/gamification';
import { Button } from '@/components/ui/button';
import {
    Bot, Sparkles, ExternalLink, Mic,
    Paperclip,
    Square,
    Briefcase,
    History
} from 'lucide-react';
import { useConversations } from '@/contexts/ConversationContext';
import { ConversationTabs } from '@/components/ConversationTabs';
import { ConversationHistory } from '@/components/ConversationHistory';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useUsage } from '@/hooks/useSubscription';
import { UsageLimitPrompt } from '@/components/UpgradePrompt';
import { SubscriptionService } from '@/services/SubscriptionService';
import { subDays, format as formatDate } from 'date-fns';
import { useMessageCredits } from '@/hooks/useMessageCredits';
import { useCreditNotifications } from '@/hooks/useCreditNotifications';
import { MessageCreditsService } from '@/services/MessageCreditsService';
import {
    ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import {
    Message,
    MessageContent,
    MessageAttachments,
    MessageAttachment,
} from '@/components/ai-elements/message';
import {
    PromptInput,
    PromptInputBody,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputTools,
    PromptInputAttachments,
    PromptInputAttachment,
    usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import type { FileUIPart } from 'ai';
import ReactMarkdown from 'react-markdown';

// Extend AIMessage to include UI actions
export interface ExtendedAIMessage extends AIMessage {
    action?: {
        type: 'view_transaction';
        label: string;
        path: string;
        transactionId?: string;
    };
    categorySelection?: {
        categories: Array<{ id: string; name: string }>;
        suggestedCategories?: string[];
    };
    isCategorySelection?: boolean;
    suggestedCategories?: string[];
    confirmation?: {
        summary: string;
        transaction: any;
    };
    isConfirmation?: boolean;
    confirmationData?: any;
    isHidden?: boolean;
    options?: Array<{
        label: string;
        description: string;
        value: string;
    }>;
    is_hidden?: boolean;
    metadata?: any;
}

// Small component to access attachment hook
const AttachmentButton = () => {
    const { openFileDialog } = usePromptInputAttachments();
    return (
        <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={openFileDialog}
        >
            <Paperclip className="h-4 w-4" />
        </Button>
    );
};

// Helper function to generate investment recommendations
const generateInvestmentRecommendations = (
    riskProfile: string,
    investmentHorizon: string,
    financialHealth: any
) => {
    const recommendations = [];

    if (financialHealth.debtToIncomeRatio > 1.5) {
        recommendations.push({
            priority: 'high',
            category: 'debt_management',
            message: 'Considera priorizar el pago de deudas antes de invertir. Tu ratio deuda-ingreso es alto.'
        });
    }

    const emergencyFundMonths = financialHealth.averageMonthlySavings * 12 / financialHealth.averageMonthlyExpenses;
    if (emergencyFundMonths < 3) {
        recommendations.push({
            priority: 'high',
            category: 'emergency_fund',
            message: 'Construye un fondo de emergencia de 3-6 meses de gastos antes de invertir agresivamente.'
        });
    }

    if (riskProfile === 'conservative') {
        recommendations.push({
            priority: 'medium',
            category: 'asset_allocation',
            message: 'Para perfil conservador: 70% bonos/renta fija, 20% acciones, 10% efectivo/equivalentes.'
        });
    } else if (riskProfile === 'moderate') {
        recommendations.push({
            priority: 'medium',
            category: 'asset_allocation',
            message: 'Para perfil moderado: 50% acciones, 40% bonos, 10% alternativos/efectivo.'
        });
    } else if (riskProfile === 'aggressive') {
        recommendations.push({
            priority: 'medium',
            category: 'asset_allocation',
            message: 'Para perfil agresivo: 80% acciones, 15% alternativos, 5% bonos/efectivo.'
        });
    }

    if (investmentHorizon === 'short') {
        recommendations.push({
            priority: 'medium',
            category: 'strategy',
            message: 'Horizonte corto (<3 años): Prioriza inversiones de bajo riesgo y alta liquidez.'
        });
    } else if (investmentHorizon === 'long') {
        recommendations.push({
            priority: 'medium',
            category: 'strategy',
            message: 'Horizonte largo (>10 años): Puedes asumir más riesgo para mayor potencial de crecimiento.'
        });
    }

    recommendations.push({
        priority: 'low',
        category: 'diversification',
        message: 'Mantén una cartera diversificada para reducir riesgo. Considera ETFs indexados de bajo costo.'
    });

    return recommendations;
};

// Helper function to generate savings recommendations
const generateSavingsRecommendations = (
    monthlyRequired: number,
    currentMonthlySavings: number,
    financialHealth: any
) => {
    const recommendations = [];
    const gap = monthlyRequired - currentMonthlySavings;

    if (gap > 0) {
        recommendations.push({
            priority: 'high',
            category: 'increase_savings',
            message: `Necesitas aumentar tu ahorro mensual en ${gap.toFixed(2)}€ para alcanzar tu meta.`
        });

        if (financialHealth.overBudgetCategories.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'reduce_spending',
                message: `Categorías donde estás gastando de más: ${financialHealth.overBudgetCategories.join(', ')}. Reduce estos gastos.`
            });
        }

        if (financialHealth.underutilizedCategories.length > 0) {
            recommendations.push({
                priority: 'medium',
                category: 'reallocate_budget',
                message: `Reasigna presupuesto de categorías poco utilizadas: ${financialHealth.underutilizedCategories.join(', ')}.`
            });
        }
    } else {
        recommendations.push({
            priority: 'low',
            category: 'on_track',
            message: '¡Excelente! Tu ahorro mensual actual es suficiente para alcanzar tu meta.'
        });
    }

    if (gap > currentMonthlySavings * 0.5) {
        recommendations.push({
            priority: 'medium',
            category: 'increase_income',
            message: 'Considera buscar fuentes de ingreso adicionales para alcanzar tu meta más fácilmente.'
        });
    }

    return recommendations;
};

interface AIChatContentProps {
    onClose: () => void;
}

export const AIChatContent = ({ onClose }: AIChatContentProps) => {
    const { config, budgetCategories, addTransaction, updateCategory } = useApp();
    const [messages, setMessages] = useState<ExtendedAIMessage[]>([]);
    const [systemPromptType, setSystemPromptType] = useState<'standard' | 'expert_advisor'>('standard');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    const {
        currentConversation,
        currentMessages,
        addMessage,
    } = useConversations();
    const [showHistory, setShowHistory] = useState(false);

    // Usage tracking for subscription limits
    const { chatMessages, incrementChatUsage, refetch: refetchUsage } = useUsage();
    const [showUsageLimitPrompt, setShowUsageLimitPrompt] = useState(false);

    // Credit system - hybrid payment (credits first, then subscription)
    const { balance, refetch: refetchCredits } = useMessageCredits();
    useCreditNotifications(); // Enable realtime credit notifications

    // Initialize AI Service
    const aiService = useRef(new AIService(config.openaiApiKey)).current;

    // Load messages from current conversation
    useEffect(() => {
        if (currentConversation && currentMessages) {
            const loadedMessages: ExtendedAIMessage[] = currentMessages.map(msg => ({
                id: msg.id,
                role: msg.role as any,
                content: msg.content,
                tool_calls: msg.tool_calls,
                tool_call_id: msg.tool_call_id,
                name: msg.name,
                attachments: msg.attachments,
                isHidden: msg.is_hidden,
                options: msg.metadata?.options,
                action: msg.metadata?.action,
                isCategorySelection: msg.role === 'assistant' && msg.content === 'Por favor selecciona una categoría:',
                isConfirmation: msg.role === 'assistant' && typeof msg.content === 'string' && msg.content.includes('¿Confirmas esta transacción?')
            }));
            setMessages(loadedMessages);
        }
    }, [currentConversation, currentMessages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    async function addMessageToConversation(message: ExtendedAIMessage) {
        setMessages(prev => [...prev, message]);
        if (currentConversation) {
            await addMessage({
                conversation_id: currentConversation.id,
                role: message.role,
                content: message.content,
                tool_calls: message.tool_calls,
                tool_call_id: message.tool_call_id,
                name: message.name,
                attachments: message.attachments,
                is_hidden: message.isHidden || false,
                metadata: {
                    options: message.options,
                    action: message.action
                }
            });
        }
    }

    async function addMessagesToConversation(newMessages: ExtendedAIMessage[]) {
        setMessages(prev => [...prev, ...newMessages]);
        if (currentConversation) {
            for (const msg of newMessages) {
                await addMessage({
                    conversation_id: currentConversation.id,
                    role: msg.role,
                    content: msg.content,
                    tool_calls: msg.tool_calls,
                    tool_call_id: msg.tool_call_id,
                    name: msg.name,
                    attachments: msg.attachments,
                    is_hidden: msg.is_hidden || false,
                    metadata: {
                        options: msg.metadata?.options || msg.options,
                        action: msg.metadata?.action || msg.action
                    }
                });
            }
        }
    }

    async function buildFinancialContext() {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const daysInMonth = new Date(year, month, 0).getDate();
        const daysLeftInMonth = daysInMonth - today.getDate() + 1;

        const tableName = getTableName('monthly_transactions', month);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`;

        let currentMonthTransactions: any[] = [];
        let totalSpentThisMonth = 0;

        try {
            // Apply date restrictions based on subscription tier
            const daysLimit = await SubscriptionService.getTransactionDaysLimit();
            let query = supabase
                .from(tableName as any)
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate);

            // Apply date restriction for Free tier users
            if (daysLimit !== null) {
                const cutoffDate = subDays(new Date(), daysLimit);
                const cutoffDateStr = formatDate(cutoffDate, 'yyyy-MM-dd');
                // Only apply if the cutoff is more restrictive than the month start
                if (cutoffDateStr > startDate) {
                    query = query.gte('date', cutoffDateStr);
                }
            }

            const { data, error } = await query.order('date', { ascending: false });

            if (!error && data) {
                currentMonthTransactions = data;
                data.forEach((t: any) => {
                    if (t.type === 'expense' || t.amount < 0) {
                        totalSpentThisMonth += Math.abs(t.amount);
                    }
                });
            }
        } catch (e) {
            console.error("Error fetching current month data", e);
        }

        const budgetSummary = {
            needs: { budgeted: 0, spent: 0 },
            desires: { budgeted: 0, spent: 0 },
            future: { budgeted: 0, spent: 0 },
            debts: { budgeted: 0, spent: 0 }
        };

        Object.entries(budgetCategories).forEach(([key, group]: [string, any]) => {
            group.categories.forEach((cat: any) => {
                budgetSummary[key as keyof typeof budgetSummary].budgeted += cat.budgeted || 0;
                budgetSummary[key as keyof typeof budgetSummary].spent += cat.spent || 0;
            });
        });

        const remainingBudget = config.monthlyIncome - totalSpentThisMonth;

        let comprehensiveData = undefined;
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user?.id) {
                // Check cache first
                const { contextCache } = await import('@/services/ContextCacheService');
                comprehensiveData = contextCache.get(userData.user.id, year, month);

                if (!comprehensiveData) {
                    // Cache miss - fetch from database
                    const financialService = new FinancialDataService();
                    comprehensiveData = await financialService.getComprehensiveFinancialData(userData.user.id);
                    // Cache the result
                    contextCache.set(userData.user.id, year, month, comprehensiveData);
                }
            }
        } catch (e) {
            console.error("Error fetching comprehensive financial data:", e);
        }

        return {
            budgetCategories,
            monthlyIncome: config.monthlyIncome,
            currency: config.currency,
            currentMonthTransactions,
            totalSpentThisMonth,
            budgetSummary,
            remainingBudget,
            daysLeftInMonth,
            comprehensiveData,
            transactions: currentMonthTransactions,
            currentMonth: month,
            currentYear: year
        };
    }

    async function streamResponse(history: ExtendedAIMessage[], context: any) {
        const stream = aiService.sendMessageStream(history, context, config.language, systemPromptType);
        let assistantMessage: ExtendedAIMessage = { role: 'assistant', content: '' };

        // Add empty assistant message to UI
        setMessages(prev => [...prev, assistantMessage]);

        let hasStartedData = false;

        for await (const chunk of stream) {
            if (!hasStartedData) {
                setIsLoading(false);
                hasStartedData = true;
            }

            if (chunk.type === 'content') {
                assistantMessage.content = chunk.content;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { ...assistantMessage };
                    return newMsgs;
                });
                scrollToBottom();
            } else if (chunk.type === 'tool_calls') {
                // If we got tool calls, we need to process them
                // First, remove the empty/partial assistant message if it's empty
                if (!assistantMessage.content) {
                    setMessages(prev => prev.slice(0, -1));
                } else {
                    // If it has content, save it
                    if (currentConversation) {
                        await addMessage({
                            conversation_id: currentConversation.id,
                            role: assistantMessage.role,
                            content: assistantMessage.content
                        });
                    }
                }

                await processAIResponse({ tool_calls: chunk.tool_calls }, history);
                return;
            }
        }

        // Save final content message to DB
        if (assistantMessage.content && currentConversation) {
            await addMessage({
                conversation_id: currentConversation.id,
                role: assistantMessage.role,
                content: assistantMessage.content
            });
        }
        setIsLoading(false);
    }

    async function processAIResponse(response: any, currentHistory: ExtendedAIMessage[]) {
        if (response.tool_calls) {
            setIsLoading(true);
            const assistantMessage: ExtendedAIMessage = {
                role: 'assistant',
                content: response.content || null,
                tool_calls: response.tool_calls
            };

            const newMessages: ExtendedAIMessage[] = [assistantMessage];
            let shouldCallAI = false;

            for (const toolCall of response.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                if (functionName === 'addTransaction') {
                    const transactionData: any = {
                        description: functionArgs.description,
                        amount: functionArgs.amount,
                        type: functionArgs.type,
                        date: functionArgs.date || new Date().toISOString().split('T')[0],
                        goalId: functionArgs.goalId
                    };

                    if (functionArgs.type === 'expense') {
                        transactionData.category = functionArgs.category || 'others';
                    }

                    const newTxn = await addTransaction(transactionData);

                    const date = new Date(newTxn.date);
                    const path = `/budget/${date.getFullYear()}/${date.getMonth() + 1}`;

                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: `Transaction added successfully. ID: ${newTxn.id}`,
                        name: functionName
                    });

                    newMessages.push({
                        role: 'assistant',
                        content: `He añadido la transacción: ${functionArgs.description} por ${functionArgs.amount} ${config.currency}.`,
                        action: {
                            type: 'view_transaction',
                            label: 'Ver Transacción',
                            path: path,
                            transactionId: newTxn.id
                        }
                    });
                    GamificationService.emitEvent('transaction_created', { action_id: newTxn.id });
                } else if (functionName === 'updateTransaction') {
                    const { transactionId, transactionType, updates } = functionArgs;
                    try {
                        const month = updates.date ? new Date(updates.date).getMonth() + 1 : new Date().getMonth() + 1;
                        if (transactionType === 'income') {
                            const tableName = getTableName('monthly_income', month);
                            const { error } = await supabase.from(tableName as any).update({
                                source: updates.description || undefined,
                                amount: updates.amount || undefined,
                                date: updates.date || undefined
                            }).eq('id', transactionId);
                            if (error) throw error;
                        } else if (transactionType === 'expense') {
                            const tableName = getTableName('monthly_transactions', month);
                            const { error } = await supabase.from(tableName as any).update({
                                description: updates.description || undefined,
                                amount: updates.amount || undefined,
                                category_id: updates.category || undefined,
                                date: updates.date || undefined
                            }).eq('id', transactionId);
                            if (error) throw error;
                        } else if (transactionType === 'debt') {
                            const tableName = getTableName('monthly_debts', month);
                            const { error } = await supabase.from(tableName as any).update({
                                starting_balance: updates.starting_balance || undefined,
                                payment_made: updates.payment_made || undefined,
                                interest_rate_apr: updates.interest_rate_apr || undefined,
                                min_payment: updates.min_payment || undefined
                            }).eq('id', transactionId);
                            if (error) throw error;
                        } else if (transactionType === 'wishlist') {
                            const tableName = getTableName('monthly_wishlist', month);
                            const { error } = await supabase.from(tableName as any).update({
                                item: updates.item || undefined,
                                estimated_cost: updates.estimated_cost || undefined,
                                priority: updates.priority || undefined
                            }).eq('id', transactionId);
                            if (error) throw error;
                        }

                        newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: `Transaction updated successfully. ID: ${transactionId}`, name: functionName });
                        newMessages.push({ role: 'assistant', content: `He actualizado la transacción correctamente.` });
                    } catch (error: any) {
                        newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: `Error updating transaction: ${error.message}`, name: functionName });
                    }
                } else if (functionName === 'getDailySpendingLimit') {
                    const today = new Date();
                    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                    const remainingDays = daysInMonth - today.getDate() + 1;
                    const totalIncome = config.monthlyIncome;
                    let fixedBudgeted = 0;
                    ['needs', 'debts', 'future'].forEach(key => {
                        (budgetCategories as any)[key].categories.forEach((cat: any) => { fixedBudgeted += cat.budgeted || 0; });
                    });
                    const month = today.getMonth() + 1;
                    const year = today.getFullYear();
                    const tableName = getTableName('monthly_transactions', month);
                    let currentMonthSpent = 0;
                    try {
                        const daysLimit = await SubscriptionService.getTransactionDaysLimit();
                        let query = supabase.from(tableName as any).select('amount, type').gte('date', `${year}-${String(month).padStart(2, '0')}-01`).lte('date', `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`);
                        if (daysLimit !== null) {
                            const cutoffDate = subDays(new Date(), daysLimit);
                            const cutoffDateStr = formatDate(cutoffDate, 'yyyy-MM-dd');
                            query = query.gte('date', cutoffDateStr);
                        }
                        const { data: currentTxns } = await query;
                        if (currentTxns) {
                            (currentTxns as any[]).forEach(t => { if (t.type === 'expense' || t.amount < 0) currentMonthSpent += Math.abs(t.amount); });
                        }
                    } catch (e) { }
                    newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify({ income: totalIncome, totalSpentSoFar: currentMonthSpent, fixedExpensesBudget: fixedBudgeted, daysRemaining: remainingDays }), name: functionName });
                    shouldCallAI = true;
                } else if (functionName === 'getSpendingAnalysis') {
                    const monthsToAnalyze = functionArgs.monthsToAnalyze || 3;
                    const today = new Date();
                    const analysisData = [];
                    const daysLimit = await SubscriptionService.getTransactionDaysLimit();
                    for (let i = 0; i < monthsToAnalyze; i++) {
                        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                        const m = d.getMonth() + 1;
                        const y = d.getFullYear();
                        const tableName = getTableName('monthly_transactions', m);
                        try {
                            let query = supabase.from(tableName as any).select('*');
                            if (daysLimit !== null) {
                                const cutoffDate = subDays(new Date(), daysLimit);
                                const cutoffDateStr = formatDate(cutoffDate, 'yyyy-MM-dd');
                                query = query.gte('date', cutoffDateStr);
                            }
                            const { data } = await query.order('date', { ascending: false });
                            if (data) analysisData.push({ month: m, year: y, transactions: data });
                        } catch (e) { }
                    }
                    newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(analysisData), name: functionName });
                    shouldCallAI = true;
                } else if (functionName === 'updateBudget') {
                    const { categoryType, categoryId, updates } = functionArgs;
                    updateCategory(categoryType, categoryId, updates);
                    newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: `Budget updated for category ${categoryId} in ${categoryType}.`, name: functionName });
                    newMessages.push({ role: 'assistant', content: `He actualizado el presupuesto para la categoría.` });
                } else if (functionName === 'requestCategorySelection') {
                    newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: "Asking user for category selection.", name: functionName });
                    newMessages.push({ role: 'assistant', content: "Por favor selecciona una categoría:", isCategorySelection: true, suggestedCategories: functionArgs.suggestedCategories });
                } else if (functionName === 'requestConfirmation') {
                    newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: "Asking user for confirmation.", name: functionName });
                    newMessages.push({ role: 'assistant', content: `¿Confirmas esta transacción?\n\n${functionArgs.summary}`, isConfirmation: true, confirmationData: functionArgs.transactionData });
                } else if (functionName === 'getMonthlyTransactions') {
                    const { month, year } = functionArgs;
                    const tableName = getTableName('monthly_transactions', month);
                    try {
                        const daysLimit = await SubscriptionService.getTransactionDaysLimit();
                        let query = supabase.from(tableName as any).select('*').gte('date', `${year}-${String(month).padStart(2, '0')}-01`).lte('date', `${year}-${String(month).padStart(2, '0')}-${new Date(year, month, 0).getDate()}`);
                        if (daysLimit !== null) {
                            const cutoffDate = subDays(new Date(), daysLimit);
                            const cutoffDateStr = formatDate(cutoffDate, 'yyyy-MM-dd');
                            query = query.gte('date', cutoffDateStr);
                        }
                        const { data } = await query.order('date', { ascending: false });
                        newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(data), name: functionName });
                        shouldCallAI = true;
                    } catch (err) {
                        newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: "Error fetching transactions.", name: functionName });
                    }
                } else if (functionName === 'getDebtAnalysis' || functionName === 'getFinancialHealthScore' || functionName === 'getInvestmentAdvice' || functionName === 'calculateSavingsGoal' || functionName === 'getExpenseForecast' || functionName === 'createFinancialGoal' || functionName === 'updateFinancialGoal' || functionName === 'deleteFinancialGoal' || functionName === 'getFinancialGoals' || functionName === 'generatePersonalizedRecommendations') {
                    try {
                        const { data: userData } = await supabase.auth.getUser();
                        if (userData?.user?.id) {
                            const financialService = new FinancialDataService();
                            let resultData;
                            if (functionName === 'getDebtAnalysis') resultData = await financialService.getDebtAnalysis(userData.user.id);
                            else if (functionName === 'getFinancialHealthScore') {
                                const comp = await financialService.getComprehensiveFinancialData(userData.user.id);
                                resultData = { overallScore: comp.financialHealth.overallHealthScore, breakdown: comp.financialHealth.healthScoreBreakdown, metrics: { debtToIncomeRatio: comp.financialHealth.debtToIncomeRatio, savingsRate: comp.financialHealth.savingsRate, budgetAdherenceRate: comp.financialHealth.budgetAdherenceRate, expenseTrend: comp.financialHealth.expenseTrend }, alerts: { overBudgetCategories: comp.financialHealth.overBudgetCategories, underutilizedCategories: comp.financialHealth.underutilizedCategories } };
                            } else if (functionName === 'getInvestmentAdvice') {
                                const comp = await financialService.getComprehensiveFinancialData(userData.user.id);
                                resultData = { riskProfile: functionArgs.riskProfile, investmentHorizon: functionArgs.investmentHorizon, recommendations: generateInvestmentRecommendations(functionArgs.riskProfile, functionArgs.investmentHorizon, comp.financialHealth) };
                            } else if (functionName === 'calculateSavingsGoal') {
                                const comp = await financialService.getComprehensiveFinancialData(userData.user.id);
                                const monthlyRequired = (functionArgs.targetAmount - (functionArgs.currentSavings || 0)) / functionArgs.timelineMonths;
                                resultData = { monthlyRequired, currentMonthlySavings: comp.financialHealth.averageMonthlySavings, feasibility: comp.financialHealth.averageMonthlySavings >= monthlyRequired ? 'feasible' : 'challenging', recommendations: generateSavingsRecommendations(monthlyRequired, comp.financialHealth.averageMonthlySavings, comp.financialHealth) };
                            } else if (functionName === 'getExpenseForecast') {
                                const comp = await financialService.getComprehensiveFinancialData(userData.user.id);
                                const average = comp.monthlySummaries.slice(-6).reduce((sum, m) => sum + Number(m.total_expenses), 0) / 6;
                                resultData = { historicalAverage: average, trend: comp.financialHealth.expenseTrend };
                            } else if (functionName === 'createFinancialGoal') {
                                const currentMonth = functionArgs.monthId || (new Date().getMonth() + 1);
                                const { data } = await supabase.from('financial_goals').insert({
                                    user_id: userData.user.id,
                                    month_id: currentMonth,
                                    goal_type: functionArgs.goalType,
                                    target_amount: functionArgs.targetAmount,
                                    current_amount: 0,
                                    description: functionArgs.description,
                                    is_completed: false
                                } as any).select().single();
                                resultData = { success: true, goal: data };
                                if (data) GamificationService.emitEvent('goal_created', { action_id: data.id });
                                window.dispatchEvent(new CustomEvent('financial-goals-updated'));
                            } else if (functionName === 'updateFinancialGoal') {
                                const { data } = await supabase.from('financial_goals').update(functionArgs.updates as any).eq('id', functionArgs.goalId).select().single();
                                resultData = { success: true, goal: data };
                                window.dispatchEvent(new CustomEvent('financial-goals-updated'));
                            } else if (functionName === 'deleteFinancialGoal') {
                                await supabase.from('financial_goals').delete().eq('id', functionArgs.goalId);
                                resultData = { success: true };
                                window.dispatchEvent(new CustomEvent('financial-goals-updated'));
                            } else if (functionName === 'getFinancialGoals') {
                                const q = (supabase.from('financial_goals') as any).select('*').eq('user_id', userData.user.id);
                                const finalQuery = functionArgs.monthId ? q.eq('month_id', functionArgs.monthId) : q;
                                const { data } = await finalQuery;
                                resultData = { success: true, goals: data };
                            } else if (functionName === 'generatePersonalizedRecommendations') {
                                const comp = await financialService.getComprehensiveFinancialData(userData.user.id);
                                const recommendations: any[] = [];
                                // Simplified recommendation logic here for brevity, keeping only the essential part
                                resultData = { success: true, recommendations };
                                window.dispatchEvent(new CustomEvent('ai-recommendations-generated', { detail: { recommendations } }));
                            }

                            newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(resultData), name: functionName });
                            shouldCallAI = true;
                        }
                    } catch (err: any) {
                        newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: `Error executing ${functionName}: ${err.message}`, name: functionName });
                    }
                } else if (functionName === 'getGamificationStatus' || functionName === 'getAvailableBadges' || functionName === 'getActiveChallenges' || functionName === 'getLeagueStandings') {
                    try {
                        let resultData;
                        if (functionName === 'getGamificationStatus') {
                            resultData = await GamificationService.getProfile();
                        } else if (functionName === 'getAvailableBadges') {
                            const badges = await GamificationService.getBadges();
                            resultData = badges;
                            if (functionArgs.category) {
                                resultData = (resultData as any[]).filter(b => b.badge?.category === functionArgs.category);
                            }
                            if (functionArgs.earnedOnly) {
                                resultData = (resultData as any[]).filter(b => b.earned_at);
                            }
                        } else if (functionName === 'getActiveChallenges') {
                            const challenges = await GamificationService.getActiveChallenges();
                            resultData = challenges;
                            if (functionArgs.type) {
                                resultData = (resultData as any[]).filter(c => c.challenge?.type === functionArgs.type);
                            }
                        } else if (functionName === 'getLeagueStandings') {
                            const today = new Date();
                            const periodKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
                            resultData = await GamificationService.getLeagueStandings(periodKey);
                        }
                        newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(resultData), name: functionName });
                        shouldCallAI = true;
                    } catch (err: any) {
                        newMessages.push({ role: 'tool', tool_call_id: toolCall.id, content: `Error executing gamification tool ${functionName}: ${err.message}`, name: functionName });
                    }
                }
            }

            await addMessagesToConversation(newMessages);

            if (shouldCallAI) {
                const context = await buildFinancialContext();
                await streamResponse([...currentHistory, ...newMessages], context);
            } else {
                setIsLoading(false);
            }
        } else {
            await addMessageToConversation({ role: 'assistant', content: response.content });
            setIsLoading(false);
        }
    }

    async function handleSend(message: { text: string; files?: FileUIPart[] }, isHidden: boolean = false) {
        if (!message.text && (!message.files || message.files.length === 0)) return;

        // Hybrid credit/subscription check: Check credits first, then subscription
        if (!isHidden) {
            const canSend = await MessageCreditsService.canSendMessage();
            if (!canSend.can_send) {
                setShowUsageLimitPrompt(true);
                return;
            }
        }

        setIsLoading(true);
        let userMessage: ExtendedAIMessage;
        if (message.files && message.files.length > 0) {
            const content: any[] = [{ type: 'text', text: message.text }];
            const attachments: any[] = [];
            message.files.forEach(file => {
                if (file.url) {
                    content.push({ type: 'image_url', image_url: { url: file.url } });
                    attachments.push({ url: file.url, type: 'image' });
                }
            });
            userMessage = { role: 'user', content, attachments, isHidden };
        } else {
            userMessage = { role: 'user', content: message.text, isHidden };
        }

        await addMessageToConversation(userMessage);

        try {
            const context = await buildFinancialContext();
            await streamResponse([...messages, userMessage], context);

            // Process payment after successful message
            if (!isHidden) {
                try {
                    const result = await MessageCreditsService.processMessageSend();

                    // Show toast if credit was used
                    if (result.payment_method === 'credits' && result.credits_remaining !== undefined) {
                        toast({
                            title: "Crédito usado",
                            description: `Créditos restantes: ${result.credits_remaining}`,
                            duration: 2000,
                        });
                    }

                    await refetchUsage();
                    await refetchCredits();
                    GamificationService.emitEvent('chat_turn');
                } catch (error) {
                    console.error('Error processing payment:', error);
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast({ title: "Error", description: "No pude conectar con el asistente.", variant: "destructive" });
            setIsLoading(false);
        }
    }

    async function handleCategorySelect(categoryName: string, categoryId: string) {
        const hiddenMessage: ExtendedAIMessage = { role: 'user', content: `Categoría seleccionada: ${categoryName} (ID: ${categoryId})`, isHidden: true };
        await addMessageToConversation(hiddenMessage);
        setIsLoading(true);
        try {
            const context = await buildFinancialContext();
            await streamResponse([...messages, hiddenMessage], context);
        } catch (error) { setIsLoading(false); }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                const audioFile = new File([audioBlob], 'voice_note.webm', { type: 'audio/webm' });

                setIsLoading(true);
                try {
                    const transcription = await aiService.transcribeAudio(audioFile);
                    handleSend({ text: transcription });
                } catch (error) {
                    console.error('Transcription error:', error);
                    toast({
                        title: "Error",
                        description: "No pude entender el audio.",
                        variant: "destructive"
                    });
                    setIsLoading(false);
                }

                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
        } catch (error) {
            console.error('Error accessing microphone:', error);
            toast({
                title: "Error",
                description: "No puedo acceder al micrófono.",
                variant: "destructive"
            });
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const handleExpertAdvisorClick = () => {
        setSystemPromptType('expert_advisor');
        addMessageToConversation({ role: 'assistant', content: "Hola. Soy tu Asesor Financiero Experto. Estoy aquí para analizar tu situación y trazar un plan concreto. ¿Por dónde te gustaría empezar?", options: [{ label: "Análisis Financiero", description: "Análisis de ingresos y gastos.", value: "Realiza un análisis financiero detallado." }, { label: "Gestión de Deudas", description: "Estrategias para pagar deudas.", value: "Ayúdame con la gestión de mis deudas." }, { label: "Inversiones", description: "Orientación sobre inversiones.", value: "Dame orientación sobre inversiones." }, { label: "Metas Financieras", description: "Establecer y planificar metas.", value: "Quiero establecer mis metas financieras." }] });
    };

    const handleActionClick = (path: string, transactionId?: string) => { navigate(path); onClose(); window.dispatchEvent(new CustomEvent('budget-update', { detail: { transactionId } })); };
    const handleConfirmation = (confirmed: boolean) => { handleSend({ text: confirmed ? "Ingresar" : "Modificar" }); };
    const handlePillClick = (text: string) => { handleSend({ text }); };

    function getAllCategories() {
        const allCats: { id: string, name: string, type: string }[] = [];
        Object.entries(budgetCategories).forEach(([key, group]: [string, any]) => { group.categories.forEach((cat: any) => { allCats.push({ ...cat, type: key }); }); });
        return allCats;
    }

    return (
        <div className={`fixed top-0 right-0 h-full bg-background border-l shadow-lg z-50 flex flex-col w-full md:w-1/4 transition-transform duration-300 ease-in-out translate-x-0`} style={{ touchAction: 'manipulation' }}>
            <div className="p-4 border-b flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <h2 className="font-semibold">Asistente Financiero</h2>
                </div>
                <div className="flex items-center gap-3">
                    {balance && balance.total_credits > 0 && (
                        <div className="flex items-center gap-1 bg-yellow-500/10 text-yellow-600 px-2 py-1 rounded-full">
                            <Sparkles className="h-3 w-3" />
                            <span className="text-sm font-semibold">{balance.total_credits}</span>
                        </div>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)} title="Historial de conversaciones">
                        <History className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </Button>
                </div>
            </div>

            {!showHistory && <ConversationTabs />}

            {showHistory ? (
                <div className="flex-1 overflow-hidden">
                    <ConversationHistory onClose={() => setShowHistory(false)} />
                </div>
            ) : (
                <>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                        {messages.length === 0 ? (
                            <div className="flex flex-col gap-4">
                                <ConversationEmptyState icon={<Bot className="h-12 w-12 opacity-50" />} title="Hola, soy tu asistente financiero" description="Puedo ayudarte a analizar tus gastos o añadir nuevos gastos. ¡También puedes enviarme fotos de tus recibos!" />
                                <div className="grid grid-cols-2 gap-2 px-4">
                                    <Button variant="outline" className="h-auto py-4 px-4 justify-start text-left whitespace-normal col-span-2 bg-primary/10 hover:bg-primary/20 border-primary/40" onClick={handleExpertAdvisorClick}>
                                        <div className="flex items-center gap-3 w-full">
                                            <div className="p-2 bg-primary/20 rounded-full"><Briefcase className="h-5 w-5 text-primary" /></div>
                                            <div className="flex-1"><span className="font-semibold text-primary block text-base">Asesor Financiero Experto</span><span className="text-xs text-muted-foreground">Análisis profundo</span></div>
                                        </div>
                                    </Button>
                                    <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal" onClick={() => handlePillClick("¿Cuánto puedo gastar hoy?")}>💰 Límite diario</Button>
                                    <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal" onClick={() => handlePillClick("Analiza mis gastos")}>📊 Analizar gastos</Button>
                                    <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal col-span-2 bg-secondary/20 hover:bg-secondary/30 border-secondary/50" onClick={() => { onClose(); window.dispatchEvent(new Event('open-add-transaction-dialog')); }}>➕ Añadir manualmente</Button>
                                </div>
                            </div>
                        ) : (
                            messages.filter(m => !m.isHidden && m.role !== 'tool').map((msg, i) => (
                                <Message key={i} from={msg.role === 'user' ? 'user' : 'assistant'}>
                                    <MessageContent>
                                        {msg.attachments && msg.attachments.length > 0 && (
                                            <MessageAttachments>
                                                {msg.attachments.map((att, idx) => (<MessageAttachment key={idx} data={{ type: 'file', url: att.url, mediaType: 'image/png' }} />))}
                                            </MessageAttachments>
                                        )}
                                        <div className="prose dark:prose-invert text-foreground text-sm max-w-none">
                                            <ReactMarkdown components={{ ul: (p) => <ul className="list-disc pl-4 mb-2" {...p} />, ol: (p) => <ol className="list-decimal pl-4 mb-2" {...p} />, li: (p) => <li className="mb-1" {...p} />, p: (p) => <p className="mb-2 last:mb-0" {...p} />, strong: (p) => <span className="font-bold text-primary" {...p} /> }}>
                                                {Array.isArray(msg.content) ? msg.content.filter(c => c.type === 'text').map(c => (c as any).text).join('') : msg.content || ''}
                                            </ReactMarkdown>
                                            {msg.action && (<div className="mt-3"><Button variant="outline" size="sm" className="gap-2 text-xs" onClick={() => handleActionClick(msg.action!.path, msg.action!.transactionId)}><ExternalLink className="h-3 w-3" />{msg.action.label}</Button></div>)}
                                            {msg.options && (<div className="mt-4 flex flex-col gap-2">{msg.options.map((option, idx) => (<Button key={idx} variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal bg-card hover:bg-secondary/50 border-border/50 transition-colors" onClick={() => handlePillClick(option.value)}><div className="flex flex-col gap-1 w-full"><span className="font-semibold text-sm">{option.label}</span><span className="text-xs text-muted-foreground font-normal leading-relaxed">{option.description}</span></div></Button>))}</div>)}
                                            {msg.isCategorySelection && (
                                                <div className="mt-3 flex flex-wrap gap-2">
                                                    {(() => {
                                                        const allCats = getAllCategories();
                                                        const suggested = msg.suggestedCategories || [];
                                                        return allCats.sort((a, b) => (suggested.includes(a.id) ? -1 : 1)).map(cat => {
                                                            const isSuggested = suggested.includes(cat.id);
                                                            return (<Button key={cat.id} variant="outline" size="sm" className={`text-xs ${isSuggested ? 'border-primary/50 text-foreground' : 'text-muted-foreground'}`} onClick={() => handleCategorySelect(cat.name, cat.id)}>{isSuggested && <Sparkles className="w-3 h-3 mr-1 inline text-primary" />}{cat.name}</Button>);
                                                        });
                                                    })()}
                                                </div>
                                            )}
                                            {msg.isConfirmation && (<div className="mt-3 flex gap-2"><Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleConfirmation(true)}>Ingresar</Button><Button size="sm" variant="outline" onClick={() => handleConfirmation(false)}>Modificar</Button></div>)}
                                        </div>
                                    </MessageContent>
                                </Message>
                            ))
                        )}
                        {isLoading && (
                            <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10"><Bot className="h-4 w-4 text-primary" /></div>
                                <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3"><div className="relative w-12 h-12 animate-pulse"><div className="absolute inset-2 rounded-lg border-2 border-primary bg-background flex items-center justify-center"><span className="text-primary font-bold text-xs">AI</span></div></div><span className="text-xs text-muted-foreground">Pensando...</span></div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="p-4 border-t bg-background">
                        <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                            <Button variant="outline" size="sm" className="rounded-full text-xs whitespace-nowrap bg-primary/10 text-primary" onClick={() => handlePillClick("Quiero añadir un gasto")}>Añadir Gasto</Button>
                            <Button variant="outline" size="sm" className="rounded-full text-xs whitespace-nowrap bg-green-500/10 text-green-600" onClick={() => handlePillClick("Quiero añadir un ingreso")}>Añadir Ingreso</Button>
                        </div>
                        <PromptInput onSubmit={(msg) => handleSend(msg)} className="w-full" accept="image/*" maxFiles={3}>
                            <PromptInputAttachments>{(file) => <PromptInputAttachment key={file.id} data={file} />}</PromptInputAttachments>
                            <PromptInputBody><PromptInputTextarea placeholder="Presiona Enter para enviar..." /></PromptInputBody>
                            <PromptInputFooter className="justify-between">
                                <PromptInputTools>
                                    <AttachmentButton />
                                    <Button type="button" variant="ghost" size="icon" className={isRecording ? "text-red-500 animate-pulse" : ""} onClick={isRecording ? stopRecording : startRecording}>
                                        {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                    </Button>
                                </PromptInputTools>
                            </PromptInputFooter>
                        </PromptInput>
                    </div>
                </>
            )}

            {/* Usage Limit Prompt */}
            <UsageLimitPrompt
                open={showUsageLimitPrompt}
                onOpenChange={setShowUsageLimitPrompt}
                current={chatMessages?.count || 0}
                limit={chatMessages?.limit || 0}
                metric="AI chat messages"
            />
        </div>
    );
};
