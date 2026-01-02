# Sistema Freemium con Período de Prueba

## Descripción General

El sistema freemium ofrece a los nuevos usuarios un período de prueba de **14 días** con acceso completo a todas las funcionalidades del **Plan Pro** de forma gratuita.

## Funcionalidades Implementadas

### 1. Registro Automático en Trial

Cuando un usuario se registra por primera vez:
- Se crea automáticamente una suscripción con:
  - **Plan**: `pro`
  - **Status**: `trialing`
  - **trial_start**: Fecha y hora actual
  - **trial_end**: 14 días desde el registro
  - **current_period_end**: Mismo que trial_end

### 2. Acceso a Funcionalidades Premium

Durante el período de prueba, los usuarios tienen acceso a:
- ✅ Mensajes de chat ilimitados (10,000/mes)
- ✅ Conexión de cuentas bancarias (Tink)
- ✅ Historial completo de transacciones
- ✅ Exportación a CSV/PDF
- ✅ Insights y análisis avanzados
- ✅ Soporte prioritario
- ✅ Acceso anticipado a nuevas funcionalidades

### 3. Notificación Visual del Trial

**TrialBanner**: Banner superior que muestra:
- Estado activo del trial
- Días restantes
- Botón para ver planes
- Botón para descartar el banner

El banner se muestra en todas las páginas protegidas mientras el trial esté activo.

### 4. Modal de Selección de Plan

**TrialExpiredModal**: Modal que se muestra automáticamente cuando expira el trial:
- Muestra los 3 planes disponibles (Free, Essential, Pro)
- Comparación de características
- Botones para seleccionar plan
- Opción "Lo decidiré después"

### 5. Downgrade Automático

Al expirar el trial sin suscripción pagada:
- El status cambia a `canceled`
- El plan cambia a `free`
- El usuario pierde acceso a funcionalidades premium
- Se mantiene el historial de que hubo un trial

## Estructura de Base de Datos

### Tabla: `subscriptions`

Campos relevantes para el trial:
```sql
- plan (ENUM: 'free', 'essential', 'pro')
- status (ENUM: 'active', 'trialing', 'canceled', ...)
- trial_start (TIMESTAMPTZ)
- trial_end (TIMESTAMPTZ)
- current_period_start (TIMESTAMPTZ)
- current_period_end (TIMESTAMPTZ)
```

### Vista: `user_entitlements`

Calcula los permisos del usuario considerando:
- Si el trial está activo (`status = 'trialing' AND trial_end > NOW()`)
- El plan actual
- El status de la suscripción

Durante el trial activo, **todas las funcionalidades Pro están habilitadas**.

## Funciones de Base de Datos

### `create_default_subscription()`

Trigger que se ejecuta al crear un nuevo usuario:
```sql
- Crea suscripción con plan 'pro' y status 'trialing'
- Establece trial_start = NOW()
- Establece trial_end = NOW() + 14 days
```

### `get_trial_status(p_user_id UUID)`

Retorna el estado detallado del trial:
```typescript
{
  has_trial: boolean,
  is_trialing: boolean,
  trial_start: string | null,
  trial_end: string | null,
  trial_expired: boolean,
  days_remaining: number,
  current_plan: 'free' | 'essential' | 'pro',
  current_status: SubscriptionStatus
}
```

### `check_and_expire_trials()`

Función que verifica y expira trials vencidos:
- Busca suscripciones con status 'trialing' y trial_end <= NOW()
- Las actualiza a status 'canceled' y plan 'free'
- Solo expira trials que no tienen stripe_subscription_id (no convertidos a pago)

## Componentes de Frontend

### Hooks

#### `useTrial()`
Hook personalizado para acceder al estado del trial:
```typescript
const {
  trialStatus,
  loading,
  error,
  refetch,
  isTrialing,
  daysRemaining,
  trialExpired
} = useTrial();
```

#### `useSubscription()` (actualizado)
Ahora incluye información del trial:
```typescript
const {
  billingInfo,
  trialStatus,
  subscription,
  entitlements,
  usage,
  isTrialing,
  daysRemaining,
  trialExpired
} = useSubscription();
```

### Componentes

#### `<TrialBanner />`
- Ubicación: Se muestra en todas las rutas protegidas
- Se renderiza cuando `isTrialing === true`
- Muestra días restantes
- Link a página de pricing
- Dismissible (se puede ocultar)

#### `<TrialExpiredModal />`
- Ubicación: Modal global en rutas protegidas
- Se abre automáticamente cuando `trialExpired === true`
- Muestra comparación de planes
- Permite seleccionar plan o continuar gratis
- Opción de decidir después

## Servicio: `SubscriptionService`

Métodos añadidos:

```typescript
// Obtener estado del trial
static async getTrialStatus(): Promise<TrialStatus>

// Verificar y expirar trials (admin)
static async checkAndExpireTrials(): Promise<void>
```

## Flujo de Usuario

### Nuevo Usuario
1. Usuario se registra → Trigger crea suscripción con trial
2. Usuario ve TrialBanner indicando días restantes
3. Usuario tiene acceso completo a funcionalidades Pro
4. Cada día se reduce el contador de días restantes

### Trial por Expirar
1. TrialBanner muestra "Quedan X días"
2. Usuario puede hacer clic en "Ver planes" para suscribirse antes

### Trial Expirado
1. Al expirar, el sistema llama a `check_and_expire_trials()`
2. Suscripción cambia a plan 'free' y status 'canceled'
3. TrialExpiredModal se muestra automáticamente
4. Usuario puede:
   - Elegir plan Essential o Pro (redirige a checkout)
   - Continuar con plan Free
   - Decidir después (cierra modal, puede volver más tarde)

## Conversión a Plan Pago

Cuando el usuario selecciona un plan durante el trial:
1. Se crea una sesión de checkout de Stripe
2. Al completar el pago:
   - stripe_subscription_id se guarda
   - status cambia a 'active'
   - plan cambia al seleccionado
   - El trial se considera convertido

## Migración

Para aplicar el sistema freemium:

```bash
# Ejecutar en Supabase SQL Editor
supabase/migrations/20260102000001_add_freemium_trial.sql
```

O vía CLI:
```bash
supabase db push
```

## Verificación

Después de implementar, verificar:

1. **Nuevo usuario tiene trial**:
```sql
SELECT plan, status, trial_start, trial_end
FROM subscriptions
WHERE user_id = 'user-uuid';
```

2. **Entitlements correctos durante trial**:
```sql
SELECT * FROM user_entitlements WHERE user_id = 'user-uuid';
```

3. **Trial status function**:
```sql
SELECT * FROM get_trial_status('user-uuid');
```

## Mantenimiento

### Expirar Trials Manualmente

Si es necesario correr la expiración manualmente:
```sql
SELECT * FROM check_and_expire_trials();
```

### Cron Job (Recomendado)

Configurar un cron job para expirar trials automáticamente cada día:
```sql
-- En Supabase Dashboard > Database > Cron Jobs
SELECT cron.schedule(
  'expire-trials',
  '0 0 * * *', -- Diariamente a medianoche
  $$
  SELECT check_and_expire_trials();
  $$
);
```

## Localización

El sistema soporta español e inglés:
- Banner y modal se adaptan según `config.language`
- Textos definidos en cada componente

## Seguridad

- ✅ Row Level Security (RLS) habilitado en todas las tablas
- ✅ Funciones con SECURITY DEFINER para operaciones privilegiadas
- ✅ Validación de usuario autenticado en todas las operaciones
- ✅ No se exponen datos sensibles de billing

## Próximos Pasos

1. ⏳ Configurar Cron Job para expirar trials automáticamente
2. ⏳ Agregar analytics para rastrear:
   - Tasa de conversión de trial a pago
   - Planes más seleccionados
   - Tiempo promedio antes de decidir
3. ⏳ Email notifications:
   - Bienvenida al trial
   - Recordatorio a 7 días
   - Recordatorio a 3 días
   - Trial expirado
