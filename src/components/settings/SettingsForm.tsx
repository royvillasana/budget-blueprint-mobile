import { useState, useEffect } from 'react';
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

export const SettingsForm = () => {
    const { config, updateConfig } = useApp();
    const { storageType, setStorageType } = useStorage();
    const { toast } = useToast();
    const t = translations[config.language];

    // const [notifications, setNotifications] = useState(true); // Unused in original file
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        ownerName: config.ownerName,
        monthlyIncome: config.monthlyIncome.toString(),
        currency: config.currency,
        language: config.language,
        openaiApiKey: config.openaiApiKey || '',
    });

    // Update form when config loads from database
    useEffect(() => {
        setFormData({
            ownerName: config.ownerName,
            monthlyIncome: config.monthlyIncome.toString(),
            currency: config.currency,
            language: config.language,
            openaiApiKey: config.openaiApiKey || '',
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

    return (
        <Card>
            <CardHeader>
                <CardTitle>{config.language === 'es' ? 'Información y Preferencias' : 'Information & Preferences'}</CardTitle>
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

                <div className="pt-4 border-t border-border/50">
                    <h3 className="text-lg font-semibold mb-4">{config.language === 'es' ? 'Datos y Almacenamiento' : 'Data & Storage'}</h3>
                    <div className="space-y-2">
                        <Label htmlFor="storage">{config.language === 'es' ? 'Ubicación de Datos' : 'Data Location'}</Label>
                        <Select
                            value={storageType}
                            onValueChange={(value) => setStorageType(value as 'supabase' | 'local')}
                        >
                            <SelectTrigger id="storage">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="supabase">{config.language === 'es' ? 'Nube (Supabase)' : 'Cloud (Supabase)'}</SelectItem>
                                <SelectItem value="local">{config.language === 'es' ? 'Local (Dispositivo)' : 'Local (Device)'}</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                            {storageType === 'supabase'
                                ? (config.language === 'es' ? 'Tus datos están sincronizados en la nube y accesibles desde cualquier dispositivo.' : 'Your data is synced in the cloud and accessible from any device.')
                                : (config.language === 'es' ? 'Tus datos se guardan solo en este dispositivo. Si borras los datos del navegador, se perderán.' : 'Your data is saved only on this device. Clearing browser data will lose it.')}
                        </p>
                    </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                    <h3 className="text-lg font-semibold mb-4">{config.language === 'es' ? 'Configuración de IA' : 'AI Settings'}</h3>
                    <div className="space-y-2">
                        <Label htmlFor="openaiApiKey">OpenAI API Key ({config.language === 'es' ? 'Opcional' : 'Optional'})</Label>
                        <Input
                            id="openaiApiKey"
                            type="password"
                            value={formData.openaiApiKey}
                            onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                            placeholder="sk-..."
                        />
                        <p className="text-xs text-muted-foreground">
                            {config.language === 'es'
                                ? 'Si proporcionas tu propia API Key, se usará en lugar de la predeterminada. Tu clave se guarda localmente y nunca se comparte con nosotros.'
                                : 'If you provide your own API Key, it will be used instead of the default. Your key is saved locally and never shared with us.'}
                        </p>
                    </div>
                </div>

                <Button onClick={handleSave} className="w-full" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {t.save}
                </Button>
            </CardContent>
        </Card>
    );
};
