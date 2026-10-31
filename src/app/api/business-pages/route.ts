import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/gdrive/offload';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get('slug')?.toLowerCase().trim();
    const accountId = searchParams.get('accountId');

    const admin = getAdminClient();

    if (slug) {
      const { data, error } = await admin
        .from('business_pages')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error || !data) {
        return NextResponse.json({ error: 'Page not found' }, { status: 404 });
      }

      // Increment view count asynchronously
      admin.from('business_pages')
        .update({ view_count: (data.view_count || 0) + 1 })
        .eq('id', data.id)
        .then(() => {});

      return NextResponse.json({ page: data });
    }

    if (accountId) {
      const { data, error } = await admin
        .from('business_pages')
        .select('*')
        .eq('account_id', accountId)
        .single();

      return NextResponse.json({ page: data || null });
    }

    return NextResponse.json({ error: 'Missing slug or accountId parameter' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      accountId,
      slug,
      title,
      tagline,
      about,
      whatsappNumber,
      callingNumber,
      address,
      googleMapsUrl,
      logoUrl,
      coverUrl,
      items,
      isPublished,
    } = body;

    if (!accountId || !title || !slug || !whatsappNumber) {
      return NextResponse.json(
        { error: 'Account ID, Title, Slug, and WhatsApp Number are required.' },
        { status: 400 }
      );
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]/g, '-');

    const admin = getAdminClient();

    const payload = {
      account_id: accountId,
      slug: cleanSlug,
      title: title.trim(),
      tagline: tagline?.trim() || null,
      about: about?.trim() || null,
      whatsapp_number: whatsappNumber.replace(/[^0-9]/g, ''),
      calling_number: callingNumber ? callingNumber.replace(/[^0-9+]/g, '') : null,
      address: address?.trim() || null,
      google_maps_url: googleMapsUrl?.trim() || null,
      logo_url: logoUrl?.trim() || null,
      cover_url: coverUrl?.trim() || null,
      items: Array.isArray(items) ? items : [],
      is_published: isPublished !== false,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await admin
      .from('business_pages')
      .upsert(payload, { onConflict: 'account_id' })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, page: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
