import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { useStorage } from '@/contexts/StorageContext';
import { translations } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AvatarUpload } from '@/components/AvatarUpload';

const Settings = () => {
  const { config, updateConfig, loadingSettings } = useApp();
  const { storageType, setStorageType } = useStorage();
  const { toast } = useToast();
  const t = translations[config.language];

  const [notifications, setNotifications] = useState(true);

  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: config.ownerName,
    monthlyIncome: config.monthlyIncome.toString(),
    currency: config.currency,
    language: config.language,
    openaiApiKey: config.openaiApiKey || '',
    avatarUrl: config.avatarUrl || '',
  });

  // Update form when config loads from database
  useEffect(() => {
    setFormData({
      ownerName: config.ownerName,
      monthlyIncome: config.monthlyIncome.toString(),
      currency: config.currency,
      language: config.language,
      openaiApiKey: config.openaiApiKey || '',
      avatarUrl: config.avatarUrl || '',
    });
  }, [config]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({
        ownerName: formData.ownerName,
        monthlyIncome: parseFloat(formData.monthlyIncome) || 0,
        currency: formData.currency as 'EUR' | 'USD',
        language: formData.language as 'es' | 'en',
        openaiApiKey: formData.openaiApiKey,
        avatarUrl: formData.avatarUrl,
      });

      toast({
        title: config.language === 'es' ? 'Configuración guardada' : 'Settings saved',
        description: config.language === 'es'
          ? 'Tus cambios han sido guardados exitosamente.'
          : 'Your changes have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: config.language === 'es' ? 'Error' : 'Error',
        description: config.language === 'es'
          ? 'No se pudieron guardar los cambios.'
          : 'Could not save changes.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

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
              <div className="flex justify-center mb-4">
                <AvatarUpload
                  url={formData.avatarUrl}
                  onUpload={(url) => setFormData({ ...formData, avatarUrl: url })}
                  displayName={formData.ownerName}
                />
              </div>

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

              <div className="pt-4 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4">Datos y Almacenamiento</h3>
                <div className="space-y-2">
                  <Label htmlFor="storage">Ubicación de Datos</Label>
                  <Select
                    value={storageType}
                    onValueChange={(value) => setStorageType(value as 'supabase' | 'local')}
                  >
                    <SelectTrigger id="storage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supabase">Nube (Supabase)</SelectItem>
                      <SelectItem value="local">Local (Dispositivo)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {storageType === 'supabase'
                      ? 'Tus datos están sincronizados en la nube y accesibles desde cualquier dispositivo.'
                      : 'Tus datos se guardan solo en este dispositivo. Si borras los datos del navegador, se perderán.'}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4">Configuración de IA</h3>
                <div className="space-y-2">
                  <Label htmlFor="openaiApiKey">OpenAI API Key (Opcional)</Label>
                  <Input
                    id="openaiApiKey"
                    type="password"
                    value={formData.openaiApiKey}
                    onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                    placeholder="sk-..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Si proporcionas tu propia API Key, se usará en lugar de la predeterminada.
                    Tu clave se guarda localmente y nunca se comparte con nosotros.
                  </p>
                </div>
              </div>

              <Button onClick={handleSave} className="w-full" disabled={saving}>
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
