export interface GamificationProfile {
  user_id: string;
  total_xp: number;
  current_level: number;
  current_streak: number;
  longest_streak: number;
  streak_freeze_count: number;
  last_active_date: string | null;
  monthly_xp: number;
  created_at: string;
  updated_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url: string | null;
  tier: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  category: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  awarded_at: string;
  metadata: Record<string, any>;
  badge?: Badge; // Joined data
}

export interface Challenge {
  id: string;
  slug: string;
  title: string;
  description: string;
  xp_reward: number;
  type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'Onetime';
  goal_target: number;
  goal_metric: string;
  is_active: boolean;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  status: 'ACTIVE' | 'COMPLETED' | 'EXPIRED' | 'SKIPPED';
  progress: number;
  target: number;
  reward_claimed: boolean;
  expires_at: string;
  challenge?: Challenge; // Joined data
}

export interface LeagueSnapshot {
  id: string;
  period_key: string;
  user_id: string;
  total_xp: number;
  rank_position: number;
  league_tier: string;
}
