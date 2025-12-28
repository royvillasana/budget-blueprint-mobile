import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '@/components/Header';
import { BankingService } from '@/services/BankingService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function BankingCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Procesando conexión bancaria...');

  useEffect(() => {
    handleCallback();
  }, []);

  const handleCallback = async () => {
    try {
      // Log all callback parameters
      const params = Object.fromEntries(searchParams.entries());
      console.log('Tink Link callback parameters:', params);

      // Check if there's an error parameter
      if (params.error) {
        setStatus('error');
        setMessage(`Error de Tink Link: ${params.message || params.error}`);
        setTimeout(() => navigate('/banking'), 3000);
        return;
      }

      // Get Tink user ID from database to confirm connection exists
      const tinkUserId = await BankingService.getTinkUserId();

      if (!tinkUserId) {
        setStatus('error');
        setMessage('No se encontró el usuario de Tink. Intenta conectar nuevamente.');
        return;
      }

      // Tink Link successful - we received a code to exchange for accounts
      const code = params.code;
      const credentialsId = params.credentialsId || params.credentials_id;

      if (!code) {
        setStatus('error');
        setMessage('No se recibió el código de autorización de Tink.');
        return;
      }

      console.log('Exchanging authorization code for accounts...');
      setMessage('Obteniendo cuentas bancarias...');

      try {
        const result = await BankingService.exchangeCode(code, credentialsId);
        console.log('Exchange result:', result);

        if (result.accountsCount && result.accountsCount > 0) {
          setStatus('success');

          // Build account status message
          let accountMsg = '';
          if (result.accountsNew > 0 && result.accountsUpdated > 0) {
            accountMsg = `${result.accountsNew} cuenta(s) nueva(s) y ${result.accountsUpdated} actualizada(s).`;
          } else if (result.accountsNew > 0) {
            accountMsg = `${result.accountsNew} cuenta(s) nueva(s) conectada(s).`;
          } else if (result.accountsUpdated > 0) {
            accountMsg = `${result.accountsUpdated} cuenta(s) actualizada(s) (ya existían).`;
          } else {
            accountMsg = `${result.accountsCount} cuenta(s) conectada(s).`;
          }

          // Build transaction message
          const txMessage = result.transactionsImported
            ? ` ${result.transactionsImported} transacciones importadas.`
            : result.error
            ? ` Error al obtener transacciones.`
            : '';

          setMessage(`¡Éxito! ${accountMsg}${txMessage}`);

          // Log details for debugging
          if (result.updatedAccountNames && result.updatedAccountNames.length > 0) {
            console.log('Cuentas actualizadas (ya existían):', result.updatedAccountNames);
          }
          if (result.newAccountNames && result.newAccountNames.length > 0) {
            console.log('Cuentas nuevas:', result.newAccountNames);
          }
        } else {
          setStatus('success');
          setMessage('¡Banco conectado! Las cuentas estarán disponibles pronto.');
        }
      } catch (exchangeError: any) {
        console.error('Exchange error:', exchangeError);
        setStatus('error');
        setMessage(`Error al obtener cuentas: ${exchangeError.message}`);
      }

      // Redirect to banking page after 2 seconds
      setTimeout(() => {
        navigate('/banking');
      }, 2000);
    } catch (error: any) {
      console.error('Callback error:', error);
      setStatus('error');
      setMessage(error.message || 'Error al procesar la conexión');

      // Redirect to banking page after 3 seconds
      setTimeout(() => {
        navigate('/banking');
      }, 3000);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === 'processing' && (
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            )}
            {status === 'error' && (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <CardTitle>
            {status === 'processing' && 'Procesando...'}
            {status === 'success' && '¡Éxito!'}
            {status === 'error' && 'Error'}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirigiendo a tu panel de banca...
            </p>
          )}
          {status === 'error' && (
            <Button onClick={() => navigate('/banking')} className="mt-4">
              Volver a Banca
            </Button>
          )}
        </CardContent>
      </Card>
      </div>
    </>
  );
}
