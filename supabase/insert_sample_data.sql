-- Script para insertar datos ficticios en todas las tablas mensuales
-- Ejecutar en Supabase SQL Editor

-- ============================================================================
-- PASO 1: Obtener el user_id actual
-- ============================================================================
-- IMPORTANTE: Reemplaza 'YOUR_USER_ID' con tu UUID real de usuario
-- Puedes obtenerlo ejecutando: SELECT auth.uid();

DO $$
DECLARE
  v_user_id UUID;
  v_category_food UUID;
  v_category_transport UUID;
  v_category_entertainment UUID;
  v_category_housing UUID;
  v_category_utilities UUID;
  v_category_healthcare UUID;
  v_category_shopping UUID;
  v_category_savings UUID;
  v_account_checking UUID;
  v_account_savings UUID;
  v_account_credit_card UUID;
  v_payment_cash UUID;
  v_payment_card UUID;
  v_payment_transfer UUID;
  month_num INTEGER;
BEGIN
  -- Obtener el usuario por email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'royvillasana@gmail.com'
  LIMIT 1;

  -- Verificar que el usuario existe
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró el usuario con email royvillasana@gmail.com';
  END IF;

  RAISE NOTICE 'Insertando datos para usuario: % (royvillasana@gmail.com)', v_user_id;

  -- ============================================================================
  -- PASO 2: Insertar categorías de ejemplo
  -- ============================================================================

  INSERT INTO public.categories (id, name, emoji, bucket_50_30_20, user_id)
  VALUES
    (gen_random_uuid(), 'Comida y Supermercado', '🛒', 'NEEDS', v_user_id),
    (gen_random_uuid(), 'Transporte', '🚗', 'NEEDS', v_user_id),
    (gen_random_uuid(), 'Vivienda', '🏠', 'NEEDS', v_user_id),
    (gen_random_uuid(), 'Servicios', '💡', 'NEEDS', v_user_id),
    (gen_random_uuid(), 'Salud', '⚕️', 'NEEDS', v_user_id),
    (gen_random_uuid(), 'Entretenimiento', '🎬', 'WANTS', v_user_id),
    (gen_random_uuid(), 'Compras', '🛍️', 'WANTS', v_user_id),
    (gen_random_uuid(), 'Restaurantes', '🍽️', 'WANTS', v_user_id),
    (gen_random_uuid(), 'Ahorros', '💰', 'FUTURE', v_user_id),
    (gen_random_uuid(), 'Inversiones', '📈', 'FUTURE', v_user_id)
  ON CONFLICT DO NOTHING;

  -- Obtener IDs de categorías
  SELECT id INTO v_category_food FROM public.categories WHERE name = 'Comida y Supermercado' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_category_transport FROM public.categories WHERE name = 'Transporte' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_category_entertainment FROM public.categories WHERE name = 'Entretenimiento' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_category_housing FROM public.categories WHERE name = 'Vivienda' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_category_utilities FROM public.categories WHERE name = 'Servicios' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_category_healthcare FROM public.categories WHERE name = 'Salud' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_category_shopping FROM public.categories WHERE name = 'Compras' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_category_savings FROM public.categories WHERE name = 'Ahorros' AND user_id = v_user_id LIMIT 1;

  -- ============================================================================
  -- PASO 3: Insertar cuentas de ejemplo
  -- ============================================================================

  INSERT INTO public.accounts (id, name, type, currency_code, user_id)
  VALUES
    (gen_random_uuid(), 'Cuenta Corriente', 'CHECKING', 'EUR', v_user_id),
    (gen_random_uuid(), 'Cuenta de Ahorros', 'SAVINGS', 'EUR', v_user_id),
    (gen_random_uuid(), 'Tarjeta de Crédito', 'CREDIT_CARD', 'EUR', v_user_id)
  ON CONFLICT DO NOTHING;

  -- Obtener IDs de cuentas
  SELECT id INTO v_account_checking FROM public.accounts WHERE name = 'Cuenta Corriente' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_account_savings FROM public.accounts WHERE name = 'Cuenta de Ahorros' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_account_credit_card FROM public.accounts WHERE name = 'Tarjeta de Crédito' AND user_id = v_user_id LIMIT 1;

  -- ============================================================================
  -- PASO 4: Insertar métodos de pago de ejemplo
  -- ============================================================================

  INSERT INTO public.payment_methods (id, name, type, user_id)
  VALUES
    (gen_random_uuid(), 'Efectivo', 'CASH', v_user_id),
    (gen_random_uuid(), 'Tarjeta de Débito', 'DEBIT', v_user_id),
    (gen_random_uuid(), 'Transferencia Bancaria', 'TRANSFER', v_user_id)
  ON CONFLICT DO NOTHING;

  -- Obtener IDs de métodos de pago
  SELECT id INTO v_payment_cash FROM public.payment_methods WHERE name = 'Efectivo' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_payment_card FROM public.payment_methods WHERE name = 'Tarjeta de Débito' AND user_id = v_user_id LIMIT 1;
  SELECT id INTO v_payment_transfer FROM public.payment_methods WHERE name = 'Transferencia Bancaria' AND user_id = v_user_id LIMIT 1;

  -- ============================================================================
  -- PASO 5: Insertar datos ficticios para cada mes
  -- ============================================================================

  FOR month_num IN 1..12 LOOP
    DECLARE
      month_suffix TEXT;
      start_date DATE;
    BEGIN
      -- Determinar el sufijo del mes y fecha de inicio
      month_suffix := CASE month_num
        WHEN 1 THEN 'jan'
        WHEN 2 THEN 'feb'
        WHEN 3 THEN 'mar'
        WHEN 4 THEN 'apr'
        WHEN 5 THEN 'may'
        WHEN 6 THEN 'jun'
        WHEN 7 THEN 'jul'
        WHEN 8 THEN 'aug'
        WHEN 9 THEN 'sep'
        WHEN 10 THEN 'oct'
        WHEN 11 THEN 'nov'
        WHEN 12 THEN 'dec'
      END;

      start_date := make_date(2025, month_num, 1);

      RAISE NOTICE 'Insertando datos para mes %: %', month_num, month_suffix;

      -- INGRESOS MENSUALES
      EXECUTE format('
        INSERT INTO public.monthly_income_%s (user_id, month_id, date, source, amount, account_id, currency_code, notes)
        VALUES
          ($1, $2, $3, ''Salario'', 3500.00, $4, ''EUR'', ''Salario mensual''),
          ($1, $2, $3 + 10, ''Freelance'', 800.00, $4, ''EUR'', ''Proyecto freelance''),
          ($1, $2, $3 + 20, ''Inversiones'', 150.00, $5, ''EUR'', ''Dividendos'')
      ', month_suffix)
      USING v_user_id, month_num, start_date, v_account_checking, v_account_savings;

      -- PRESUPUESTO MENSUAL
      EXECUTE format('
        INSERT INTO public.monthly_budget_%s (user_id, month_id, category_id, bucket_50_30_20, estimated, assigned, actual, variance)
        VALUES
          ($1, $2, $3, ''NEEDS'', 600.00, 600.00, 580.00, 20.00),
          ($1, $2, $4, ''NEEDS'', 300.00, 300.00, 285.00, 15.00),
          ($1, $2, $5, ''NEEDS'', 1200.00, 1200.00, 1200.00, 0.00),
          ($1, $2, $6, ''NEEDS'', 250.00, 250.00, 245.00, 5.00),
          ($1, $2, $7, ''NEEDS'', 150.00, 150.00, 130.00, 20.00),
          ($1, $2, $8, ''WANTS'', 200.00, 200.00, 180.00, 20.00),
          ($1, $2, $9, ''WANTS'', 150.00, 150.00, 165.00, -15.00),
          ($1, $2, $10, ''FUTURE'', 500.00, 500.00, 500.00, 0.00)
        ON CONFLICT DO NOTHING
      ', month_suffix)
      USING v_user_id, month_num,
            v_category_food, v_category_transport, v_category_housing,
            v_category_utilities, v_category_healthcare, v_category_entertainment,
            v_category_shopping, v_category_savings;

      -- TRANSACCIONES MENSUALES (10 transacciones por mes)
      EXECUTE format('
        INSERT INTO public.monthly_transactions_%s (user_id, month_id, date, description, category_id, amount, direction, payment_method_id, account_id, currency_code)
        VALUES
          ($1, $2, $3 + 2, ''Supermercado Mercadona'', $4, 85.50, ''EXPENSE'', $5, $6, ''EUR''),
          ($1, $2, $3 + 5, ''Gasolina Shell'', $7, 65.00, ''EXPENSE'', $8, $6, ''EUR''),
          ($1, $2, $3 + 7, ''Netflix'', $9, 15.99, ''EXPENSE'', $8, $6, ''EUR''),
          ($1, $2, $3 + 10, ''Supermercado Carrefour'', $4, 120.30, ''EXPENSE'', $8, $6, ''EUR''),
          ($1, $2, $3 + 12, ''Restaurante'', $10, 45.00, ''EXPENSE'', $8, $6, ''EUR''),
          ($1, $2, $3 + 15, ''Farmacia'', $11, 28.50, ''EXPENSE'', $5, $6, ''EUR''),
          ($1, $2, $3 + 18, ''Ropa Zara'', $10, 89.99, ''EXPENSE'', $8, $6, ''EUR''),
          ($1, $2, $3 + 20, ''Electricidad'', $12, 85.00, ''EXPENSE'', $13, $6, ''EUR''),
          ($1, $2, $3 + 22, ''Supermercado Lidl'', $4, 95.80, ''EXPENSE'', $8, $6, ''EUR''),
          ($1, $2, $3 + 25, ''Cine'', $9, 24.00, ''EXPENSE'', $8, $6, ''EUR'')
        ON CONFLICT DO NOTHING
      ', month_suffix)
      USING v_user_id, month_num, start_date,
            v_category_food, v_payment_cash, v_account_checking,
            v_category_transport, v_payment_card,
            v_category_entertainment,
            v_category_shopping,
            v_category_healthcare,
            v_category_utilities, v_payment_transfer;

      -- DEUDAS MENSUALES (si existen cuentas de crédito)
      IF v_account_credit_card IS NOT NULL THEN
        EXECUTE format('
          INSERT INTO public.monthly_debts_%s (user_id, month_id, debt_account_id, starting_balance, interest_rate_apr, min_payment, payment_made, ending_balance, due_day)
          VALUES
            ($1, $2, $3, 1500.00, 18.50, 150.00, 200.00, 1300.00, 15)
          ON CONFLICT DO NOTHING
        ', month_suffix)
        USING v_user_id, month_num, v_account_credit_card;
      END IF;

    END;
  END LOOP;

  RAISE NOTICE 'Datos ficticios insertados correctamente para todos los 12 meses!';
END $$;

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Verificar datos insertados
SELECT 'Categorías insertadas' as tabla, COUNT(*) as total FROM public.categories
UNION ALL
SELECT 'Cuentas insertadas', COUNT(*) FROM public.accounts
UNION ALL
SELECT 'Métodos de pago insertados', COUNT(*) FROM public.payment_methods
UNION ALL
SELECT 'Ingresos Enero', COUNT(*) FROM public.monthly_income_jan
UNION ALL
SELECT 'Transacciones Enero', COUNT(*) FROM public.monthly_transactions_jan
UNION ALL
SELECT 'Presupuesto Enero', COUNT(*) FROM public.monthly_budget_jan
UNION ALL
SELECT 'Deudas Enero', COUNT(*) FROM public.monthly_debts_jan;
