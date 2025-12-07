import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { AIService, AIMessage } from '@/services/AIService';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from '@/components/ui/sheet';
import { Bot, Sparkles, ExternalLink, Mic, Square } from 'lucide-react';

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
    PromptInputActionMenu,
    PromptInputActionMenuTrigger,
    PromptInputActionMenuContent,
    PromptInputActionAddAttachments,
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
        type: 'income' | 'expense';
        suggestedCategories?: string[];
    };
    confirmation?: {
        summary: string;
        transactionData: any;
    };
    isHidden?: boolean;
}

export const AIChat = () => {
    const { config, transactions, budgetCategories, addTransaction } = useApp();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ExtendedAIMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);

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

    const processAIResponse = async (response: any) => {
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

                } else if (functionName === 'requestCategorySelection') {
                    // Add tool result message (required by OpenAI)
                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: "Category selection UI shown to user.",
                        name: functionName
                    });

                    // Attach UI properties to the assistant message
                    assistantMessage.categorySelection = {
                        type: functionArgs.type,
                        suggestedCategories: functionArgs.suggestedCategories
                    };
                    assistantMessage.content = assistantMessage.content || 'Por favor, selecciona una categoría:';

                } else if (functionName === 'requestConfirmation') {
                    // Add tool result message (required by OpenAI)
                    newMessages.push({
                        role: 'tool',
                        tool_call_id: toolCall.id,
                        content: "Confirmation UI shown to user.",
                        name: functionName
                    });

                    // Attach UI properties to the assistant message
                    assistantMessage.confirmation = {
                        summary: functionArgs.summary,
                        transactionData: functionArgs.transactionData
                    };
                    assistantMessage.content = assistantMessage.content || functionArgs.summary;
                }
            }

            setMessages(prev => [...prev, ...newMessages]);

        } else if (response.content) {
            setMessages(prev => [...prev, { role: 'assistant', content: response.content || '' }]);
        }

        setIsLoading(false);
    };

    const handleSend = async (message: { text: string; files?: FileUIPart[] }, isHidden: boolean = false) => {
        if ((!message.text.trim() && (!message.files || message.files.length === 0)) || isLoading) return;

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

            const response = await aiService.sendMessage([...messages, userMessage], context);
            await processAIResponse(response);

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

        aiService.sendMessage([...messages, hiddenMessage], context)
            .then(response => {
                processAIResponse(response);
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

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-gradient-to-r from-primary to-accent hover:shadow-xl transition-all duration-300"
                    size="icon"
                >
                    <Sparkles className="h-6 w-6 text-white animate-pulse" />
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-primary" />
                        Asistente Financiero
                    </SheetTitle>
                    <SheetDescription>
                        Tu asistente personal para gestionar gastos y presupuesto.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.length === 0 ? (
                            <ConversationEmptyState
                                icon={<Bot className="h-12 w-12 opacity-50" />}
                                title="Hola, soy tu asistente financiero"
                                description="Puedo ayudarte a analizar tus gastos o añadir nuevas transacciones. ¡También puedes enviarme fotos de tus recibos!"
                            />
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
                                <PromptInputTextarea placeholder="Escribe un mensaje o adjunta un recibo..." />
                            </PromptInputBody>
                            <PromptInputFooter className="justify-between">
                                <PromptInputTools>
                                    <PromptInputActionMenu>
                                        <PromptInputActionMenuTrigger />
                                        <PromptInputActionMenuContent>
                                            <PromptInputActionAddAttachments />
                                        </PromptInputActionMenuContent>
                                    </PromptInputActionMenu>
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
                                <PromptInputSubmit disabled={isLoading} />
                            </PromptInputFooter>
                        </PromptInput>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
};
