'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/helpers';
import { deleteCloudinaryImages } from '@/lib/cloudinary/delete';
import type { CategoryTranslationInput } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/supabase/types';

type CategoryUpdate = Database['public']['Tables']['categories']['Update'];

export async function createCategory(formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const slug = formData.get('slug') as string;
  const imageUrl = (formData.get('image_url') as string) || null;
  const sortOrder = Number(formData.get('sort_order') || 0);
  const isVisible = formData.get('is_visible') === 'true';

  const { data: category, error } = await supabase
    .from('categories')
    .insert({ slug, image_url: imageUrl, sort_order: sortOrder, is_visible: isVisible })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  const translations: CategoryTranslationInput[] = JSON.parse(
    (formData.get('translations') as string) || '[]'
  );
  if (translations.length > 0) {
    await supabase.from('category_translations').insert(
      translations.map(t => ({
        category_id: category.id,
        language_code: t.language_code,
        name: t.name,
        description: t.description || null
      }))
    );
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/dashboard/categories');

  return { id: category.id };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const updates: CategoryUpdate = {};
  if (formData.has('slug')) updates.slug = formData.get('slug') as string;
  if (formData.has('image_url')) updates.image_url = (formData.get('image_url') as string) || null;
  if (formData.has('sort_order')) updates.sort_order = Number(formData.get('sort_order'));
  if (formData.has('is_visible')) updates.is_visible = formData.get('is_visible') === 'true';

  const { error } = await supabase.from('categories').update(updates).eq('id', id);
  if (error) throw new Error(error.message);

  // Delete old image from Cloudinary if replaced
  const oldImageUrl = formData.get('old_image_url') as string | null;
  if (oldImageUrl) {
    await deleteCloudinaryImages([oldImageUrl]);
  }

  const translations = formData.get('translations');
  if (translations) {
    const parsed: CategoryTranslationInput[] = JSON.parse(translations as string);
    for (const t of parsed) {
      if (t.id) {
        await supabase
          .from('category_translations')
          .update({ name: t.name, description: t.description })
          .eq('id', t.id);
      } else {
        await supabase.from('category_translations').insert({
          category_id: id,
          language_code: t.language_code,
          name: t.name,
          description: t.description || null
        });
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/dashboard/categories');
}

export async function deleteCategory(id: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  // Check if any products reference this category
  const { count } = await supabase
    .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('category_id', id);

  if (count && count > 0) {
    throw new Error(`No se puede eliminar: hay ${count} producto(s) asociado(s) a esta categoría.`);
  }

  // Fetch image URL before deleting
  const { data: category } = await supabase
    .from('categories')
    .select('image_url')
    .eq('id', id)
    .single();

  // Delete image from Cloudinary
  if (category?.image_url) {
    await deleteCloudinaryImages([category.image_url]);
  }

  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/dashboard/categories');
}
