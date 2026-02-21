import type {
  ProductAdmin,
  ProductAdminListItem,
  ProductDetail,
  ProductListItem,
  RelatedProduct
} from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getProducts(lang = 'es'): Promise<ProductListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(
      `
      id, slug, price, compare_at_price, is_featured, display_on_landing,
      sort_order, preparation_time_minutes, weight_grams, season_tags,
      category_id,
      product_translations!inner(name, short_description, description),
      product_images(id, url, alt_text, sort_order, is_primary),
      categories!inner(slug, category_translations!inner(name))
    `
    )
    .eq('is_visible', true)
    .eq('product_translations.language_code', lang)
    .eq('categories.category_translations.language_code', lang)
    .order('sort_order');

  return (data ?? []) as unknown as ProductListItem[];
}

export async function getFeaturedProducts(lang = 'es'): Promise<ProductListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(
      `
      id, slug, price, compare_at_price, is_featured, display_on_landing,
      sort_order,
      product_translations!inner(name, short_description, description),
      product_images(id, url, alt_text, sort_order, is_primary)
    `
    )
    .eq('is_visible', true)
    .eq('display_on_landing', true)
    .eq('product_translations.language_code', lang)
    .order('sort_order')
    .limit(6);

  return (data ?? []) as unknown as ProductListItem[];
}

export async function getProductBySlug(slug: string, lang = 'es'): Promise<ProductDetail | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(
      `
      id, slug, price, compare_at_price, is_featured,
      preparation_time_minutes, weight_grams, season_tags,
      category_id,
      product_translations!inner(name, short_description, description),
      product_images(id, url, alt_text, sort_order, is_primary),
      categories!inner(slug, category_translations!inner(name)),
      ingredients(
        id, sort_order, is_allergen,
        ingredient_translations!inner(name)
      ),
      preparation_steps(
        id, step_number, image_url, duration_minutes,
        preparation_step_translations!inner(title, description)
      )
    `
    )
    .eq('slug', slug)
    .eq('is_visible', true)
    .eq('product_translations.language_code', lang)
    .eq('categories.category_translations.language_code', lang)
    .eq('ingredients.ingredient_translations.language_code', lang)
    .eq('preparation_steps.preparation_step_translations.language_code', lang)
    .single();

  return (data as unknown as ProductDetail) ?? null;
}

export async function getProductById(id: string): Promise<ProductAdmin | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(
      `
      id, slug, price, tax_rate, compare_at_price, is_visible, is_featured,
      display_on_landing, sort_order, preparation_time_minutes,
      weight_grams, season_tags, category_id, created_at, updated_at,
      product_translations(id, language_code, name, short_description, description),
      product_images(id, url, alt_text, sort_order, is_primary),
      ingredients(id, sort_order, is_allergen, ingredient_translations(id, language_code, name)),
      preparation_steps(id, step_number, image_url, duration_minutes, preparation_step_translations(id, language_code, title, description))
    `
    )
    .eq('id', id)
    .single();

  return (data as unknown as ProductAdmin) ?? null;
}

export async function getRelatedProducts(
  categoryId: string,
  excludeProductId: string,
  lang = 'es'
): Promise<RelatedProduct[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(
      `
      id, slug, price, compare_at_price,
      product_translations!inner(name),
      product_images(url, is_primary)
    `
    )
    .eq('is_visible', true)
    .eq('category_id', categoryId)
    .neq('id', excludeProductId)
    .eq('product_translations.language_code', lang)
    .order('sort_order')
    .limit(4);

  return (data ?? []) as unknown as RelatedProduct[];
}

export async function getAllProductsAdmin(): Promise<ProductAdminListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('products')
    .select(
      `
      id, slug, price, is_visible, is_featured, display_on_landing,
      sort_order, created_at,
      product_translations(language_code, name),
      product_images(url, is_primary),
      categories(slug, category_translations(language_code, name)),
      inventory(stock, low_stock_threshold)
    `
    )
    .order('sort_order');

  return (data ?? []) as unknown as ProductAdminListItem[];
}
