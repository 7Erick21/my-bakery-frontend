import type { ReviewAdmin, ReviewWithProfile } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getApprovedReviews(productId?: string): Promise<ReviewWithProfile[]> {
  const supabase = await createClient();

  let query = supabase
    .from('reviews')
    .select(
      `
      id, rating, comment, review_type, created_at,
      profiles(full_name, avatar_url),
      review_images(url),
      products(slug, product_translations(name, language_code))
    `
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (productId) {
    query = query.eq('product_id', productId);
  }

  const { data } = await query;
  return (data ?? []) as unknown as ReviewWithProfile[];
}

export async function getAllReviewsAdmin(): Promise<ReviewAdmin[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reviews')
    .select(
      `
      id, rating, comment, status, review_type, created_at,
      profiles(full_name, email),
      products(slug, product_translations(name, language_code)),
      review_images(url),
      admin_response
    `
    )
    .order('created_at', { ascending: false });

  return (data ?? []) as unknown as ReviewAdmin[];
}

export async function getLatestReviews(limit = 6): Promise<ReviewWithProfile[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reviews')
    .select(
      `
      id, rating, comment, review_type, created_at,
      profiles(full_name, avatar_url),
      review_images(url),
      products(slug, product_translations(name, language_code))
    `
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []) as unknown as ReviewWithProfile[];
}

export async function getPaginatedReviews({
  page = 1,
  pageSize = 12,
  rating,
  reviewType,
  hasImages
}: {
  page?: number;
  pageSize?: number;
  rating?: number;
  reviewType?: string;
  hasImages?: boolean;
}) {
  const supabase = await createClient();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('reviews')
    .select(
      `
      id, rating, comment, review_type, created_at,
      profiles(full_name, avatar_url),
      review_images(url),
      products(slug, product_translations(name, language_code))
    `,
      { count: 'exact' }
    )
    .eq('status', 'approved')
    .order('created_at', { ascending: false });

  if (rating) {
    query = query.eq('rating', rating);
  }
  if (reviewType) {
    query = query.eq('review_type', reviewType);
  }

  const { data, count } = await query.range(from, to);

  let filtered = (data ?? []) as unknown as ReviewWithProfile[];

  // Client-side filter for reviews with images (Supabase doesn't support filtering by related count)
  if (hasImages) {
    filtered = filtered.filter(r => r.review_images?.length > 0);
  }

  return { data: filtered, total: hasImages ? filtered.length : (count ?? 0) };
}

export async function getReviewStats() {
  const supabase = await createClient();

  const { data, count } = await supabase
    .from('reviews')
    .select('rating', { count: 'exact' })
    .eq('status', 'approved');

  const total = count ?? 0;
  const avg = total > 0 ? (data?.reduce((sum, r) => sum + r.rating, 0) ?? 0) / total : 0;

  return { average: avg.toFixed(1), total };
}

export async function getReviewById(id: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reviews')
    .select(
      `
      id, user_id, product_id, rating, comment, status, review_type,
      admin_response, created_at,
      profiles(full_name, email, avatar_url),
      products(slug, product_translations(name, language_code)),
      review_images(id, url)
    `
    )
    .eq('id', id)
    .single();

  return data as unknown as ReviewAdmin | null;
}
