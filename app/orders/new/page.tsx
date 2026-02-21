import { redirect } from 'next/navigation';

import { getSession } from '@/lib/auth/helpers';
import { createClient } from '@/lib/supabase/server';

import { Checkout } from '@/views/Orders';

export default async function CheckoutPage() {
  const user = await getSession();
  if (!user) redirect('/auth');

  const supabase = await createClient();

  // Fetch Bizum phone from business_info
  const { data: bizumRow } = await supabase
    .from('business_info')
    .select('value')
    .eq('key', 'bizum_phone')
    .maybeSingle();

  return <Checkout bizumPhone={bizumRow?.value} />;
}
