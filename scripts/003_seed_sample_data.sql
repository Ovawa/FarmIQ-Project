-- This script will be used to seed sample data after authentication is set up
-- For now, it's just a placeholder that will be populated later

-- Sample field types and crop varieties for reference
INSERT INTO public.fields (id, user_id, name, size_acres, location, soil_type) VALUES
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'North Field', 25.5, 'North Section', 'Loamy'),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'South Field', 18.2, 'South Section', 'Clay')
ON CONFLICT (id) DO NOTHING;

-- Note: This is sample data with placeholder user_id
-- Real data will be inserted after user authentication is implemented
