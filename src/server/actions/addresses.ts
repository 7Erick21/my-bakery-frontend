'use server';

import { revalidatePath } from 'next/cache';

import { requireAuth } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

export async function createAddress(formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const isDefault = formData.get('is_default') === 'true';

  // If setting as default, unset all others
  if (isDefault) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  }

  const { data, error } = await supabase
    .from('addresses')
    .insert({
      user_id: user.id,
      label: (formData.get('label') as string) || null,
      full_name: formData.get('full_name') as string,
      phone: (formData.get('phone') as string) || null,
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      postal_code: formData.get('postal_code') as string,
      province: formData.get('province') as string,
      country: (formData.get('country') as string) || 'ES',
      is_default: isDefault
    })
    .select('id')
    .single();

  if (error) throw new Error(error.message);

  revalidatePath('/orders/new');
  return { addressId: data.id };
}

export async function updateAddress(addressId: string, formData: FormData) {
  const user = await requireAuth();
  const supabase = await createClient();

  const isDefault = formData.get('is_default') === 'true';

  if (isDefault) {
    await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);
  }

  const { error } = await supabase
    .from('addresses')
    .update({
      label: (formData.get('label') as string) || null,
      full_name: formData.get('full_name') as string,
      phone: (formData.get('phone') as string) || null,
      street: formData.get('street') as string,
      city: formData.get('city') as string,
      postal_code: formData.get('postal_code') as string,
      province: formData.get('province') as string,
      is_default: isDefault
    })
    .eq('id', addressId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/new');
}

export async function deleteAddress(addressId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', addressId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/new');
}

export async function setDefaultAddress(addressId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  await supabase.from('addresses').update({ is_default: false }).eq('user_id', user.id);

  const { error } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', addressId)
    .eq('user_id', user.id);

  if (error) throw new Error(error.message);

  revalidatePath('/orders/new');
}
