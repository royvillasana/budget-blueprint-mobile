-- Fix security warnings: Convert views from SECURITY DEFINER to SECURITY INVOKER
-- This ensures views use the querying user's permissions, not the creator's

ALTER VIEW view_transactions_all SET (security_invoker = on);
ALTER VIEW view_income_all SET (security_invoker = on);
ALTER VIEW view_budget_all SET (security_invoker = on);
ALTER VIEW view_debts_all SET (security_invoker = on);
ALTER VIEW view_wishlist_all SET (security_invoker = on);
ALTER VIEW view_settings_all SET (security_invoker = on);
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);