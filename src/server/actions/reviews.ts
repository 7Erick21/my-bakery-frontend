'use server';

import { revalidatePath } from 'next/cache';

import { requireAuth, requireRole } from '@/lib/auth/helpers';
import { deleteCloudinaryImages } from '@/lib/cloudinary/delete';
import { createClient } from '@/lib/supabase/server';
import type { ReviewStatus } from '@/lib/supabase/types';

export async function createReview(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const productId = (formData.get('product_id') as string) || null;
  const rating = Number(formData.get('rating'));
  const comment = formData.get('comment') as string;
  const reviewType = productId ? 'product' : 'company';

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      product_id: productId,
      rating,
      comment,
      review_type: reviewType,
      status: 'approved'
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  // Handle review images
  const imageUrls = formData.getAll('image_urls') as string[];
  if (imageUrls.length > 0) {
    await supabase.from('review_images').insert(
      imageUrls.map(url => ({
        review_id: review.id,
        url
      }))
    );
  }

  revalidatePath('/');
  revalidatePath('/reviews');
  if (productId) revalidatePath('/products');
}

export async function updateReviewStatus(reviewId: string, status: ReviewStatus) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase.from('reviews').update({ status }).eq('id', reviewId);
  if (error) throw new Error(error.message);

  revalidatePath('/reviews');
  revalidatePath('/dashboard/reviews');
}

export async function addAdminResponse(reviewId: string, response: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase
    .from('reviews')
    .update({ admin_response: response })
    .eq('id', reviewId);
  if (error) throw new Error(error.message);

  revalidatePath('/reviews');
  revalidatePath('/dashboard/reviews');
}

export async function deleteReview(reviewId: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  // Fetch image URLs before deleting
  const { data: images } = await supabase
    .from('review_images')
    .select('url')
    .eq('review_id', reviewId);

  // Delete from Cloudinary
  if (images && images.length > 0) {
    await deleteCloudinaryImages(images.map(img => img.url));
  }

  await supabase.from('review_images').delete().eq('review_id', reviewId);
  await supabase.from('reviews').delete().eq('id', reviewId);

  revalidatePath('/');
  revalidatePath('/reviews');
  revalidatePath('/dashboard/reviews');
}
