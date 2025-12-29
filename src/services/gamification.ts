import { supabase } from "@/integrations/supabase/client";
import { GamificationProfile, UserBadge, UserChallenge, LeagueSnapshot } from "@/types/gamification";

export const GamificationService = {
  // Fetch user profile
  async getProfile(): Promise<GamificationProfile | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Ensure profile exists (using our database trigger logic implicitly, or explicit check)
    const { data, error } = await supabase
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching gamification profile:', error);
      return null;
    }
    return data;
  },

  // Fetch badges
  async getBadges(): Promise<UserBadge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_badges')
      .select('*, badge:badges(*)')
      .eq('user_id', user.id);

    if (error) {
        console.error('Error fetching badges:', error);
        return [];
    }
    return data || [];
  },

  // Fetch active challenges
  async getActiveChallenges(): Promise<UserChallenge[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('user_challenges')
      .select('*, challenge:challenges(*)')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE');
      
    if (error) {
        console.error('Error fetching challenges:', error);
        return [];
    }
    return data || [];
  },

  // Fetch League Standings (Mock for now, or actual)
  async getLeagueStandings(periodKey: string): Promise<LeagueSnapshot[]> {
     const { data, error } = await supabase
      .from('league_snapshots')
      .select('*')
      .eq('period_key', periodKey)
      .order('rank_position', { ascending: true })
      .limit(50);
      
      if (error) {
          console.error('Error fetching league:', error);
          return [];
      }
      return data;
  },

  // Emit an event (Client-side trigger, e.g. from page visit)
  // NOTE: Critical game logic should happen server-side or via robust edge functions
  // This is a helper for client-initiated "soft" events or for testing.
  async emitEvent(eventType: string, metadata: any = {}) {
     const { data: { user } } = await supabase.auth.getUser();
     if (!user) return;

     const { data, error } = await supabase
       .rpc('process_gamification_event', {
         p_user_id: user.id,
         p_event_type: eventType,
         p_metadata: metadata
       });
       
     if (error) {
         console.error('Error processing event:', error);
     }
     return data;
  }
};
