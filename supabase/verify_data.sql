-- Script para verificar que todos los datos estén correctamente insertados
-- Ejecutar en Supabase SQL Editor

-- ============================================================================
-- PARTE 1: Verificar datos en las tablas base
-- ============================================================================

SELECT 'CATEGORÍAS' as tabla, COUNT(*) as total FROM public.categories;
SELECT 'CUENTAS' as tabla, COUNT(*) as total FROM public.accounts;
SELECT 'MÉTODOS DE PAGO' as tabla, COUNT(*) as total FROM public.payment_methods;
SELECT 'MESES' as tabla, COUNT(*) as total FROM public.months;

-- ============================================================================
-- PARTE 2: Verificar datos en las tablas mensuales (Enero como ejemplo)
-- ============================================================================

SELECT 'INGRESOS ENERO' as tabla, COUNT(*) as total FROM public.monthly_income_jan;
SELECT 'TRANSACCIONES ENERO' as tabla, COUNT(*) as total FROM public.monthly_transactions_jan;
SELECT 'PRESUPUESTO ENERO' as tabla, COUNT(*) as total FROM public.monthly_budget_jan;
SELECT 'DEUDAS ENERO' as tabla, COUNT(*) as total FROM public.monthly_debts_jan;

-- ============================================================================
-- PARTE 3: Verificar vistas
-- ============================================================================

SELECT 'VIEW_INCOME_ALL' as vista, COUNT(*) as total FROM view_income_all;
SELECT 'VIEW_TRANSACTIONS_ALL' as vista, COUNT(*) as total FROM view_transactions_all;
SELECT 'VIEW_BUDGET_ALL' as vista, COUNT(*) as total FROM view_budget_all;
SELECT 'VIEW_DEBTS_ALL' as vista, COUNT(*) as total FROM view_debts_all;

-- ============================================================================
-- PARTE 4: Verificar vista de resumen mensual
-- ============================================================================

SELECT
    month_id,
    month_name,
    total_income,
    total_expenses,
    net_cash_flow,
    needs_actual,
    wants_actual,
    future_actual
FROM view_monthly_summary
ORDER BY month_id;

-- ============================================================================
-- PARTE 5: Probar las funciones RPC
-- ============================================================================

-- Obtener el user_id
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'royvillasana@gmail.com'
  LIMIT 1;

  RAISE NOTICE 'User ID: %', v_user_id;

  -- Verificar transacciones de enero
  RAISE NOTICE 'Transacciones de Enero:';
  PERFORM * FROM get_user_transactions(v_user_id, 1);

  -- Verificar presupuesto de enero
  RAISE NOTICE 'Presupuesto de Enero:';
  PERFORM * FROM get_user_budget(v_user_id, 1);

  -- Verificar deudas de enero
  RAISE NOTICE 'Deudas de Enero:';
  PERFORM * FROM get_user_debts(v_user_id, 1);
END $$;

-- ============================================================================
-- PARTE 6: Ver datos reales de ejemplo
-- ============================================================================

-- Ver primeras 5 transacciones de enero
SELECT * FROM public.monthly_transactions_jan LIMIT 5;

-- Ver primeras 5 entradas de presupuesto de enero
SELECT * FROM public.monthly_budget_jan LIMIT 5;

-- Ver todas las deudas de enero
SELECT * FROM public.monthly_debts_jan;
