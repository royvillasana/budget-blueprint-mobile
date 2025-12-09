-- Script diagnóstico simplificado que muestra todo en un solo resultado

SELECT 'CATEGORÍAS' as tipo, COUNT(*) as total FROM public.categories
UNION ALL
SELECT 'CUENTAS', COUNT(*) FROM public.accounts
UNION ALL
SELECT 'MÉTODOS DE PAGO', COUNT(*) FROM public.payment_methods
UNION ALL
SELECT 'MESES', COUNT(*) FROM public.months
UNION ALL
SELECT 'INGRESOS ENERO', COUNT(*) FROM public.monthly_income_jan
UNION ALL
SELECT 'TRANSACCIONES ENERO', COUNT(*) FROM public.monthly_transactions_jan
UNION ALL
SELECT 'PRESUPUESTO ENERO', COUNT(*) FROM public.monthly_budget_jan
UNION ALL
SELECT 'DEUDAS ENERO', COUNT(*) FROM public.monthly_debts_jan
UNION ALL
SELECT 'VIEW_INCOME_ALL', COUNT(*) FROM view_income_all
UNION ALL
SELECT 'VIEW_TRANSACTIONS_ALL', COUNT(*) FROM view_transactions_all
UNION ALL
SELECT 'VIEW_BUDGET_ALL', COUNT(*) FROM view_budget_all
UNION ALL
SELECT 'VIEW_DEBTS_ALL', COUNT(*) FROM view_debts_all
UNION ALL
SELECT 'VIEW_MONTHLY_SUMMARY', COUNT(*) FROM view_monthly_summary
ORDER BY tipo;
