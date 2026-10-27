import { NextResponse } from 'next/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { supabaseAdmin } from '@/lib/automations/admin-client';
import { runAutomationsForTrigger } from '@/lib/automations/engine';
import { getTemplate } from '@/lib/automations/templates';
import { insertSteps, type BuilderStepInput } from '@/lib/automations/steps-tree';

export const dynamic = 'force-dynamic';

interface LeadPayload {
  name: string;
  phone: string;
  city?: string;
  category?: string;
  rating?: number;
}

/**
 * POST /api/leads/import-and-outreach
 * Imports selected leads as Contacts and triggers the Omnichannel outreach sequence.
 */
export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await requireRole('agent');

    const body = await request.json().catch(() => ({}));
    const leads: LeadPayload[] = Array.isArray(body.leads) ? body.leads : [];
    const enrollInSequence: boolean = body.enrollInSequence !== false;

    if (!leads || leads.length === 0) {
      return NextResponse.json({ error: 'No leads provided for import' }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // 1. Ensure the Omnichannel Outreach automation exists and is active for this account
    // Wire the approved Meta template (welcome_lead_intro) or text message
    let targetAutomationId: string | null = null;
    if (enrollInSequence) {
      const { data: existingAuto } = await admin
        .from('automations')
        .select('id, is_active')
        .eq('account_id', accountId)
        .eq('trigger_type', 'new_contact_created')
        .eq('name', 'UniCRM Omnichannel Drip & AI Agent Qualifier')
        .maybeSingle();

      if (existingAuto) {
        targetAutomationId = existingAuto.id;
        if (!existingAuto.is_active) {
          await admin
            .from('automations')
            .update({ is_active: true })
            .eq('id', existingAuto.id);
        }
      } else {
        // Deploy template with approved Meta template welcome_lead_intro
        const { data: createdAuto } = await admin
          .from('automations')
          .insert({
            account_id: accountId,
            user_id: userId,
            name: 'UniCRM Omnichannel Drip & AI Agent Qualifier',
            description: 'Automated 1-click lead outreach: WhatsApp intro -> Follow-up reminder -> AI qualification.',
            trigger_type: 'new_contact_created',
            trigger_config: {},
            is_active: true,
          })
          .select('id')
          .single();

        if (createdAuto) {
          targetAutomationId = createdAuto.id;
          const outreachSteps: BuilderStepInput[] = [
            {
              step_type: 'send_template',
              step_config: {
                template_name: 'welcome_lead_intro',
                language: 'en_US',
                variable_mapping: {
                  '1': '{{contact.name}}',
                  '2': 'our team',
                },
              },
            },
            {
              step_type: 'wait',
              step_config: { amount: 1, unit: 'days' },
            },
            {
              step_type: 'send_template',
              step_config: {
                template_name: 'inquiry_follow_up_touch',
                language: 'en_US',
                variable_mapping: {
                  '1': '{{contact.name}}',
                  '2': 'our previous conversation',
                },
              },
            },
            {
              step_type: 'ai_reply',
              step_config: {
                prompt: 'Qualify if the business prospect needs CRM, messaging, or business growth services. Answer their questions and offer to schedule a call.',
              },
            },
          ];
          await insertSteps(createdAuto.id, outreachSteps);
        }
      }
    }

    // 2. Insert or upsert contacts
    const importedContactIds: string[] = [];

    for (const lead of leads) {
      const cleanPhone = String(lead.phone || '').replace(/[^0-9]/g, '');
      if (!cleanPhone || cleanPhone.length < 10) continue;

      const { data: contact, error: upsertErr } = await admin
        .from('contacts')
        .upsert(
          {
            account_id: accountId,
            user_id: userId,
            name: lead.name || 'Valued Prospect',
            phone: cleanPhone,
            company: lead.category || undefined,
            tags: ['smart_lead_finder', lead.city ? `city:${lead.city}` : 'local_lead'],
          },
          { onConflict: 'account_id,phone' }
        )
        .select('id')
        .single();

      if (contact && !upsertErr) {
        importedContactIds.push(contact.id);

        // 3. Dispatch trigger for each newly imported contact
        if (enrollInSequence) {
          void runAutomationsForTrigger({
            accountId,
            triggerType: 'new_contact_created',
            contactId: contact.id,
            context: {
              vars: {
                lead_source: 'smart_lead_finder',
                city: lead.city,
                category: lead.category,
              },
            },
          }).catch((err) => {
            console.error('[Leads/Outreach] Error dispatching automation:', err);
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      importedCount: importedContactIds.length,
      enrolledInOutreach: enrollInSequence,
      automationId: targetAutomationId,
    });
  } catch (err: any) {
    console.error('[Leads/ImportAndOutreach] Exception:', err);
    return toErrorResponse(err);
  }
}
