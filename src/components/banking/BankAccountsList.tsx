import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BankingService } from '@/services/BankingService';
import type { BankAccount } from '@/types/banking';
import { Loader2, RefreshCw, Wallet } from 'lucide-react';
import { toast } from 'sonner';

interface BankAccountsListProps {
  onAccountSelect?: (account: BankAccount) => void;
}

export function BankAccountsList({ onAccountSelect }: BankAccountsListProps) {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadAccounts = async () => {
    try {
      const data = await BankingService.getAccounts();
      setAccounts(data);
    } catch (error: any) {
      toast.error('Error al cargar cuentas', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const tinkUserId = await BankingService.getTinkUserId();
      if (!tinkUserId) {
        toast.error('No hay usuario Tink', {
          description: 'Conecta un banco primero',
        });
        return;
      }

      const result = await BankingService.syncTransactions(tinkUserId);
      toast.success('Transacciones sincronizadas', {
        description: `${result.transactionsSynced} nuevas, ${result.transactionsSkipped} omitidas`,
      });

      // Reload accounts after sync
      await loadAccounts();
    } catch (error: any) {
      toast.error('Error al sincronizar', {
        description: error.message,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  const formatCurrency = (amount: number | null, currency: string | null) => {
    if (amount === null) return '—';
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: currency || 'EUR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-8">
          <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">
            No hay cuentas conectadas
          </p>
          <p className="text-sm text-muted-foreground text-center mt-2">
            Conecta tu banco para ver tus cuentas aquí
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cuentas Bancarias</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSync}
          disabled={isSyncing}
        >
          {isSyncing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Sincronizar
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Card
            key={account.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onAccountSelect?.(account)}
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">
                  {account.account_name || 'Cuenta Bancaria'}
                </CardTitle>
                {account.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Activa
                  </Badge>
                )}
              </div>
              {account.iban && (
                <CardDescription className="font-mono text-xs">
                  {account.iban}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(account.current_balance, account.currency)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Actualizada: {new Date(account.updated_at).toLocaleDateString('es-ES')}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
