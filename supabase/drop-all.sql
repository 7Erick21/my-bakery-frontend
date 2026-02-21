-- =============================================================================
-- DROP ALL BAKERY TABLES - Run this FIRST in Supabase SQL Editor
-- =============================================================================
-- DROP TABLE CASCADE automatically removes triggers, policies, indexes, etc.
-- No need to drop triggers separately.

-- 1. Drop trigger on auth.users (only one that references another schema)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Drop functions (CASCADE removes dependent triggers automatically)
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.auto_create_inventory() CASCADE;
DROP FUNCTION IF EXISTS public.check_low_stock() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_order() CASCADE;
DROP FUNCTION IF EXISTS public.notify_new_review() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.is_admin_or_above() CASCADE;
DROP FUNCTION IF EXISTS public.is_marketing_or_above() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.increment_coupon_uses(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.decrement_stock(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.record_inventory_movement(uuid, text, integer, text, text) CASCADE;
DROP FUNCTION IF EXISTS public.generate_invoice_number() CASCADE;

-- 3. Drop sequence
DROP SEQUENCE IF EXISTS public.invoice_number_seq;

-- 4. Drop all tables (CASCADE handles FK dependencies)
DROP TABLE IF EXISTS public.recurring_order_items CASCADE;
DROP TABLE IF EXISTS public.recurring_order_schedules CASCADE;
DROP TABLE IF EXISTS public.daily_inventory_report_items CASCADE;
DROP TABLE IF EXISTS public.daily_inventory_reports CASCADE;
DROP TABLE IF EXISTS public.inventory_movements CASCADE;
DROP TABLE IF EXISTS public.invoice_items CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.production_schedule CASCADE;
DROP TABLE IF EXISTS public.social_links CASCADE;
DROP TABLE IF EXISTS public.business_info_translations CASCADE;
DROP TABLE IF EXISTS public.business_info CASCADE;
DROP TABLE IF EXISTS public.feature_card_translations CASCADE;
DROP TABLE IF EXISTS public.feature_cards CASCADE;
DROP TABLE IF EXISTS public.timeline_event_translations CASCADE;
DROP TABLE IF EXISTS public.timeline_events CASCADE;
DROP TABLE IF EXISTS public.cms_media CASCADE;
DROP TABLE IF EXISTS public.cms_content_translations CASCADE;
DROP TABLE IF EXISTS public.cms_content CASCADE;
DROP TABLE IF EXISTS public.review_images CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.inventory CASCADE;
DROP TABLE IF EXISTS public.preparation_step_translations CASCADE;
DROP TABLE IF EXISTS public.preparation_steps CASCADE;
DROP TABLE IF EXISTS public.ingredient_translations CASCADE;
DROP TABLE IF EXISTS public.ingredients CASCADE;
DROP TABLE IF EXISTS public.product_images CASCADE;
DROP TABLE IF EXISTS public.product_translations CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.category_translations CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.languages CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 5. Drop enums
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.review_status CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.discount_type CASCADE;
DROP TYPE IF EXISTS public.notification_type CASCADE;
DROP TYPE IF EXISTS public.audit_action CASCADE;
DROP TYPE IF EXISTS public.content_section CASCADE;
DROP TYPE IF EXISTS public.season_tag CASCADE;
DROP TYPE IF EXISTS public.delivery_type CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.inventory_movement_type CASCADE;

SELECT 'All dropped successfully' AS result;
