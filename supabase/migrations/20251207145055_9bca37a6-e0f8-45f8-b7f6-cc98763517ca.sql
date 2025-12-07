-- Set views to SECURITY INVOKER to fix security warnings
ALTER VIEW view_monthly_summary SET (security_invoker = on);
ALTER VIEW view_annual_summary SET (security_invoker = on);