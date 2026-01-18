-- DEBUG: Verificar exactamente qué ve el Dashboard

-- 1. Año actual
SELECT EXTRACT(YEAR FROM CURRENT_DATE) as current_year;

-- 2. Lo que debería retornar getAnnualSummary() para el año 2026
SELECT
    year,
    user_id,
    annual_income,
    annual_expenses,
    annual_future_actual,
    annual_debt_payments
FROM view_annual_summary
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana@gmail.com%' LIMIT 1)
  AND year = EXTRACT(YEAR FROM CURRENT_DATE);

-- 3. Verificar si hay datos para TODOS los años (sin filtro de año)
SELECT
    year,
    annual_income,
    annual_expenses,
    annual_future_actual,
    annual_debt_payments
FROM view_annual_summary
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana@gmail.com%' LIMIT 1)
ORDER BY year DESC;

-- 4. Verificar datos en 2025 (año pasado)
SELECT
    month_name,
    total_income,
    total_expenses,
    future_actual,
    debt_payments
FROM view_monthly_summary
WHERE user_id = (SELECT id FROM auth.users WHERE email LIKE '%royvillasana@gmail.com%' LIMIT 1)
  AND year = 2025
ORDER BY month_id;
