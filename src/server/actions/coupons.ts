'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';
import type { DiscountType } from '@/lib/supabase/types';

export async function createCoupon(formData: FormData) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  const { error } = await supabase.from('coupons').insert({
    code: (formData.get('code') as string).toUpperCase(),
    discount_type: formData.get('discount_type') as DiscountType,
    discount_value: Number(formData.get('discount_value')),
    min_order_amount: formData.get('min_order_amount')
      ? Number(formData.get('min_order_amount'))
      : null,
    max_uses: formData.get('max_uses') ? Number(formData.get('max_uses')) : null,
    valid_from: (formData.get('valid_from') as string) || new Date().toISOString(),
    valid_until: (formData.get('valid_until') as string) || null,
    is_active: true
  });

  if (error) throw new Error(error.message);
  revalidatePath('/dashboard/coupons');
}

export async function toggleCouponActive(id: string, isActive: boolean) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  await supabase.from('coupons').update({ is_active: isActive }).eq('id', id);
  revalidatePath('/dashboard/coupons');
}

export async function deleteCoupon(id: string) {
  await requireRole(['admin', 'super_admin']);
  const supabase = await createClient();

  await supabase.from('coupons').delete().eq('id', id);
  revalidatePath('/dashboard/coupons');
}

export async function getAllCouponsAdmin() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('coupons')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}
