-- Add production_cost column to crops table
-- Run this in Supabase SQL Editor: https://app.supabase.com/project/[YOUR_PROJECT]/sql/new

ALTER TABLE public.crops 
ADD COLUMN IF NOT EXISTS production_cost DECIMAL(12,2) DEFAULT NULL;
