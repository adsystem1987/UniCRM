import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireRole, toErrorResponse } from '@/lib/auth/account';
import { supabaseAdmin } from '@/lib/automations/admin-client';
import { STARTER_TEMPLATES } from '@/lib/whatsapp/starter-templates';
import { AUTOMATION_TEMPLATES } from '@/lib/automations/templates';
import { insertSteps, type BuilderStepInput } from '@/lib/automations/steps-tree';

export const dynamic = 'force-dynamic';

/**
 * POST /api/onboarding/deploy-starters
 * 1-Click DFY Onboarding Deployment:
 * 1. Submits all 5 starter message templates to Meta for approval under this account's WABA.
 * 2. Seeds the core automated drip workflows ('welcome_message' and 'follow_up_reminder') into the account.
 */
export async function POST(req: Request) {
  try {
    await requireRole('agent');
  } catch (err) {
    return toErrorResponse(err);
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('account_id')
      .eq('user_id', user.id)
      .single();

    const accountId = profile?.account_id as string | undefined;
    if (!accountId) {
      return NextResponse.json({ error: 'Profile not linked to an account.' }, { status: 403 });
    }

    const admin = supabaseAdmin();
    const protocol = req.headers.get('x-forwarded-proto') || 'https';
    const host = req.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;

    // 1. Submit Starter Templates to Meta (via internal submit route or direct)
    let templatesSubmitted = 0;
    const templateErrors: string[] = [];

    for (const starter of STARTER_TEMPLATES) {
      try {
        const submitRes = await fetch(`${baseUrl}/api/whatsapp/templates/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            cookie: req.headers.get('cookie') || '',
          },
          body: JSON.stringify({
            name: starter.name,
            category: starter.category,
            language: starter.language,
            body_text: starter.body_text,
            footer_text: starter.footer_text,
            buttons: starter.buttons,
            sample_values: starter.sample_values,
          }),
        });

        if (submitRes.ok) {
          templatesSubmitted++;
        } else {
          const errData = await submitRes.json().catch(() => ({}));
          templateErrors.push(`${starter.name}: ${errData?.error || submitRes.statusText}`);
        }
      } catch (err) {
        templateErrors.push(`${starter.name}: ${err instanceof Error ? err.message : 'Error'}`);
      }
    }

    // 2. Pre-seed Default Starter Automations
    let automationsCreated = 0;
    const startersToSeed = [AUTOMATION_TEMPLATES.welcome_message, AUTOMATION_TEMPLATES.follow_up_reminder];

    for (const tpl of startersToSeed) {
      // Check if automation already exists for this trigger/name
      const { data: existing } = await admin
        .from('automations')
        .select('id')
        .eq('account_id', accountId)
        .eq('trigger_type', tpl.trigger_type)
        .limit(1)
        .maybeSingle();

      if (!existing) {
        const { data: newAuto, error: createErr } = await admin
          .from('automations')
          .insert({
            account_id: accountId,
            user_id: user.id,
            name: tpl.name,
            description: tpl.description,
            trigger_type: tpl.trigger_type,
            trigger_config: tpl.trigger_config,
            is_active: true,
          })
          .select('id')
          .single();

        if (newAuto && !createErr) {
          await insertSteps(newAuto.id, tpl.steps as unknown as BuilderStepInput[]);
          automationsCreated++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      templatesSubmitted,
      automationsCreated,
      templateErrors: templateErrors.length > 0 ? templateErrors : undefined,
    });
  } catch (error) {
    console.error('[deploy-starters] error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to deploy starter pack' },
      { status: 500 }
    );
  }
}
