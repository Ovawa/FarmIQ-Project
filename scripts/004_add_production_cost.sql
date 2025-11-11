-- Add production_cost column to crops table for tracking production costs in NAD (Namibian Dollar)
-- This script adds support for production cost tracking per crop
-- The cost is stored in Namibian Dollars (N$)

-- Check if column exists before adding (safety measure for idempotency)
DO $$
BEGIN
  -- Add production_cost column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'crops' AND column_name = 'production_cost'
  ) THEN
    ALTER TABLE public.crops 
    ADD COLUMN production_cost DECIMAL(12,2) DEFAULT NULL;
    
    -- Create a comment on the column for documentation
    COMMENT ON COLUMN public.crops.production_cost IS 'Production cost in NAD (Namibian Dollar)';
  END IF;
END $$;
