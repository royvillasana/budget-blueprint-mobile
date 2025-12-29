import React, { useEffect, useState } from 'react';
import { GamificationService } from '@/services/gamification';
import { GamificationProfile } from '@/types/gamification';
import { Progress } from '@/components/ui/progress';
import { Flame, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getLevelTitle } from '@/utils/gamification';

interface GamificationHUDProps {
    className?: string;
}

export const GamificationHUD: React.FC<GamificationHUDProps> = ({ className }) => {
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await GamificationService.getProfile();
            setProfile(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={`flex items-center space-x-4 ${className}`}>
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-24" />
        </div>;
    }

    if (!profile) return null;

    // XP calculation logic...
    const currentLevel = profile.current_level;
    const { title, icon } = getLevelTitle(currentLevel);
    const xpForCurrentLevel = 100 * Math.pow(currentLevel, 2);
    const xpForNextLevel = 100 * Math.pow(currentLevel + 1, 2);
    const xpNeeded = xpForNextLevel - xpForCurrentLevel;
    const xpProgress = profile.total_xp - xpForCurrentLevel;
    const percentage = Math.min(100, Math.max(0, (xpProgress / xpNeeded) * 100));

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className={`flex items-center justify-between gap-4 w-full cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
                    <div className="flex items-center space-x-3 flex-1">
                        {/* Level Indicator */}
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                            {currentLevel}
                        </div>

                        {/* Summary Info */}
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary">Nivel {currentLevel}</span>
                            <span className="text-xs text-muted-foreground">{title}</span>
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center space-x-1 text-orange-500 font-medium">
                        <Flame className={`w-4 h-4 ${profile.current_streak > 0 ? 'fill-orange-500 animate-pulse' : 'text-muted-foreground'}`} />
                        <span className="text-sm">{profile.current_streak}</span>
                    </div>
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 overflow-hidden border-2 bg-popover/95 backdrop-blur-xl" align="end">
                {/* Header Section */}
                <div className="flex flex-col items-center p-6 bg-gradient-to-b from-primary/10 to-transparent space-y-2">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-4xl shadow-inner border-2 border-primary/30">
                            {icon}
                        </div>
                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shadow-sm border border-background">
                            Lvl {currentLevel}
                        </div>
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-bold text-foreground">{title}</h3>
                        <p className="text-xs text-muted-foreground">Total XP: {profile.total_xp}</p>
                    </div>
                </div>

                {/* Progress Bar Section */}
                <div className="px-4 pb-2 space-y-1">
                    <Progress value={percentage} className="h-3" />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                        <span>{Math.floor(xpProgress)} XP</span>
                        <span>{Math.floor(xpNeeded)} XP to next</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 p-4">
                    {/* Day Streak Card */}
                    <div className="bg-card border rounded-lg p-3 flex flex-col items-center justify-center space-y-1 shadow-sm">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <span className="text-xl font-bold">{profile.current_streak}</span>
                        <span className="text-[10px] text-muted-foreground text-center">Day Streak</span>
                    </div>

                    {/* Freezes Available Card */}
                    <div className="bg-card border rounded-lg p-3 flex flex-col items-center justify-center space-y-1 shadow-sm">
                        <Shield className="w-6 h-6 text-blue-500" />
                        <span className="text-xl font-bold">{profile.streak_freeze_count}</span>
                        <span className="text-[10px] text-muted-foreground text-center">Freezes Available</span>
                    </div>
                </div>

                {/* Footer Action */}
                <Link to="/profile" className="block w-full text-center py-3 text-sm font-medium bg-secondary/50 hover:bg-secondary transition-colors text-primary border-t">
                    Ver perfil completo
                </Link>
            </PopoverContent>
        </Popover>
    );
};
