import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectBankButton } from '@/components/banking/ConnectBankButton';
import { BankAccountsList } from '@/components/banking/BankAccountsList';
import { TransactionReviewModal } from '@/components/banking/TransactionReviewModal';
import { BankingService } from '@/services/BankingService';
import type { BankAccount } from '@/types/banking';
import { Building2, CreditCard, TrendingUp } from 'lucide-react';

export default function Banking() {
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);
  const [transactionCount, setTransactionCount] = useState<number>(0);

  useEffect(() => {
    loadBankingData();
  }, []);

  const loadBankingData = async () => {
    try {
      const accountsData = await BankingService.getAccounts();
      setAccounts(accountsData);

      // Calculate total balance
      const total = accountsData.reduce((sum, acc) => sum + (acc.current_balance || 0), 0);
      setTotalBalance(total);

      // For now, transactions count is 0 - will be updated when we fetch from bank_transactions table
      setTransactionCount(0);
    } catch (error) {
      console.error('Error loading banking data:', error);
    }
  };

  const handleAccountSelect = (account: BankAccount) => {
    setSelectedAccount(account);
    setIsModalOpen(true);
  };

  const handleImportComplete = () => {
    loadBankingData();
    console.log('Import completed');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  return (
    <>
      <Header />
      <div className="container mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Banca Conectada</h1>
          <p className="text-muted-foreground">
            Conecta tus cuentas bancarias y sincroniza transacciones automáticamente
          </p>
        </div>
        <ConnectBankButton />
      </div>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Cuentas Conectadas
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {accounts.length === 1 ? 'Cuenta activa' : 'Cuentas activas'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Saldo Total
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              En todas las cuentas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Transacciones
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionCount}</div>
            <p className="text-xs text-muted-foreground">
              Sincronizadas este mes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="accounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="accounts">Cuentas</TabsTrigger>
          <TabsTrigger value="connections">Conexiones</TabsTrigger>
          <TabsTrigger value="about">Acerca de</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <BankAccountsList onAccountSelect={handleAccountSelect} />
        </TabsContent>

        <TabsContent value="connections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conexiones Bancarias</CardTitle>
              <CardDescription>
                Gestiona tus conexiones con diferentes bancos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Las conexiones bancarias aparecerán aquí después de conectar tu primer banco.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Acerca de la Integración Bancaria</CardTitle>
              <CardDescription>
                Powered by Tink Open Banking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">¿Cómo funciona?</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li>Haz clic en "Conectar Banco" para iniciar el proceso</li>
                  <li>Selecciona tu banco de la lista de proveedores</li>
                  <li>Autoriza la conexión usando las credenciales de tu banco</li>
                  <li>Tus cuentas y transacciones se sincronizarán automáticamente</li>
                  <li>Revisa e importa transacciones a tu presupuesto mensual</li>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Seguridad</h3>
                <p className="text-sm text-muted-foreground">
                  Usamos Tink, una plataforma de Open Banking regulada y conforme con PSD2.
                  Tus credenciales bancarias nunca se almacenan en nuestros servidores.
                  Todas las conexiones están encriptadas y protegidas.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Privacidad</h3>
                <p className="text-sm text-muted-foreground">
                  Solo accedemos a la información que autorizas explícitamente.
                  Puedes revocar el acceso en cualquier momento desde esta página.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transaction Review Modal */}
      <TransactionReviewModal
        account={selectedAccount}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onImportComplete={handleImportComplete}
      />
      </div>
    </>
  );
}
