-- ============================================================================
-- DIAGNÓSTICO: Por qué el dashboard muestra €0.00
-- ============================================================================
-- Ejecuta este script completo en el SQL Editor de Supabase
-- para diagnosticar el problema

-- 1. Verificar usuario royvillasana@gmail.com existe y obtener su ID
SELECT 'Usuario royvillasana@gmail.com:' AS info;
SELECT id, email, created_at
FROM auth.users
WHERE email LIKE '%royvillasana%';

-- Guardar el user_id para las siguientes queries (reemplaza 'USER_ID_AQUI' con el ID real)
\set user_id 'USER_ID_PLACEHOLDER'

-- 2. Verificar datos en view_income_all
SELECT '
========================================
view_income_all (Ingresos):
========================================' AS info;
SELECT
    user_id,
    year,
    month_id,
    COUNT(*) as num_entries,
    SUM(amount) as total_income
FROM view_income_all
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
GROUP BY user_id, year, month_id
ORDER BY year DESC, month_id DESC
LIMIT 10;

-- 3. Verificar datos en view_transactions_all
SELECT '
========================================
view_transactions_all (Transacciones):
========================================' AS info;
SELECT
    user_id,
    year,
    month_id,
    direction,
    COUNT(*) as num_entries,
    SUM(amount) as total_amount
FROM view_transactions_all
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
GROUP BY user_id, year, month_id, direction
ORDER BY year DESC, month_id DESC
LIMIT 10;

-- 4. Verificar view_monthly_summary (después del fix)
SELECT '
========================================
view_monthly_summary (DESPUÉS del fix):
========================================' AS info;
SELECT
    user_id,
    year,
    month_name,
    total_income,
    total_expenses,
    net_cash_flow,
    future_actual,
    debt_payments
FROM view_monthly_summary
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
ORDER BY year DESC, month_id DESC
LIMIT 12;

-- 5. Verificar view_annual_summary (lo que ve el dashboard)
SELECT '
========================================
view_annual_summary (LO QUE VE EL DASHBOARD):
========================================' AS info;
SELECT
    user_id,
    year,
    annual_income,
    annual_expenses,
    annual_net_cash_flow,
    annual_future_actual,
    annual_debt_payments
FROM view_annual_summary
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
ORDER BY year DESC;

-- 6. Verificar la definición de view_monthly_summary
SELECT '
========================================
Definición actual de view_monthly_summary:
========================================' AS info;
SELECT
    schemaname,
    viewname,
    definition
FROM pg_views
WHERE viewname = 'view_monthly_summary';

-- 7. Verificar CTE user_years (cuántos años tiene el usuario)
SELECT '
========================================
Años del usuario (debería mostrar 2024, 2025, etc.):
========================================' AS info;
WITH user_years AS (
  SELECT DISTINCT user_id, year FROM view_income_all
  UNION
  SELECT DISTINCT user_id, year FROM view_transactions_all
  UNION
  SELECT DISTINCT user_id, year FROM view_budget_all
  UNION
  SELECT DISTINCT user_id, year FROM view_debts_all
)
SELECT user_id, year, COUNT(*) as num_years
FROM user_years
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
GROUP BY user_id, year
ORDER BY year DESC;

-- 8. Verificar que las vistas base NO estén vacías
SELECT '
========================================
Conteo de registros en vistas base:
========================================' AS info;
SELECT
    'view_income_all' as vista,
    COUNT(*) as total_registros,
    COUNT(DISTINCT user_id) as usuarios_distintos
FROM view_income_all
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
UNION ALL
SELECT
    'view_transactions_all',
    COUNT(*),
    COUNT(DISTINCT user_id)
FROM view_transactions_all
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
UNION ALL
SELECT
    'view_budget_all',
    COUNT(*),
    COUNT(DISTINCT user_id)
FROM view_budget_all
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1)
UNION ALL
SELECT
    'view_debts_all',
    COUNT(*),
    COUNT(DISTINCT user_id)
FROM view_debts_all
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana%' LIMIT 1);

-- 9. Verificar RLS policies en las vistas
SELECT '
========================================
Security invoker settings (deben ser ON):
========================================' AS info;
SELECT
    schemaname,
    viewname,
    viewowner
FROM pg_views
WHERE viewname IN ('view_monthly_summary', 'view_annual_summary');
