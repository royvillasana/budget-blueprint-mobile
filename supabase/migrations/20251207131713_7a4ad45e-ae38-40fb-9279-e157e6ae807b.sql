-- Add foreign key relationships for monthly_transactions tables (Feb-Dec)
-- These are needed for PostgREST to recognize the joins

-- February
ALTER TABLE public.monthly_transactions_feb
ADD CONSTRAINT monthly_transactions_feb_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_feb
ADD CONSTRAINT monthly_transactions_feb_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_feb
ADD CONSTRAINT monthly_transactions_feb_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- March
ALTER TABLE public.monthly_transactions_mar
ADD CONSTRAINT monthly_transactions_mar_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_mar
ADD CONSTRAINT monthly_transactions_mar_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_mar
ADD CONSTRAINT monthly_transactions_mar_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- April
ALTER TABLE public.monthly_transactions_apr
ADD CONSTRAINT monthly_transactions_apr_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_apr
ADD CONSTRAINT monthly_transactions_apr_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_apr
ADD CONSTRAINT monthly_transactions_apr_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- May
ALTER TABLE public.monthly_transactions_may
ADD CONSTRAINT monthly_transactions_may_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_may
ADD CONSTRAINT monthly_transactions_may_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_may
ADD CONSTRAINT monthly_transactions_may_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- June
ALTER TABLE public.monthly_transactions_jun
ADD CONSTRAINT monthly_transactions_jun_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_jun
ADD CONSTRAINT monthly_transactions_jun_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_jun
ADD CONSTRAINT monthly_transactions_jun_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- July
ALTER TABLE public.monthly_transactions_jul
ADD CONSTRAINT monthly_transactions_jul_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_jul
ADD CONSTRAINT monthly_transactions_jul_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_jul
ADD CONSTRAINT monthly_transactions_jul_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- August
ALTER TABLE public.monthly_transactions_aug
ADD CONSTRAINT monthly_transactions_aug_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_aug
ADD CONSTRAINT monthly_transactions_aug_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_aug
ADD CONSTRAINT monthly_transactions_aug_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- September
ALTER TABLE public.monthly_transactions_sep
ADD CONSTRAINT monthly_transactions_sep_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_sep
ADD CONSTRAINT monthly_transactions_sep_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_sep
ADD CONSTRAINT monthly_transactions_sep_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- October
ALTER TABLE public.monthly_transactions_oct
ADD CONSTRAINT monthly_transactions_oct_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_oct
ADD CONSTRAINT monthly_transactions_oct_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_oct
ADD CONSTRAINT monthly_transactions_oct_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- November
ALTER TABLE public.monthly_transactions_nov
ADD CONSTRAINT monthly_transactions_nov_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_nov
ADD CONSTRAINT monthly_transactions_nov_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_nov
ADD CONSTRAINT monthly_transactions_nov_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);

-- December
ALTER TABLE public.monthly_transactions_dec
ADD CONSTRAINT monthly_transactions_dec_category_id_fkey 
FOREIGN KEY (category_id) REFERENCES public.categories(id);

ALTER TABLE public.monthly_transactions_dec
ADD CONSTRAINT monthly_transactions_dec_payment_method_id_fkey 
FOREIGN KEY (payment_method_id) REFERENCES public.payment_methods(id);

ALTER TABLE public.monthly_transactions_dec
ADD CONSTRAINT monthly_transactions_dec_account_id_fkey 
FOREIGN KEY (account_id) REFERENCES public.accounts(id);