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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StorageProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
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
            <AIChat />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </StorageProvider>
  </QueryClientProvider>
);

export default App;
