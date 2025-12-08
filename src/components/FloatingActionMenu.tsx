import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Sparkles, X, PenLine } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionMenuProps {
    onOpenChat: () => void;
}

export const FloatingActionMenu = ({ onOpenChat }: FloatingActionMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    const handleManualAdd = () => {
        setIsOpen(false);
        window.dispatchEvent(new Event('open-add-transaction-dialog'));
    };

    const handleAIChat = () => {
        setIsOpen(false);
        onOpenChat();
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-2"
                        >
                            <span className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium shadow-sm border">
                                AI Chat
                            </span>
                            <Button
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg bg-gradient-to-r from-primary to-accent"
                                onClick={handleAIChat}
                            >
                                <Sparkles className="h-5 w-5 text-white" />
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.8 }}
                            transition={{ duration: 0.2, delay: 0.05 }}
                            className="flex items-center gap-2"
                        >
                            <span className="bg-background/80 backdrop-blur-sm px-2 py-1 rounded-md text-sm font-medium shadow-sm border">
                                Añadir manualmente
                            </span>
                            <Button
                                size="icon"
                                className="h-12 w-12 rounded-full shadow-lg bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                onClick={handleManualAdd}
                            >
                                <PenLine className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <Button
                size="icon"
                className={`rounded-full shadow-xl transition-all duration-300 ${isOpen ? 'h-10 w-10 bg-accent hover:bg-accent/90' : 'h-14 w-14 bg-primary hover:bg-primary/90'}`}
                onClick={toggleMenu}
            >
                <Plus className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-[135deg] text-accent-foreground' : 'text-primary-foreground'}`} />
            </Button>
        </div>
    );
};
