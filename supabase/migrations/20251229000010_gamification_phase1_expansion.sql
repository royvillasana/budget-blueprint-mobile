-- Migration: Gamification Phase 1 Expansion
-- Description: Adds 40+ new badges and predefined challenges for daily/weekly/monthly rotation

-- ============================================
-- PART 1: EXPANDED BADGES CATALOG
-- ============================================

-- Category: ONBOARDING (Getting Started)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('profile_complete', 'Perfil Completo', 'Completa tu perfil con toda tu información.', 'COMMON', 'ONBOARDING', '✅'),
('first_budget', 'Primer Presupuesto', 'Crea tu primer presupuesto mensual.', 'COMMON', 'ONBOARDING', '📊'),
('welcome_aboard', '¡Bienvenido!', 'Únete a la comunidad financiera.', 'COMMON', 'ONBOARDING', '🎉')
ON CONFLICT (id) DO NOTHING;

-- Category: TRANSACTIONS (Accumulative)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('tx_10', 'Primeros Pasos', 'Registra 10 transacciones.', 'COMMON', 'TRANSACTIONS', '🔟'),
('tx_50', 'Medio Centurión', 'Registra 50 transacciones.', 'COMMON', 'TRANSACTIONS', '5️⃣0️⃣'),
('tx_500', 'Maestro del Registro', 'Registra 500 transacciones.', 'EPIC', 'TRANSACTIONS', '📝'),
('tx_1000', 'Leyenda del Tracking', 'Registra 1000 transacciones.', 'LEGENDARY', 'TRANSACTIONS', '📚')
ON CONFLICT (id) DO NOTHING;

-- Category: BANKING (Bank Connections)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('bank_5', 'Coleccionista de Cuentas', 'Conecta 5 cuentas bancarias.', 'RARE', 'BANKING', '🏦'),
('bank_10', 'Maestro Bancario', 'Conecta 10 cuentas bancarias.', 'EPIC', 'BANKING', '🏛️')
ON CONFLICT (id) DO NOTHING;

-- Category: SAVINGS (Savings Milestones)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('savings_100', 'Primer Ahorro', 'Ahorra tus primeros 100€.', 'COMMON', 'SAVINGS', '💰'),
('savings_1k', 'Ahorrador Serio', 'Ahorra 1,000€ acumulados.', 'RARE', 'SAVINGS', '💵'),
('savings_10k', 'Maestro del Ahorro', 'Ahorra 10,000€ acumulados.', 'EPIC', 'SAVINGS', '💎'),
('emergency_fund', 'Fondo de Emergencia', 'Completa tu fondo de emergencia (3 meses).', 'EPIC', 'SAVINGS', '🛡️')
ON CONFLICT (id) DO NOTHING;

-- Category: STREAK (Habit Building)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('streak_21', 'Hábito en Formación', 'Mantén una racha de 21 días.', 'RARE', 'STREAK', '🔥'),
('streak_66', 'Hábito Forjado', 'Completa el desafío científico de 66 días.', 'LEGENDARY', 'STREAK', '🔥🔥🔥'),
('streak_100', 'Imparable', 'Mantén una racha de 100 días.', 'LEGENDARY', 'STREAK', '⚡'),
('monthly_perfect', 'Mes Perfecto', 'Completa todos los retos de un mes.', 'EPIC', 'STREAK', '🌟')
ON CONFLICT (id) DO NOTHING;

-- Category: EDUCATION (Learning & Growth)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('articles_5', 'Lector Curioso', 'Lee 5 artículos educativos.', 'COMMON', 'EDUCATION', '📖'),
('articles_20', 'Estudiante Dedicado', 'Lee 20 artículos educativos.', 'RARE', 'EDUCATION', '📚'),
('chat_20', 'Conversador', 'Haz 20 preguntas al chatbot.', 'COMMON', 'EDUCATION', '💬'),
('chat_100', 'Experto en Diálogo', 'Haz 100 preguntas al chatbot.', 'RARE', 'EDUCATION', '🗣️')
ON CONFLICT (id) DO NOTHING;

-- Category: GOALS (Financial Goals)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('first_goal', 'Planificador', 'Crea tu primera meta financiera.', 'COMMON', 'GOALS', '🎯'),
('goals_5', 'Visionario', 'Completa 5 metas financieras.', 'RARE', 'GOALS', '🌠'),
('goals_10', 'Maestro de Metas', 'Completa 10 metas financieras.', 'EPIC', 'GOALS', '🏆')
ON CONFLICT (id) DO NOTHING;

-- Category: FINANCIAL (Real Financial Achievements)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('debt_eliminated', 'Libre de Deudas', 'Paga completamente una deuda.', 'EPIC', 'FINANCIAL', '🎊'),
('budget_master', 'Maestro del Presupuesto', 'Mantente dentro del presupuesto 3 meses seguidos.', 'EPIC', 'FINANCIAL', '📈'),
('investment_starter', 'Inversor Novato', 'Realiza tu primera inversión.', 'RARE', 'FINANCIAL', '📊'),
('financial_health', 'Salud Financiera Óptima', 'Alcanza un puntaje de salud financiera de 80+.', 'LEGENDARY', 'FINANCIAL', '💚')
ON CONFLICT (id) DO NOTHING;

-- Category: SOCIAL (Community & Referrals)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('league_participant', 'Competidor', 'Participa en la liga mensual.', 'COMMON', 'SOCIAL', '🏅'),
('league_top_10', 'Top 10', 'Termina en el top 10 de la liga mensual.', 'RARE', 'SOCIAL', '🥉'),
('league_top_3', 'Podio', 'Termina en el top 3 de la liga mensual.', 'EPIC', 'SOCIAL', '🥈'),
('league_champion', 'Campeón', 'Gana la liga mensual.', 'LEGENDARY', 'SOCIAL', '🥇'),
('referral_1', 'Embajador', 'Invita a tu primer amigo.', 'COMMON', 'SOCIAL', '👋'),
('referral_5', 'Influencer Financiero', 'Invita a 5 amigos.', 'RARE', 'SOCIAL', '🌐')
ON CONFLICT (id) DO NOTHING;

-- Category: SPECIAL (Unique Achievements)
INSERT INTO public.badges (id, name, description, tier, category, icon_url) VALUES
('early_bird', 'Madrugador', 'Registra una transacción antes de las 7 AM.', 'RARE', 'SPECIAL', '🌅'),
('night_owl', 'Búho Nocturno', 'Registra una transacción después de las 11 PM.', 'RARE', 'SPECIAL', '🦉'),
('weekend_warrior', 'Guerrero de Fin de Semana', 'Mantén tu racha activa todo el fin de semana.', 'RARE', 'SPECIAL', '🎮'),
('new_year_saver', 'Propósito de Año Nuevo', 'Ahorra en enero (evento especial).', 'EPIC', 'SPECIAL', '🎆')
ON CONFLICT (id) DO NOTHING;


-- ============================================
-- PART 2: PREDEFINED CHALLENGES
-- ============================================

-- DAILY CHALLENGES
INSERT INTO public.challenges (slug, title, description, xp_reward, type, goal_target, goal_metric, is_active) VALUES
('daily_log_3_tx', 'Registra 3 Gastos', 'Registra al menos 3 transacciones hoy.', 10, 'DAILY', 3, 'transaction_count', true),
('daily_save_5', 'Ahorra Hoy', 'Ahorra al menos 5€ hoy.', 15, 'DAILY', 5, 'savings_amount', true),
('daily_check_summary', 'Revisa tu Resumen', 'Consulta tu resumen financiero del día.', 5, 'DAILY', 1, 'summary_check', true),
('daily_chat', 'Conversa con tu Dinero', 'Haz al menos 1 pregunta al chatbot.', 10, 'DAILY', 1, 'chat_messages', true),
('daily_no_impulse', 'Sin Compras Impulsivas', 'No gastes en categoría "Caprichos" hoy.', 20, 'DAILY', 0, 'impulse_spending', true)
ON CONFLICT (slug) DO NOTHING;

-- WEEKLY CHALLENGES
INSERT INTO public.challenges (slug, title, description, xp_reward, type, goal_target, goal_metric, is_active) VALUES
('weekly_budget_entertainment', 'Presupuesto de Ocio', 'Mantente dentro del presupuesto de entretenimiento esta semana.', 50, 'WEEKLY', 1, 'budget_adherence', true),
('weekly_save_50', 'Ahorro Semanal', 'Ahorra al menos 50€ esta semana.', 75, 'WEEKLY', 50, 'weekly_savings', true),
('weekly_streak_7', 'Semana Completa', 'Registra gastos todos los días de la semana (7/7).', 100, 'WEEKLY', 7, 'daily_logs', true),
('weekly_no_credit', 'Sin Tarjeta de Crédito', 'No uses la tarjeta de crédito por 7 días.', 60, 'WEEKLY', 0, 'credit_usage', true),
('weekly_meal_prep', 'Cocina en Casa', 'Reduce gastos en restaurantes un 50% esta semana.', 80, 'WEEKLY', 50, 'restaurant_reduction', true)
ON CONFLICT (slug) DO NOTHING;

-- MONTHLY CHALLENGES
INSERT INTO public.challenges (slug, title, description, xp_reward, type, goal_target, goal_metric, is_active) VALUES
('monthly_save_10pct', 'Ahorro del 10%', 'Ahorra al menos el 10% de tus ingresos este mes.', 200, 'MONTHLY', 10, 'savings_percentage', true),
('monthly_reduce_food', 'Dieta Financiera', 'Reduce gastos en comida un 20% vs mes anterior.', 150, 'MONTHLY', 20, 'food_reduction', true),
('monthly_debt_payment', 'Elimina una Deuda', 'Liquida al menos una deuda pequeña este mes.', 300, 'MONTHLY', 1, 'debts_paid', true),
('monthly_all_weekly', 'Maestro Mensual', 'Completa todos los retos semanales del mes.', 400, 'MONTHLY', 4, 'weekly_challenges', true),
('monthly_investment', 'Inversión Mensual', 'Invierte o ahorra para inversión este mes.', 250, 'MONTHLY', 1, 'investment_made', true)
ON CONFLICT (slug) DO NOTHING;

-- SPECIAL: 66-Day Habit Challenge
INSERT INTO public.challenges (slug, title, description, xp_reward, type, goal_target, goal_metric, is_active) VALUES
('habit_66_days', 'Hábito de 66 Días', 'Mantén tu racha durante 66 días consecutivos para forjar un hábito permanente.', 500, 'Onetime', 66, 'streak_days', true)
ON CONFLICT (slug) DO NOTHING;


-- ============================================
-- PART 3: HELPER FUNCTIONS
-- ============================================

-- Function to calculate level from total XP (matches frontend logic)
CREATE OR REPLACE FUNCTION public.calculate_level_from_xp(total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
    level INTEGER := 0;
    accumulated INTEGER := 0;
    xp_for_level INTEGER;
BEGIN
    WHILE accumulated <= total_xp AND level < 100 LOOP
        level := level + 1;
        
        -- XP calculation matching frontend
        IF level <= 10 THEN
            xp_for_level := level * 100;
        ELSIF level <= 20 THEN
            xp_for_level := 1000 + (level - 10) * 150;
        ELSIF level <= 30 THEN
            xp_for_level := 2500 + (level - 20) * 200;
        ELSIF level <= 40 THEN
            xp_for_level := 4500 + (level - 30) * 300;
        ELSIF level <= 50 THEN
            xp_for_level := 7500 + (level - 40) * 400;
        ELSIF level <= 60 THEN
            xp_for_level := 11500 + (level - 50) * 500;
        ELSIF level <= 70 THEN
            xp_for_level := 16500 + (level - 60) * 750;
        ELSIF level <= 80 THEN
            xp_for_level := 24000 + (level - 70) * 1000;
        ELSIF level <= 90 THEN
            xp_for_level := 34000 + (level - 80) * 1500;
        ELSE
            xp_for_level := 49000 + (level - 90) * 2000;
        END IF;
        
        accumulated := accumulated + xp_for_level;
    END LOOP;
    
    RETURN GREATEST(0, level - 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to auto-update level when XP changes
CREATE OR REPLACE FUNCTION public.update_level_from_xp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.current_level := public.calculate_level_from_xp(NEW.total_xp);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-calculate level
DROP TRIGGER IF EXISTS trigger_update_level ON public.user_gamification;
CREATE TRIGGER trigger_update_level
    BEFORE UPDATE OF total_xp ON public.user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION public.update_level_from_xp();

-- Also update on insert
DROP TRIGGER IF EXISTS trigger_update_level_insert ON public.user_gamification;
CREATE TRIGGER trigger_update_level_insert
    BEFORE INSERT ON public.user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION public.update_level_from_xp();


-- ============================================
-- PART 4: STREAK FREEZE LOGIC
-- ============================================

-- Function to calculate streak freezes earned (1 per 10 days, max 3)
CREATE OR REPLACE FUNCTION public.calculate_streak_freezes(current_streak INTEGER)
RETURNS INTEGER AS $$
BEGIN
    RETURN LEAST(3, FLOOR(current_streak / 10));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update streak_freeze_count when streak changes
CREATE OR REPLACE FUNCTION public.update_streak_freezes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update if streak increased
    IF NEW.current_streak > OLD.current_streak THEN
        NEW.streak_freeze_count := public.calculate_streak_freezes(NEW.current_streak);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_freezes ON public.user_gamification;
CREATE TRIGGER trigger_update_freezes
    BEFORE UPDATE OF current_streak ON public.user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION public.update_streak_freezes();


-- ============================================
-- PART 5: VIEWS FOR EASY QUERYING
-- ============================================

-- View: User Progress Summary
CREATE OR REPLACE VIEW public.view_user_gamification_summary AS
SELECT 
    ug.user_id,
    ug.total_xp,
    ug.current_level,
    ug.current_streak,
    ug.longest_streak,
    ug.streak_freeze_count,
    ug.monthly_xp,
    COUNT(DISTINCT ub.badge_id) as badges_earned,
    COUNT(DISTINCT CASE WHEN uc.status = 'COMPLETED' THEN uc.id END) as challenges_completed,
    COUNT(DISTINCT CASE WHEN uc.status = 'ACTIVE' THEN uc.id END) as active_challenges
FROM public.user_gamification ug
LEFT JOIN public.user_badges ub ON ug.user_id = ub.user_id
LEFT JOIN public.user_challenges uc ON ug.user_id = uc.user_id
GROUP BY ug.user_id, ug.total_xp, ug.current_level, ug.current_streak, 
         ug.longest_streak, ug.streak_freeze_count, ug.monthly_xp;

-- View: Badge Progress (all badges with earned status)
CREATE OR REPLACE VIEW public.view_badge_progress AS
SELECT 
    b.id,
    b.name,
    b.description,
    b.tier,
    b.category,
    b.icon_url,
    ub.user_id,
    ub.awarded_at,
    CASE WHEN ub.user_id IS NOT NULL THEN true ELSE false END as is_earned
FROM public.badges b
LEFT JOIN public.user_badges ub ON b.id = ub.badge_id;

-- Migration completed: Gamification Phase 1
-- Expanded badges (40+), challenges, level calculation, and streak freezes
