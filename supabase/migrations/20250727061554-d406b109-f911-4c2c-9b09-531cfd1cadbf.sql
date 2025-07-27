-- Create supplier records for existing supplier profiles that don't have them
INSERT INTO public.suppliers (profile_id, description, specializations, delivery_radius, delivery_time_days, min_order_amount, rating)
SELECT 
  p.id,
  'Professional supplier providing quality products',
  ARRAY['General'],
  50,
  3,
  0,
  5.0
FROM public.profiles p
LEFT JOIN public.suppliers s ON s.profile_id = p.id
WHERE p.user_type = 'supplier' AND s.id IS NULL;