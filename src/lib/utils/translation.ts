import type { LandingBusinessInfoItem } from '@/lib/supabase/models';

export function getTranslation<T extends { language_code: string }>(
  translations: T[] | undefined,
  lang: string
): T | undefined {
  return translations?.find(t => t.language_code === lang) ?? translations?.[0];
}

export function getBusinessValue(
  items: LandingBusinessInfoItem[],
  key: string,
  lang: string
): string {
  const item = items.find(i => i.key === key);
  if (!item) return '';
  const translation = item.business_info_translations?.find(t => t.language_code === lang);
  return translation?.value ?? item.value;
}
