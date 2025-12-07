-- Add foreign key constraints for monthly_budget tables (Feb-Dec)
ALTER TABLE public.monthly_budget_feb 
  ADD CONSTRAINT monthly_budget_feb_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_mar 
  ADD CONSTRAINT monthly_budget_mar_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_apr 
  ADD CONSTRAINT monthly_budget_apr_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_may 
  ADD CONSTRAINT monthly_budget_may_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_jun 
  ADD CONSTRAINT monthly_budget_jun_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_jul 
  ADD CONSTRAINT monthly_budget_jul_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_aug 
  ADD CONSTRAINT monthly_budget_aug_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_sep 
  ADD CONSTRAINT monthly_budget_sep_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_oct 
  ADD CONSTRAINT monthly_budget_oct_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_nov 
  ADD CONSTRAINT monthly_budget_nov_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_budget_dec 
  ADD CONSTRAINT monthly_budget_dec_category_id_fkey 
  FOREIGN KEY (category_id) REFERENCES public.categories(id);

-- Add foreign key constraints for monthly_debts tables (Feb-Dec) to accounts
ALTER TABLE public.monthly_debts_feb 
  ADD CONSTRAINT monthly_debts_feb_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_mar 
  ADD CONSTRAINT monthly_debts_mar_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_apr 
  ADD CONSTRAINT monthly_debts_apr_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_may 
  ADD CONSTRAINT monthly_debts_may_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_jun 
  ADD CONSTRAINT monthly_debts_jun_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_jul 
  ADD CONSTRAINT monthly_debts_jul_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_aug 
  ADD CONSTRAINT monthly_debts_aug_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_sep 
  ADD CONSTRAINT monthly_debts_sep_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_oct 
  ADD CONSTRAINT monthly_debts_oct_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_nov 
  ADD CONSTRAINT monthly_debts_nov_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);

ALTER TABLE public.monthly_debts_dec 
  ADD CONSTRAINT monthly_debts_dec_debt_account_id_fkey 
  FOREIGN KEY (debt_account_id) REFERENCES public.accounts(id);