import { useState, useRef, useEffect } from 'react';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';
import { supabase } from '@/integrations/supabase/client';
import { getTableName } from '@/utils/monthUtils';
import { useApp } from '@/contexts/AppContext';
import { AIService, AIMessage } from '@/services/AIService';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Bot, Sparkles, ExternalLink, Mic, Square, Paperclip } from 'lucide-react';

import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
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
    confirmation?: {
        summary: string;
        transaction: any;
    };
    isHidden?: boolean;
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

export const AIChat = () => {
    const { config, transactions, budgetCategories, addTransaction, updateCategory } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ExtendedAIMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Notify App.tsx when drawer state changes (for desktop push effect)
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('ai-chat-state-change', {
            detail: { isOpen }
        }));
    }, [isOpen]);

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
                    const newTxn = await addTransaction({
                        description: functionArgs.description,
                        amount: functionArgs.amount,
                        type: functionArgs.type,
                        category: functionArgs.category || 'others',
                        date: functionArgs.date || new Date().toISOString().split('T')[0]
                    });

                    toast({
                        title: "Transacción añadida",
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
                }
            }

            setMessages(prev => [...prev, ...newMessages]);

            if (shouldCallAI) {
                const context = {
                    transactions,
                    budgetCategories,
                    monthlyIncome: config.monthlyIncome,
                    currency: config.currency
                };
                const updatedHistory = [...currentHistory, ...newMessages];
                const followUpResponse = await aiService.sendMessage(updatedHistory, context);
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
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }
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

        setMessages(prev => [...prev, userMessage]);

        try {
            const context = {
                transactions,
                budgetCategories,
                monthlyIncome: config.monthlyIncome,
                currency: config.currency
            };

            const currentHistory = [...messages, userMessage];
            const response = await aiService.sendMessage(currentHistory, context);
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

    const handleCategorySelect = (categoryName: string, categoryId: string) => {
        // Send hidden message to AI
        const hiddenMessage: ExtendedAIMessage = {
            role: 'user',
            content: `Categoría seleccionada: ${categoryName} (ID: ${categoryId})`,
            isHidden: true
        };

        setMessages(prev => [...prev, hiddenMessage]);
        setIsLoading(true);

        const context = {
            transactions,
            budgetCategories,
            monthlyIncome: config.monthlyIncome,
            currency: config.currency
        };

        const currentHistory = [...messages, hiddenMessage];
        aiService.sendMessage(currentHistory, context)
            .then(response => {
                processAIResponse(response, currentHistory);
            })
            .catch(error => {
                console.error('Error sending message:', error);
                setIsLoading(false);
            });
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

    return (
        <>
            <FloatingActionMenu onOpenChat={() => setIsOpen(true)} />

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
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsOpen(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </Button>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {messages.length === 0 ? (
                        <div className="flex flex-col gap-4">
                            <ConversationEmptyState
                                icon={<Bot className="h-12 w-12 opacity-50" />}
                                title="Hola, soy tu asistente financiero"
                                description="Puedo ayudarte a analizar tus gastos o añadir nuevas transacciones. ¡También puedes enviarme fotos de tus recibos!"
                            />
                            <div className="grid grid-cols-2 gap-2 px-4">
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

                                        {msg.categorySelection && (
                                            <div className="mt-3 flex flex-wrap gap-2">
                                                {(() => {
                                                    const allCats = getAllCategories();
                                                    const suggested = msg.categorySelection.suggestedCategories || [];

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

                                        {msg.confirmation && (
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
            </div>
        </>
    );
};
