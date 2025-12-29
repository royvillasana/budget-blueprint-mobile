import React, { useEffect, useState } from 'react';
import { GamificationService } from '@/services/gamification';
import { GamificationProfile, UserBadge, UserChallenge } from '@/types/gamification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Flame, Target, Star, Shield, Award } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const LEVEL_TIERS = [
    { max: 9, title: "Ant", icon: "🐜" },
    { max: 19, title: "Squirrel", icon: "🐿️" },
    { max: 29, title: "Beaver", icon: "🦫" },
    { max: 39, title: "Fox", icon: "🦊" },
    { max: 49, title: "Stag", icon: "🦌" },
    { max: 59, title: "Gryphon", icon: "🦅" },
    { max: 69, title: "Dragon", icon: "🐉" },
    { max: 79, title: "Phoenix", icon: "🔥" },
    { max: 89, title: "Titan", icon: "🗿" },
    { max: 1000, title: "Oracle", icon: "🔮" },
];

const getLevelTitle = (level: number) => {
    return LEVEL_TIERS.find(t => level <= t.max) || LEVEL_TIERS[LEVEL_TIERS.length - 1];
};

export default function ProgressPage() {
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [challenges, setChallenges] = useState<UserChallenge[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [prof, bdgs, chals] = await Promise.all([
                    GamificationService.getProfile(),
                    GamificationService.getBadges(),
                    GamificationService.getActiveChallenges()
                ]);
                setProfile(prof);
                setBadges(bdgs);
                setChallenges(chals);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    if (loading) return <div className="p-8 space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>;

    if (!profile) return <div className="p-8 text-center">Profile not found. Please log in.</div>;

    const levelInfo = getLevelTitle(profile.current_level);

    // XP calc
    const currentLevel = profile.current_level;
    const xpForCurrentLevel = 100 * Math.pow(currentLevel, 2);
    const xpForNextLevel = 100 * Math.pow(currentLevel + 1, 2);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = profile.total_xp - xpForCurrentLevel;
    const percentage = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

    return (
        <div className="container max-w-md mx-auto p-4 space-y-6 pb-20">
            {/* Header Profile */}
            <div className="flex flex-col items-center text-center space-y-2 py-4">
                <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-background">
                        {levelInfo.icon}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-background p-1 rounded-full">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full border">
                            Lvl {currentLevel}
                        </div>
                    </div>
                </div>
                <h1 className="text-2xl font-bold mt-2">{levelInfo.title}</h1>
                <p className="text-muted-foreground text-sm">Total XP: {profile.total_xp.toLocaleString()}</p>

                <div className="w-full max-w-xs space-y-1 mt-2">
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>{Math.floor(xpProgress)} XP</span>
                        <span>{xpNeeded} XP to next</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Flame className="w-8 h-8 text-orange-500 mb-2" />
                        <span className="text-2xl font-bold">{profile.current_streak}</span>
                        <span className="text-xs text-muted-foreground">Day Streak</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-2xl font-bold">{profile.streak_freeze_count}</span>
                        <span className="text-xs text-muted-foreground">Freezes Available</span>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="challenges" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="challenges">Challenges</TabsTrigger>
                    <TabsTrigger value="badges">Badges</TabsTrigger>
                </TabsList>

                <TabsContent value="challenges" className="space-y-4 mt-4">
                    {challenges.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                No active challenges. Check back tomorrow!
                            </CardContent>
                        </Card>
                    ) : (
                        challenges.map(uc => (
                            <Card key={uc.id}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex justify-between">
                                        {uc.challenge?.title}
                                        <span className="text-sm font-normal text-primary">+{uc.challenge?.xp_reward} XP</span>
                                    </CardTitle>
                                    <CardDescription>{uc.challenge?.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-1">
                                        <Progress value={(uc.progress / uc.target) * 100} className="h-2" />
                                        <div className="text-xs text-right text-muted-foreground">
                                            {uc.progress} / {uc.target} {uc.challenge?.goal_metric}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="badges" className="mt-4">
                    <div className="grid grid-cols-3 gap-3">
                        {/*  We could list ALL potential badges and gray out unearned ones if we had a catalog endpoint. 
                     For now, listing earned badges. */}
                        {badges.map(b => (
                            <div key={b.id} className="flex flex-col items-center text-center p-2 bg-card rounded-lg border">
                                <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-2xl mb-2">
                                    {b.badge?.icon_url || '🏅'}
                                </div>
                                <span className="text-xs font-medium line-clamp-2">{b.badge?.name}</span>
                                <span className="text-[10px] text-muted-foreground uppercase mt-1">{b.badge?.tier}</span>
                            </div>
                        ))}
                        {badges.length === 0 && (
                            <div className="col-span-3 text-center py-8 text-muted-foreground">
                                No badges earned yet. Keep going!
                            </div>
                        )}
                    </div>
                </TabsContent>
            </Tabs>

        </div>
    );
}
