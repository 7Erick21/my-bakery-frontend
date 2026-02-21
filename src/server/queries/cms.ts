import type { CmsContentItem } from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

export async function getCmsContent(lang = 'es') {
  const supabase = await createClient();

  const { data } = await supabase
    .from('cms_content')
    .select(
      `
      id, section, image_url, sort_order, is_visible,
      cms_content_translations!inner(title, subtitle, body, cta_text, cta_url)
    `
    )
    .eq('is_visible', true)
    .eq('cms_content_translations.language_code', lang)
    .order('sort_order');

  return data ?? [];
}

export interface CmsSeoData {
  title: string | null;
  description: string | null;
}

export async function getCmsSeoMetadata(lang = 'es'): Promise<CmsSeoData> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('cms_content')
    .select(
      `
      cms_content_translations!inner(title, body)
    `
    )
    .eq('section', 'seo')
    .eq('is_visible', true)
    .eq('cms_content_translations.language_code', lang)
    .limit(1)
    .single();

  const translation = (
    data as unknown as { cms_content_translations: { title: string | null; body: string | null }[] }
  )?.cms_content_translations?.[0];

  return {
    title: translation?.title || null,
    description: translation?.body || null
  };
}

export async function getAllCmsContentAdmin(): Promise<CmsContentItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('cms_content')
    .select(
      `
      id, section, image_url, sort_order, is_visible, created_at, updated_at,
      cms_content_translations(id, language_code, title, subtitle, body, cta_text, cta_url)
    `
    )
    .order('section, sort_order');

  return (data ?? []) as unknown as CmsContentItem[];
}

export async function getCmsContentBySection(section: string): Promise<CmsContentItem[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('cms_content')
    .select(
      `
      id, section, image_url, sort_order, is_visible, created_at, updated_at,
      cms_content_translations(id, language_code, title, subtitle, body, cta_text, cta_url),
      cms_media(id, url, alt_text, media_type, sort_order)
    `
    )
    .eq('section', section)
    .order('sort_order');

  return (data ?? []) as unknown as CmsContentItem[];
}
