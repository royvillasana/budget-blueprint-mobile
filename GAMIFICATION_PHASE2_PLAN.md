# 🎮 Fase 2 - Sistema de Gamificación Avanzado

## Objetivos de la Fase 2

1. **Integración Completa con Chatbot** ✨
2. **Sistema de Streak Freeze Activo** 🛡️
3. **Desafío de 66 Días** 📅
4. **Liga con Divisiones** 🏆

---

## 1. Integración con Chatbot como "Game Master"

### Funcionalidades del Chatbot:

#### A. Saludos Personalizados con Gamificación
```
"¡Hola! 👋 Eres nivel 15 (Ardilla Previsora 🐿️) con 1,250 XP.
Tienes una racha de 5 días 🔥 - ¡sigue así!"
```

#### B. Notificaciones de Logros
- Celebrar cuando se gana XP
- Anunciar subidas de nivel
- Felicitar por badges desbloqueadas
- Recordar rachas en peligro

#### C. Respuestas sobre Gamificación
Usuario: "¿Cómo funciona el sistema de niveles?"
Bot: "Ganas XP por acciones como registrar transacciones (+2 XP), conectar bancos (+50 XP)..."

#### D. Motivación y Recordatorios
- "¡Cuidado! Tu racha de 7 días está en riesgo. Registra una transacción hoy."
- "Estás a solo 50 XP de subir al nivel 16 (Conejo Ágil 🐇)"
- "Completa el reto diario: Registra 3 gastos (+10 XP)"

### Implementación:

**Archivo:** `src/services/AIService.ts`

Añadir al system prompt:

```typescript
## GAMIFICATION SYSTEM INTEGRATION

You are also the "Game Master" for the gamification system. You should:

1. **Greet users with their gamification status:**
   - Current level and title
   - Total XP
   - Current streak
   - Active challenges

2. **Celebrate achievements:**
   - When XP is gained: "¡Genial! +2 XP por registrar esa transacción"
   - When leveling up: "🎉 ¡FELICIDADES! Subiste al nivel X (Título)"
   - When earning badges: "🏆 ¡Nueva insignia desbloqueada! [Nombre]"

3. **Answer gamification questions:**
   - Explain how XP works
   - Show available badges and how to earn them
   - Explain streak freezes
   - Show league standings

4. **Motivate and remind:**
   - Warn about streak risks
   - Suggest completing challenges
   - Show progress towards next level
   - Encourage healthy financial habits through gamification

5. **Use gamification data from context:**
   - Access user_gamification table data
   - Reference badges, challenges, and league position
   - Personalize advice based on gamification progress
```

### Nuevas Funciones para el Chatbot:

```typescript
// Añadir a las tools del AIService:

{
  type: 'function',
  function: {
    name: 'getGamificationStatus',
    description: 'Get user gamification status including level, XP, streak, badges, and active challenges',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
},
{
  type: 'function',
  function: {
    name: 'getAvailableBadges',
    description: 'Get all available badges with earned status and how to earn them',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Optional: filter by category (TRANSACTIONS, STREAK, SAVINGS, etc.)'
        }
      },
      required: []
    }
  }
},
{
  type: 'function',
  function: {
    name: 'getActiveChallenges',
    description: 'Get user active challenges with progress',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  }
},
{
  type: 'function',
  function: {
    name: 'getLeagueStandings',
    description: 'Get current month league standings and user position',
    parameters: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Number of top users to show (default: 10)'
        }
      },
      required: []
    }
  }
}
```

---

## 2. Sistema de Streak Freeze Activo

### Lógica Actual (Ya Implementada):
- ✅ Campo `streak_freeze_count` en user_gamification
- ✅ Función `calculate_streak_freezes()` (1 cada 10 días, máx 3)
- ✅ Trigger `update_streak_freezes()` auto-actualiza

### Pendiente:

#### A. Uso Automático de Freezes
**Archivo:** `supabase/migrations/20251229000012_streak_freeze_usage.sql`

```sql
-- Función para usar freeze automáticamente cuando se rompe racha
CREATE OR REPLACE FUNCTION public.use_streak_freeze_if_needed()
RETURNS TRIGGER AS $$
DECLARE
    v_last_active DATE;
    v_freeze_count INTEGER;
    v_today DATE := CURRENT_DATE;
BEGIN
    -- Si el usuario no estuvo activo ayer
    IF NEW.last_active_date < v_today - 1 THEN
        -- Verificar si tiene freezes disponibles
        IF NEW.streak_freeze_count > 0 THEN
            -- Usar un freeze
            NEW.streak_freeze_count := NEW.streak_freeze_count - 1;
            NEW.last_active_date := v_today - 1; -- Mantener racha
            
            -- Log del uso de freeze (opcional)
            INSERT INTO public.xp_ledger (user_id, amount, action_type, metadata)
            VALUES (NEW.user_id, 0, 'freeze_used', jsonb_build_object(
                'previous_streak', NEW.current_streak,
                'freezes_remaining', NEW.streak_freeze_count
            ));
        ELSE
            -- Sin freezes: resetear racha
            NEW.current_streak := 0;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

#### B. Notificación de Freeze Usado
Integrar con el hook de notificaciones para avisar al usuario cuando se usa un freeze.

#### C. UI de Streak Freezes
Mejorar visualización en GamificationHUD:
- Mostrar freezes disponibles con ícono 🛡️
- Tooltip explicando cómo funcionan
- Indicador visual cuando se usa un freeze

---

## 3. Desafío de 66 Días

### Concepto:
Basado en la ciencia de formación de hábitos (66 días para crear un hábito permanente).

### Implementación:

#### A. Componente de Calendario
**Archivo:** `src/components/gamification/SixtyDaysChallenge.tsx`

```typescript
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export const SixtySixDaysChallenge = () => {
    const [challengeData, setChallengeData] = useState({
        currentDay: 0,
        totalDays: 66,
        completedDays: [],
        isActive: false
    });

    // Calendario visual de 66 días
    // Días completados en verde
    // Día actual resaltado
    // Días futuros en gris

    return (
        <Card>
            <CardHeader>
                <CardTitle>Desafío de 66 Días 🔥</CardTitle>
                <p className="text-sm text-muted-foreground">
                    Forja un hábito financiero permanente
                </p>
            </CardHeader>
            <CardContent>
                {/* Grid de 66 días */}
                <div className="grid grid-cols-11 gap-1">
                    {Array.from({ length: 66 }).map((_, i) => (
                        <div
                            key={i}
                            className={`
                                w-8 h-8 rounded-sm flex items-center justify-center text-xs
                                ${completedDays.includes(i) ? 'bg-green-500 text-white' : ''}
                                ${i === currentDay ? 'ring-2 ring-primary' : ''}
                                ${i > currentDay ? 'bg-muted text-muted-foreground' : ''}
                            `}
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
                
                {/* Progreso */}
                <div className="mt-4 space-y-2">
                    <Progress value={(currentDay / 66) * 100} />
                    <p className="text-sm text-center">
                        Día {currentDay} de 66 ({Math.round((currentDay / 66) * 100)}%)
                    </p>
                </div>

                {/* Mensajes motivacionales */}
                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                    <p className="text-sm font-medium">
                        {getMotivationalMessage(currentDay)}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
};

function getMotivationalMessage(day: number): string {
    if (day < 7) return "¡Excelente comienzo! Los primeros días son cruciales.";
    if (day < 21) return "¡Vas muy bien! Estás formando el hábito.";
    if (day < 40) return "¡Increíble! Ya pasaste la mitad del camino.";
    if (day < 66) return "¡Casi lo logras! El hábito está casi forjado.";
    return "🎉 ¡FELICIDADES! Has forjado un hábito permanente.";
}
```

#### B. Migración SQL para Challenge
```sql
-- Tabla para tracking del desafío de 66 días
CREATE TABLE IF NOT EXISTS public.sixty_six_day_challenge (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    current_day INTEGER DEFAULT 0,
    completed_days INTEGER[] DEFAULT '{}',
    is_completed BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, start_date)
);

-- Función para actualizar progreso diario
CREATE OR REPLACE FUNCTION public.update_66_day_challenge()
RETURNS TRIGGER AS $$
BEGIN
    -- Si el usuario tiene racha activa, actualizar desafío
    IF NEW.current_streak > 0 THEN
        UPDATE public.sixty_six_day_challenge
        SET 
            current_day = NEW.current_streak,
            completed_days = array_append(completed_days, NEW.current_streak),
            is_completed = (NEW.current_streak >= 66),
            updated_at = NOW()
        WHERE user_id = NEW.user_id AND is_active = TRUE;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_update_66_challenge
    AFTER UPDATE OF current_streak ON public.user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION public.update_66_day_challenge();
```

---

## 4. Liga con Divisiones

### Sistema de Divisiones:

**Divisiones:**
1. Bronce (0-999 XP mensual)
2. Plata (1,000-2,499 XP)
3. Oro (2,500-4,999 XP)
4. Platino (5,000-9,999 XP)
5. Diamante (10,000+ XP)

### Implementación:

#### A. Migración SQL
**Archivo:** `supabase/migrations/20251229000013_league_divisions.sql`

```sql
-- Función para calcular división basada en XP mensual
CREATE OR REPLACE FUNCTION public.calculate_league_division(monthly_xp INTEGER)
RETURNS VARCHAR(50) AS $$
BEGIN
    IF monthly_xp < 1000 THEN RETURN 'BRONZE';
    ELSIF monthly_xp < 2500 THEN RETURN 'SILVER';
    ELSIF monthly_xp < 5000 THEN RETURN 'GOLD';
    ELSIF monthly_xp < 10000 THEN RETURN 'PLATINUM';
    ELSE RETURN 'DIAMOND';
    END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Vista de liga con divisiones
CREATE OR REPLACE VIEW public.view_league_with_divisions AS
SELECT 
    ug.user_id,
    ug.monthly_xp,
    public.calculate_league_division(ug.monthly_xp) as division,
    RANK() OVER (
        PARTITION BY public.calculate_league_division(ug.monthly_xp)
        ORDER BY ug.monthly_xp DESC
    ) as division_rank,
    RANK() OVER (ORDER BY ug.monthly_xp DESC) as global_rank
FROM public.user_gamification ug
WHERE ug.monthly_xp > 0
ORDER BY ug.monthly_xp DESC;

-- Función para resetear XP mensual (ejecutar el 1 de cada mes)
CREATE OR REPLACE FUNCTION public.reset_monthly_league()
RETURNS void AS $$
BEGIN
    -- Guardar snapshot antes de resetear
    INSERT INTO public.league_snapshots (period_key, user_id, total_xp, rank_position, league_tier)
    SELECT 
        TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
        user_id,
        monthly_xp,
        ROW_NUMBER() OVER (ORDER BY monthly_xp DESC),
        public.calculate_league_division(monthly_xp)
    FROM public.user_gamification
    WHERE monthly_xp > 0;
    
    -- Resetear monthly_xp
    UPDATE public.user_gamification
    SET monthly_xp = 0;
END;
$$ LANGUAGE plpgsql;
```

#### B. Componente de Liga
**Archivo:** `src/components/gamification/LeagueStandings.tsx`

```typescript
export const LeagueStandings = () => {
    const [division, setDivision] = useState('GOLD');
    const [standings, setStandings] = useState([]);
    const [userPosition, setUserPosition] = useState(null);

    // Colores por división
    const divisionColors = {
        BRONZE: 'from-amber-700 to-amber-900',
        SILVER: 'from-gray-400 to-gray-600',
        GOLD: 'from-yellow-400 to-yellow-600',
        PLATINUM: 'from-cyan-400 to-cyan-600',
        DIAMOND: 'from-blue-400 to-purple-600'
    };

    return (
        <Card>
            <CardHeader className={`bg-gradient-to-r ${divisionColors[division]}`}>
                <CardTitle className="text-white">
                    Liga {division}
                </CardTitle>
            </CardHeader>
            <CardContent>
                {/* Top 10 de la división */}
                <div className="space-y-2">
                    {standings.map((user, index) => (
                        <div key={user.id} className="flex items-center gap-3 p-2 rounded hover:bg-muted">
                            <span className="font-bold w-8">#{index + 1}</span>
                            <div className="flex-1">
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-muted-foreground">{user.monthly_xp} XP</p>
                            </div>
                            {index < 3 && <span className="text-2xl">{['🥇', '🥈', '🥉'][index]}</span>}
                        </div>
                    ))}
                </div>

                {/* Posición del usuario */}
                {userPosition && (
                    <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium">
                            Tu posición: #{userPosition.rank} en {division}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            {userPosition.monthly_xp} XP este mes
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
```

---

## Implementation Progress

- [x] **Phase 2.1: Chatbot Integration (Game Master)**
  - [x] Update system prompt in `AIService.ts`
  - [x] Add new tool functions for gamification data.
  - [x] Integrate tool handlers in `AIChatContent.tsx`.
- [x] **Phase 2.2: Automated Streak Freeze**
  - [x] SQL function for automatic freeze usage.
  - [x] XP ledger logging for freeze events.
- [x] **Phase 2.3: 66-Day Challenge**
  - [x] Backend tracking table and triggers.
  - [x] Frontend UI component `SixtySixDaysChallenge.tsx`.
  - [x] Dashboard integration.
- [x] **Phase 2.4: League Divisions**
  - [x] Division calculation logic.
  - [x] League view with ranks and divisions.
  - [x] Frontend UI component `LeagueStandings.tsx`.
  - [x] Dashboard integration.
- [x] Función `update_66_day_challenge()`
- [x] Mensajes motivacionales por día
- [x] Integrar en dashboard

### Liga con Divisiones:
- [x] Función `calculate_league_division()`
- [x] Vista `view_league_with_divisions`
- [x] Función `reset_monthly_league()`
- [x] Componente `LeagueStandings.tsx`
- [ ] Cron job mensual para reset (Manual setup required in Supabase Dashboard)

---

## Prioridad de Implementación

1. **Alta:** Chatbot Integration (mayor impacto en engagement)
2. **Media:** Streak Freeze (mejora retención)
3. **Media:** Liga con Divisiones (competencia social)
4. **Baja:** Desafío 66 Días (feature especial)

---

## Métricas de Éxito - Fase 2

- **+40% Engagement con Chatbot**: Usuarios preguntan sobre gamificación
- **+25% Retención**: Streak freezes evitan pérdida de usuarios
- **+30% Competitividad**: Liga con divisiones motiva más actividad
- **+15% Habit Formation**: Desafío de 66 días completa hábitos

---

**Fecha de Planificación:** 29 de Diciembre, 2024
**Versión:** 2.1.0 - Fase 2 Planificada
