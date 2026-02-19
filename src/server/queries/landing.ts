import type {
  LandingBusinessInfoItem,
  LandingCmsSection,
  LandingFeatureCard,
  LandingSocialLink,
  LandingTimelineEvent
} from '@/lib/supabase/models';
import { createClient } from '@/lib/supabase/server';

// ──────────────────────────────────────────────
// Landing page queries (all translations, for client-side lang switch)
// ──────────────────────────────────────────────

export async function getLandingTimelineEvents(): Promise<LandingTimelineEvent[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('timeline_events')
    .select(
      `
      id, year, image_url, sort_order,
      timeline_event_translations(language_code, title, description)
    `
    )
    .eq('is_visible', true)
    .order('sort_order');

  return (data ?? []) as unknown as LandingTimelineEvent[];
}

export async function getLandingFeatureCards(): Promise<LandingFeatureCard[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('feature_cards')
    .select(
      `
      id, icon, sort_order,
      feature_card_translations(language_code, title, description)
    `
    )
    .eq('is_visible', true)
    .order('sort_order');

  return (data ?? []) as unknown as LandingFeatureCard[];
}

export async function getLandingBusinessInfo(): Promise<LandingBusinessInfoItem[]> {
  const supabase = await createClient();

  const { data } = await supabase.from('business_info').select(
    `
      id, key, value,
      business_info_translations(id, language_code, value)
    `
  );

  return (data ?? []) as unknown as LandingBusinessInfoItem[];
}

export async function getLandingSocialLinks(): Promise<LandingSocialLink[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('social_links')
    .select('id, platform, url, icon, sort_order')
    .eq('is_visible', true)
    .order('sort_order');

  return (data ?? []) as unknown as LandingSocialLink[];
}

export async function getLandingCmsContent(): Promise<LandingCmsSection[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('cms_content')
    .select(
      `
      id, section, image_url,
      cms_content_translations(language_code, title, subtitle, body, cta_text, cta_url)
    `
    )
    .eq('is_visible', true)
    .order('sort_order');

  return (data ?? []) as unknown as LandingCmsSection[];
}

// ──────────────────────────────────────────────
// Admin queries (all translations with IDs)
// ──────────────────────────────────────────────

export async function getAllTimelineEventsAdmin(): Promise<LandingTimelineEvent[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('timeline_events')
    .select(
      `
      id, year, image_url, sort_order,
      timeline_event_translations(id, language_code, title, description)
    `
    )
    .order('sort_order');

  return (data ?? []) as unknown as LandingTimelineEvent[];
}

export async function getAllFeatureCardsAdmin(): Promise<LandingFeatureCard[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('feature_cards')
    .select(
      `
      id, icon, sort_order,
      feature_card_translations(id, language_code, title, description)
    `
    )
    .order('sort_order');

  return (data ?? []) as unknown as LandingFeatureCard[];
}

export async function getAllBusinessInfoAdmin(): Promise<LandingBusinessInfoItem[]> {
  const supabase = await createClient();

  const { data } = await supabase.from('business_info').select(
    `
      id, key, value,
      business_info_translations(id, language_code, value)
    `
  );

  return (data ?? []) as unknown as LandingBusinessInfoItem[];
}

// ──────────────────────────────────────────────
// Single-language queries (legacy, kept for compatibility)
// ──────────────────────────────────────────────

export async function getTimelineEvents(lang = 'es') {
  const supabase = await createClient();

  const { data } = await supabase
    .from('timeline_events')
    .select(
      `
      id, year, image_url, sort_order,
      timeline_event_translations!inner(title, description)
    `
    )
    .eq('is_visible', true)
    .eq('timeline_event_translations.language_code', lang)
    .order('sort_order');

  return data ?? [];
}

export async function getFeatureCards(lang = 'es') {
  const supabase = await createClient();

  const { data } = await supabase
    .from('feature_cards')
    .select(
      `
      id, icon, sort_order,
      feature_card_translations!inner(title, description)
    `
    )
    .eq('is_visible', true)
    .eq('feature_card_translations.language_code', lang)
    .order('sort_order');

  return data ?? [];
}

export async function getBusinessInfo(lang = 'es') {
  const supabase = await createClient();

  const { data } = await supabase
    .from('business_info')
    .select(
      `
      id, key, value,
      business_info_translations(value)
    `
    )
    .eq('business_info_translations.language_code', lang);

  return data ?? [];
}

export async function getSocialLinks() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('social_links')
    .select('id, platform, url, icon, sort_order')
    .eq('is_visible', true)
    .order('sort_order');

  return data ?? [];
}

export async function getLanguages() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('languages')
    .select('code, name, native_name, is_active, sort_order')
    .eq('is_active', true)
    .order('sort_order');

  return data ?? [];
}

export async function getAllLanguagesAdmin() {
  const supabase = await createClient();

  const { data } = await supabase
    .from('languages')
    .select('code, name, native_name, is_active, sort_order, created_at')
    .order('sort_order');

  return data ?? [];
}
