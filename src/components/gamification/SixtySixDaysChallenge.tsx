import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Calendar, CheckCircle2, Lock, Flame } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ChallengeState {
    current_day: number;
    last_check_date: string;
    is_completed: boolean;
    is_active: boolean;
}

export const SixtySixDaysChallenge = () => {
    const [challenge, setChallenge] = useState<ChallengeState | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchChallenge = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await (supabase
            .from('sixty_six_day_challenges' as any)
            .select('*')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .maybeSingle() as any);

        if (error) {
            console.error('Error fetching challenge:', error);
        } else {
            setChallenge(data);
        }
        setLoading(false);
    };

    const startChallenge = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('sixty_six_day_challenges' as any)
            .insert({
                user_id: user.id,
                start_date: new Date().toISOString().split('T')[0],
                last_check_date: new Date().toISOString().split('T')[0],
                current_day: 1
            });

        if (error) {
            toast({
                title: "Error",
                description: "No se pudo iniciar el desafío.",
                variant: "destructive"
            });
        } else {
            toast({
                title: "¡Desafío Iniciado!",
                description: "Día 1 de 66. ¡Tú puedes!",
            });
            fetchChallenge();
        }
    };

    useEffect(() => {
        fetchChallenge();
    }, []);

    if (loading) return <div className="animate-pulse h-48 bg-muted rounded-xl" />;

    if (!challenge) {
        return (
            <Card className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-500 rounded-lg">
                            <Trophy className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <CardTitle>El Desafío de los 66 Días</CardTitle>
                            <CardDescription>
                                Según la ciencia, se necesitan 66 días para formar un hábito sólido.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                        Mantén tu racha financiera durante 66 días seguidos para ganar la medalla legendaria y 500 XP.
                    </p>
                    <Button onClick={startChallenge} className="w-full bg-indigo-600 hover:bg-indigo-700">
                        Aceptar el Desafío
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const progress = (challenge.current_day / 66) * 100;

    return (
        <Card className="relative overflow-hidden border-2 border-indigo-500/30">
            {challenge.is_completed && (
                <div className="absolute inset-0 bg-indigo-600/10 flex items-center justify-center backdrop-blur-[1px] z-10">
                    <div className="bg-background/90 p-4 rounded-2xl shadow-xl text-center border-2 border-indigo-500">
                        <Trophy className="h-12 w-12 text-yellow-500 mx-auto mb-2" />
                        <h3 className="font-bold text-lg">¡Hábito Forjado!</h3>
                        <p className="text-sm text-muted-foreground">Has completado los 66 días.</p>
                    </div>
                </div>
            )}

            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" />
                        <CardTitle className="text-lg">Día {challenge.current_day} / 66</CardTitle>
                    </div>
                    <div className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                        Reto de Hábito
                    </div>
                </div>
                <CardDescription>
                    {challenge.is_completed ? "¡Objetivo alcanzado!" : "Sigue así para automatizar tu éxito financiero."}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="relative pt-2">
                        <Progress value={progress} className="h-3 bg-indigo-100 dark:bg-indigo-900/20" />
                        <div className="absolute -top-1 left-0 transform" style={{ left: `${progress}%` }}>
                            <div className="h-4 w-1 bg-indigo-500 rounded-full shadow-glow" />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                        {[1, 22, 44, 66].map((milestone) => (
                            <div key={milestone} className="text-center">
                                <div className={`mx-auto w-8 h-8 rounded-full flex items-center justify-center mb-1 ${challenge.current_day >= milestone ? 'bg-indigo-500 text-white' : 'bg-muted text-muted-foreground'
                                    }`}>
                                    {challenge.current_day >= milestone ? <CheckCircle2 className="h-5 w-5" /> : <Lock className="h-4 w-4" />}
                                </div>
                                <span className="text-[10px] text-muted-foreground">Día {milestone}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/30 p-2 rounded-lg">
                        <Calendar className="h-3 w-3" />
                        <span>Póxima actualización: {new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
