import React, { useEffect, useState } from 'react';
import { GamificationService } from '@/services/gamification';
import { GamificationProfile, UserBadge, UserChallenge } from '@/types/gamification';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Flame, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getLevelTitle, getXPProgress } from '@/utils/gamification';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';
import { supabase } from '@/integrations/supabase/client';

export const GamificationDashboard = () => {
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [badges, setBadges] = useState<UserBadge[]>([]);
    const [challenges, setChallenges] = useState<UserChallenge[]>([]);
    const [loading, setLoading] = useState(true);
    const { config } = useApp();
    const t = translations[config.language];

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

    if (loading) return <div className="space-y-4">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
    </div>;

    if (!profile) return <div className="p-8 text-center">Profile not found. Please log in.</div>;

    const { title, icon, tier } = getLevelTitle(profile.current_level);

    // Use new XP calculation
    const currentLevel = profile.current_level;
    const { current: xpProgress, needed: xpNeeded, percentage } = getXPProgress(profile.total_xp);

    return (
        <div className="space-y-6">
            {/* Header Profile */}
            <div className="flex flex-col items-center text-center space-y-2 py-4">
                <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center text-4xl shadow-lg border-4 border-background">
                        {icon}
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-background p-1 rounded-full">
                        <div className="bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full border">
                            {t.profile.level} {currentLevel}
                        </div>
                    </div>
                </div>
                <h1 className="text-2xl font-bold mt-2">{title}</h1>
                <p className="text-sm font-medium text-primary/80">{tier}</p>
                <p className="text-muted-foreground text-sm">{t.gamification.totalXP}: {profile.total_xp.toLocaleString()}</p>

                <div className="w-full max-w-xs space-y-1 mt-2">
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>{Math.floor(xpProgress)} XP</span>
                        <span>{xpNeeded} {t.gamification.xpToNext}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Flame className="w-8 h-8 text-orange-500 mb-2" />
                        <span className="text-2xl font-bold">{profile.current_streak}</span>
                        <span className="text-xs text-muted-foreground">{t.gamification.dayStreak}</span>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 flex flex-col items-center justify-center">
                        <Shield className="w-8 h-8 text-blue-500 mb-2" />
                        <span className="text-2xl font-bold">{profile.streak_freeze_count}</span>
                        <span className="text-xs text-muted-foreground">{t.gamification.freezesAvailable}</span>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="challenges" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="challenges">{t.gamification.challenges}</TabsTrigger>
                    <TabsTrigger value="badges">{t.gamification.badges}</TabsTrigger>
                </TabsList>

                <TabsContent value="challenges" className="space-y-4 mt-4">
                    {challenges.length === 0 ? (
                        <Card>
                            <CardContent className="p-6 text-center text-muted-foreground">
                                {t.gamification.noChallenges}
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
                                            {uc.progress} / {uc.target} {t.gamification.goalMetric}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </TabsContent>

                <TabsContent value="badges" className="mt-4">
                    <BadgesGrid badges={badges} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

// New BadgesGrid component with progressive disclosure
const BadgesGrid = ({ badges }: { badges: UserBadge[] }) => {
    const [allBadges, setAllBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { config } = useApp();
    const t = translations[config.language];

    useEffect(() => {
        async function loadAllBadges() {
            try {
                const { data, error } = await supabase
                    .from('badges')
                    .select('*')
                    .order('tier', { ascending: true })
                    .order('category', { ascending: true });

                if (error) throw error;

                // Merge with earned badges
                const earnedBadgeIds = new Set(badges.map(b => b.badge_id));
                const mergedBadges = data?.map(badge => ({
                    ...badge,
                    earned: earnedBadgeIds.has(badge.id),
                    earned_at: badges.find(b => b.badge_id === badge.id)?.awarded_at
                })) || [];

                setAllBadges(mergedBadges);
            } catch (err) {
                console.error('Error loading badges:', err);
            } finally {
                setLoading(false);
            }
        }
        loadAllBadges();
    }, [badges]);

    if (loading) {
        return <div className="text-center py-8 text-muted-foreground">Cargando insignias...</div>;
    }

    // Group badges by category
    const categories = Array.from(new Set(allBadges.map(b => b.category)));

    return (
        <div className="space-y-6">
            {categories.map(category => {
                const categoryBadges = allBadges.filter(b => b.category === category);
                const earnedCount = categoryBadges.filter(b => b.earned).length;

                return (
                    <div key={category} className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-foreground">
                                {category}
                            </h3>
                            <span className="text-xs text-muted-foreground">
                                {earnedCount}/{categoryBadges.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                            {categoryBadges.map(badge => (
                                <BadgeCard key={badge.id} badge={badge} />
                            ))}
                        </div>
                    </div>
                );
            })}
            {allBadges.length === 0 && (
                <div className="col-span-3 text-center py-8 text-muted-foreground">
                    {t.gamification.noBadges}
                </div>
            )}
        </div>
    );
};

// Individual badge card with tooltip
const BadgeCard = ({ badge }: { badge: any }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const isEarned = badge.earned;

    // Tier colors
    const tierColors: Record<string, string> = {
        'COMMON': 'border-gray-400',
        'RARE': 'border-blue-500',
        'EPIC': 'border-purple-500',
        'LEGENDARY': 'border-yellow-500'
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <div
                className={`flex flex-col items-center text-center p-3 rounded-lg border-2 transition-all cursor-pointer ${isEarned
                    ? `bg-card ${tierColors[badge.tier] || 'border-gray-400'} shadow-sm hover:shadow-md`
                    : 'bg-muted/30 border-muted grayscale opacity-60 hover:opacity-80'
                    }`}
            >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-2 ${isEarned ? 'bg-secondary' : 'bg-muted'
                    }`}>
                    {badge.icon_url || '🏅'}
                </div>
                <span className={`text-xs font-medium line-clamp-2 ${isEarned ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                    {badge.name}
                </span>
                <span className={`text-[10px] uppercase mt-1 ${isEarned ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                    {badge.tier}
                </span>
                {isEarned && badge.earned_at && (
                    <span className="text-[9px] text-muted-foreground mt-1">
                        {new Date(badge.earned_at).toLocaleDateString()}
                    </span>
                )}
            </div>

            {/* Tooltip */}
            {showTooltip && (
                <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-popover border rounded-lg shadow-lg">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <span className="text-2xl">{badge.icon_url || '🏅'}</span>
                            <div className="flex-1">
                                <h4 className="font-semibold text-sm">{badge.name}</h4>
                                <p className="text-xs text-muted-foreground uppercase">{badge.tier}</p>
                            </div>
                        </div>
                        <p className="text-xs text-foreground">{badge.description}</p>
                        {isEarned && badge.earned_at && (
                            <div className="pt-2 border-t">
                                <p className="text-xs text-green-600 font-medium">
                                    ✓ Desbloqueada el {new Date(badge.earned_at).toLocaleDateString()}
                                </p>
                            </div>
                        )}
                    </div>
                    {/* Arrow */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="w-2 h-2 bg-popover border-r border-b rotate-45"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
