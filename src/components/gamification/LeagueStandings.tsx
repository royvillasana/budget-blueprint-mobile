import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trophy, Medal, Crown, Star, TrendingUp } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface LeagueMember {
    user_id: string;
    display_name: string;
    avatar_url: string;
    monthly_xp: number;
    division: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    division_rank: number;
    global_rank: number;
}

const divisionConfig = {
    BRONZE: { icon: Medal, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Bronce' },
    SILVER: { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-100', label: 'Plata' },
    GOLD: { icon: Medal, color: 'text-yellow-500', bg: 'bg-yellow-100', label: 'Oro' },
    PLATINUM: { icon: Star, color: 'text-cyan-400', bg: 'bg-cyan-100', label: 'Platino' },
    DIAMOND: { icon: Crown, color: 'text-indigo-500', bg: 'bg-indigo-100', label: 'Diamante' }
};

export const LeagueStandings = () => {
    const [members, setMembers] = useState<LeagueMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [userDivision, setUserDivision] = useState<string>('BRONZE');

    const fetchLeague = async () => {
        const { data, error } = await (supabase
            .from('view_league_with_divisions' as any)
            .select('*') as any);

        if (error) {
            console.error('Error fetching league:', error);
        } else {
            setMembers(data || []);
            // Find current user division
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const currentUser = data?.find((m: any) => m.user_id === user.id);
                if (currentUser) setUserDivision(currentUser.division);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeague();
    }, []);

    const renderMemberList = (divisionMembers: LeagueMember[]) => (
        <div className="space-y-3 mt-4">
            {divisionMembers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    No hay participantes en esta división todavía.
                </div>
            ) : (
                divisionMembers.map((member) => (
                    <div key={member.user_id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border/50 hover:border-primary/30 transition-all">
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-sm w-6 text-muted-foreground">#{member.division_rank}</span>
                            <Avatar className="h-10 w-10 border-2 border-background">
                                <AvatarImage src={member.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {member.display_name?.substring(0, 2).toUpperCase() || '??'}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="font-semibold text-sm">{member.display_name || 'Usuario Anónimo'}</div>
                                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                    <TrendingUp className="h-3 w-3" />
                                    {member.monthly_xp} XP este mes
                                </div>
                            </div>
                        </div>
                        {member.division_rank <= 3 && (
                            <Trophy className={`h-5 w-5 ${member.division_rank === 1 ? 'text-yellow-500' :
                                member.division_rank === 2 ? 'text-gray-400' : 'text-orange-600'
                                }`} />
                        )}
                    </div>
                ))
            )}
        </div>
    );

    if (loading) return <div className="animate-pulse h-96 bg-muted rounded-xl" />;

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0 pt-0">
                <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-yellow-500" />
                        Ligas Mensuales
                    </CardTitle>
                    <Badge variant="outline" className="font-mono">ENERO 2024</Badge>
                </div>
                <CardDescription>
                    Compite con otros usuarios y asciende de categoría. Los premios se reparten al final del mes.
                </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
                <Tabs defaultValue={userDivision} className="w-full">
                    <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-muted/50 rounded-xl mb-4 no-scrollbar">
                        {Object.entries(divisionConfig).map(([key, config]) => {
                            const Icon = config.icon;
                            return (
                                <TabsTrigger key={key} value={key} className="flex-1 min-w-[100px] gap-2 py-2 rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                    <Icon className={`h-4 w-4 ${config.color}`} />
                                    <span className="text-xs">{config.label}</span>
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {Object.keys(divisionConfig).map((division) => (
                        <TabsContent key={division} value={division}>
                            <div className={`p-4 rounded-xl ${divisionConfig[division as keyof typeof divisionConfig].bg} mb-4 flex items-center justify-between`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-white`}>
                                        {(() => {
                                            const Icon = divisionConfig[division as keyof typeof divisionConfig].icon;
                                            return <Icon className={`h-6 w-6 ${divisionConfig[division as keyof typeof divisionConfig].color}`} />;
                                        })()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm">División {divisionConfig[division as keyof typeof divisionConfig].label}</h3>
                                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                                            {members.filter(m => m.division === division).length} Participantes
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-primary">Top 10% Asciende</div>
                                    <div className="text-[10px] text-muted-foreground">8 días restantes</div>
                                </div>
                            </div>
                            {renderMemberList(members.filter(m => m.division === division))}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
};
