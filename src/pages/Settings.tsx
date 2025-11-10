import { useState } from 'react';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { config, updateConfig } = useApp();
  const { toast } = useToast();
  const t = translations[config.language];

  const [formData, setFormData] = useState({
    ownerName: config.ownerName,
    monthlyIncome: config.monthlyIncome.toString(),
    currency: config.currency,
    language: config.language,
  });

  const handleSave = () => {
    updateConfig({
      ownerName: formData.ownerName,
      monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
      currency: formData.currency as 'EUR' | 'USD',
      language: formData.language as 'es' | 'en',
    });

    toast({
      title: config.language === 'es' ? 'Configuración guardada' : 'Settings saved',
      description: config.language === 'es' 
        ? 'Tus cambios han sido guardados exitosamente.' 
        : 'Your changes have been saved successfully.',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t.settingsTitle}</h1>

          <Card>
            <CardHeader>
              <CardTitle>Información Personal</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ownerName">{t.ownerName}</Label>
                <Input
                  id="ownerName"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="monthlyIncome">{t.monthlyIncome}</Label>
                <Input
                  id="monthlyIncome"
                  type="number"
                  value={formData.monthlyIncome}
                  onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
                  placeholder="3000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">{t.currency}</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData({ ...formData, currency: value as 'EUR' | 'USD' })}
                >
                  <SelectTrigger id="currency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="USD">USD ($)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">{t.language}</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => setFormData({ ...formData, language: value as 'es' | 'en' })}
                >
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSave} className="w-full">
                {t.save}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Settings;
