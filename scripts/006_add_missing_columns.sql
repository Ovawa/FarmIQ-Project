-- Add missing columns to crops table
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/[YOUR_PROJECT]/sql/new

-- Add expected_harvest_date column (DATE type)
ALTER TABLE public.crops
ADD COLUMN IF NOT EXISTS expected_harvest_date DATE;

-- Add production_cost column (DECIMAL type in N$ currency)
ALTER TABLE public.crops
ADD COLUMN IF NOT EXISTS production_cost DECIMAL(12,2) DEFAULT NULL;

-- Verify columns exist (optional query to check after running)
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name = 'crops'
--   AND column_name IN ('expected_harvest_date', 'production_cost');
