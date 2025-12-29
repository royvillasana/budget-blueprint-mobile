import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Loader2, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
    url: string;
    onUpload: (url: string) => void;
    displayName: string;
    fallbackIcon?: React.ReactNode;
    size?: "sm" | "md" | "lg";
}

export const AvatarUpload = ({ url, onUpload, displayName, fallbackIcon, size = "md" }: AvatarUploadProps) => {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const sizeClasses = {
        sm: "h-12 w-12 text-sm",
        md: "h-24 w-24 text-2xl",
        lg: "h-32 w-32 text-4xl"
    };

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debes seleccionar una imagen para subir.');
            }

            const file = event.target.files[0];
            const fileExt = file.name.split('.').pop();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) throw new Error('No se encontró el usuario.');

            const filePath = `${user.id}/${Math.random()}.${fileExt}`;

            // Upload the file to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            // Get the public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            onUpload(publicUrl);

            toast({
                title: "Avatar actualizado",
                description: "Tu foto de perfil se ha subido correctamente.",
            });
        } catch (error: any) {
            toast({
                title: "Error al subir imagen",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Avatar className={`${sizeClasses[size]} border-4 border-background shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:border-primary/50 overflow-hidden`}>
                    <AvatarImage src={url} alt={displayName} className="object-cover" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-white font-bold">
                        {fallbackIcon || (displayName ? displayName.substring(0, 1).toUpperCase() : <User className="h-1/2 w-1/2" />)}
                    </AvatarFallback>
                </Avatar>

                <div
                    className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-lg scale-90 opacity-0 group-hover:opacity-100 transition-all duration-200"
                >
                    {uploading ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                        <Camera className="h-3 w-3" />
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleUpload}
                accept="image/*"
                className="hidden"
            />

            <p className="text-xs text-muted-foreground">
                JPG, PNG o GIF. Máximo 2MB.
            </p>
        </div>
    );
};
