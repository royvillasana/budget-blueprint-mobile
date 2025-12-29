
export const getLevelTitle = (level: number): { title: string; icon: string } => {
    if (level < 5) return { title: 'Ant', icon: '🐜' };
    if (level < 10) return { title: 'Beetle', icon: '🪲' };
    if (level < 20) return { title: 'Squirrel', icon: '🐿️' };
    if (level < 30) return { title: 'Rabbit', icon: '🐇' };
    if (level < 40) return { title: 'Fox', icon: '🦊' };
    if (level < 50) return { title: 'Wolf', icon: '🐺' };
    if (level < 60) return { title: 'Bear', icon: '🐻' };
    if (level < 70) return { title: 'Lion', icon: '🦁' };
    if (level < 80) return { title: 'Elephant', icon: '🐘' };
    if (level < 90) return { title: 'Dragon', icon: '🐉' };
    return { title: 'Oracle', icon: '🧙‍♂️' };
};
