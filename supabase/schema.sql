-- =============================================================================
-- My Bakery - Complete Database Schema for Supabase
-- =============================================================================
-- Run this in Supabase Dashboard > SQL Editor
-- This creates: 12 enums, 33 tables, 10 functions, triggers, RLS policies
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. ENUMS
-- ---------------------------------------------------------------------------

CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'marketing', 'user');
CREATE TYPE public.review_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled');
CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed');
CREATE TYPE public.notification_type AS ENUM ('new_order', 'low_stock', 'new_review', 'order_status_change');
CREATE TYPE public.audit_action AS ENUM ('create', 'update', 'delete');
CREATE TYPE public.content_section AS ENUM ('hero', 'products_intro', 'about_intro', 'about_footer', 'contact_intro', 'footer', 'seo');
CREATE TYPE public.season_tag AS ENUM ('navidad', 'san_juan', 'sant_jordi', 'pascua', 'todos_santos', 'todo_el_ano');
CREATE TYPE public.delivery_type AS ENUM ('delivery', 'pickup');
CREATE TYPE public.payment_method AS ENUM ('stripe', 'bizum', 'cash');
CREATE TYPE public.inventory_movement_type AS ENUM ('production', 'order', 'physical_sale', 'damaged_product', 'damaged_sale', 'manual_adjustment');

-- ---------------------------------------------------------------------------
-- 2. TABLES
-- ---------------------------------------------------------------------------

-- 2.1 Profiles (linked to auth.users)
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  full_name   text,
  avatar_url  text,
  role        public.user_role NOT NULL DEFAULT 'user',
  preferred_language text NOT NULL DEFAULT 'es',
  stripe_customer_id text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.2 Languages
CREATE TABLE public.languages (
  code        text PRIMARY KEY,
  name        text NOT NULL,
  native_name text NOT NULL,
  is_active   boolean NOT NULL DEFAULT true,
  sort_order  integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.3 Categories
CREATE TABLE public.categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text UNIQUE NOT NULL,
  image_url   text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.4 Category translations
CREATE TABLE public.category_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id   uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  name          text NOT NULL,
  description   text,
  UNIQUE(category_id, language_code)
);

-- 2.5 Products
CREATE TABLE public.products (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                     text UNIQUE NOT NULL,
  category_id              uuid NOT NULL REFERENCES public.categories(id),
  price                    numeric(10,2) NOT NULL,
  compare_at_price         numeric(10,2),
  tax_rate                 numeric(5,2) NOT NULL DEFAULT 10.00,
  is_visible               boolean NOT NULL DEFAULT true,
  is_featured              boolean NOT NULL DEFAULT false,
  display_on_landing       boolean NOT NULL DEFAULT false,
  sort_order               integer NOT NULL DEFAULT 0,
  preparation_time_minutes integer,
  weight_grams             integer,
  season_tags              public.season_tag[] NOT NULL DEFAULT '{}',
  created_at               timestamptz NOT NULL DEFAULT now(),
  updated_at               timestamptz NOT NULL DEFAULT now()
);

-- 2.6 Product translations
CREATE TABLE public.product_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  name          text NOT NULL,
  short_description text,
  description   text,
  UNIQUE(product_id, language_code)
);

-- 2.7 Product images
CREATE TABLE public.product_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_primary  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.8 Ingredients
CREATE TABLE public.ingredients (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sort_order  integer NOT NULL DEFAULT 0,
  is_allergen boolean NOT NULL DEFAULT false
);

-- 2.9 Ingredient translations
CREATE TABLE public.ingredient_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_id uuid NOT NULL REFERENCES public.ingredients(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  name          text NOT NULL,
  UNIQUE(ingredient_id, language_code)
);

-- 2.10 Preparation steps
CREATE TABLE public.preparation_steps (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id       uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  step_number      integer NOT NULL,
  image_url        text,
  duration_minutes integer,
  UNIQUE(product_id, step_number)
);

-- 2.11 Preparation step translations
CREATE TABLE public.preparation_step_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id       uuid NOT NULL REFERENCES public.preparation_steps(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  title         text NOT NULL,
  description   text,
  UNIQUE(step_id, language_code)
);

-- 2.12 Inventory
CREATE TABLE public.inventory (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id           uuid NOT NULL UNIQUE REFERENCES public.products(id) ON DELETE CASCADE,
  stock                integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
  low_stock_threshold  integer NOT NULL DEFAULT 10,
  updated_at           timestamptz NOT NULL DEFAULT now()
);

-- 2.13 Coupons
CREATE TABLE public.coupons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text UNIQUE NOT NULL,
  discount_type   public.discount_type NOT NULL,
  discount_value  numeric(10,2) NOT NULL,
  min_order_amount numeric(10,2),
  max_uses        integer,
  current_uses    integer NOT NULL DEFAULT 0,
  valid_from      timestamptz NOT NULL DEFAULT now(),
  valid_until     timestamptz,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 2.14 Addresses (user saved addresses)
CREATE TABLE public.addresses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  label       text,
  full_name   text NOT NULL,
  phone       text,
  street      text NOT NULL,
  city        text NOT NULL,
  postal_code text NOT NULL,
  province    text NOT NULL,
  country     text NOT NULL DEFAULT 'ES',
  is_default  boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.15 Orders
CREATE TABLE public.orders (
  id                          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid NOT NULL REFERENCES public.profiles(id),
  status                      public.order_status NOT NULL DEFAULT 'pending',
  payment_status              public.payment_status NOT NULL DEFAULT 'pending',
  subtotal                    numeric(10,2) NOT NULL,
  discount_amount             numeric(10,2) NOT NULL DEFAULT 0,
  total                       numeric(10,2) NOT NULL,
  coupon_id                   uuid REFERENCES public.coupons(id),
  stripe_checkout_session_id  text,
  stripe_payment_intent_id    text,
  delivery_type               public.delivery_type NOT NULL DEFAULT 'pickup',
  payment_method              public.payment_method NOT NULL DEFAULT 'stripe',
  delivery_fee                numeric(10,2) NOT NULL DEFAULT 0,
  address_id                  uuid REFERENCES public.addresses(id),
  delivery_date               timestamptz,
  notes                       text,
  buyer_nif                   text,
  created_at                  timestamptz NOT NULL DEFAULT now(),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

-- 2.16 Order items
CREATE TABLE public.order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id),
  quantity    integer NOT NULL CHECK (quantity > 0),
  unit_price  numeric(10,2) NOT NULL,
  total_price numeric(10,2) NOT NULL,
  tax_rate    numeric(5,2) NOT NULL DEFAULT 10.00
);

-- 2.17 Reviews
CREATE TABLE public.reviews (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id),
  product_id        uuid REFERENCES public.products(id),
  rating            integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment           text,
  status            public.review_status NOT NULL DEFAULT 'pending',
  admin_response    text,
  review_type       text NOT NULL DEFAULT 'company',
  is_company_review boolean GENERATED ALWAYS AS (product_id IS NULL) STORED,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

-- 2.18 Review images
CREATE TABLE public.review_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id   uuid NOT NULL REFERENCES public.reviews(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text,
  sort_order  integer NOT NULL DEFAULT 0
);

-- 2.19 CMS content
CREATE TABLE public.cms_content (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section     public.content_section NOT NULL,
  image_url   text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.20 CMS content translations
CREATE TABLE public.cms_content_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id    uuid NOT NULL REFERENCES public.cms_content(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  title         text,
  subtitle      text,
  body          text,
  cta_text      text,
  cta_url       text,
  UNIQUE(content_id, language_code)
);

-- 2.21 CMS media
CREATE TABLE public.cms_media (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id  uuid NOT NULL REFERENCES public.cms_content(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text,
  media_type  text NOT NULL DEFAULT 'image',
  sort_order  integer NOT NULL DEFAULT 0
);

-- 2.22 Timeline events
CREATE TABLE public.timeline_events (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  year        integer NOT NULL,
  image_url   text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.23 Timeline event translations
CREATE TABLE public.timeline_event_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id      uuid NOT NULL REFERENCES public.timeline_events(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  title         text NOT NULL,
  description   text,
  UNIQUE(event_id, language_code)
);

-- 2.24 Feature cards
CREATE TABLE public.feature_cards (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon        text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.25 Feature card translations
CREATE TABLE public.feature_card_translations (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  card_id       uuid NOT NULL REFERENCES public.feature_cards(id) ON DELETE CASCADE,
  language_code text NOT NULL REFERENCES public.languages(code),
  title         text NOT NULL,
  description   text,
  UNIQUE(card_id, language_code)
);

-- 2.26 Business info
CREATE TABLE public.business_info (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key         text UNIQUE NOT NULL,
  value       text NOT NULL,
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.27 Business info translations
CREATE TABLE public.business_info_translations (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_info_id uuid NOT NULL REFERENCES public.business_info(id) ON DELETE CASCADE,
  language_code    text NOT NULL REFERENCES public.languages(code),
  value            text NOT NULL,
  UNIQUE(business_info_id, language_code)
);

-- 2.28 Social links
CREATE TABLE public.social_links (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform    text NOT NULL,
  url         text NOT NULL,
  icon        text,
  sort_order  integer NOT NULL DEFAULT 0,
  is_visible  boolean NOT NULL DEFAULT true
);

-- 2.29 Production schedule (permanent base calendar)
CREATE TABLE public.production_schedule (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  day_of_week   integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  base_quantity integer NOT NULL CHECK (base_quantity > 0),
  is_active     boolean NOT NULL DEFAULT true,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(product_id, day_of_week)
);

-- 2.30 Notifications
CREATE TABLE public.notifications (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        public.notification_type NOT NULL,
  title       text NOT NULL,
  message     text NOT NULL,
  data        jsonb,
  is_read     boolean NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.31 Audit log
CREATE TABLE public.audit_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id),
  action      public.audit_action NOT NULL,
  table_name  text NOT NULL,
  record_id   text NOT NULL,
  old_data    jsonb,
  new_data    jsonb,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.32 Invoices
CREATE TABLE public.invoices (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        uuid NOT NULL UNIQUE REFERENCES public.orders(id),
  invoice_number  text UNIQUE NOT NULL,
  invoice_date    timestamptz NOT NULL DEFAULT now(),
  seller_name     text NOT NULL,
  seller_nif      text NOT NULL,
  seller_address  text NOT NULL,
  buyer_name      text NOT NULL,
  buyer_nif       text,
  buyer_address   text,
  buyer_email     text,
  subtotal_base   numeric(10,2) NOT NULL,
  total_iva       numeric(10,2) NOT NULL,
  total           numeric(10,2) NOT NULL,
  discount_amount numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee    numeric(10,2) NOT NULL DEFAULT 0,
  pdf_url         text,
  sent_at         timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- 2.33 Invoice items
CREATE TABLE public.invoice_items (
  id                   uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id           uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  product_name         text NOT NULL,
  quantity             integer NOT NULL,
  unit_price_incl_iva  numeric(10,2) NOT NULL,
  tax_rate             numeric(5,2) NOT NULL,
  unit_base            numeric(10,2) NOT NULL,
  line_base            numeric(10,2) NOT NULL,
  line_iva             numeric(10,2) NOT NULL,
  line_total           numeric(10,2) NOT NULL
);

-- 2.34 Inventory movements
CREATE TABLE public.inventory_movements (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  movement_type public.inventory_movement_type NOT NULL,
  quantity      integer NOT NULL,
  reference_id  text,
  notes         text,
  created_by    uuid REFERENCES public.profiles(id),
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- 2.35 Daily inventory reports
CREATE TABLE public.daily_inventory_reports (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_date date UNIQUE NOT NULL,
  created_by  uuid NOT NULL REFERENCES public.profiles(id),
  notes       text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- 2.36 Daily inventory report items
CREATE TABLE public.daily_inventory_report_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id     uuid NOT NULL REFERENCES public.daily_inventory_reports(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES public.products(id),
  produced      integer NOT NULL DEFAULT 0,
  sold_online   integer NOT NULL DEFAULT 0,
  sold_physical integer NOT NULL DEFAULT 0,
  damaged       integer NOT NULL DEFAULT 0,
  leftover      integer NOT NULL DEFAULT 0,
  UNIQUE(report_id, product_id)
);

-- 2.37 Recurring order schedules (B2B)
CREATE TABLE public.recurring_order_schedules (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_name  text NOT NULL,
  contact_name   text,
  contact_phone  text,
  delivery_type  public.delivery_type NOT NULL DEFAULT 'pickup',
  address_id     uuid REFERENCES public.addresses(id),
  payment_method public.payment_method NOT NULL DEFAULT 'cash',
  notes          text,
  is_active      boolean NOT NULL DEFAULT true,
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

-- 2.38 Recurring order items
CREATE TABLE public.recurring_order_items (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  schedule_id uuid NOT NULL REFERENCES public.recurring_order_schedules(id) ON DELETE CASCADE,
  product_id  uuid NOT NULL REFERENCES public.products(id),
  day_of_week integer NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 7),
  quantity    integer NOT NULL CHECK (quantity > 0),
  is_active   boolean NOT NULL DEFAULT true,
  UNIQUE(schedule_id, product_id, day_of_week)
);

-- ---------------------------------------------------------------------------
-- 3. SEQUENCES (for invoice numbering)
-- ---------------------------------------------------------------------------

CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START WITH 1;

-- ---------------------------------------------------------------------------
-- 4. INDEXES
-- ---------------------------------------------------------------------------

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_categories_visible_sort ON public.categories(is_visible, sort_order);
CREATE INDEX idx_products_visible_sort ON public.products(is_visible, sort_order);
CREATE INDEX idx_products_landing ON public.products(display_on_landing) WHERE display_on_landing = true;
CREATE INDEX idx_product_translations_pid_lang ON public.product_translations(product_id, language_code);
CREATE INDEX idx_category_translations_cid_lang ON public.category_translations(category_id, language_code);
CREATE INDEX idx_orders_user_created ON public.orders(user_id, created_at DESC);
CREATE INDEX idx_orders_delivery ON public.orders(delivery_date);
CREATE INDEX idx_order_items_order ON public.order_items(order_id);
CREATE INDEX idx_reviews_status_created ON public.reviews(status, created_at DESC);
CREATE INDEX idx_reviews_product_status ON public.reviews(product_id, status);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_coupons_code_active ON public.coupons(code, is_active);
CREATE INDEX idx_cms_content_section ON public.cms_content(section, is_visible);
CREATE INDEX idx_audit_log_created ON public.audit_log(created_at DESC);
CREATE INDEX idx_production_schedule_product ON public.production_schedule(product_id);
CREATE INDEX idx_addresses_user ON public.addresses(user_id);
CREATE INDEX idx_invoices_order ON public.invoices(order_id);
CREATE INDEX idx_inventory_movements_product ON public.inventory_movements(product_id, created_at DESC);
CREATE INDEX idx_recurring_schedules_user ON public.recurring_order_schedules(user_id);

-- ---------------------------------------------------------------------------
-- 5. HELPER FUNCTIONS (used by RLS policies)
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS public.user_role
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_admin_or_above()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_marketing_or_above()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role IN ('marketing', 'admin', 'super_admin')
  );
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- 6. RPC FUNCTIONS
-- ---------------------------------------------------------------------------

-- Atomically increment coupon uses
CREATE OR REPLACE FUNCTION public.increment_coupon_uses(coupon_id uuid)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.coupons
  SET current_uses = current_uses + 1
  WHERE id = coupon_id;
END;
$$;

-- Atomically decrement inventory stock (legacy, kept for compatibility)
CREATE OR REPLACE FUNCTION public.decrement_stock(p_product_id uuid, p_quantity integer)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.inventory
  SET stock = GREATEST(0, stock - p_quantity),
      updated_at = now()
  WHERE product_id = p_product_id;
END;
$$;

-- Record inventory movement + update stock atomically
CREATE OR REPLACE FUNCTION public.record_inventory_movement(
  p_product_id uuid,
  p_movement_type text,
  p_quantity integer,
  p_reference_id text DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  -- Insert movement record
  INSERT INTO public.inventory_movements (product_id, movement_type, quantity, reference_id, notes, created_by)
  VALUES (p_product_id, p_movement_type::public.inventory_movement_type, p_quantity, p_reference_id, p_notes, auth.uid());

  -- Update stock (create inventory row if missing)
  INSERT INTO public.inventory (product_id, stock, low_stock_threshold)
  VALUES (p_product_id, GREATEST(0, p_quantity), 5)
  ON CONFLICT (product_id) DO UPDATE
  SET stock = GREATEST(0, public.inventory.stock + p_quantity),
      updated_at = now();
END;
$$;

-- Generate sequential invoice number (FAC-YYYY-NNNNN)
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  seq_val integer;
BEGIN
  seq_val := nextval('public.invoice_number_seq');
  RETURN 'FAC-' || EXTRACT(YEAR FROM now())::text || '-' || LPAD(seq_val::text, 5, '0');
END;
$$;

-- ---------------------------------------------------------------------------
-- 7. TRIGGERS
-- ---------------------------------------------------------------------------

-- 7.1 Auto-create profile on new auth user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, preferred_language)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE
      WHEN NEW.email = 'pinedacuevaerick910@gmail.com' THEN 'super_admin'::public.user_role
      ELSE 'user'::public.user_role
    END,
    'es'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7.2 Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_cms_content_updated_at BEFORE UPDATE ON public.cms_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_timeline_events_updated_at BEFORE UPDATE ON public.timeline_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_feature_cards_updated_at BEFORE UPDATE ON public.feature_cards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_production_schedule_updated_at BEFORE UPDATE ON public.production_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trg_recurring_schedules_updated_at BEFORE UPDATE ON public.recurring_order_schedules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 7.3 Auto-create inventory row when product is created
CREATE OR REPLACE FUNCTION public.auto_create_inventory()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.inventory (product_id, stock, low_stock_threshold)
  VALUES (NEW.id, 0, 5)
  ON CONFLICT (product_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_auto_create_inventory
  AFTER INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.auto_create_inventory();

-- 7.4 Low stock notification
CREATE OR REPLACE FUNCTION public.check_low_stock()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  IF NEW.stock <= NEW.low_stock_threshold AND (OLD.stock IS NULL OR OLD.stock > OLD.low_stock_threshold) THEN
    INSERT INTO public.notifications (user_id, type, title, message, data)
    SELECT p.id, 'low_stock', 'Stock bajo',
      'El producto esta por debajo del umbral de stock.',
      jsonb_build_object('product_id', NEW.product_id, 'stock', NEW.stock)
    FROM public.profiles p
    WHERE p.role IN ('admin', 'super_admin');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_check_low_stock
  AFTER UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.check_low_stock();

-- 7.5 Notify admins on new order
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT p.id, 'new_order', 'Nuevo pedido',
    'Se ha recibido un nuevo pedido.',
    jsonb_build_object('order_id', NEW.id, 'total', NEW.total)
  FROM public.profiles p
  WHERE p.role IN ('admin', 'super_admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_order
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();

-- 7.6 Notify admins on new review
CREATE OR REPLACE FUNCTION public.notify_new_review()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, data)
  SELECT p.id, 'new_review', 'Nueva resena',
    'Se ha recibido una nueva resena pendiente de moderacion.',
    jsonb_build_object('review_id', NEW.id, 'rating', NEW.rating)
  FROM public.profiles p
  WHERE p.role IN ('admin', 'super_admin');
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_notify_new_review
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_review();

-- ---------------------------------------------------------------------------
-- 8. ENABLE RLS ON ALL TABLES
-- ---------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredient_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparation_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.preparation_step_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.review_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_content_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cms_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_event_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_card_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_info_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.production_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_inventory_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_inventory_report_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_order_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_order_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 9. RLS POLICIES
-- ---------------------------------------------------------------------------

-- ===== PROFILES =====
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid()) WITH CHECK (id = auth.uid());
CREATE POLICY "Super admin can update any profile" ON public.profiles FOR UPDATE USING (public.is_super_admin());

-- ===== LANGUAGES =====
CREATE POLICY "Anyone can read languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert languages" ON public.languages FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update languages" ON public.languages FOR UPDATE USING (public.is_marketing_or_above());

-- ===== CATEGORIES =====
CREATE POLICY "Anyone can read visible categories" ON public.categories FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can read all categories" ON public.categories FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (public.is_admin_or_above());

-- ===== CATEGORY TRANSLATIONS =====
CREATE POLICY "Anyone can read category translations" ON public.category_translations FOR SELECT USING (true);
CREATE POLICY "Admins can insert category translations" ON public.category_translations FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update category translations" ON public.category_translations FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete category translations" ON public.category_translations FOR DELETE USING (public.is_admin_or_above());

-- ===== PRODUCTS =====
CREATE POLICY "Anyone can read visible products" ON public.products FOR SELECT USING (is_visible = true);
CREATE POLICY "Admins can read all products" ON public.products FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (public.is_admin_or_above());

-- ===== PRODUCT TRANSLATIONS =====
CREATE POLICY "Anyone can read product translations" ON public.product_translations FOR SELECT USING (true);
CREATE POLICY "Admins can insert product translations" ON public.product_translations FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update product translations" ON public.product_translations FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete product translations" ON public.product_translations FOR DELETE USING (public.is_admin_or_above());

-- ===== PRODUCT IMAGES =====
CREATE POLICY "Anyone can read product images" ON public.product_images FOR SELECT USING (true);
CREATE POLICY "Admins can insert product images" ON public.product_images FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update product images" ON public.product_images FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete product images" ON public.product_images FOR DELETE USING (public.is_admin_or_above());

-- ===== INGREDIENTS =====
CREATE POLICY "Anyone can read ingredients" ON public.ingredients FOR SELECT USING (true);
CREATE POLICY "Admins can insert ingredients" ON public.ingredients FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update ingredients" ON public.ingredients FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete ingredients" ON public.ingredients FOR DELETE USING (public.is_admin_or_above());

-- ===== INGREDIENT TRANSLATIONS =====
CREATE POLICY "Anyone can read ingredient translations" ON public.ingredient_translations FOR SELECT USING (true);
CREATE POLICY "Admins can insert ingredient translations" ON public.ingredient_translations FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update ingredient translations" ON public.ingredient_translations FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete ingredient translations" ON public.ingredient_translations FOR DELETE USING (public.is_admin_or_above());

-- ===== PREPARATION STEPS =====
CREATE POLICY "Anyone can read preparation steps" ON public.preparation_steps FOR SELECT USING (true);
CREATE POLICY "Admins can insert preparation steps" ON public.preparation_steps FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update preparation steps" ON public.preparation_steps FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete preparation steps" ON public.preparation_steps FOR DELETE USING (public.is_admin_or_above());

-- ===== PREPARATION STEP TRANSLATIONS =====
CREATE POLICY "Anyone can read step translations" ON public.preparation_step_translations FOR SELECT USING (true);
CREATE POLICY "Admins can insert step translations" ON public.preparation_step_translations FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update step translations" ON public.preparation_step_translations FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete step translations" ON public.preparation_step_translations FOR DELETE USING (public.is_admin_or_above());

-- ===== INVENTORY =====
CREATE POLICY "Anyone can read inventory" ON public.inventory FOR SELECT USING (true);
CREATE POLICY "Admins can insert inventory" ON public.inventory FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update inventory" ON public.inventory FOR UPDATE USING (public.is_admin_or_above());

-- ===== COUPONS =====
CREATE POLICY "Anyone can read coupons" ON public.coupons FOR SELECT USING (true);
CREATE POLICY "Admins can insert coupons" ON public.coupons FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update coupons" ON public.coupons FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete coupons" ON public.coupons FOR DELETE USING (public.is_admin_or_above());

-- ===== ADDRESSES =====
CREATE POLICY "Users can read own addresses" ON public.addresses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can read all addresses" ON public.addresses FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Users can insert own addresses" ON public.addresses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own addresses" ON public.addresses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete own addresses" ON public.addresses FOR DELETE USING (user_id = auth.uid());

-- ===== ORDERS =====
CREATE POLICY "Users can read own orders" ON public.orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can read all orders" ON public.orders FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Authenticated users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (public.is_admin_or_above());

-- ===== ORDER ITEMS =====
CREATE POLICY "Users can read own order items" ON public.order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can read all order items" ON public.order_items FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Authenticated users can insert order items" ON public.order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ===== REVIEWS =====
CREATE POLICY "Anyone can read approved reviews" ON public.reviews FOR SELECT USING (status = 'approved');
CREATE POLICY "Admins can read all reviews" ON public.reviews FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Users can read own reviews" ON public.reviews FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Authenticated users can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_id = auth.uid());
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE USING (public.is_admin_or_above());

-- ===== REVIEW IMAGES =====
CREATE POLICY "Anyone can read review images" ON public.review_images FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert review images" ON public.review_images FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete review images" ON public.review_images FOR DELETE USING (public.is_admin_or_above());

-- ===== CMS CONTENT =====
CREATE POLICY "Anyone can read CMS content" ON public.cms_content FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert CMS content" ON public.cms_content FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update CMS content" ON public.cms_content FOR UPDATE USING (public.is_marketing_or_above());

-- ===== CMS CONTENT TRANSLATIONS =====
CREATE POLICY "Anyone can read CMS translations" ON public.cms_content_translations FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert CMS translations" ON public.cms_content_translations FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update CMS translations" ON public.cms_content_translations FOR UPDATE USING (public.is_marketing_or_above());

-- ===== CMS MEDIA =====
CREATE POLICY "Anyone can read CMS media" ON public.cms_media FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert CMS media" ON public.cms_media FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update CMS media" ON public.cms_media FOR UPDATE USING (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can delete CMS media" ON public.cms_media FOR DELETE USING (public.is_marketing_or_above());

-- ===== TIMELINE EVENTS =====
CREATE POLICY "Anyone can read timeline events" ON public.timeline_events FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert timeline events" ON public.timeline_events FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update timeline events" ON public.timeline_events FOR UPDATE USING (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can delete timeline events" ON public.timeline_events FOR DELETE USING (public.is_marketing_or_above());

-- ===== TIMELINE EVENT TRANSLATIONS =====
CREATE POLICY "Anyone can read timeline translations" ON public.timeline_event_translations FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert timeline translations" ON public.timeline_event_translations FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update timeline translations" ON public.timeline_event_translations FOR UPDATE USING (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can delete timeline translations" ON public.timeline_event_translations FOR DELETE USING (public.is_marketing_or_above());

-- ===== FEATURE CARDS =====
CREATE POLICY "Anyone can read feature cards" ON public.feature_cards FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert feature cards" ON public.feature_cards FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update feature cards" ON public.feature_cards FOR UPDATE USING (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can delete feature cards" ON public.feature_cards FOR DELETE USING (public.is_marketing_or_above());

-- ===== FEATURE CARD TRANSLATIONS =====
CREATE POLICY "Anyone can read card translations" ON public.feature_card_translations FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert card translations" ON public.feature_card_translations FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update card translations" ON public.feature_card_translations FOR UPDATE USING (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can delete card translations" ON public.feature_card_translations FOR DELETE USING (public.is_marketing_or_above());

-- ===== BUSINESS INFO =====
CREATE POLICY "Anyone can read business info" ON public.business_info FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert business info" ON public.business_info FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update business info" ON public.business_info FOR UPDATE USING (public.is_marketing_or_above());

-- ===== BUSINESS INFO TRANSLATIONS =====
CREATE POLICY "Anyone can read business info translations" ON public.business_info_translations FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert business info translations" ON public.business_info_translations FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update business info translations" ON public.business_info_translations FOR UPDATE USING (public.is_marketing_or_above());

-- ===== SOCIAL LINKS =====
CREATE POLICY "Anyone can read social links" ON public.social_links FOR SELECT USING (true);
CREATE POLICY "Marketing+ can insert social links" ON public.social_links FOR INSERT WITH CHECK (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can update social links" ON public.social_links FOR UPDATE USING (public.is_marketing_or_above());
CREATE POLICY "Marketing+ can delete social links" ON public.social_links FOR DELETE USING (public.is_marketing_or_above());

-- ===== PRODUCTION SCHEDULE =====
CREATE POLICY "Admins can read production schedule" ON public.production_schedule FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert production schedule" ON public.production_schedule FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update production schedule" ON public.production_schedule FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Admins can delete production schedule" ON public.production_schedule FOR DELETE USING (public.is_admin_or_above());

-- ===== NOTIFICATIONS =====
CREATE POLICY "Users can read own notifications" ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- ===== AUDIT LOG =====
CREATE POLICY "Super admin can read audit log" ON public.audit_log FOR SELECT USING (public.is_super_admin());
CREATE POLICY "System can insert audit log" ON public.audit_log FOR INSERT WITH CHECK (true);

-- ===== INVOICES =====
CREATE POLICY "Users can read own invoices" ON public.invoices FOR SELECT USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = invoices.order_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can read all invoices" ON public.invoices FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert invoices" ON public.invoices FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update invoices" ON public.invoices FOR UPDATE USING (public.is_admin_or_above());

-- ===== INVOICE ITEMS =====
CREATE POLICY "Users can read own invoice items" ON public.invoice_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.invoices JOIN public.orders ON orders.id = invoices.order_id WHERE invoices.id = invoice_items.invoice_id AND orders.user_id = auth.uid()));
CREATE POLICY "Admins can read all invoice items" ON public.invoice_items FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert invoice items" ON public.invoice_items FOR INSERT WITH CHECK (public.is_admin_or_above());

-- ===== INVENTORY MOVEMENTS =====
CREATE POLICY "Admins can read inventory movements" ON public.inventory_movements FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert inventory movements" ON public.inventory_movements FOR INSERT WITH CHECK (public.is_admin_or_above());

-- ===== DAILY INVENTORY REPORTS =====
CREATE POLICY "Admins can read daily reports" ON public.daily_inventory_reports FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert daily reports" ON public.daily_inventory_reports FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update daily reports" ON public.daily_inventory_reports FOR UPDATE USING (public.is_admin_or_above());

-- ===== DAILY INVENTORY REPORT ITEMS =====
CREATE POLICY "Admins can read daily report items" ON public.daily_inventory_report_items FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Admins can insert daily report items" ON public.daily_inventory_report_items FOR INSERT WITH CHECK (public.is_admin_or_above());
CREATE POLICY "Admins can update daily report items" ON public.daily_inventory_report_items FOR UPDATE USING (public.is_admin_or_above());

-- ===== RECURRING ORDER SCHEDULES =====
CREATE POLICY "Users can read own recurring schedules" ON public.recurring_order_schedules FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can read all recurring schedules" ON public.recurring_order_schedules FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Users can insert own recurring schedules" ON public.recurring_order_schedules FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own recurring schedules" ON public.recurring_order_schedules FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can update all recurring schedules" ON public.recurring_order_schedules FOR UPDATE USING (public.is_admin_or_above());
CREATE POLICY "Users can delete own recurring schedules" ON public.recurring_order_schedules FOR DELETE USING (user_id = auth.uid());

-- ===== RECURRING ORDER ITEMS =====
CREATE POLICY "Users can read own recurring items" ON public.recurring_order_items FOR SELECT USING (EXISTS (SELECT 1 FROM public.recurring_order_schedules WHERE recurring_order_schedules.id = recurring_order_items.schedule_id AND recurring_order_schedules.user_id = auth.uid()));
CREATE POLICY "Admins can read all recurring items" ON public.recurring_order_items FOR SELECT USING (public.is_admin_or_above());
CREATE POLICY "Users can insert own recurring items" ON public.recurring_order_items FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM public.recurring_order_schedules WHERE recurring_order_schedules.id = recurring_order_items.schedule_id AND recurring_order_schedules.user_id = auth.uid()));
CREATE POLICY "Users can update own recurring items" ON public.recurring_order_items FOR UPDATE USING (EXISTS (SELECT 1 FROM public.recurring_order_schedules WHERE recurring_order_schedules.id = recurring_order_items.schedule_id AND recurring_order_schedules.user_id = auth.uid()));
CREATE POLICY "Users can delete own recurring items" ON public.recurring_order_items FOR DELETE USING (EXISTS (SELECT 1 FROM public.recurring_order_schedules WHERE recurring_order_schedules.id = recurring_order_items.schedule_id AND recurring_order_schedules.user_id = auth.uid()));

-- ---------------------------------------------------------------------------
-- 10. SEED DATA
-- ---------------------------------------------------------------------------

INSERT INTO public.languages (code, name, native_name, is_active, sort_order) VALUES
  ('es', 'Spanish', 'Espanol', true, 0),
  ('en', 'English', 'English', true, 1),
  ('ca', 'Catalan', 'Catala', true, 2);
