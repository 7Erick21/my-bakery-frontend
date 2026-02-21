import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from './types';

// ──────────────────────────────────────────────
// Helper: shorthand for table types
// ──────────────────────────────────────────────
type Tables = Database['public']['Tables'];

// ──────────────────────────────────────────────
// Row aliases
// ──────────────────────────────────────────────
export type ProductRow = Tables['products']['Row'];
export type ProductTranslationRow = Tables['product_translations']['Row'];
export type ProductImageRow = Tables['product_images']['Row'];
export type CategoryRow = Tables['categories']['Row'];
export type CategoryTranslationRow = Tables['category_translations']['Row'];
export type IngredientRow = Tables['ingredients']['Row'];
export type IngredientTranslationRow = Tables['ingredient_translations']['Row'];
export type PreparationStepRow = Tables['preparation_steps']['Row'];
export type PrepStepTranslationRow = Tables['preparation_step_translations']['Row'];
export type ReviewRow = Tables['reviews']['Row'];
export type ReviewImageRow = Tables['review_images']['Row'];
export type ProfileRow = Tables['profiles']['Row'];
export type OrderRow = Tables['orders']['Row'];
export type OrderItemRow = Tables['order_items']['Row'];
export type CouponRow = Tables['coupons']['Row'];
export type InventoryRow = Tables['inventory']['Row'];
export type CmsContentRow = Tables['cms_content']['Row'];
export type CmsContentTranslationRow = Tables['cms_content_translations']['Row'];
export type NotificationRow = Tables['notifications']['Row'];
export type AuditLogRow = Tables['audit_log']['Row'];
export type ProductionScheduleRow = Tables['production_schedule']['Row'];
export type LanguageRow = Tables['languages']['Row'];
export type AddressRow = Tables['addresses']['Row'];
export type InvoiceRow = Tables['invoices']['Row'];
export type InvoiceItemRow = Tables['invoice_items']['Row'];
export type InventoryMovementRow = Tables['inventory_movements']['Row'];
export type DailyInventoryReportRow = Tables['daily_inventory_reports']['Row'];
export type DailyInventoryReportItemRow = Tables['daily_inventory_report_items']['Row'];
export type RecurringOrderScheduleRow = Tables['recurring_order_schedules']['Row'];
export type RecurringOrderItemRow = Tables['recurring_order_items']['Row'];

// ──────────────────────────────────────────────
// Public composite types (queries with joins)
// ──────────────────────────────────────────────

/** Returned by getProducts / getFeaturedProducts */
export interface ProductListItem {
  id: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  is_featured: boolean;
  display_on_landing: boolean;
  sort_order: number;
  preparation_time_minutes?: number | null;
  weight_grams?: number | null;
  season_tags?: string[];
  category_id: string;
  product_translations: Pick<ProductTranslationRow, 'name' | 'short_description' | 'description'>[];
  product_images: Pick<ProductImageRow, 'id' | 'url' | 'alt_text' | 'sort_order' | 'is_primary'>[];
  categories?: {
    slug: string;
    category_translations: Pick<CategoryTranslationRow, 'name'>[];
  };
}

/** Returned by getProductBySlug */
export interface ProductDetail extends ProductListItem {
  ingredients: {
    id: string;
    sort_order: number;
    is_allergen: boolean;
    ingredient_translations: Pick<IngredientTranslationRow, 'name'>[];
  }[];
  preparation_steps: {
    id: string;
    step_number: number;
    image_url: string | null;
    duration_minutes: number | null;
    preparation_step_translations: Pick<PrepStepTranslationRow, 'title' | 'description'>[];
  }[];
}

/** Returned by getRelatedProducts */
export interface RelatedProduct {
  id: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  product_translations: Pick<ProductTranslationRow, 'name'>[];
  product_images: Pick<ProductImageRow, 'url' | 'is_primary'>[];
}

/** Returned by getCategories */
export interface CategoryListItem {
  id: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  category_translations: Pick<CategoryTranslationRow, 'name' | 'description'>[];
}

/** Returned by getApprovedReviews / getLatestReviews / getPaginatedReviews */
export interface ReviewWithProfile {
  id: string;
  rating: number;
  comment: string | null;
  review_type: string;
  admin_response?: string | null;
  created_at: string;
  profiles: Pick<ProfileRow, 'full_name' | 'avatar_url'> | null;
  review_images: Pick<ReviewImageRow, 'url'>[];
  products: {
    slug: string;
    product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
  } | null;
}

/** Returned by getUserOrders */
export interface OrderListItem {
  id: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  delivery_type: string;
  payment_method: string;
  delivery_fee: number;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    products: {
      slug: string;
      product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
    } | null;
  }[];
  invoices: { id: string }[] | null;
}

/** Returned by getOrderById */
export interface OrderWithItems {
  id: string;
  user_id: string;
  status: string;
  payment_status: string;
  subtotal: number;
  discount_amount: number;
  total: number;
  delivery_type: string;
  payment_method: string;
  delivery_fee: number;
  address_id: string | null;
  delivery_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  coupon_id: string | null;
  stripe_checkout_session_id: string | null;
  order_items: {
    id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    tax_rate: number;
    products: {
      slug: string;
      product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
      product_images: Pick<ProductImageRow, 'url' | 'is_primary'>[];
    } | null;
  }[];
  profiles: Pick<ProfileRow, 'full_name' | 'email'> | null;
  addresses: Pick<AddressRow, 'full_name' | 'street' | 'city' | 'postal_code' | 'province'> | null;
}

// ──────────────────────────────────────────────
// Dashboard (admin) composite types
// ──────────────────────────────────────────────

/** Returned by getProductById (admin — all languages, with IDs) */
export interface ProductAdmin {
  id: string;
  slug: string;
  price: number;
  compare_at_price: number | null;
  tax_rate: number;
  is_visible: boolean;
  is_featured: boolean;
  display_on_landing: boolean;
  sort_order: number;
  preparation_time_minutes: number | null;
  weight_grams: number | null;
  season_tags: string[];
  category_id: string;
  created_at: string;
  updated_at: string;
  product_translations: Pick<
    ProductTranslationRow,
    'id' | 'language_code' | 'name' | 'short_description' | 'description'
  >[];
  product_images: Pick<ProductImageRow, 'id' | 'url' | 'alt_text' | 'sort_order' | 'is_primary'>[];
  ingredients: {
    id: string;
    sort_order: number;
    is_allergen: boolean;
    ingredient_translations: Pick<IngredientTranslationRow, 'id' | 'language_code' | 'name'>[];
  }[];
  preparation_steps: {
    id: string;
    step_number: number;
    image_url: string | null;
    duration_minutes: number | null;
    preparation_step_translations: Pick<
      PrepStepTranslationRow,
      'id' | 'language_code' | 'title' | 'description'
    >[];
  }[];
}

/** Returned by getAllProductsAdmin */
export interface ProductAdminListItem {
  id: string;
  slug: string;
  price: number;
  is_visible: boolean;
  is_featured: boolean;
  display_on_landing: boolean;
  sort_order: number;
  created_at: string;
  product_translations: Pick<ProductTranslationRow, 'language_code' | 'name'>[];
  product_images: Pick<ProductImageRow, 'url' | 'is_primary'>[];
  categories: {
    slug: string;
    category_translations: Pick<CategoryTranslationRow, 'language_code' | 'name'>[];
  } | null;
  inventory: Pick<InventoryRow, 'stock' | 'low_stock_threshold'>[];
}

/** Returned by getAllCategoriesAdmin / getCategoryById */
export interface CategoryAdmin {
  id: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at?: string;
  category_translations: Pick<
    CategoryTranslationRow,
    'id' | 'language_code' | 'name' | 'description'
  >[];
}

/** Returned by getAllReviewsAdmin */
export interface ReviewAdmin {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  review_type: string;
  created_at: string;
  admin_response: string | null;
  profiles: Pick<ProfileRow, 'full_name' | 'email'> | null;
  products: {
    slug: string;
    product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
  } | null;
  review_images: Pick<ReviewImageRow, 'url'>[];
}

/** Returned by getAllOrdersAdmin */
export interface OrderAdmin {
  id: string;
  status: string;
  payment_status: string;
  total: number;
  delivery_type: string;
  payment_method: string;
  delivery_fee: number;
  delivery_date: string | null;
  created_at: string;
  profiles: Pick<ProfileRow, 'full_name' | 'email'> | null;
  order_items: Pick<OrderItemRow, 'quantity'>[];
}

/** Returned by getAllInventory */
export interface InventoryItem {
  id: string;
  product_id: string;
  stock: number;
  low_stock_threshold: number;
  updated_at: string;
  products: {
    slug: string;
    product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
  } | null;
}

/** Returned by getAllCmsContentAdmin / getCmsContentBySection */
export interface CmsContentItem {
  id: string;
  section: string;
  image_url: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
  cms_content_translations: Pick<
    CmsContentTranslationRow,
    'id' | 'language_code' | 'title' | 'subtitle' | 'body' | 'cta_text' | 'cta_url'
  >[];
  cms_media?: {
    id: string;
    url: string;
    alt_text: string | null;
    media_type: string;
    sort_order: number;
  }[];
}

/** Returned by getAuditLog */
export interface AuditEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_data: unknown;
  new_data: unknown;
  created_at: string;
  profiles: Pick<ProfileRow, 'full_name' | 'email'> | null;
}

/** Returned by getAllUsers */
export type UserProfile = Pick<
  ProfileRow,
  'id' | 'full_name' | 'email' | 'avatar_url' | 'role' | 'preferred_language' | 'created_at'
>;

/** Alias for NotificationRow */
export type NotificationItem = NotificationRow;

/** Alias for CouponRow */
export type CouponItem = CouponRow;

/** Returned by getProductionSchedule */
export interface ProductionScheduleItem {
  id: string;
  product_id: string;
  day_of_week: number;
  base_quantity: number;
  is_active: boolean;
  products: {
    slug: string;
    product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
  } | null;
}

/** Aggregated recurring order items for production view */
export interface RecurringProductionItem {
  product_id: string;
  day_of_week: number;
  total_quantity: number;
  details: { business_name: string; quantity: number }[];
  product_name: string;
}

/** Address item */
export type AddressItem = AddressRow;

/** Invoice with items */
export interface InvoiceWithItems extends InvoiceRow {
  invoice_items: InvoiceItemRow[];
}

/** Inventory movement with product info */
export interface InventoryMovementItem {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reference_id: string | null;
  notes: string | null;
  created_at: string;
  profiles: Pick<ProfileRow, 'full_name'> | null;
  products: {
    slug: string;
    product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
  } | null;
}

/** Daily report with items */
export interface DailyReportWithItems {
  id: string;
  report_date: string;
  notes: string | null;
  created_at: string;
  profiles: Pick<ProfileRow, 'full_name'> | null;
  daily_inventory_report_items: {
    id: string;
    product_id: string;
    produced: number;
    sold_online: number;
    sold_physical: number;
    damaged: number;
    leftover: number;
    products: {
      slug: string;
      product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
    } | null;
  }[];
}

/** Recurring schedule with items */
export interface RecurringScheduleWithItems {
  id: string;
  user_id: string;
  business_name: string;
  contact_name: string | null;
  contact_phone: string | null;
  delivery_type: string;
  payment_method: string;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  addresses: Pick<AddressRow, 'full_name' | 'street' | 'city' | 'postal_code'> | null;
  recurring_order_items: {
    id: string;
    product_id: string;
    day_of_week: number;
    quantity: number;
    is_active: boolean;
    products: {
      slug: string;
      price: number;
      product_translations: Pick<ProductTranslationRow, 'name' | 'language_code'>[];
    } | null;
  }[];
  profiles: Pick<ProfileRow, 'full_name' | 'email'> | null;
}

// ──────────────────────────────────────────────
// Landing page composite types (all translations)
// ──────────────────────────────────────────────

export interface LandingTimelineEvent {
  id: string;
  year: number;
  image_url: string | null;
  sort_order: number;
  timeline_event_translations: {
    language_code: string;
    title: string;
    description: string | null;
  }[];
}

export interface LandingFeatureCard {
  id: string;
  icon: string | null;
  sort_order: number;
  feature_card_translations: {
    language_code: string;
    title: string;
    description: string | null;
  }[];
}

export interface LandingBusinessInfoItem {
  id: string;
  key: string;
  value: string;
  business_info_translations: {
    id?: string;
    language_code: string;
    value: string;
  }[];
}

export interface LandingSocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string | null;
  sort_order: number;
}

export interface LandingCmsSection {
  id: string;
  section: string;
  image_url: string | null;
  cms_content_translations: {
    language_code: string;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    cta_text: string | null;
    cta_url: string | null;
  }[];
}

// ──────────────────────────────────────────────
// Input types (parsed from FormData JSON)
// ──────────────────────────────────────────────

export interface ProductTranslationInput {
  id?: string;
  language_code: string;
  name: string;
  short_description?: string | null;
  description?: string | null;
}

export interface ProductImageInput {
  url: string;
  alt_text?: string | null;
  is_primary?: boolean;
}

export interface IngredientTranslationInput {
  language_code: string;
  name: string;
}

export interface IngredientInput {
  sort_order: number;
  is_allergen?: boolean;
  translations: IngredientTranslationInput[];
}

export interface PreparationStepTranslationInput {
  language_code: string;
  title: string;
  description?: string | null;
}

export interface PreparationStepInput {
  step_number: number;
  image_url?: string | null;
  duration_minutes?: number | null;
  translations: PreparationStepTranslationInput[];
}

export interface CategoryTranslationInput {
  id?: string;
  language_code: string;
  name: string;
  description?: string | null;
}

export interface OrderItemInput {
  productId: string;
  price: number;
  quantity: number;
  taxRate?: number;
}

export interface AddressInput {
  label?: string;
  full_name: string;
  phone?: string;
  street: string;
  city: string;
  postal_code: string;
  province: string;
  country?: string;
  is_default?: boolean;
}

export interface CmsTranslationInput {
  id?: string;
  language_code: string;
  title?: string | null;
  subtitle?: string | null;
  body?: string | null;
  cta_text?: string | null;
  cta_url?: string | null;
}

// ──────────────────────────────────────────────
// Typed Supabase client — uses Awaited<ReturnType> to match whatever createClient returns
// ──────────────────────────────────────────────
export type TypedSupabaseClient = SupabaseClient;
