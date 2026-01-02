# Multi-Year Support Implementation

## Overview

Se ha agregado soporte para múltiples años en las tablas mensuales de transacciones, ingresos y presupuestos. Ahora puedes almacenar y consultar datos de años anteriores y futuros.

## Cambios en la Base de Datos

### 1. Nueva columna `year` en tablas mensuales

Todas las tablas `monthly_transactions_*` ahora tienen una columna `year` (INT):
- Valor por defecto: 2025 (para datos existentes)
- Indexada para mejor rendimiento
- Permite almacenar datos de múltiples años en la misma tabla

### 2. Vista actualizada `view_transactions_all`

La vista ahora incluye la columna `year` en el SELECT, permitiendo filtrar por año:

```sql
SELECT * FROM view_transactions_all
WHERE user_id = auth.uid()
AND year = 2024
AND EXTRACT(MONTH FROM date) = 12;
```

### 3. Nueva función helper

**`get_available_months_and_years()`**: Devuelve todos los meses y años que tienen datos para el usuario actual.

```sql
SELECT * FROM get_available_months_and_years();
```

Resultado:
```
year | month | month_name | transaction_count | income_count
-----|-------|------------|------------------|-------------
2024 |   12  |    dec     |        45        |      3
2025 |    1  |    jan     |        23        |      2
2025 |    2  |    feb     |        18        |      1
```

## Cómo Aplicar la Migración

### Opción 1: Supabase SQL Editor (Recomendado)

1. Abre [Supabase SQL Editor](https://supabase.com/dashboard/project/gqqlqxmiqjzusyivpkzm/sql/new)
2. Copia y pega el contenido de `/supabase/migrations/20260101000001_add_multi_year_support.sql`
3. Ejecuta el SQL

### Opción 2: Supabase CLI

```bash
supabase db push
```

## Cómo Usar en el Código

### Queries Actualizadas

Las queries ahora deben incluir filtro por año:

```typescript
// Antes
const { data } = await supabase
  .from(getTableName('monthly_transactions', month))
  .select('*');

// Ahora
const { data } = await supabase
  .from(getTableName('monthly_transactions', month))
  .select('*')
  .eq('year', year);  // ← Agregar filtro por año
```

### Insertar Transacciones

Al insertar nuevas transacciones, incluye el año:

```typescript
const { data, error } = await supabase
  .from(getTableName('monthly_transactions', month))
  .insert({
    user_id: userId,
    year: 2025,  // ← Incluir año
    date: '2025-01-15',
    description: 'Compra',
    amount: 50.00,
    category_id: categoryId,
    // ... otros campos
  });
```

### Componente MonthYearPicker

Ya está integrado en el Header y permite seleccionar mes y año:

```tsx
<MonthYearPicker
  selectedMonth={currentMonth}
  selectedYear={currentYear}
  onSelect={(month, year) => {
    navigate(`/budget/${year}/${month}`);
  }}
/>
```

## Migración de Datos Existentes

Los datos existentes en las tablas automáticamente tienen `year = 2025` como valor por defecto. Si tienes datos de otros años que necesitas migrar:

```sql
-- Ejemplo: Mover transacciones de diciembre 2024
UPDATE monthly_transactions_dec
SET year = 2024
WHERE date < '2025-01-01';
```

## Testing

Después de aplicar la migración, verifica:

1. **Datos existentes preservados**:
   ```sql
   SELECT COUNT(*) FROM monthly_transactions_jan WHERE year = 2025;
   ```

2. **Columna year indexada**:
   ```sql
   SELECT indexname FROM pg_indexes
   WHERE tablename LIKE 'monthly_transactions_%'
   AND indexname LIKE '%year%';
   ```

3. **Función helper funciona**:
   ```sql
   SELECT * FROM get_available_months_and_years();
   ```

## Compatibilidad con Código Existente

✅ **Retrocompatible**: El código que no filtra por año seguirá funcionando, pero devolverá datos de todos los años.

⚠️ **Acción Recomendada**: Actualizar queries para incluir filtro por año para evitar resultados inesperados.

## Próximos Pasos

1. ✅ Ejecutar migración en Supabase
2. ⏳ Actualizar queries en componentes principales:
   - `MonthlyBudget.tsx`
   - `AIChatContent.tsx` (parcialmente completado)
   - `SupabaseStorage.ts`
3. ⏳ Agregar filtro por año en exportaciones
4. ⏳ Actualizar Edge Functions de Tink para incluir año

## Notas Técnicas

- **Rendimiento**: Los índices en `year` aseguran que las queries filtradas sean rápidas
- **Almacenamiento**: No se crean tablas nuevas, se reutilizan las existentes
- **Escalabilidad**: Puede manejar décadas de datos sin degradación de rendimiento
- **RLS**: Las políticas de Row Level Security siguen aplicando (solo usuarios propios)

## Soporte

Si encuentras problemas:
1. Verifica que la migración se ejecutó correctamente
2. Revisa los logs de Supabase para errores
3. Asegúrate de que las queries incluyen el filtro `eq('year', year)`
