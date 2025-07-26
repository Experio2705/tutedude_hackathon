-- Make supplier_id nullable in orders table since orders can be created without a specific supplier
ALTER TABLE public.orders ALTER COLUMN supplier_id DROP NOT NULL;