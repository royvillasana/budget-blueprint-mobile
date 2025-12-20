import { useState, useEffect, Suspense, lazy } from 'react';
import { FloatingActionMenu } from '@/components/FloatingActionMenu';
import { useLocation } from 'react-router-dom';

// Lazy load the heavy chat content
const AIChatContent = lazy(() => import('./AIChatContent').then(m => ({ default: m.AIChatContent })));

export const AIChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Notify App.tsx when drawer state changes (for desktop push effect)
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('ai-chat-state-change', {
            detail: { isOpen }
        }));
    }, [isOpen]);

    // Don't show FAB on landing page or auth page
    const shouldShowFAB = location.pathname !== '/' && location.pathname !== '/auth';

    if (!shouldShowFAB) return null;

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

            {/* Lazy Load Content only when open */}
            {isOpen && (
                <Suspense fallback={
                    <div className="fixed top-0 right-0 h-full bg-background border-l shadow-lg z-50 flex flex-col w-full md:w-1/4 animate-in fade-in slide-in-from-right-full duration-300">
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-pulse text-primary font-medium">Cargando asistente...</div>
                        </div>
                    </div>
                }>
                    <AIChatContent onClose={() => setIsOpen(false)} />
                </Suspense>
            )}
        </>
    );
};
