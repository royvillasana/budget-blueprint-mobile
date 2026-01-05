import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BankingService } from '@/services/BankingService';
import type { BankTransaction, BankAccount } from '@/types/banking';
import { Loader2, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface TransactionReviewModalProps {
  account: BankAccount | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportComplete?: () => void;
}

export function TransactionReviewModal({
  account,
  open,
  onOpenChange,
  onImportComplete,
}: TransactionReviewModalProps) {
  const [transactions, setTransactions] = useState<BankTransaction[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (open && account) {
      loadTransactions();
    }
  }, [open, account]);

  const loadTransactions = async () => {
    if (!account) return;

    setIsLoading(true);
    try {
      const data = await BankingService.getTransactions(account.id, false);
      setTransactions(data);
      // Select all by default
      setSelectedIds(new Set(data.map((t) => t.id)));
    } catch (error: any) {
      toast.error('Error al cargar transacciones', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  };

  const handleImport = async () => {
    if (selectedIds.size === 0) {
      toast.error('Selecciona al menos una transacción');
      return;
    }

    setIsImporting(true);
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;

      const result = await BankingService.importTransactions(
        Array.from(selectedIds),
        year,
        month
      );

      toast.success('Transacciones importadas', {
        description: `${result.imported} importadas, ${result.skipped} omitidas`,
      });

      // Dispatch event to notify MonthlyBudget page to refresh
      window.dispatchEvent(new CustomEvent('transaction-added'));

      onOpenChange(false);
      onImportComplete?.();
    } catch (error: any) {
      toast.error('Error al importar', {
        description: error.message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Revisar Transacciones</DialogTitle>
          <DialogDescription>
            {account?.account_name || 'Cuenta Bancaria'} - Selecciona las transacciones para importar
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground">
              No hay transacciones nuevas para importar
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
              >
                {selectedIds.size === transactions.length ? 'Deseleccionar' : 'Seleccionar'} Todo
              </Button>
              <p className="text-sm text-muted-foreground">
                {selectedIds.size} de {transactions.length} seleccionadas
              </p>
            </div>

            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-2">
                {transactions.map((transaction) => {
                  const isSelected = selectedIds.has(transaction.id);
                  const isIncome = transaction.amount > 0;

                  return (
                    <div
                      key={transaction.id}
                      className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? 'bg-accent' : 'hover:bg-accent/50'
                      }`}
                      onClick={() => handleToggle(transaction.id)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggle(transaction.id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {transaction.merchant_name || transaction.description || 'Sin descripción'}
                            </p>
                            {transaction.description && transaction.merchant_name && (
                              <p className="text-xs text-muted-foreground">
                                {transaction.description}
                              </p>
                            )}
                          </div>
                          <Badge variant={isIncome ? 'default' : 'secondary'}>
                            {isIncome ? (
                              <Check className="mr-1 h-3 w-3" />
                            ) : (
                              <X className="mr-1 h-3 w-3" />
                            )}
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </Badge>
                        </div>

                        <p className="text-xs text-muted-foreground">
                          {formatDate(transaction.booking_date)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isImporting}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleImport}
                disabled={isImporting || selectedIds.size === 0}
              >
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importando...
                  </>
                ) : (
                  `Importar ${selectedIds.size} Transacciones`
                )}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
