-- Script de diagnóstico para entender por qué el dashboard muestra €0.00

-- Paso 1: Verificar tu user_id
SELECT id, email FROM auth.users WHERE email = 'royvillasana@gmail.com';

-- Paso 2: Verificar datos en las tablas base con tu user_id
SELECT 'INGRESOS ENERO' as tabla, COUNT(*) as total, SUM(amount) as total_amount
FROM public.monthly_income_jan
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'royvillasana@gmail.com' LIMIT 1);

SELECT 'TRANSACCIONES ENERO' as tabla, COUNT(*) as total, SUM(amount) as total_amount
FROM public.monthly_transactions_jan
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'royvillasana@gmail.com' LIMIT 1);

SELECT 'PRESUPUESTO ENERO' as tabla, COUNT(*) as total, SUM(actual) as total_actual
FROM public.monthly_budget_jan
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'royvillasana@gmail.com' LIMIT 1);

-- Paso 3: Verificar qué devuelve view_monthly_summary
SELECT * FROM view_monthly_summary
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'royvillasana@gmail.com' LIMIT 1)
ORDER BY month_id
LIMIT 12;

-- Paso 4: Verificar qué devuelve view_annual_summary
SELECT * FROM view_annual_summary
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'royvillasana@gmail.com' LIMIT 1);

-- Paso 5: Ver TODOS los registros de view_monthly_summary (sin filtro)
SELECT month_id, month_name, user_id, total_income, total_expenses
FROM view_monthly_summary
ORDER BY month_id;

-- Paso 6: Verificar las agregaciones intermedias
SELECT month_id, user_id, SUM(amount) AS total_income
FROM view_income_all
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'royvillasana@gmail.com' LIMIT 1)
GROUP BY month_id, user_id
ORDER BY month_id;
