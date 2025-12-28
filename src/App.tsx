import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { StorageProvider } from "./contexts/StorageContext";
import { ConversationProvider } from "./contexts/ConversationContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useState, useEffect, lazy, Suspense } from 'react';

const Dashboard = lazy(() => import("./pages/Dashboard"));
const MonthlyBudget = lazy(() => import("./pages/MonthlyBudget"));
const Budget = lazy(() => import("./pages/Budget"));
const Catalog = lazy(() => import("./pages/Catalog"));
const Settings = lazy(() => import("./pages/Settings"));
const Banking = lazy(() => import("./pages/Banking"));
const BankingCallback = lazy(() => import("./pages/BankingCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const FinancialHealth = lazy(() => import("./pages/FinancialHealth").then(module => ({ default: module.FinancialHealth })));
const AIChat = lazy(() => import('./components/AIChat').then(module => ({ default: module.AIChat })));
const GlobalFABDialog = lazy(() => import('./components/GlobalFABDialog').then(module => ({ default: module.GlobalFABDialog })));

const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);


const queryClient = new QueryClient();

const App = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleDrawerState = (event: CustomEvent) => {
      setIsDrawerOpen(event.detail.isOpen);
    };

    window.addEventListener('ai-chat-state-change', handleDrawerState as EventListener);
    return () => window.removeEventListener('ai-chat-state-change', handleDrawerState as EventListener);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <StorageProvider>
          <AppProvider>
            <ConversationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <div
                    className={`transition-all duration-300 ease-in-out h-screen overflow-y-auto ${isDrawerOpen ? 'md:mr-[25%]' : 'mr-0'}`}
                  >
                    <Suspense fallback={<LoadingFallback />}>
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <Dashboard />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/budget"
                          element={
                            <ProtectedRoute>
                              <Budget />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/budget/:year/:month"
                          element={
                            <ProtectedRoute>
                              <MonthlyBudget />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/catalog"
                          element={
                            <ProtectedRoute>
                              <Catalog />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <Settings />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/financial-health"
                          element={
                            <ProtectedRoute>
                              <FinancialHealth />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/banking"
                          element={
                            <ProtectedRoute>
                              <Banking />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/banking/callback"
                          element={
                            <ProtectedRoute>
                              <BankingCallback />
                            </ProtectedRoute>
                          }
                        />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                  </div>
                  <Suspense fallback={null}>
                    <AIChat />
                    <GlobalFABDialog />
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </ConversationProvider>
          </AppProvider>
        </StorageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
