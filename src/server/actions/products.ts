'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/helpers';
import { deleteCloudinaryImages } from '@/lib/cloudinary/delete';
import type {
  IngredientInput,
  PreparationStepInput,
  ProductImageInput,
  ProductTranslationInput,
  TypedSupabaseClient
} from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';
import type { Database, SeasonTag } from '@/lib/supabase/types';

type ProductUpdate = Database['public']['Tables']['products']['Update'];

export async function createProduct(formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const slug = formData.get('slug') as string;
  const categoryId = formData.get('category_id') as string;
  const price = Number(formData.get('price'));
  const taxRate = formData.get('tax_rate') ? Number(formData.get('tax_rate')) : 10;
  const compareAtPrice = formData.get('compare_at_price')
    ? Number(formData.get('compare_at_price'))
    : null;
  const isVisible = formData.get('is_visible') === 'true';
  const isFeatured = formData.get('is_featured') === 'true';
  const displayOnLanding = formData.get('display_on_landing') === 'true';
  const sortOrder = Number(formData.get('sort_order') || 0);
  const prepTime = formData.get('preparation_time_minutes')
    ? Number(formData.get('preparation_time_minutes'))
    : null;
  const weight = formData.get('weight_grams') ? Number(formData.get('weight_grams')) : null;
  const seasonTags = formData.get('season_tags')
    ? ((formData.get('season_tags') as string).split(',') as SeasonTag[])
    : ([] as SeasonTag[]);

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      slug,
      category_id: categoryId,
      price,
      tax_rate: taxRate,
      compare_at_price: compareAtPrice,
      is_visible: isVisible,
      is_featured: isFeatured,
      display_on_landing: displayOnLanding,
      sort_order: sortOrder,
      preparation_time_minutes: prepTime,
      weight_grams: weight,
      season_tags: seasonTags
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  // Insert translations
  const translations: ProductTranslationInput[] = JSON.parse(
    (formData.get('translations') as string) || '[]'
  );
  if (translations.length > 0) {
    await supabase.from('product_translations').insert(
      translations.map(t => ({
        product_id: product.id,
        language_code: t.language_code,
        name: t.name,
        short_description: t.short_description || null,
        description: t.description || null
      }))
    );
  }

  // Insert images
  const images: ProductImageInput[] = JSON.parse((formData.get('images') as string) || '[]');
  if (images.length > 0) {
    await supabase.from('product_images').insert(
      images.map((img, idx) => ({
        product_id: product.id,
        url: img.url,
        alt_text: img.alt_text || null,
        sort_order: idx,
        is_primary: idx === 0
      }))
    );
  }

  // Save ingredients if provided
  const ingredientsData = formData.get('ingredients_data');
  if (ingredientsData) {
    await saveIngredients(supabase, product.id, ingredientsData as string);
  }

  // Save preparation steps if provided
  const stepsData = formData.get('steps_data');
  if (stepsData) {
    await savePreparationSteps(supabase, product.id, stepsData as string);
  }

  // Create inventory record
  await supabase.from('inventory').insert({
    product_id: product.id,
    quantity: 0,
    low_stock_threshold: 10
  });

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/dashboard/products');

  return { id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const updates: ProductUpdate = {};
  if (formData.has('slug')) updates.slug = formData.get('slug') as string;
  if (formData.has('category_id')) updates.category_id = formData.get('category_id') as string;
  if (formData.has('price')) updates.price = Number(formData.get('price'));
  if (formData.has('tax_rate')) updates.tax_rate = Number(formData.get('tax_rate'));
  if (formData.has('compare_at_price'))
    updates.compare_at_price = formData.get('compare_at_price')
      ? Number(formData.get('compare_at_price'))
      : null;
  if (formData.has('is_visible')) updates.is_visible = formData.get('is_visible') === 'true';
  if (formData.has('is_featured')) updates.is_featured = formData.get('is_featured') === 'true';
  if (formData.has('display_on_landing'))
    updates.display_on_landing = formData.get('display_on_landing') === 'true';
  if (formData.has('sort_order')) updates.sort_order = Number(formData.get('sort_order'));
  if (formData.has('preparation_time_minutes'))
    updates.preparation_time_minutes = formData.get('preparation_time_minutes')
      ? Number(formData.get('preparation_time_minutes'))
      : null;
  if (formData.has('weight_grams'))
    updates.weight_grams = formData.get('weight_grams')
      ? Number(formData.get('weight_grams'))
      : null;
  if (formData.has('season_tags'))
    updates.season_tags = (formData.get('season_tags') as string)
      .split(',')
      .filter(Boolean) as SeasonTag[];

  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw new Error(error.message);

  // Update translations if provided
  const translations = formData.get('translations');
  if (translations) {
    const parsed: ProductTranslationInput[] = JSON.parse(translations as string);
    for (const t of parsed) {
      if (t.id) {
        await supabase
          .from('product_translations')
          .update({
            name: t.name,
            short_description: t.short_description,
            description: t.description
          })
          .eq('id', t.id);
      } else {
        await supabase.from('product_translations').insert({
          product_id: id,
          language_code: t.language_code,
          name: t.name,
          short_description: t.short_description || null,
          description: t.description || null
        });
      }
    }
  }

  // Update images if provided
  const imagesRaw = formData.get('images');
  if (imagesRaw) {
    const newImages: ProductImageInput[] = JSON.parse(imagesRaw as string);
    const newUrls: string[] = newImages.map(img => img.url);

    // Delete removed images from Cloudinary
    const oldImageUrlsRaw = formData.get('old_image_urls');
    if (oldImageUrlsRaw) {
      const oldUrls: string[] = JSON.parse(oldImageUrlsRaw as string);
      const removedUrls = oldUrls.filter(url => !newUrls.includes(url));
      await deleteCloudinaryImages(removedUrls);
    }

    // Replace product_images: delete old rows, insert new
    await supabase.from('product_images').delete().eq('product_id', id);
    if (newImages.length > 0) {
      await supabase.from('product_images').insert(
        newImages.map((img, idx) => ({
          product_id: id,
          url: img.url,
          alt_text: img.alt_text || null,
          sort_order: idx,
          is_primary: idx === 0
        }))
      );
    }
  }

  // Save ingredients if provided
  const ingredientsData = formData.get('ingredients_data');
  if (ingredientsData) {
    await saveIngredients(supabase, id, ingredientsData as string);
  }

  // Save preparation steps if provided
  const stepsData = formData.get('steps_data');
  if (stepsData) {
    await savePreparationSteps(supabase, id, stepsData as string);
  }

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/dashboard/products');
}

export async function deleteProduct(id: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  // Fetch image URLs before deleting
  const { data: images } = await supabase.from('product_images').select('url').eq('product_id', id);

  // Delete images from Cloudinary
  if (images && images.length > 0) {
    await deleteCloudinaryImages(images.map(img => img.url));
  }

  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/dashboard/products');
}

export async function toggleProductVisibility(id: string, isVisible: boolean) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase.from('products').update({ is_visible: isVisible }).eq('id', id);
  if (error) throw new Error(error.message);

  revalidatePath('/');
  revalidatePath('/products');
  revalidatePath('/dashboard/products');
}

async function saveIngredients(supabase: TypedSupabaseClient, productId: string, jsonData: string) {
  const ingredients: IngredientInput[] = JSON.parse(jsonData);

  // Delete existing ingredients (cascade deletes translations)
  await supabase.from('ingredients').delete().eq('product_id', productId);

  for (const ing of ingredients) {
    const { data: inserted } = await supabase
      .from('ingredients')
      .insert({
        product_id: productId,
        sort_order: ing.sort_order,
        is_allergen: ing.is_allergen ?? false
      })
      .select('id')
      .single();

    if (inserted && ing.translations?.length > 0) {
      await supabase.from('ingredient_translations').insert(
        ing.translations.map(t => ({
          ingredient_id: inserted.id,
          language_code: t.language_code,
          name: t.name
        }))
      );
    }
  }
}

async function savePreparationSteps(
  supabase: TypedSupabaseClient,
  productId: string,
  jsonData: string
) {
  const steps: PreparationStepInput[] = JSON.parse(jsonData);

  // Delete existing steps (cascade deletes translations)
  await supabase.from('preparation_steps').delete().eq('product_id', productId);

  for (const step of steps) {
    const { data: inserted } = await supabase
      .from('preparation_steps')
      .insert({
        product_id: productId,
        step_number: step.step_number,
        image_url: step.image_url || null,
        duration_minutes: step.duration_minutes || null
      })
      .select('id')
      .single();

    if (inserted && step.translations?.length > 0) {
      await supabase.from('preparation_step_translations').insert(
        step.translations.map(t => ({
          step_id: inserted.id,
          language_code: t.language_code,
          title: t.title,
          description: t.description || null
        }))
      );
    }
  }
}
