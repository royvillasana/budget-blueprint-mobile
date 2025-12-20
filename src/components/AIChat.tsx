import { useState, useRef, useEffect } from 'react';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';
import { supabase } from '@/integrations/supabase/client';
import { getTableName } from '@/utils/monthUtils';
import { useApp } from '@/contexts/AppContext';
import { AIService, AIMessage } from '@/services/AIService';
import { FinancialDataService } from '@/services/FinancialDataService';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import {
    Bot, Sparkles, ExternalLink, Mic,
    Paperclip,
    X,
    Briefcase,
    History
} from 'lucide-react';
import { useConversations } from '@/contexts/ConversationContext';
import { ConversationTabs } from '@/components/ConversationTabs';
import { ConversationHistory } from '@/components/ConversationHistory';

import { useToast } from '@/hooks/use-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Conversation,
    ConversationContent,
    ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import {
    Message,
    MessageContent,
    MessageResponse,
    MessageAttachments,
    MessageAttachment,
} from '@/components/ai-elements/message';
import {
    PromptInput,
    PromptInputBody,
    PromptInputTextarea,
    PromptInputFooter,
    PromptInputSubmit,
    PromptInputTools,
    PromptInputAttachments,
    PromptInputAttachment,
    usePromptInputAttachments,
} from '@/components/ai-elements/prompt-input';
import type { FileUIPart } from 'ai';
import ReactMarkdown from 'react-markdown';

// Extend AIMessage to include UI actions
interface ExtendedAIMessage extends AIMessage {
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

    // Check if user should focus on debt first
    if (financialHealth.debtToIncomeRatio > 1.5) {
        recommendations.push({
            priority: 'high',
            category: 'debt_management',
            message: 'Considera priorizar el pago de deudas antes de invertir. Tu ratio deuda-ingreso es alto.'
        });
    }

    // Emergency fund check
    const emergencyFundMonths = financialHealth.averageMonthlySavings * 12 / financialHealth.averageMonthlyExpenses;
    if (emergencyFundMonths < 3) {
        recommendations.push({
            priority: 'high',
            category: 'emergency_fund',
            message: 'Construye un fondo de emergencia de 3-6 meses de gastos antes de invertir agresivamente.'
        });
    }

    // Investment allocation based on risk profile
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

    // Time horizon recommendations
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

    // Diversification reminder
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

        // Suggest cutting from overbudget categories
        if (financialHealth.overBudgetCategories.length > 0) {
            recommendations.push({
                priority: 'high',
                category: 'reduce_spending',
                message: `Categorías donde estás gastando de más: ${financialHealth.overBudgetCategories.join(', ')}. Reduce estos gastos.`
            });
        }

        // Suggest utilizing underutilized budget
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

    // Income increase suggestion
    if (gap > currentMonthlySavings * 0.5) {
        recommendations.push({
            priority: 'medium',
            category: 'increase_income',
            message: 'Considera buscar fuentes de ingreso adicionales para alcanzar tu meta más fácilmente.'
        });
    }

    return recommendations;
};

export const AIChat = () => {
    const { config, transactions, budgetCategories, addTransaction, updateCategory } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ExtendedAIMessage[]>([]);
    const [systemPromptType, setSystemPromptType] = useState<'standard' | 'expert_advisor'>('standard');
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Conversation management
    const {
        currentConversation,
        currentMessages,
        createConversation,
        addMessage,
        refreshMessages,
    } = useConversations();
    const [showHistory, setShowHistory] = useState(false);

    // Notify App.tsx when drawer state changes (for desktop push effect)
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('ai-chat-state-change', {
            detail: { isOpen }
        }));
    }, [isOpen]);

    // Create a conversation if none exists when chat is opened
    useEffect(() => {
        const initConversation = async () => {
            if (isOpen && !currentConversation) {
                await createConversation();
            }
        };
        initConversation();
    }, [isOpen, currentConversation, createConversation]);

    // Load messages from current conversation
    useEffect(() => {
        if (currentConversation && currentMessages) {
            // Convert ConversationMessage[] to ExtendedAIMessage[]
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
                action: msg.metadata?.action
            }));
            setMessages(loadedMessages);
        }
    }, [currentConversation, currentMessages]);

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

                // Stop all tracks
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

    // Initialize AI Service
    const aiService = new AIService(config.openaiApiKey);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Helper to add message both locally and to database
    const addMessageToConversation = async (message: ExtendedAIMessage) => {
        // Add to local state
        setMessages(prev => [...prev, message]);

        // Save to database if we have a current conversation
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
    };

    // Helper to add multiple messages
    const addMessagesToConversation = async (newMessages: ExtendedAIMessage[]) => {
        // Add to local state
        setMessages(prev => [...prev, ...newMessages]);

        // Save to database if we have a current conversation
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
                    is_hidden: msg.isHidden || false,
                    metadata: {
                        options: msg.options,
                        action: msg.action
                    }
                });
            }
        }
    };

    // ... (rest of the component)

    const processAIResponse = async (response: any, currentHistory: ExtendedAIMessage[]) => {
        console.log('AI Response:', response);

        if (response.tool_calls) {
            console.log('Tool calls detected:', response.tool_calls);

            // 1. Add the assistant message with tool calls to history
            const assistantMessage: ExtendedAIMessage = {
                role: 'assistant',
                content: response.content || null,
                tool_calls: response.tool_calls
            };

            // We'll build a list of new messages to add
            const newMessages: ExtendedAIMessage[] = [assistantMessage];
            let shouldCallAI = false;

            // Handle tool calls
            for (const toolCall of response.tool_calls) {
                const functionName = toolCall.function.name;
                const functionArgs = JSON.parse(toolCall.function.arguments);

                console.log('Processing tool:', functionName, functionArgs);

                if (functionName === 'addTransaction') {
                    // Execute the action
                    // Income doesn't need a category, only expenses do
                    const transactionData: any = {
                        description: functionArgs.description,
                        amount: functionArgs.amount,
                        type: functionArgs.type,
                        date: functionArgs.date || new Date().toISOString().split('T')[0],
                        goalId: functionArgs.goalId
                    };

                    // Only add category for expenses
                    if (functionArgs.type === 'expense') {
                        transactionData.category = functionArgs.category || 'others';
                    }

                    const newTxn = await addTransaction(transactionData);

                    toast({
                        title: functionArgs.type === 'income' ? "Ingreso añadido" : "Gasto añadido",
                        description: `${functionArgs.description} - ${functionArgs.amount} ${config.currency}`,
                    });

                    // Calculate path for the transaction
                    const date = new Date(newTxn.date);
                    const path = `/budget/${date.getFullYear()}/${date.getMonth() + 1}`;

                    // Add tool result message (required by OpenAI)
                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: `Transaction added successfully. ID: ${newTxn.id}`,
                        name: functionName
                    });

                    // Add a visible assistant message with the action button
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

                } else if (functionName === 'updateTransaction') {
                    // Update transaction based on type
                    const { transactionId, transactionType, updates } = functionArgs;

                    try {
                        let result;
                        const month = updates.date ? new Date(updates.date).getMonth() + 1 : new Date().getMonth() + 1;
                        const year = updates.date ? new Date(updates.date).getFullYear() : new Date().getFullYear();

                        if (transactionType === 'income') {
                            const tableName = getTableName('monthly_income', month);
                            const { data, error } = await supabase
                                .from(tableName as any)
                                .update({
                                    source: updates.description || undefined,
                                    amount: updates.amount || undefined,
                                    date: updates.date || undefined
                                })
                                .eq('id', transactionId)
                                .select()
                                .single();

                            if (error) throw error;
                            result = data;
                        } else if (transactionType === 'expense') {
                            const tableName = getTableName('monthly_transactions', month);
                            const { data, error } = await supabase
                                .from(tableName as any)
                                .update({
                                    description: updates.description || undefined,
                                    amount: updates.amount || undefined,
                                    category_id: updates.category || undefined,
                                    date: updates.date || undefined
                                })
                                .eq('id', transactionId)
                                .select()
                                .single();

                            if (error) throw error;
                            result = data;
                        } else if (transactionType === 'debt') {
                            const tableName = getTableName('monthly_debts', month);
                            const { data, error } = await supabase
                                .from(tableName as any)
                                .update({
                                    starting_balance: updates.starting_balance || undefined,
                                    payment_made: updates.payment_made || undefined,
                                    interest_rate_apr: updates.interest_rate_apr || undefined,
                                    min_payment: updates.min_payment || undefined
                                })
                                .eq('id', transactionId)
                                .select()
                                .single();

                            if (error) throw error;
                            result = data;
                        } else if (transactionType === 'wishlist') {
                            const tableName = getTableName('monthly_wishlist', month);
                            const { data, error } = await supabase
                                .from(tableName as any)
                                .update({
                                    item: updates.item || undefined,
                                    estimated_cost: updates.estimated_cost || undefined,
                                    priority: updates.priority || undefined
                                })
                                .eq('id', transactionId)
                                .select()
                                .single();

                            if (error) throw error;
                            result = data;
                        }

                        toast({
                            title: "Actualizado exitosamente",
                            description: `Se ha actualizado el ${transactionType === 'income' ? 'ingreso' : transactionType === 'expense' ? 'gasto' : transactionType === 'debt' ? 'deuda' : 'deseo'}`,
                        });

                        // Add tool result message
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: `Transaction updated successfully. ID: ${transactionId}`,
                            name: functionName
                        });

                        // Add visible assistant message
                        newMessages.push({
                            role: 'assistant',
                            content: `He actualizado la transacción correctamente.`
                        });
                    } catch (error: any) {
                        console.error('Error updating transaction:', error);
                        toast({
                            title: "Error",
                            description: error.message || "No se pudo actualizar la transacción",
                            variant: "destructive"
                        });

                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: `Error updating transaction: ${error.message}`,
                            name: functionName
                        });
                    }

                } else if (functionName === 'getDailySpendingLimit') {
                    const today = new Date();
                    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                    const remainingDays = daysInMonth - today.getDate() + 1;

                    // Calculate total budget (income)
                    const totalIncome = config.monthlyIncome;

                    // Calculate fixed expenses (Needs + Debts + Future)
                    // Note: This assumes 'budgeted' amount is what we want to reserve. 
                    // Alternatively, we could use actual spent if it's higher? Let's stick to budget for planning.
                    let reservedAmount = 0;
                    ['needs', 'debts', 'future'].forEach(key => {
                        // @ts-ignore
                        budgetCategories[key].categories.forEach(cat => {
                            reservedAmount += cat.budgeted || 0;
                        });
                    });

                    // Calculate what has been spent so far in ALL categories
                    // We need current month's transactions for this.
                    // Since 'transactions' in context might be limited, let's fetch current month's data to be safe
                    // Or rely on what we have if it's already loaded? 
                    // Let's assume 'transactions' contains current month data or we fetch it.
                    // For robustness, let's fetch current month data here similar to getMonthlyTransactions

                    const month = today.getMonth() + 1;
                    const year = today.getFullYear();
                    const tableName = getTableName('monthly_transactions', month);
                    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                    const endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`;

                    let currentMonthSpent = 0;
                    try {
                        const { data: currentTxns, error } = await supabase
                            .from(tableName as any)
                            .select('amount, type')
                            .gte('date', startDate)
                            .lte('date', endDate);

                        if (!error && currentTxns) {
                            (currentTxns as any[]).forEach(t => {
                                if (t.type === 'expense' || t.amount < 0) { // Handle both conventions
                                    currentMonthSpent += Math.abs(t.amount);
                                }
                            });
                        }
                    } catch (e) {
                        console.error("Error fetching current month data", e);
                    }

                    const availableForWants = totalIncome - reservedAmount;
                    // We assume 'currentMonthSpent' includes everything. 
                    // Ideally we should subtract fixed expenses spent from reservedAmount? 
                    // Simplified formula: (Income - Fixed_Budgeted - Total_Spent_So_Far) / Days_Left
                    // Wait, if I spent money on Rent, it increases Total_Spent but I already subtracted it via Fixed_Budgeted?
                    // No. (Income - Fixed_Budgeted) is "Discretionary Budget".
                    // We need to subtract "Discretionary Spent" from "Discretionary Budget".
                    // Or: (Income - Total_Spent - Remaining_Fixed_Bills).

                    // Let's go with a simpler "Safe to Spend" for "Wants":
                    // Safe = (Wants_Budget - Wants_Spent) / Days_Left.

                    let wantsBudget = 0;
                    let wantsSpent = 0;
                    // @ts-ignore
                    budgetCategories['desires'].categories.forEach(cat => {
                        wantsBudget += cat.budgeted || 0;
                        // We need to know how much spent in this category. 
                        // This requires mapping transactions to categories.
                    });

                    // Let's use the aggressive formula:
                    // Remaining = Income - Total_Spent.
                    // But we must reserve for future bills.
                    // So: Remaining_Liquid = Income - Total_Spent.
                    // Pending_Bills = Fixed_Budgeted - Fixed_Spent.
                    // Safe_Daily = (Remaining_Liquid - Pending_Bills) / Days_Left.

                    // We need Fixed_Spent.
                    let fixedBudgeted = 0;
                    ['needs', 'debts', 'future'].forEach(key => {
                        // @ts-ignore
                        budgetCategories[key].categories.forEach(cat => {
                            fixedBudgeted += cat.budgeted || 0;
                        });
                    });

                    // We need to categorize current month transactions to know Fixed_Spent vs Wants_Spent
                    // This is complex without a joined query.

                    // SIMPLIFIED APPROACH for MVP:
                    // (MonthlyIncome - TotalSpent - (FixedBudget * 0.5)) / DaysLeft ?? No.

                    // Let's just return the raw numbers to the AI and let it reason?
                    // "Income: X, Spent: Y, FixedBudget: Z, DaysLeft: D".

                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify({
                            income: totalIncome,
                            totalSpentSoFar: currentMonthSpent,
                            fixedExpensesBudget: fixedBudgeted,
                            daysRemaining: remainingDays,
                            note: "Calculate: (Income - TotalSpent - (FixedExpensesBudget - FixedExpensesSpent)) / DaysRemaining. If FixedExpensesSpent is unknown, assume proportional or ask user."
                        }),
                        name: functionName
                    });
                    shouldCallAI = true;

                } else if (functionName === 'getSpendingAnalysis') {
                    const monthsToAnalyze = functionArgs.monthsToAnalyze || 3;
                    const today = new Date();
                    const analysisData = [];

                    for (let i = 0; i < monthsToAnalyze; i++) {
                        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
                        const m = d.getMonth() + 1;
                        const y = d.getFullYear();
                        const tableName = getTableName('monthly_transactions', m);

                        try {
                            const { data, error } = await supabase
                                .from(tableName as any)
                                .select('*')
                                .order('date', { ascending: false });

                            if (!error && data) {
                                analysisData.push({ month: m, year: y, transactions: data });
                            }
                        } catch (e) {
                            console.error(`Error fetching data for ${m}/${y}`, e);
                        }
                    }

                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: JSON.stringify(analysisData),
                        name: functionName
                    });
                    shouldCallAI = true;

                } else if (functionName === 'updateBudget') {
                    const { categoryType, categoryId, updates } = functionArgs;
                    // @ts-ignore
                    // const { updateCategory } = useApp(); // This won't work inside a function.
                    // We need to capture updateCategory from the component scope.
                    // It is available in the component scope as 'updateCategory' (destructured from useApp)

                    // Call the context function
                    // Note: We need to ensure updateCategory is in the closure.
                    // It is currently NOT in the closure of processAIResponse if defined outside.
                    // BUT processAIResponse is defined INSIDE AIChat component now (I fixed it earlier).
                    // So 'updateCategory' should be available if I destructure it.

                    updateCategory(categoryType, categoryId, updates);

                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: `Budget updated for category ${categoryId} in ${categoryType}. New values: ${JSON.stringify(updates)}`,
                        name: functionName
                    });

                    newMessages.push({
                        role: 'assistant',
                        content: `He actualizado el presupuesto para la categoría.`
                    });
                    // No need to call AI again necessarily, but maybe to confirm?
                    // Let's not call AI to avoid loops, just confirm.
                } else if (functionName === 'requestCategorySelection') {
                    // Add tool result message (required by OpenAI)
                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: "Asking user for category selection.",
                        name: functionName
                    });

                    // Add the visible assistant message asking for category
                    newMessages.push({
                        role: 'assistant',
                        content: "Por favor selecciona una categoría:",
                        isCategorySelection: true,
                        suggestedCategories: functionArgs.suggestedCategories
                    });

                } else if (functionName === 'requestConfirmation') {
                    // Add tool result message
                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: "Asking user for confirmation.",
                        name: functionName
                    });

                    // Add visible confirmation request
                    newMessages.push({
                        role: 'assistant',
                        content: `¿Confirmas esta transacción?\n\n${functionArgs.summary}`,
                        isConfirmation: true,
                        confirmationData: functionArgs.transactionData
                    });
                } else if (functionName === 'getMonthlyTransactions') {
                    const { month, year } = functionArgs;
                    const tableName = getTableName('monthly_transactions', month);

                    // Calculate last day of the month
                    const lastDay = new Date(year, month, 0).getDate();
                    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
                    const endDate = `${year}-${String(month).padStart(2, '0')}-${lastDay}`;

                    try {
                        const { data, error } = await supabase
                            .from(tableName as any)
                            .select('*')
                            .gte('date', startDate)
                            .lte('date', endDate)
                            .order('date', { ascending: false });

                        if (error) throw error;

                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify(data),
                            name: functionName
                        });

                        shouldCallAI = true;

                    } catch (err) {
                        console.error('Error fetching transactions:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: "Error fetching transactions.",
                            name: functionName
                        });
                    }

                } else if (functionName === 'getDebtAnalysis') {
                    try {
                        const { data: userData } = await supabase.auth.getUser();
                        if (userData?.user?.id) {
                            const financialService = new FinancialDataService();
                            const debtAnalysis = await financialService.getDebtAnalysis(userData.user.id);

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(debtAnalysis),
                                name: functionName
                            });
                            shouldCallAI = true;
                        }
                    } catch (err) {
                        console.error('Error fetching debt analysis:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: "Error fetching debt analysis.",
                            name: functionName
                        });
                    }

                } else if (functionName === 'getFinancialHealthScore') {
                    try {
                        const { data: userData } = await supabase.auth.getUser();
                        if (userData?.user?.id) {
                            const financialService = new FinancialDataService();
                            const comprehensiveData = await financialService.getComprehensiveFinancialData(userData.user.id);

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({
                                    overallScore: comprehensiveData.financialHealth.overallHealthScore,
                                    breakdown: comprehensiveData.financialHealth.healthScoreBreakdown,
                                    metrics: {
                                        debtToIncomeRatio: comprehensiveData.financialHealth.debtToIncomeRatio,
                                        savingsRate: comprehensiveData.financialHealth.savingsRate,
                                        budgetAdherenceRate: comprehensiveData.financialHealth.budgetAdherenceRate,
                                        expenseTrend: comprehensiveData.financialHealth.expenseTrend
                                    },
                                    alerts: {
                                        overBudgetCategories: comprehensiveData.financialHealth.overBudgetCategories,
                                        underutilizedCategories: comprehensiveData.financialHealth.underutilizedCategories
                                    }
                                }),
                                name: functionName
                            });
                            shouldCallAI = true;
                        }
                    } catch (err) {
                        console.error('Error fetching financial health score:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: "Error fetching financial health score.",
                            name: functionName
                        });
                    }

                } else if (functionName === 'getInvestmentAdvice') {
                    try {
                        const { riskProfile, investmentHorizon, monthlyInvestmentAmount } = functionArgs;
                        const { data: userData } = await supabase.auth.getUser();

                        if (userData?.user?.id) {
                            const financialService = new FinancialDataService();
                            const comprehensiveData = await financialService.getComprehensiveFinancialData(userData.user.id);

                            // Build investment advice based on risk profile and user's financial situation
                            const advice = {
                                riskProfile,
                                investmentHorizon,
                                monthlyInvestmentAmount: monthlyInvestmentAmount || comprehensiveData.financialHealth.averageMonthlySavings,
                                currentFinancialSituation: {
                                    debtToIncomeRatio: comprehensiveData.financialHealth.debtToIncomeRatio,
                                    savingsRate: comprehensiveData.financialHealth.savingsRate,
                                    averageMonthlySavings: comprehensiveData.financialHealth.averageMonthlySavings,
                                    totalDebt: comprehensiveData.financialHealth.totalDebt
                                },
                                recommendations: generateInvestmentRecommendations(
                                    riskProfile,
                                    investmentHorizon,
                                    comprehensiveData.financialHealth
                                )
                            };

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(advice),
                                name: functionName
                            });
                            shouldCallAI = true;
                        }
                    } catch (err) {
                        console.error('Error generating investment advice:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: "Error generating investment advice.",
                            name: functionName
                        });
                    }

                } else if (functionName === 'calculateSavingsGoal') {
                    try {
                        const { targetAmount, timelineMonths, currentSavings = 0, purpose } = functionArgs;
                        const { data: userData } = await supabase.auth.getUser();

                        if (userData?.user?.id) {
                            const financialService = new FinancialDataService();
                            const comprehensiveData = await financialService.getComprehensiveFinancialData(userData.user.id);

                            const remainingAmount = targetAmount - currentSavings;
                            const monthlyRequired = remainingAmount / timelineMonths;
                            const currentMonthlySavings = comprehensiveData.financialHealth.averageMonthlySavings;
                            const feasibility = currentMonthlySavings >= monthlyRequired ? 'feasible' : 'challenging';
                            const adjustmentNeeded = Math.max(0, monthlyRequired - currentMonthlySavings);

                            const savingsGoalPlan = {
                                purpose,
                                targetAmount,
                                currentSavings,
                                remainingAmount,
                                timelineMonths,
                                monthlyRequired,
                                currentMonthlySavings,
                                feasibility,
                                adjustmentNeeded,
                                projectedCompletion: feasibility === 'feasible'
                                    ? timelineMonths
                                    : currentMonthlySavings > 0
                                        ? Math.ceil(remainingAmount / currentMonthlySavings)
                                        : null,
                                recommendations: generateSavingsRecommendations(
                                    monthlyRequired,
                                    currentMonthlySavings,
                                    comprehensiveData.financialHealth
                                )
                            };

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify(savingsGoalPlan),
                                name: functionName
                            });
                            shouldCallAI = true;
                        }
                    } catch (err) {
                        console.error('Error calculating savings goal:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: "Error calculating savings goal.",
                            name: functionName
                        });
                    }

                } else if (functionName === 'getExpenseForecast') {
                    try {
                        const { forecastMonths = 3, categoryId } = functionArgs;
                        const { data: userData } = await supabase.auth.getUser();

                        if (userData?.user?.id) {
                            const financialService = new FinancialDataService();
                            const comprehensiveData = await financialService.getComprehensiveFinancialData(userData.user.id);

                            // Analyze historical spending patterns
                            const historicalData = comprehensiveData.monthlySummaries.slice(-6); // Last 6 months
                            const averageMonthlyExpenses = historicalData.reduce((sum, m) => sum + Number(m.total_expenses), 0) / historicalData.length;

                            // Simple forecast based on trend
                            const trend = comprehensiveData.financialHealth.expenseTrend;
                            const trendMultiplier = trend === 'increasing' ? 1.05 : trend === 'decreasing' ? 0.95 : 1.0;

                            const forecast = [];
                            for (let i = 1; i <= forecastMonths; i++) {
                                const projectedAmount = averageMonthlyExpenses * Math.pow(trendMultiplier, i);
                                forecast.push({
                                    month: i,
                                    projectedExpenses: projectedAmount,
                                    confidence: i <= 2 ? 'high' : 'medium'
                                });
                            }

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({
                                    forecastMonths,
                                    categoryId,
                                    historicalAverage: averageMonthlyExpenses,
                                    trend,
                                    forecast
                                }),
                                name: functionName
                            });
                            shouldCallAI = true;
                        }
                    } catch (err) {
                        console.error('Error generating expense forecast:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: "Error generating expense forecast.",
                            name: functionName
                        });
                    }

                } else if (functionName === 'createFinancialGoal') {
                    try {
                        const { goalType, targetAmount, description, monthId } = functionArgs;
                        const { data: userData } = await supabase.auth.getUser();

                        if (userData?.user?.id) {
                            const currentMonth = monthId || (new Date().getMonth() + 1);

                            const { data, error } = await supabase
                                .from('financial_goals')
                                .insert({
                                    user_id: userData.user.id,
                                    month_id: currentMonth,
                                    goal_type: goalType,
                                    target_amount: targetAmount,
                                    current_amount: 0,
                                    description: description,
                                    is_completed: false
                                })
                                .select()
                                .single();

                            if (error) throw error;

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({
                                    success: true,
                                    goal: data,
                                    message: `Meta financiera creada exitosamente: ${description}`
                                }),
                                name: functionName
                            });
                            shouldCallAI = true;

                            // Trigger a refresh event for the Financial Health page
                            window.dispatchEvent(new CustomEvent('financial-goals-updated'));
                        }
                    } catch (err) {
                        console.error('Error creating financial goal:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({
                                success: false,
                                error: "Error al crear la meta financiera."
                            }),
                            name: functionName
                        });
                    }

                } else if (functionName === 'updateFinancialGoal') {
                    try {
                        const { goalId, updates } = functionArgs;

                        const { data, error } = await supabase
                            .from('financial_goals')
                            .update(updates)
                            .eq('id', goalId)
                            .select()
                            .single();

                        if (error) throw error;

                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({
                                success: true,
                                goal: data,
                                message: 'Meta financiera actualizada exitosamente'
                            }),
                            name: functionName
                        });
                        shouldCallAI = true;

                        // Trigger a refresh event for the Financial Health page
                        window.dispatchEvent(new CustomEvent('financial-goals-updated'));
                    } catch (err) {
                        console.error('Error updating financial goal:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({
                                success: false,
                                error: "Error al actualizar la meta financiera."
                            }),
                            name: functionName
                        });
                    }

                } else if (functionName === 'deleteFinancialGoal') {
                    try {
                        const { goalId } = functionArgs;

                        const { error } = await supabase
                            .from('financial_goals')
                            .delete()
                            .eq('id', goalId);

                        if (error) throw error;

                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({
                                success: true,
                                message: 'Meta financiera eliminada exitosamente'
                            }),
                            name: functionName
                        });
                        shouldCallAI = true;

                        // Trigger a refresh event for the Financial Health page
                        window.dispatchEvent(new CustomEvent('financial-goals-updated'));
                    } catch (err) {
                        console.error('Error deleting financial goal:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({
                                success: false,
                                error: "Error al eliminar la meta financiera."
                            }),
                            name: functionName
                        });
                    }

                } else if (functionName === 'getFinancialGoals') {
                    try {
                        const { monthId } = functionArgs;
                        const { data: userData } = await supabase.auth.getUser();

                        if (userData?.user?.id) {
                            let query = supabase
                                .from('financial_goals')
                                .select('*')
                                .eq('user_id', userData.user.id)
                                .order('created_at', { ascending: false });

                            if (monthId) {
                                query = query.eq('month_id', monthId);
                            }

                            const { data, error } = await query;

                            if (error) throw error;

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({
                                    success: true,
                                    goals: data,
                                    count: data?.length || 0
                                }),
                                name: functionName
                            });
                            shouldCallAI = true;
                        }
                    } catch (err) {
                        console.error('Error fetching financial goals:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({
                                success: false,
                                error: "Error al obtener las metas financieras."
                            }),
                            name: functionName
                        });
                    }

                } else if (functionName === 'generatePersonalizedRecommendations') {
                    try {
                        const { focusArea = 'all' } = functionArgs;
                        const { data: userData } = await supabase.auth.getUser();

                        if (userData?.user?.id) {
                            const financialService = new FinancialDataService();
                            const comprehensiveData = await financialService.getComprehensiveFinancialData(userData.user.id);

                            const recommendations = [];
                            const fh = comprehensiveData.financialHealth;

                            // SAVINGS RECOMMENDATIONS
                            if (focusArea === 'all' || focusArea === 'savings') {
                                if (fh.savingsRate < 10) {
                                    recommendations.push({
                                        category: 'savings',
                                        priority: 'high',
                                        title: 'Aumenta tu tasa de ahorro',
                                        description: `Tu tasa de ahorro actual es del ${fh.savingsRate.toFixed(1)}%, muy por debajo del 20% recomendado. Intenta ahorrar al menos el 10% de tus ingresos.`,
                                        action: 'Establece transferencias automáticas a una cuenta de ahorros el día que recibes tu nómina.',
                                        impact: 'high'
                                    });
                                } else if (fh.savingsRate < 20) {
                                    recommendations.push({
                                        category: 'savings',
                                        priority: 'medium',
                                        title: 'Mejora tu tasa de ahorro',
                                        description: `Estás ahorrando ${fh.savingsRate.toFixed(1)}%. ¡Buen trabajo! El objetivo es llegar al 20%.`,
                                        action: 'Busca una categoría de gasto donde puedas reducir para aumentar tu ahorro.',
                                        impact: 'medium'
                                    });
                                }

                                const emergencyFundNeeded = fh.averageMonthlyExpenses * 6;
                                const currentSavings = fh.averageMonthlySavings * 12;
                                if (currentSavings < emergencyFundNeeded) {
                                    recommendations.push({
                                        category: 'savings',
                                        priority: 'high',
                                        title: 'Construye tu fondo de emergencia',
                                        description: `Necesitas ${emergencyFundNeeded.toFixed(0)}€ para cubrir 6 meses de gastos. Tu ahorro anual proyectado es ${currentSavings.toFixed(0)}€.`,
                                        action: 'Prioriza construir tu fondo de emergencia antes de otras metas financieras.',
                                        impact: 'high'
                                    });
                                }
                            }

                            // DEBT RECOMMENDATIONS
                            if (focusArea === 'all' || focusArea === 'debt') {
                                if (fh.totalDebt > 0) {
                                    if (fh.debtToIncomeRatio > 1.5) {
                                        recommendations.push({
                                            category: 'debt',
                                            priority: 'critical',
                                            title: 'Ratio deuda-ingreso muy alto',
                                            description: `Tu ratio deuda-ingreso es ${fh.debtToIncomeRatio.toFixed(2)}x (${(fh.debtToIncomeRatio * 100).toFixed(0)}%). Esto es crítico.`,
                                            action: 'Considera consolidar deudas o buscar ingresos adicionales. Consulta con un asesor financiero.',
                                            impact: 'critical'
                                        });
                                    } else if (fh.debtToIncomeRatio > 0.5) {
                                        recommendations.push({
                                            category: 'debt',
                                            priority: 'high',
                                            title: 'Acelera el pago de deudas',
                                            description: `Tienes ${fh.totalDebt.toFixed(0)}€ en deudas. A tu ritmo actual tardarás ${fh.debtPayoffProjection} meses en liquidarlas.`,
                                            action: 'Usa el método avalancha (paga primero las deudas con mayor interés) o bola de nieve (paga primero las deudas más pequeñas).',
                                            impact: 'high'
                                        });
                                    }
                                }
                            }

                            // BUDGET RECOMMENDATIONS
                            if (focusArea === 'all' || focusArea === 'budget') {
                                if (fh.budgetAdherenceRate < 60) {
                                    recommendations.push({
                                        category: 'budget',
                                        priority: 'high',
                                        title: 'Mejora la disciplina presupuestaria',
                                        description: `Solo cumples tu presupuesto en el ${fh.budgetAdherenceRate.toFixed(0)}% de las categorías.`,
                                        action: 'Revisa las categorías con sobregasto y ajusta tus hábitos o reasigna el presupuesto de forma más realista.',
                                        impact: 'high'
                                    });
                                }

                                if (fh.overBudgetCategories.length > 0) {
                                    recommendations.push({
                                        category: 'budget',
                                        priority: 'medium',
                                        title: 'Controla categorías con sobregasto',
                                        description: `Estás gastando de más en: ${fh.overBudgetCategories.join(', ')}.`,
                                        action: 'Identifica gastos innecesarios en estas categorías y establece alertas cuando te acerques al límite.',
                                        impact: 'medium'
                                    });
                                }

                                if (fh.expenseTrend === 'increasing') {
                                    recommendations.push({
                                        category: 'budget',
                                        priority: 'medium',
                                        title: 'Tus gastos están aumentando',
                                        description: 'Se detecta una tendencia creciente en tus gastos mensuales.',
                                        action: 'Analiza qué está causando el aumento y toma medidas correctivas antes de que impacte tus ahorros.',
                                        impact: 'medium'
                                    });
                                }
                            }

                            // INCOME RECOMMENDATIONS
                            if (focusArea === 'all' || focusArea === 'income') {
                                if (fh.incomeVariability > 20) {
                                    recommendations.push({
                                        category: 'income',
                                        priority: 'medium',
                                        title: 'Estabiliza tus ingresos',
                                        description: `Tus ingresos tienen una variabilidad del ${fh.incomeVariability.toFixed(0)}%, lo que dificulta la planificación.`,
                                        action: 'Busca fuentes de ingreso más estables o mantén un colchón financiero mayor.',
                                        impact: 'medium'
                                    });
                                }

                                if (fh.incomeGrowthRate < 0) {
                                    recommendations.push({
                                        category: 'income',
                                        priority: 'high',
                                        title: 'Tus ingresos están disminuyendo',
                                        description: `Hay una tendencia negativa en tus ingresos (${fh.incomeGrowthRate.toFixed(1)}%).`,
                                        action: 'Identifica la causa y busca oportunidades para aumentar o diversificar ingresos.',
                                        impact: 'high'
                                    });
                                }
                            }

                            // GENERAL POSITIVE FEEDBACK
                            if (fh.overallHealthScore >= 80) {
                                recommendations.push({
                                    category: 'general',
                                    priority: 'low',
                                    title: '¡Excelente salud financiera!',
                                    description: `Tu puntuación de salud financiera es ${fh.overallHealthScore.toFixed(0)}/100. ¡Felicidades!`,
                                    action: 'Mantén tus buenos hábitos y considera invertir para hacer crecer tu patrimonio.',
                                    impact: 'positive'
                                });
                            }

                            newMessages.push({
                                role: 'tool',
                                tool_call_id: toolCall.id,
                                content: JSON.stringify({
                                    success: true,
                                    recommendations: recommendations,
                                    financialScore: fh.overallHealthScore,
                                    focusArea: focusArea
                                }),
                                name: functionName
                            });
                            shouldCallAI = true;

                            // Validar `userInfo` antes de usarlo. Si no está disponible, no guardar en localStorage.
                            const { data: authData } = await supabase.auth.getUser();
                            const userId = authData?.user?.id;
                            if (userId) {
                                localStorage.setItem(`ai_recommendations_${userId}`, JSON.stringify(recommendations));
                            }

                            // Trigger event for Financial Health page to display recommendations
                            window.dispatchEvent(new CustomEvent('ai-recommendations-generated', {
                                detail: { recommendations }
                            }));
                        }
                    } catch (err) {
                        console.error('Error generating personalized recommendations:', err);
                        newMessages.push({
                            role: 'tool',
                            tool_call_id: toolCall.id,
                            content: JSON.stringify({
                                success: false,
                                error: "Error al generar recomendaciones personalizadas."
                            }),
                            name: functionName
                        });
                    }
                }
            }

            await addMessagesToConversation(newMessages);

            if (shouldCallAI) {
                const context = await buildFinancialContext();
                const updatedHistory = [...currentHistory, ...newMessages];
                const followUpResponse = await aiService.sendMessage(updatedHistory, context, config.language, systemPromptType);
                await processAIResponse(followUpResponse, updatedHistory);
            } else {
                setIsLoading(false);
            }

        } else {
            // No tool calls, just a regular message
            const assistantMessage: ExtendedAIMessage = {
                role: 'assistant',
                content: response.content
            };
            await addMessageToConversation(assistantMessage);
            setIsLoading(false);
        }
    };

    const buildFinancialContext = async () => {
        const today = new Date();
        const month = today.getMonth() + 1;
        const year = today.getFullYear();
        const daysInMonth = new Date(year, month, 0).getDate();
        const daysLeftInMonth = daysInMonth - today.getDate() + 1;

        // Fetch current month transactions
        const tableName = getTableName('monthly_transactions', month);
        const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
        const endDate = `${year}-${String(month).padStart(2, '0')}-${daysInMonth}`;

        let currentMonthTransactions: any[] = [];
        let totalSpentThisMonth = 0;

        try {
            const { data, error } = await supabase
                .from(tableName as any)
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)
                .order('date', { ascending: false });

            if (!error && data) {
                currentMonthTransactions = data;
                // Calculate total spent
                data.forEach((t: any) => {
                    if (t.type === 'expense' || t.amount < 0) {
                        totalSpentThisMonth += Math.abs(t.amount);
                    }
                });
            }
        } catch (e) {
            console.error("Error fetching current month data", e);
        }

        // Calculate budget summary
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

        const totalBudgeted = Object.values(budgetSummary).reduce((sum, cat) => sum + cat.budgeted, 0);
        const remainingBudget = config.monthlyIncome - totalSpentThisMonth;

        // NEW: Fetch comprehensive financial data
        let comprehensiveData = undefined;
        try {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user?.id) {
                const financialService = new FinancialDataService();
                comprehensiveData = await financialService.getComprehensiveFinancialData(userData.user.id);
                console.log('✅ Comprehensive financial data loaded for AI:', {
                    transactions: comprehensiveData.allTransactions.length,
                    income: comprehensiveData.allIncome.length,
                    debts: comprehensiveData.allDebts.length,
                    healthScore: comprehensiveData.financialHealth.overallHealthScore
                });
            }
        } catch (e) {
            console.error("Error fetching comprehensive financial data:", e);
        }

        return {
            transactions,
            budgetCategories,
            monthlyIncome: config.monthlyIncome,
            currency: config.currency,
            currentMonthTransactions,
            totalSpentThisMonth,
            budgetSummary,
            remainingBudget,
            daysLeftInMonth,
            // NEW: Include comprehensive data
            comprehensiveData,
            currentMonth: month,
            currentYear: year
        };
    };

    const handleSend = async (message: { text: string; files?: FileUIPart[] }, isHidden: boolean = false) => {
        if (!message.text && (!message.files || message.files.length === 0)) return;

        setIsLoading(true);

        let userMessage: ExtendedAIMessage;

        if (message.files && message.files.length > 0) {
            // Handle multimodal message
            const content: any[] = [{ type: 'text', text: message.text }];
            const attachments: any[] = [];

            message.files.forEach(file => {
                if (file.url) {
                    content.push({
                        type: 'image_url',
                        image_url: { url: file.url }
                    });
                    attachments.push({ url: file.url, type: 'image' });
                }
            });

            userMessage = { role: 'user', content: content, attachments, isHidden };
        } else {
            userMessage = { role: 'user', content: message.text, isHidden };
        }

        await addMessageToConversation(userMessage);

        try {
            const context = await buildFinancialContext();

            const currentHistory = [...messages, userMessage];
            const response = await aiService.sendMessage(currentHistory, context, config.language, systemPromptType);
            await processAIResponse(response, currentHistory);

        } catch (error) {
            console.error('Error sending message:', error);
            toast({
                title: "Error",
                description: "No pude conectar con el asistente. Verifica tu API Key.",
                variant: "destructive"
            });
            setIsLoading(false);
        }
    };

    const handleCategorySelect = async (categoryName: string, categoryId: string) => {
        // Send hidden message to AI
        const hiddenMessage: ExtendedAIMessage = {
            role: 'user',
            content: `Categoría seleccionada: ${categoryName} (ID: ${categoryId})`,
            isHidden: true
        };

        await addMessageToConversation(hiddenMessage);
        setIsLoading(true);

        try {
            const context = await buildFinancialContext();
            const currentHistory = [...messages, hiddenMessage];
            const response = await aiService.sendMessage(currentHistory, context, config.language, systemPromptType);
            await processAIResponse(response, currentHistory);
        } catch (error) {
            console.error('Error sending message:', error);
            setIsLoading(false);
        }
    };

    const handleExpertAdvisorClick = () => {
        setSystemPromptType('expert_advisor');

        // Initial trigger for the expert advisor
        // We add the welcome message directly
        const expertWelcomeMessage: ExtendedAIMessage = {
            role: 'assistant',
            content: "Hola. Soy tu Asesor Financiero Experto. Estoy aquí para analizar tu situación y trazar un plan concreto. ¿Por dónde te gustaría empezar?",
            options: [
                {
                    label: "Análisis Financiero",
                    description: "Puedo analizar tus ingresos y gastos para identificar áreas donde puedes ahorrar más.",
                    value: "Realiza un análisis financiero detallado de mis ingresos y gastos."
                },
                {
                    label: "Gestión de Deudas",
                    description: "Si tienes deudas, puedo proporcionarte estrategias efectivas para pagarlas de manera eficiente.",
                    value: "Ayúdame con la gestión de mis deudas y estrategias de pago."
                },
                {
                    label: "Inversiones",
                    description: "Puedo darte orientación sobre inversiones adecuadas según tu perfil de riesgo.",
                    value: "Dame orientación sobre inversiones según mi perfil."
                },
                {
                    label: "Metas Financieras",
                    description: "Juntos podemos establecer metas, como un fondo de emergencia o vacacional.",
                    value: "Quiero establecer y planificar mis metas financieras."
                },
                {
                    label: "Optimización de Presupuesto",
                    description: "Te ofreceré recomendaciones para ajustar tu presupuesto a tus prioridades.",
                    value: "Ayúdame a optimizar mi presupuesto actual."
                },
                {
                    label: "Análisis de Salud Financiera",
                    description: "Te proporcionaré un estado de salud financiera con sugerencias de mejora.",
                    value: "Haz un análisis completo de mi salud financiera."
                }
            ]
        };

        addMessageToConversation(expertWelcomeMessage);
    };

    const handleActionClick = (path: string, transactionId?: string) => {
        navigate(path);
        setIsOpen(false);
        window.dispatchEvent(new CustomEvent('budget-update', {
            detail: { transactionId }
        }));
    };

    const handleConfirmation = (confirmed: boolean) => {
        if (confirmed) {
            handleSend({ text: "Ingresar" });
        } else {
            handleSend({ text: "Modificar" });
        }
    };

    const handlePillClick = (text: string) => {
        handleSend({ text });
    };

    // Flatten categories for selection
    const getAllCategories = () => {
        const allCats: { id: string, name: string, type: string }[] = [];
        Object.entries(budgetCategories).forEach(([key, group]) => {
            group.categories.forEach(cat => {
                allCats.push({ ...cat, type: key });
            });
        });
        return allCats;
    };

    // ...

    // Don't show FAB on landing page or auth page
    const shouldShowFAB = location.pathname !== '/' && location.pathname !== '/auth';

    return (
        <>
            {shouldShowFAB && <FloatingActionMenu onOpenChat={() => setIsOpen(true)} />}

            {/* Overlay only on mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Custom Drawer */}
            <div
                className={`fixed top-0 right-0 h-full bg-background border-l shadow-lg z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    } w-full md:w-1/4`}
                style={{
                    // Prevent zoom on mobile when focusing inputs
                    touchAction: 'manipulation'
                }}
            >
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        <h2 className="font-semibold">Asistente Financiero</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setShowHistory(!showHistory)}
                            title="Historial de conversaciones"
                        >
                            <History className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </Button>
                    </div>
                </div>

                {/* Conversation Tabs */}
                {!showHistory && <ConversationTabs />}

                {/* Conversation History View */}
                {showHistory ? (
                    <div className="flex-1 overflow-hidden">
                        <ConversationHistory onClose={() => setShowHistory(false)} />
                    </div>
                ) : (
                    <>
                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                            {messages.length === 0 ? (
                                <div className="flex flex-col gap-4">
                                    <ConversationEmptyState
                                        icon={<Bot className="h-12 w-12 opacity-50" />}
                                        title="Hola, soy tu asistente financiero"
                                        description="Puedo ayudarte a analizar tus gastos o añadir nuevos gastos. ¡También puedes enviarme fotos de tus recibos!"
                                    />
                                    <div className="grid grid-cols-2 gap-2 px-4">
                                        <Button
                                            variant="outline"
                                            className="h-auto py-4 px-4 justify-start text-left whitespace-normal col-span-2 bg-primary/10 hover:bg-primary/20 border-primary/40"
                                            onClick={handleExpertAdvisorClick}
                                        >
                                            <div className="flex items-center gap-3 w-full">
                                                <div className="p-2 bg-primary/20 rounded-full">
                                                    <Briefcase className="h-5 w-5 text-primary" />
                                                </div>
                                                <div className="flex-1">
                                                    <span className="font-semibold text-primary block text-base">Asesor Financiero Experto</span>
                                                    <span className="text-xs text-muted-foreground">Análisis profundo y plan de acción</span>
                                                </div>
                                            </div>
                                        </Button>
                                        <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal" onClick={() => handlePillClick("¿Cuánto puedo gastar hoy?")}>
                                            💰 Límite diario
                                        </Button>
                                        <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal" onClick={() => handlePillClick("Analiza mis gastos de los últimos 3 meses")}>
                                            📊 Analizar gastos
                                        </Button>
                                        <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal" onClick={() => handlePillClick("Ayúdame a optimizar mi presupuesto")}>
                                            ⚖️ Optimizar presupuesto
                                        </Button>
                                        <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal" onClick={() => handlePillClick("Dame consejos de inversión")}>
                                            📈 Inversión
                                        </Button>
                                        <Button variant="outline" className="h-auto py-3 px-4 justify-start text-left whitespace-normal col-span-2 bg-secondary/20 hover:bg-secondary/30 border-secondary/50" onClick={() => {
                                            setIsOpen(false);
                                            window.dispatchEvent(new Event('open-add-transaction-dialog'));
                                        }}>
                                            ➕ Añadir manualmente
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                messages.filter(m => !m.isHidden && m.role !== 'tool').map((msg, i) => (
                                    <Message key={i} from={msg.role === 'user' ? 'user' : 'assistant'}>
                                        <MessageContent>
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <MessageAttachments>
                                                    {msg.attachments.map((att, idx) => (
                                                        <MessageAttachment key={idx} data={{ type: 'file', url: att.url, mediaType: 'image/png' }} />
                                                    ))}
                                                </MessageAttachments>
                                            )}
                                            <div className="prose dark:prose-invert text-foreground text-sm max-w-none">
                                                <ReactMarkdown
                                                    components={{
                                                        ul: ({ node, ...props }) => <ul className="list-disc pl-4 mb-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        strong: ({ node, ...props }) => <span className="font-bold text-primary" {...props} />
                                                    }}
                                                >
                                                    {Array.isArray(msg.content)
                                                        ? msg.content.filter(c => c.type === 'text').map(c => (c as any).text).join('')
                                                        : msg.content || ''}
                                                </ReactMarkdown>

                                                {msg.action && (
                                                    <div className="mt-3">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2 text-xs"
                                                            onClick={() => handleActionClick(msg.action!.path, msg.action!.transactionId)}
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                            {msg.action.label}
                                                        </Button>
                                                    </div>
                                                )}

                                                {msg.options && (
                                                    <div className="mt-4 flex flex-col gap-2">
                                                        {msg.options.map((option, idx) => (
                                                            <Button
                                                                key={idx}
                                                                variant="outline"
                                                                className="h-auto py-3 px-4 justify-start text-left whitespace-normal bg-card hover:bg-secondary/50 border-border/50 transition-colors"
                                                                onClick={() => handlePillClick(option.value)}
                                                            >
                                                                <div className="flex flex-col gap-1 w-full">
                                                                    <span className="font-semibold text-sm">{option.label}</span>
                                                                    <span className="text-xs text-muted-foreground font-normal leading-relaxed">
                                                                        {option.description}
                                                                    </span>
                                                                </div>
                                                            </Button>
                                                        ))}
                                                    </div>
                                                )}


                                                {msg.isCategorySelection && (
                                                    <div className="mt-3 flex flex-wrap gap-2">
                                                        {(() => {
                                                            const allCats = getAllCategories();
                                                            const suggested = msg.suggestedCategories || [];

                                                            // Sort: Suggested first, then others
                                                            const sortedCats = [...allCats].sort((a, b) => {
                                                                const isASuggested = suggested.includes(a.id);
                                                                const isBSuggested = suggested.includes(b.id);
                                                                if (isASuggested && !isBSuggested) return -1;
                                                                if (!isASuggested && isBSuggested) return 1;
                                                                return 0;
                                                            });

                                                            return sortedCats.map(cat => {
                                                                const isSuggested = suggested.includes(cat.id);
                                                                return (
                                                                    <Button
                                                                        key={cat.id}
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className={`text-xs transition-colors ${isSuggested
                                                                            ? 'border-primary/50 text-foreground hover:bg-primary hover:text-primary-foreground'
                                                                            : 'text-muted-foreground hover:bg-primary hover:text-primary-foreground'
                                                                            }`}
                                                                        onClick={() => handleCategorySelect(cat.name, cat.id)}
                                                                    >
                                                                        {isSuggested && <Sparkles className="w-3 h-3 mr-1 inline text-primary group-hover:text-primary-foreground" />}
                                                                        {cat.name}
                                                                    </Button>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                )}

                                                {msg.isConfirmation && (
                                                    <div className="mt-3 flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700 text-white"
                                                            onClick={() => handleConfirmation(true)}
                                                        >
                                                            Ingresar
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleConfirmation(false)}
                                                        >
                                                            Modificar
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>
                                        </MessageContent>
                                    </Message>
                                ))
                            )}

                            {/* AI Loading Indicator */}
                            {isLoading && (
                                <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-500">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Bot className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex items-center gap-2 rounded-2xl bg-muted px-4 py-3">
                                        {/* AI Chip Icon with Animation */}
                                        <div className="relative w-12 h-12 animate-pulse">
                                            {/* Chip body */}
                                            <div className="absolute inset-2 rounded-lg border-2 border-primary bg-background flex items-center justify-center">
                                                <span className="text-primary font-bold text-xs">AI</span>
                                            </div>

                                            {/* Connection pins - top */}
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-primary rounded-t animate-pulse" style={{ animationDelay: '0ms' }} />
                                            <div className="absolute top-0 left-1/3 -translate-x-1/2 w-1 h-2 bg-accent rounded-t animate-pulse" style={{ animationDelay: '100ms' }} />
                                            <div className="absolute top-0 left-2/3 -translate-x-1/2 w-1 h-2 bg-primary rounded-t animate-pulse" style={{ animationDelay: '200ms' }} />

                                            {/* Connection pins - bottom */}
                                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-2 bg-primary rounded-b animate-pulse" style={{ animationDelay: '300ms' }} />
                                            <div className="absolute bottom-0 left-1/3 -translate-x-1/2 w-1 h-2 bg-accent rounded-b animate-pulse" style={{ animationDelay: '400ms' }} />
                                            <div className="absolute bottom-0 left-2/3 -translate-x-1/2 w-1 h-2 bg-primary rounded-b animate-pulse" style={{ animationDelay: '500ms' }} />

                                            {/* Connection dots - left */}
                                            <div className="absolute left-0 top-1/3 w-1.5 h-1.5 rounded-full bg-primary animate-ping" style={{ animationDuration: '1.5s' }} />
                                            <div className="absolute left-0 top-1/2 w-1.5 h-1.5 rounded-full bg-accent animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
                                            <div className="absolute left-0 top-2/3 w-1.5 h-1.5 rounded-full bg-primary animate-ping" style={{ animationDuration: '1.5s', animationDelay: '0.4s' }} />
                                        </div>
                                        <span className="text-xs text-muted-foreground">Pensando...</span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div className="p-4 border-t bg-background">
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs whitespace-nowrap bg-primary/10 hover:bg-primary/20 border-primary/20 text-primary"
                                    onClick={() => handlePillClick("Quiero añadir un gasto")}
                                >
                                    Añadir Gasto
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="rounded-full text-xs whitespace-nowrap bg-green-500/10 hover:bg-green-500/20 border-green-500/20 text-green-600"
                                    onClick={() => handlePillClick("Quiero añadir un ingreso")}
                                >
                                    Añadir Ingreso
                                </Button>
                            </div>
                            <PromptInput
                                onSubmit={(msg) => handleSend(msg)}
                                className="w-full"
                                accept="image/*"
                                maxFiles={3}
                            >
                                <PromptInputAttachments>
                                    {(file) => <PromptInputAttachment key={file.id} data={file} />}
                                </PromptInputAttachments>
                                <PromptInputBody>
                                    <PromptInputTextarea placeholder="Presiona Enter para enviar..." />
                                </PromptInputBody>
                                <PromptInputFooter className="justify-between">
                                    <PromptInputTools>
                                        <AttachmentButton />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className={isRecording ? "text-red-500 animate-pulse" : ""}
                                            onClick={isRecording ? stopRecording : startRecording}
                                        >
                                            {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                        </Button>
                                    </PromptInputTools>
                                </PromptInputFooter>
                            </PromptInput>
                        </div>
                    </>
                )}
            </div >
        </>
    );
};
