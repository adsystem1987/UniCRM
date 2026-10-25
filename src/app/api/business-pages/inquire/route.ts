import { NextResponse } from 'next/server';
import { getAdminClient } from '@/lib/gdrive/offload';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { pageId, accountId, name, phone, itemId, itemTitle, notes } = body;

    if (!pageId || !accountId || !name || !phone) {
      return NextResponse.json(
        { error: 'Name, phone number, and page details are required.' },
        { status: 400 }
      );
    }

    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const admin = getAdminClient();

    // 1. Insert into business_page_inquiries
    const { data: inquiry, error: inqErr } = await admin
      .from('business_page_inquiries')
      .insert({
        page_id: pageId,
        account_id: accountId,
        name: name.trim(),
        phone: cleanPhone,
        item_id: itemId || null,
        item_title: itemTitle || null,
        notes: notes?.trim() || null,
        source: 'web_page',
        status: 'new',
      })
      .select()
      .single();

    if (inqErr) {
      console.error('Error recording page inquiry:', inqErr);
    }

    // 2. Increment lead count on the business page
    admin.from('business_pages')
      .select('lead_count')
      .eq('id', pageId)
      .single()
      .then(({ data }) => {
        if (data) {
          admin.from('business_pages')
            .update({ lead_count: (data.lead_count || 0) + 1 })
            .eq('id', pageId)
            .then(() => {});
        }
      });

    // 3. Upsert contact into UniCRM Contacts so the user immediately sees it
    try {
      const { data: existingContact } = await admin
        .from('contacts')
        .select('id, tags')
        .eq('account_id', accountId)
        .eq('phone', cleanPhone)
        .maybeSingle();

      if (!existingContact) {
        await admin.from('contacts').insert({
          account_id: accountId,
          name: name.trim(),
          phone: cleanPhone,
          tags: ['WebPageLead'],
        });
      }
    } catch (contactErr) {
      console.warn('Could not auto-create contact in CRM table:', contactErr);
    }

    return NextResponse.json({ success: true, inquiry });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
