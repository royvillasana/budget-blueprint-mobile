-- Add unique constraint for (user_id, institution_id) to support Tink user upsert
-- This allows each user to have only one Tink user ID stored

ALTER TABLE public.bank_requisitions
ADD CONSTRAINT unique_user_institution
UNIQUE (user_id, institution_id);
