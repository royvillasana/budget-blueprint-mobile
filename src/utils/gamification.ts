
// XP required for each level (exponential progression)
export const calculateXPForLevel = (level: number): number => {
    if (level <= 10) return level * 100;
    if (level <= 20) return 1000 + (level - 10) * 150;
    if (level <= 30) return 2500 + (level - 20) * 200;
    if (level <= 40) return 4500 + (level - 30) * 300;
    if (level <= 50) return 7500 + (level - 40) * 400;
    if (level <= 60) return 11500 + (level - 50) * 500;
    if (level <= 70) return 16500 + (level - 60) * 750;
    if (level <= 80) return 24000 + (level - 70) * 1000;
    if (level <= 90) return 34000 + (level - 80) * 1500;
    return 49000 + (level - 90) * 2000;
};

// Total XP needed to reach a level
export const getTotalXPForLevel = (level: number): number => {
    let total = 0;
    for (let i = 1; i <= level; i++) {
        total += calculateXPForLevel(i);
    }
    return total;
};

// Calculate level from total XP
export const getLevelFromXP = (totalXP: number): number => {
    let level = 0;
    let accumulated = 0;
    while (accumulated <= totalXP && level < 100) {
        level++;
        accumulated += calculateXPForLevel(level);
    }
    return Math.max(0, level - 1);
};

// XP progress to next level
export const getXPProgress = (totalXP: number): { current: number; needed: number; percentage: number } => {
    const currentLevel = getLevelFromXP(totalXP);
    const xpForCurrentLevel = getTotalXPForLevel(currentLevel);
    const xpForNextLevel = getTotalXPForLevel(currentLevel + 1);
    const current = totalXP - xpForCurrentLevel;
    const needed = xpForNextLevel - xpForCurrentLevel;
    const percentage = (current / needed) * 100;
    return { current, needed, percentage };
};

// Streak freeze logic
export const getStreakFreezesEarned = (currentStreak: number): number => {
    return Math.min(3, Math.floor(currentStreak / 10));
};

// Level titles with rich thematic progression
export const getLevelTitle = (level: number): { title: string; icon: string; tier: string } => {
    // Tier 1: Insects & Small Creatures (1-10)
    if (level === 0) return { title: 'Novato', icon: '🥚', tier: 'Inicio' };
    if (level <= 3) return { title: 'Hormiga Ahorrativa', icon: '🐜', tier: 'Bronce' };
    if (level <= 6) return { title: 'Abeja Trabajadora', icon: '🐝', tier: 'Bronce' };
    if (level <= 10) return { title: 'Escarabajo Persistente', icon: '🪲', tier: 'Bronce' };
    
    // Tier 2: Small Mammals (11-20)
    if (level <= 13) return { title: 'Ratón Cauteloso', icon: '🐭', tier: 'Plata' };
    if (level <= 16) return { title: 'Ardilla Previsora', icon: '🐿️', tier: 'Plata' };
    if (level <= 20) return { title: 'Conejo Ágil', icon: '🐇', tier: 'Plata' };
    
    // Tier 3: Clever Animals (21-30)
    if (level <= 23) return { title: 'Mapache Astuto', icon: '🦝', tier: 'Oro' };
    if (level <= 26) return { title: 'Zorro Inteligente', icon: '🦊', tier: 'Oro' };
    if (level <= 30) return { title: 'Búho Sabio', icon: '🦉', tier: 'Oro' };
    
    // Tier 4: Predators (31-40)
    if (level <= 33) return { title: 'Lobo Estratega', icon: '🐺', tier: 'Platino' };
    if (level <= 36) return { title: 'Pantera Sigilosa', icon: '🐆', tier: 'Platino' };
    if (level <= 40) return { title: 'León Dominante', icon: '🦁', tier: 'Platino' };
    
    // Tier 5: Powerful Beasts (41-50)
    if (level <= 43) return { title: 'Oso Protector', icon: '🐻', tier: 'Diamante' };
    if (level <= 46) return { title: 'Tigre Feroz', icon: '🐯', tier: 'Diamante' };
    if (level <= 50) return { title: 'Elefante Majestuoso', icon: '🐘', tier: 'Diamante' };
    
    // Tier 6: Mythical Creatures (51-60)
    if (level <= 53) return { title: 'Unicornio Místico', icon: '🦄', tier: 'Maestro' };
    if (level <= 56) return { title: 'Grifo Guardián', icon: '🦅', tier: 'Maestro' };
    if (level <= 60) return { title: 'Fénix Renacido', icon: '🔥', tier: 'Maestro' };
    
    // Tier 7: Dragons (61-70)
    if (level <= 63) return { title: 'Dragón de Bronce', icon: '🐲', tier: 'Legendario' };
    if (level <= 66) return { title: 'Dragón de Plata', icon: '🐉', tier: 'Legendario' };
    if (level <= 70) return { title: 'Dragón de Oro', icon: '🐲✨', tier: 'Legendario' };
    
    // Tier 8: Ancient Powers (71-80)
    if (level <= 73) return { title: 'Kraken Profundo', icon: '🐙', tier: 'Mítico' };
    if (level <= 76) return { title: 'Leviatán Ancestral', icon: '🐋', tier: 'Mítico' };
    if (level <= 80) return { title: 'Titán Primordial', icon: '⚡', tier: 'Mítico' };
    
    // Tier 9: Divine Beings (81-90)
    if (level <= 83) return { title: 'Ángel Guardián', icon: '👼', tier: 'Divino' };
    if (level <= 86) return { title: 'Arcángel Protector', icon: '😇', tier: 'Divino' };
    if (level <= 90) return { title: 'Serafín Iluminado', icon: '✨', tier: 'Divino' };
    
    // Tier 10: Ultimate Masters (91-100)
    if (level <= 93) return { title: 'Mago Supremo', icon: '🧙‍♂️', tier: 'Supremo' };
    if (level <= 96) return { title: 'Oráculo Omnisciente', icon: '🔮', tier: 'Supremo' };
    if (level <= 99) return { title: 'Maestro del Dinero', icon: '💰👑', tier: 'Supremo' };
    
    // Level 100: The Ultimate
    return { title: 'Dragón Dorado Supremo', icon: '🐲💎✨', tier: 'Leyenda Eterna' };
};

// XP Rewards Table
export const XP_REWARDS = {
    TRANSACTION_CREATED: 2,
    BANK_CONNECTED: 50,
    GOAL_CREATED: 25,
    GOAL_COMPLETED: 100,
    CHAT_MESSAGE: 5,
    ARTICLE_READ: 10,
    DAILY_STREAK: 5,
    CHALLENGE_DAILY: 20,
    CHALLENGE_WEEKLY: 75,
    CHALLENGE_MONTHLY: 250,
    LEVEL_UP_BONUS: 50,
    REFERRAL: 100,
    BUDGET_CREATED: 15,
    DEBT_PAYMENT: 30,
    SAVINGS_MILESTONE: 50,
} as const;
