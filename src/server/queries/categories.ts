import type { CategoryAdmin, CategoryListItem } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getCategories(lang = 'es'): Promise<CategoryListItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select(
      `
      id, slug, image_url, sort_order,
      category_translations!inner(name, description)
    `
    )
    .eq('is_visible', true)
    .eq('category_translations.language_code', lang)
    .order('sort_order');

  return (data ?? []) as CategoryListItem[];
}

export async function getAllCategoriesAdmin(): Promise<CategoryAdmin[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select(
      `
      id, slug, image_url, sort_order, is_visible, created_at,
      category_translations(id, language_code, name, description)
    `
    )
    .order('sort_order');

  return (data ?? []) as CategoryAdmin[];
}

export async function getCategoryById(id: string): Promise<CategoryAdmin | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('categories')
    .select(
      `
      id, slug, image_url, sort_order, is_visible, created_at, updated_at,
      category_translations(id, language_code, name, description)
    `
    )
    .eq('id', id)
    .single();

  return (data as CategoryAdmin) ?? null;
}
