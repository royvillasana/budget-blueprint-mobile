# Configuración de Salud Financiera

## Paso 1: Ejecutar Migración de Base de Datos

Para habilitar la funcionalidad de Salud Financiera, necesitas ejecutar la migración SQL en tu base de datos de Supabase.

### Opción A: Usando Supabase CLI (Recomendado)

```bash
# Desde la raíz del proyecto
supabase db push
```

Si te pide contraseña, usa la contraseña de tu base de datos de Supabase.

### Opción B: Usando el Dashboard de Supabase (Manual)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard/project/gqqlqxmiqjzusyivpkzm/sql/new)
2. Copia y pega el contenido del archivo: `supabase/migrations/20251209000001_create_financial_goals_table.sql`
3. Haz clic en "Run" para ejecutar la migración

## Paso 2: Acceder a la Página

Una vez ejecutada la migración, puedes acceder a la página de Salud Financiera desde:

- **URL directa**: `http://localhost:8080/financial-health`
- **Menú de navegación**: Click en "Salud Financiera" en el header

## Características Implementadas

### 📊 Panel de Salud Financiera

1. **Puntuación General (0-100)**
   - Gestión de Deudas
   - Hábitos de Ahorro
   - Disciplina Presupuestaria
   - Estabilidad de Ingresos

2. **Control del Día a Día**
   - Ingresos promedio mensuales
   - Gastos promedio mensuales
   - Balance neto
   - Tendencia de gastos (creciente/decreciente/estable)

3. **Gestión de Deudas**
   - Deuda total
   - Ratio deuda-ingreso
   - Pago mensual promedio
   - Proyección de liquidación

4. **Creación de Ahorro**
   - Ahorro mensual promedio
   - Tasa de ahorro (%)
   - Proyección anual
   - Progreso hacia meta del 20%

5. **Regla 50/30/20**
   - Distribución ideal del presupuesto
   - 50% Necesidades
   - 30% Deseos
   - 20% Ahorro/Deudas

### 🎯 Sistema de Metas Mensuales

- **Generación Automática de Metas**:
  1. Meta de ahorro (20% de ingresos)
  2. Reducción de deudas (10% más que el promedio)
  3. Límite de gastos en deseos (30% de ingresos)
  4. Fondo de emergencia (6 meses de gastos)

- **Seguimiento de Progreso**:
  - Barra de progreso visual
  - Porcentaje completado
  - Estado (completada/en progreso)
  - Actualización automática

### 💡 Recomendaciones Personalizadas

El sistema analiza tus datos y proporciona recomendaciones específicas:

- Alerta si el ratio deuda-ingreso es alto (>150%)
- Sugerencias para aumentar la tasa de ahorro (<10%)
- Advertencias sobre tendencias de gasto creciente
- Felicitaciones por buena salud financiera (>80 puntos)
- Recordatorios para construir fondo de emergencia

### 📈 Análisis Detallado

- **Alertas de Categorías**:
  - Categorías con sobregasto
  - Categorías subutilizadas
  - Categoría de mayor gasto

- **Cálculos Automáticos**:
  - Todos los cálculos se hacen a partir de tus datos reales
  - No necesitas ingresar información manualmente
  - Se actualiza automáticamente con nuevas transacciones

## Cómo Usar la Funcionalidad

### 1. Visualizar tu Salud Financiera

1. Navega a "Salud Financiera" en el menú
2. Verás tu puntuación general de 0-100
3. Revisa las métricas en las tres tarjetas principales
4. Consulta la distribución según la regla 50/30/20

### 2. Establecer Metas Mensuales

1. Ve a la pestaña "Metas"
2. Haz clic en "Generar Metas Automáticas"
3. El sistema creará 4 metas basadas en tu situación financiera
4. Las metas se actualizarán automáticamente según tus transacciones

### 3. Recibir Recomendaciones

1. Ve a la pestaña "Análisis"
2. Revisa las recomendaciones personalizadas
3. El sistema te dirá exactamente qué mejorar
4. Sigue las acciones sugeridas para mejorar tu puntuación

## Integración con IA

El asistente AI ahora tiene acceso a toda esta información. Puedes preguntarle:

- "¿Cómo está mi salud financiera?"
- "¿Qué metas debería establecer este mes?"
- "¿Cómo puedo mejorar mi puntuación de salud financiera?"
- "¿Estoy en camino de cumplir mis metas?"

El AI utilizará tus datos reales para darte consejos personalizados y específicos.

## Próximos Pasos

1. Ejecutar la migración SQL
2. Navegar a la página de Salud Financiera
3. Generar metas automáticas
4. Revisar recomendaciones personalizadas
5. Usar el AI para obtener consejos específicos

---

**Nota**: La funcionalidad de Salud Financiera utiliza todos los datos históricos de tu cuenta (transacciones, ingresos, presupuestos, deudas) para calcular métricas precisas y personalizadas.
