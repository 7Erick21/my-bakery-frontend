'use server';

import { revalidatePath } from 'next/cache';

import { requireRole } from '@/lib/auth/helpers';
import { deleteCloudinaryImages } from '@/lib/cloudinary/delete';
import { createClient } from '@/lib/supabase/server';

export async function upsertCmsContent(section: string, formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  const id = formData.get('id') as string | null;
  const imageUrl = (formData.get('image_url') as string) || null;
  const sortOrder = Number(formData.get('sort_order') || 0);
  const isVisible = formData.get('is_visible') !== 'false';

  let contentId = id;

  // Delete old image from Cloudinary if replaced
  const oldImageUrl = formData.get('old_image_url') as string | null;
  if (oldImageUrl) {
    await deleteCloudinaryImages([oldImageUrl]);
  }

  if (id) {
    await supabase
      .from('cms_content')
      .update({ image_url: imageUrl, sort_order: sortOrder, is_visible: isVisible })
      .eq('id', id);
  } else {
    const { data } = await supabase
      .from('cms_content')
      .insert({ section, image_url: imageUrl, sort_order: sortOrder, is_visible: isVisible })
      .select('id')
      .single();
    contentId = data?.id;
  }

  if (contentId) {
    const translations = JSON.parse((formData.get('translations') as string) || '[]');
    for (const t of translations) {
      if (t.id) {
        await supabase
          .from('cms_content_translations')
          .update({
            title: t.title,
            subtitle: t.subtitle,
            body: t.body,
            cta_text: t.cta_text,
            cta_url: t.cta_url
          })
          .eq('id', t.id);
      } else {
        await supabase.from('cms_content_translations').insert({
          content_id: contentId,
          language_code: t.language_code,
          title: t.title || null,
          subtitle: t.subtitle || null,
          body: t.body || null,
          cta_text: t.cta_text || null,
          cta_url: t.cta_url || null
        });
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function updateBusinessInfo(id: string, formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  const value = formData.get('value') as string;
  await supabase.from('business_info').update({ value }).eq('id', id);

  const translations = JSON.parse((formData.get('translations') as string) || '[]');
  for (const t of translations) {
    if (t.id) {
      await supabase.from('business_info_translations').update({ value: t.value }).eq('id', t.id);
    } else {
      await supabase.from('business_info_translations').insert({
        business_info_id: id,
        language_code: t.language_code,
        value: t.value
      });
    }
  }

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function updateSocialLink(id: string, formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  await supabase
    .from('social_links')
    .update({
      platform: formData.get('platform') as string,
      url: formData.get('url') as string,
      icon: (formData.get('icon') as string) || null,
      is_visible: formData.get('is_visible') !== 'false'
    })
    .eq('id', id);

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function createSocialLink(formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  await supabase.from('social_links').insert({
    platform: formData.get('platform') as string,
    url: formData.get('url') as string,
    icon: (formData.get('icon') as string) || null,
    sort_order: Number(formData.get('sort_order') || 0),
    is_visible: true
  });

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function createBusinessInfo(formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  const key = formData.get('key') as string;
  const value = formData.get('value') as string;

  const { data } = await supabase
    .from('business_info')
    .insert({ key, value })
    .select('id')
    .single();

  if (data?.id) {
    const translations = JSON.parse((formData.get('translations') as string) || '[]');
    for (const tr of translations) {
      await supabase.from('business_info_translations').insert({
        business_info_id: data.id,
        language_code: tr.language_code,
        value: tr.value
      });
    }
  }

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function upsertTimelineEvent(formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  const id = formData.get('id') as string | null;
  const year = Number(formData.get('year'));
  const imageUrl = (formData.get('image_url') as string) || null;
  const sortOrder = Number(formData.get('sort_order') || 0);

  const oldImageUrl = formData.get('old_image_url') as string | null;
  if (oldImageUrl) {
    await deleteCloudinaryImages([oldImageUrl]);
  }

  let eventId = id;

  if (id) {
    await supabase
      .from('timeline_events')
      .update({ year, image_url: imageUrl, sort_order: sortOrder })
      .eq('id', id);
  } else {
    const { data } = await supabase
      .from('timeline_events')
      .insert({ year, image_url: imageUrl, sort_order: sortOrder })
      .select('id')
      .single();
    eventId = data?.id;
  }

  if (eventId) {
    const translations = JSON.parse((formData.get('translations') as string) || '[]');
    for (const tr of translations) {
      if (tr.id) {
        await supabase
          .from('timeline_event_translations')
          .update({ title: tr.title, description: tr.description })
          .eq('id', tr.id);
      } else {
        await supabase.from('timeline_event_translations').insert({
          event_id: eventId,
          language_code: tr.language_code,
          title: tr.title || '',
          description: tr.description || null
        });
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function deleteTimelineEvent(id: string) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  // Fetch image URL before deleting so we can clean up Cloudinary
  const { data: event } = await supabase
    .from('timeline_events')
    .select('image_url')
    .eq('id', id)
    .single();

  if (event?.image_url) {
    await deleteCloudinaryImages([event.image_url]);
  }

  await supabase.from('timeline_event_translations').delete().eq('event_id', id);
  await supabase.from('timeline_events').delete().eq('id', id);

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function reorderTimelineEvents(orderedIds: string[]) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('timeline_events')
        .update({ sort_order: index + 1 })
        .eq('id', id)
    )
  );

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function reorderFeatureCards(orderedIds: string[]) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('feature_cards')
        .update({ sort_order: index + 1 })
        .eq('id', id)
    )
  );

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function upsertFeatureCard(formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  const id = formData.get('id') as string | null;
  const icon = (formData.get('icon') as string) || null;
  const sortOrder = Number(formData.get('sort_order') || 0);

  let cardId = id;

  if (id) {
    await supabase.from('feature_cards').update({ icon, sort_order: sortOrder }).eq('id', id);
  } else {
    const { data } = await supabase
      .from('feature_cards')
      .insert({ icon, sort_order: sortOrder })
      .select('id')
      .single();
    cardId = data?.id;
  }

  if (cardId) {
    const translations = JSON.parse((formData.get('translations') as string) || '[]');
    for (const tr of translations) {
      if (tr.id) {
        await supabase
          .from('feature_card_translations')
          .update({ title: tr.title, description: tr.description })
          .eq('id', tr.id);
      } else {
        await supabase.from('feature_card_translations').insert({
          card_id: cardId,
          language_code: tr.language_code,
          title: tr.title || '',
          description: tr.description || null
        });
      }
    }
  }

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function deleteFeatureCard(id: string) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  await supabase.from('feature_card_translations').delete().eq('card_id', id);
  await supabase.from('feature_cards').delete().eq('id', id);

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function reorderSocialLinks(orderedIds: string[]) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  await Promise.all(
    orderedIds.map((id, index) =>
      supabase
        .from('social_links')
        .update({ sort_order: index + 1 })
        .eq('id', id)
    )
  );

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function deleteSocialLink(id: string) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  await supabase.from('social_links').delete().eq('id', id);

  revalidatePath('/');
  revalidatePath('/dashboard/content');
}

export async function upsertLanguage(formData: FormData) {
  await requireRole(['marketing', 'admin', 'super_admin']);
  const supabase = await createClient();

  const code = formData.get('code') as string;
  const name = formData.get('name') as string;
  const nativeName = formData.get('native_name') as string;
  const isActive = formData.get('is_active') !== 'false';
  const sortOrder = Number(formData.get('sort_order') || 0);

  const isNew = formData.get('is_new') === 'true';

  if (isNew) {
    await supabase.from('languages').insert({
      code,
      name,
      native_name: nativeName,
      is_active: isActive,
      sort_order: sortOrder
    });
  } else {
    await supabase
      .from('languages')
      .update({ name, native_name: nativeName, is_active: isActive, sort_order: sortOrder })
      .eq('code', code);
  }

  revalidatePath('/');
  revalidatePath('/dashboard/languages');
}
