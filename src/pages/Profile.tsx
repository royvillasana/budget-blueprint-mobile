import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { useApp } from '@/contexts/AppContext';
import { supabase } from '@/integrations/supabase/client';
import { User, Settings as SettingsIcon, Trophy, CreditCard } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { SettingsForm } from '@/components/settings/SettingsForm';
import { GamificationDashboard } from '@/components/gamification/GamificationDashboard';
import { translations } from '@/i18n/translations';
import { GamificationService } from '@/services/gamification';
import { GamificationProfile } from '@/types/gamification';
import { getLevelTitle } from '@/utils/gamification';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const Profile = () => {
    const { config } = useApp();
    const t = translations[config.language];
    const [userEmail, setUserEmail] = useState<string | null>(null);
    const [gamificationProfile, setGamificationProfile] = useState<GamificationProfile | null>(null);
    const [activeTab, setActiveTab] = useState<'progress' | 'settings'>('progress');

    useEffect(() => {
        // Fetch User
        supabase.auth.getUser().then(({ data: { user } }) => {
            setUserEmail(user?.email || null);
        });

        // Fetch Gamification Level for the Identity Card
        GamificationService.getProfile().then(setGamificationProfile);
    }, []);

    const levelInfo = gamificationProfile ? getLevelTitle(gamificationProfile.current_level) : null;

    const TabButton = ({ id, label, icon: Icon }: { id: 'progress' | 'settings', label: string, icon: any }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm font-medium",
                activeTab === id
                    ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/20"
                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
        >
            <Icon className={cn("w-4 h-4", activeTab === id ? "text-primary-foreground" : "text-muted-foreground")} />
            {label}
            {activeTab === id && (
                <motion.div
                    layoutId="activeTabIndicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                />
            )}
        </button>
    );

    return (
        <div className="min-h-screen bg-muted/30">
            <Header />
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Sidebar: Identity & Nav */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5 }}
                        className="lg:col-span-4 space-y-6"
                    >
                        {/* Identity Card */}
                        <Card className="overflow-hidden border-border/50 shadow-sm relative group">
                            <div className="h-24 bg-gradient-to-r from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-500" />
                            <CardContent className="relative pt-0 text-center pb-8 px-6">
                                <div className="relative inline-block -mt-12 mb-4">
                                    <Avatar className="h-24 w-24 border-4 border-background shadow-xl ring-2 ring-border/20">
                                        <AvatarImage src="" alt={userEmail || ''} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                                            {userEmail ? userEmail.charAt(0).toUpperCase() : <User className="h-8 w-8" />}
                                        </AvatarFallback>
                                    </Avatar>
                                    {levelInfo && (
                                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm border border-border">
                                            <div className="text-xl animate-bounce-slow" title={`Level ${gamificationProfile?.current_level} - ${levelInfo.title}`}>
                                                {levelInfo.icon}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <h1 className="text-2xl font-bold tracking-tight text-foreground">{config.ownerName || 'User'}</h1>
                                <p className="text-sm text-muted-foreground font-medium mb-4">{userEmail}</p>

                                {gamificationProfile && (
                                    <div className="flex items-center justify-center gap-2">
                                        <Badge variant="secondary" className="px-3 py-1 bg-primary/10 text-primary border-primary/20">
                                            Lvl {gamificationProfile.current_level} • {levelInfo?.title}
                                        </Badge>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Navigation Menu */}
                        <div className="space-y-2">
                            <h3 className="px-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                {config.language === 'es' ? 'Menú' : 'Menu'}
                            </h3>
                            <TabButton
                                id="progress"
                                label={config.language === 'es' ? 'Progreso y Logros' : 'Progress & Achievements'}
                                icon={Trophy}
                            />
                            <TabButton
                                id="settings"
                                label={t.settings}
                                icon={SettingsIcon}
                            />
                        </div>
                    </motion.div>

                    {/* Right Content Area */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {activeTab === 'progress' ? (
                                <motion.div
                                    key="progress"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <GamificationDashboard />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="settings"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <SettingsForm />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default Profile;
