import React, { useEffect, useState } from 'react';
import { GamificationService } from '@/services/gamification';
import { GamificationProfile } from '@/types/gamification';
import { Progress } from '@/components/ui/progress';
import { Flame, Shield } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getLevelTitle, getXPProgress } from '@/utils/gamification';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/i18n/translations';

interface GamificationHUDProps {
    className?: string;
}

export const GamificationHUD: React.FC<GamificationHUDProps> = ({ className }) => {
    const [profile, setProfile] = useState<GamificationProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { config } = useApp();
    const t = translations[config.language];

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

    // Use new XP calculation functions
    const currentLevel = profile.current_level;
    const { title, icon, tier } = getLevelTitle(currentLevel);
    const { current: xpProgress, needed: xpNeeded, percentage } = getXPProgress(profile.total_xp);

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div className={`p-4 flex items-center justify-between gap-4 w-full cursor-pointer hover:opacity-80 transition-opacity ${className}`}>
                    <div className="flex items-center space-x-3 flex-1">
                        {/* Level Indicator */}
                        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-sm">
                            {currentLevel}
                        </div>

                        {/* Summary Info */}
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold text-primary">{t.gamification.level} {currentLevel}</span>
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
            <PopoverContent
                className="w-[var(--radix-popover-trigger-width)] min-w-[var(--radix-popover-trigger-width)] p-6 overflow-hidden border-2 bg-slate-950/95 backdrop-blur-xl border-slate-800"
                align="center"
                sideOffset={4}
            >
                {/* Image-Style Header Section */}
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#4fd1c5] to-[#2c7a7b] flex items-center justify-center text-5xl shadow-[0_0_20px_rgba(79,209,197,0.3)] border-2 border-white/10 overflow-hidden">
                            <span className="drop-shadow-lg">{icon}</span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-[#4fd1c5] text-slate-900 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg border-2 border-slate-950">
                            Lvl {currentLevel}
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <h3 className="text-2xl font-bold text-white tracking-tight">{title}</h3>
                        <p className="text-xs font-semibold text-[#4fd1c5] uppercase tracking-wider">{tier}</p>
                        <p className="text-[11px] text-slate-400 mt-2 font-medium">
                            XP Total: {profile.total_xp.toLocaleString()}
                        </p>
                    </div>
                </div>

                {/* Styled Progress Bar Section */}
                <div className="mt-8 space-y-2">
                    <div className="relative h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="absolute top-0 left-0 h-full bg-[#4fd1c5] transition-all duration-1000 ease-out"
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-[10px] font-medium text-slate-500 uppercase tracking-tighter px-0.5">
                        <span>{Math.floor(xpProgress).toLocaleString()} XP</span>
                        <span>{Math.floor(xpNeeded).toLocaleString()} {t.gamification.xpToNext}</span>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 p-4">
                    {/* Day Streak Card */}
                    <div className="bg-card border rounded-lg p-3 flex flex-col items-center justify-center space-y-1 shadow-sm">
                        <Flame className="w-6 h-6 text-orange-500" />
                        <span className="text-xl font-bold">{profile.current_streak}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{t.gamification.dayStreak}</span>
                    </div>

                    {/* Freezes Available Card */}
                    <div className="bg-card border rounded-lg p-3 flex flex-col items-center justify-center space-y-1 shadow-sm">
                        <Shield className="w-6 h-6 text-blue-500" />
                        <span className="text-xl font-bold">{profile.streak_freeze_count}</span>
                        <span className="text-[10px] text-muted-foreground text-center">{t.gamification.freezesAvailable}</span>
                    </div>
                </div>

                {/* Footer Action */}
                <Link to="/profile" className="block w-full text-center py-3 text-sm font-medium bg-secondary/50 hover:bg-secondary transition-colors text-primary border-t">
                    {t.gamification.viewProfile}
                </Link>
            </PopoverContent>
        </Popover>
    );
};
