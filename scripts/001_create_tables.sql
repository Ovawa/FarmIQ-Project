-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  farm_name TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create fields table
CREATE TABLE IF NOT EXISTS public.fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  size_acres DECIMAL(10,2) NOT NULL,
  location TEXT,
  soil_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on fields
ALTER TABLE public.fields ENABLE ROW LEVEL SECURITY;

-- Create policies for fields
CREATE POLICY "fields_select_own" ON public.fields FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fields_insert_own" ON public.fields FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fields_update_own" ON public.fields FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "fields_delete_own" ON public.fields FOR DELETE USING (auth.uid() = user_id);

-- Create crops table
CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  status TEXT DEFAULT 'planted' CHECK (status IN ('planted', 'growing', 'harvested')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on crops
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;

-- Create policies for crops
CREATE POLICY "crops_select_own" ON public.crops FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "crops_insert_own" ON public.crops FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "crops_update_own" ON public.crops FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "crops_delete_own" ON public.crops FOR DELETE USING (auth.uid() = user_id);

-- Create yield_records table
CREATE TABLE IF NOT EXISTS public.yield_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  harvest_date DATE NOT NULL,
  yield_amount DECIMAL(10,2) NOT NULL,
  yield_unit TEXT DEFAULT 'bushels' CHECK (yield_unit IN ('bushels', 'tons', 'pounds', 'kg')),
  quality_grade TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on yield_records
ALTER TABLE public.yield_records ENABLE ROW LEVEL SECURITY;

-- Create policies for yield_records
CREATE POLICY "yield_records_select_own" ON public.yield_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "yield_records_insert_own" ON public.yield_records FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "yield_records_update_own" ON public.yield_records FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "yield_records_delete_own" ON public.yield_records FOR DELETE USING (auth.uid() = user_id);

-- Create predictions table
CREATE TABLE IF NOT EXISTS public.predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  field_id UUID NOT NULL REFERENCES public.fields(id) ON DELETE CASCADE,
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  predicted_yield DECIMAL(10,2) NOT NULL,
  yield_unit TEXT DEFAULT 'bushels' CHECK (yield_unit IN ('bushels', 'tons', 'pounds', 'kg')),
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  prediction_date DATE NOT NULL,
  factors JSONB, -- Store weather, soil, historical data factors
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on predictions
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Create policies for predictions
CREATE POLICY "predictions_select_own" ON public.predictions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "predictions_insert_own" ON public.predictions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "predictions_update_own" ON public.predictions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "predictions_delete_own" ON public.predictions FOR DELETE USING (auth.uid() = user_id);
