import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { StorageProvider } from "./contexts/StorageContext";
import Dashboard from "./pages/Dashboard";
import MonthlyBudget from "./pages/MonthlyBudget";
import Budget from "./pages/Budget";
import Catalog from "./pages/Catalog";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AIChat } from './components/AIChat';
import { useState, useEffect } from 'react';

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
      <StorageProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div
                className={`transition-all duration-300 ease-in-out h-screen overflow-y-auto ${isDrawerOpen ? 'md:mr-[25%]' : 'mr-0'}`}
              >
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
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
              <AIChat />
            </BrowserRouter>
          </TooltipProvider>
        </AppProvider>
      </StorageProvider>
    </QueryClientProvider>
  );
};

export default App;
