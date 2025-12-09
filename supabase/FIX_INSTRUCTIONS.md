# Database Fix Instructions

## Problem
Data is not displaying in the dashboard and monthly budget pages because critical database views and functions are missing.

## Solution

### Step 1: Optional - Diagnose Current State
Run [diagnose_database.sql](diagnose_database.sql) in your Supabase SQL Editor to see what's currently in your database.

### Step 2: Run the Fix Migration
Run [migrations/20251209000002_add_views_and_functions_only.sql](migrations/20251209000002_add_views_and_functions_only.sql) in your Supabase SQL Editor.

This migration will:
- ✓ Create monthly_budget_* tables if they don't exist
- ✓ Add missing columns to existing tables
- ✓ Create all required database views:
  - `view_monthly_summary` - Dashboard monthly data
  - `view_annual_summary` - Dashboard annual totals
  - `view_transactions_all` - All transactions across months
  - `view_income_all` - All income across months
  - `view_budget_all` - All budget entries across months
  - `view_debts_all` - All debts across months
- ✓ Create all required RPC functions:
  - `get_user_transactions()` - Fetch transactions for a specific month
  - `get_user_debts()` - Fetch debts for a specific month
  - `get_user_budget()` - Fetch budget for a specific month

### Step 3: Verify
After running the migration:
1. Check that it completed successfully (should see "Migration completed!" message)
2. Refresh your application
3. Navigate to the Dashboard - you should now see data
4. Navigate to a monthly budget page - you should see transactions, budget items, etc.

## What This Fixes

### Dashboard Issues
- **Before**: Empty dashboard, no monthly summaries, no annual totals
- **After**: Dashboard displays monthly income, expenses, and annual summaries

### Monthly Budget Page Issues
- **Before**: Empty budget tables, no transactions, no debts
- **After**: Full budget details, transaction lists, debt tracking

## Technical Details

The application uses:
- **Supabase Storage** service ([src/services/storage/SupabaseStorage.ts](../src/services/storage/SupabaseStorage.ts))
- **Database Views** to aggregate data across 12 monthly tables
- **RPC Functions** to dynamically query the correct monthly table based on month_id

These views and functions were missing from the database, causing the frontend to receive empty data.
