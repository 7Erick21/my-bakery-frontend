-- =============================================================================
-- Re-create profiles from auth.users
-- Change the email below to assign super_admin role to a different user
-- Run in Supabase SQL Editor
-- =============================================================================

INSERT INTO public.profiles (id, email, full_name, avatar_url, role, preferred_language)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name'),
  u.raw_user_meta_data->>'avatar_url',
  CASE
    WHEN u.email = 'pinedacuevaerick910@gmail.com' THEN 'super_admin'::public.user_role
    ELSE 'user'::public.user_role
  END,
  'es'
FROM auth.users u
ON CONFLICT (id) DO NOTHING;



-- Cambiar phone para notificaciones a numero

  UPDATE business_info SET value = 'TU_NUMERO_REAL' WHERE key = 'bizum_phone';