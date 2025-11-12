import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LayoutDashboard, Wallet, BookOpen, Settings } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: LayoutDashboard,
      title: 'Dashboard',
      description: 'Vista general de tu situación financiera anual',
      path: '/dashboard',
      color: 'text-primary'
    },
    {
      icon: Wallet,
      title: 'Presupuesto',
      description: 'Gestiona tus presupuestos mensuales detallados',
      path: '/budget',
      color: 'text-accent'
    },
    {
      icon: BookOpen,
      title: 'Catálogo',
      description: 'Configura categorías, cuentas y métodos de pago',
      path: '/catalog',
      color: 'text-secondary'
    },
    {
      icon: Settings,
      title: 'Configuración',
      description: 'Ajusta idioma, moneda y preferencias',
      path: '/settings',
      color: 'text-muted-foreground'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Budget Blueprint
          </h1>
          <p className="text-xl text-muted-foreground">
            Tu controlador financiero mensual y anual
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {features.map((feature) => (
            <Card 
              key={feature.path}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => navigate(feature.path)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <feature.icon className={`h-6 w-6 ${feature.color}`} />
                  {feature.title}
                </CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(feature.path);
                  }}
                >
                  Ir a {feature.title}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle>¿Comenzando?</CardTitle>
            <CardDescription>
              Empieza configurando tus categorías y cuentas en el Catálogo, luego navega al Dashboard para ver tu panorama financiero anual.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};

export default Index;
