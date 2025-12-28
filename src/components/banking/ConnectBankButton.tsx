import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BankingService } from '@/services/BankingService';
import { toast } from 'sonner';
import { Loader2, Building2 } from 'lucide-react';

export function ConnectBankButton() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const { authorizationLink } = await BankingService.createConnection();

      // Redirect to Tink Link
      window.location.href = authorizationLink;
    } catch (error: any) {
      toast.error('Error al conectar banco', {
        description: error.message || 'No se pudo crear la conexión bancaria',
      });
      setIsConnecting(false);
    }
  };

  return (
    <Button
      onClick={handleConnect}
      disabled={isConnecting}
      className="w-full sm:w-auto"
      size="lg"
    >
      {isConnecting ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Building2 className="mr-2 h-4 w-4" />
          Conectar Banco
        </>
      )}
    </Button>
  );
}
