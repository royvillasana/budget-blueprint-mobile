# Plan de Mejoras del Sistema de Gamificación

## Estado Actual
El sistema actual tiene:
- ✅ XP Ledger (registro de puntos)
- ✅ User Gamification Profile (perfil con nivel, streak, XP)
- ✅ Badges (insignias básicas)
- ✅ Challenges (desafíos)
- ✅ League Snapshots (ligas mensuales)
- ✅ Niveles con nombres de animales (Ant → Oracle)

## Mejoras Propuestas (Basadas en el Documento)

### 1. Sistema de Niveles Mejorado (0-100)
**Actual:** Niveles básicos con animales simples
**Propuesta:** Expandir a 100 niveles con temática más rica

#### Implementación:
- Actualizar `gamification.ts` con 100 niveles
- Usar progresión de animales → mitología (Nivel 1-20: Insectos, 21-40: Mamíferos pequeños, 41-60: Depredadores, 61-80: Bestias legendarias, 81-100: Seres míticos)
- Ejemplo: Nivel 100 = "Dragón Dorado" 🐲✨

### 2. Sistema de Rachas Mejorado
**Actual:** Streak básico en user_gamification
**Propuesta:** Añadir protección de racha (Streak Freeze)

#### Implementación:
- ✅ Ya existe `streak_freeze_count` en la tabla
- Crear lógica para ganar freezes (1 freeze cada 10 días de racha)
- Máximo 3 freezes acumulados
- Añadir insignias de racha: 7, 21, 30, 66 días

### 3. Desafío de 66 Días
**Propuesta:** Implementar el desafío científico de formación de hábitos

#### Implementación:
- Crear challenge especial "habit_66_days"
- Calendario visual de 66 días
- Insignia legendaria al completar
- Mensajes motivacionales diarios

### 4. Más Insignias (Badges)
**Actual:** 7 insignias básicas
**Propuesta:** Expandir a ~30-50 insignias en categorías

#### Categorías de Insignias:
1. **Inicio** (Onboarding):
   - first_tx ✅
   - first_chat ✅
   - first_bank ✅
   - profile_complete
   - first_budget

2. **Acumulativas**:
   - tx_10, tx_50, tx_100 ✅, tx_500, tx_1000
   - bank_connect_1 ✅, bank_5, bank_10
   - savings_100, savings_1k, savings_10k

3. **Hábitos y Rachas**:
   - streak_7 ✅, streak_21, streak_30 ✅, streak_66, streak_100
   - monthly_perfect (completar todos los retos del mes)

4. **Educación**:
   - articles_read_5, articles_read_20
   - chat_questions_20, chat_questions_100
   - first_goal, goals_completed_5

5. **Logros Financieros**:
   - debt_eliminated
   - emergency_fund_complete
   - budget_master (3 meses dentro de presupuesto)
   - investment_starter

6. **Sociales/Liga**:
   - league_top_10
   - league_top_3
   - referral_1, referral_5

### 5. Desafíos Diarios/Semanales/Mensuales
**Actual:** Sistema de challenges básico
**Propuesta:** Rotación automática de desafíos

#### Tipos de Desafíos:
**Diarios:**
- "Registra 3 gastos hoy" (+10 XP)
- "Ahorra 5€ hoy" (+15 XP)
- "Consulta tu resumen financiero" (+5 XP)
- "Conversa con el chatbot" (+10 XP)

**Semanales:**
- "Mantente dentro del presupuesto de entretenimiento" (+50 XP)
- "Ahorra 50€ esta semana" (+75 XP)
- "Registra gastos 7/7 días" (+100 XP)
- "No uses tarjeta de crédito por 7 días" (+60 XP)

**Mensuales:**
- "Ahorra 10% de tus ingresos" (+200 XP)
- "Reduce gastos en comida 20%" (+150 XP)
- "Liquida una deuda pequeña" (+300 XP)
- "Completa todos los retos semanales" (+400 XP)

### 6. Integración con Chatbot
**Propuesta:** El chatbot como "Game Master"

#### Funcionalidades:
- Saludar con el reto diario
- Celebrar logros en tiempo real
- Dar feedback de XP ganado
- Recordar rachas en peligro
- Responder preguntas sobre gamificación
- Mensajes motivacionales personalizados

### 7. Liga Mensual Mejorada
**Actual:** league_snapshots básico
**Propuesta:** Sistema de ligas con divisiones

#### Implementación:
- Divisiones: Bronce, Plata, Oro, Platino, Diamante
- Promoción/Descenso automático
- Top 10 de cada división ascienden
- Bottom 10 descienden
- Reinicio mensual de XP de liga
- Tabla de amigos (si se implementa sistema de amigos)

### 8. Personalización Visual
**Propuesta:** Desbloquear elementos visuales

#### Desbloqueables:
- Temas de color (nivel 10, 25, 50, 75, 100)
- Marcos de perfil (insignias especiales)
- Iconos de nivel personalizados
- Fondos de perfil

### 9. Sistema de Recompensas XP
**Propuesta:** Tabla clara de acciones → XP

#### Valores Sugeridos:
```
Acción                          XP
─────────────────────────────────────
Registrar transacción           +2
Conectar banco                  +50
Crear meta de ahorro            +25
Completar meta                  +100
Conversar con chatbot           +5
Leer artículo educativo         +10
Mantener racha diaria           +5
Completar reto diario           +20
Completar reto semanal          +75
Completar reto mensual          +250
Subir de nivel                  +50 (bonus)
Referir amigo                   +100
```

### 10. Curva de Progresión de Niveles
**Propuesta:** XP requerido por nivel (progresión exponencial suave)

```
Nivel 1-10:   100 XP por nivel
Nivel 11-20:  150 XP por nivel
Nivel 21-30:  200 XP por nivel
Nivel 31-40:  300 XP por nivel
Nivel 41-50:  400 XP por nivel
Nivel 51-60:  500 XP por nivel
Nivel 61-70:  750 XP por nivel
Nivel 71-80:  1000 XP por nivel
Nivel 81-90:  1500 XP por nivel
Nivel 91-100: 2000 XP por nivel
```

## Prioridades de Implementación

### Fase 1 (Inmediata):
1. ✅ Expandir sistema de niveles a 100
2. ✅ Añadir más insignias (al menos 20)
3. ✅ Crear desafíos diarios/semanales/mensuales
4. ✅ Implementar tabla de XP por acción

### Fase 2 (Corto plazo):
1. Integración completa con chatbot
2. Sistema de streak freeze
3. Desafío de 66 días
4. Liga con divisiones

### Fase 3 (Mediano plazo):
1. Personalización visual
2. Sistema de amigos
3. Compartir en redes sociales
4. Eventos especiales/temporadas

## Archivos a Modificar

1. **src/utils/gamification.ts**
   - Expandir getLevelTitle() a 100 niveles
   - Añadir calculateXPForLevel()
   - Añadir getStreakFreezesEarned()

2. **supabase/migrations/nueva_migration.sql**
   - Insertar nuevas insignias
   - Crear desafíos predefinidos
   - Añadir función de cálculo de nivel

3. **src/services/gamification.ts**
   - Añadir métodos para streak freeze
   - Métodos para desafíos diarios
   - Integración con eventos del chatbot

4. **src/components/gamification/**
   - Mejorar GamificationHUD
   - Crear componente de desafíos diarios
   - Crear calendario de 66 días
   - Mejorar visualización de liga

5. **src/services/AIService.ts**
   - Integrar respuestas de gamificación
   - Celebraciones de logros
   - Recordatorios de rachas

## Métricas de Éxito

- **Retención:** Aumento del 20% en DAU (usuarios activos diarios)
- **Engagement:** 50% de usuarios completan al menos 1 desafío diario
- **Hábito:** 30% de usuarios mantienen racha de 7+ días
- **Viral:** 10% de usuarios comparten logros
- **Educación:** 40% de usuarios leen contenido educativo

## Notas Importantes

- Mantener tono sobrio pero motivador
- No penalizar, solo recompensar
- Gamificación opcional (toggle en settings)
- Celebrar cada logro, grande o pequeño
- Feedback inmediato en cada acción
- Progreso siempre visible
