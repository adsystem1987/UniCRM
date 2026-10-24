import type {
  AutomationStepConfig,
  AutomationStepType,
  AutomationTriggerConfig,
  AutomationTriggerType,
} from '@/types'
import { getT } from '@/lib/i18n/translate'

export type TemplateSlug =
  | 'welcome_message'
  | 'out_of_office'
  | 'lead_qualifier'
  | 'follow_up_reminder'
  | 'unitpost_omnichannel_outreach'

export interface TemplateStepSeed {
  step_type: AutomationStepType
  step_config: AutomationStepConfig
  branch?: 'yes' | 'no' | null
  /** Index (within this seed list) of the Condition parent, if nested. */
  parent_index?: number | null
}

export interface AutomationTemplateDefinition {
  slug: TemplateSlug
  name: string
  description: string
  trigger_type: AutomationTriggerType
  trigger_config: AutomationTriggerConfig
  steps: TemplateStepSeed[]
}

const t = getT('StarterAutomations')

/** Comma-separated keyword list from the catalogue → trimmed array. */
function keywords(key: string): string[] {
  return t(key)
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean)
}

export const AUTOMATION_TEMPLATES: Record<TemplateSlug, AutomationTemplateDefinition> = {
  welcome_message: {
    slug: 'welcome_message',
    name: t('welcome_message.name'),
    description: t('welcome_message.description'),
    // first_inbound_message (added in PR #33) catches both brand-new
    // contacts AND manually-added/imported contacts on their first-ever
    // reply, which is what a user setting up a "welcome" automation
    // almost always wants. new_contact_created would miss the
    // manually-imported case.
    trigger_type: 'first_inbound_message',
    trigger_config: {},
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: t('welcome_message.text'),
        },
      },
      {
        step_type: 'add_tag',
        step_config: { tag_id: '' },
      },
    ],
  },
  out_of_office: {
    slug: 'out_of_office',
    name: t('out_of_office.name'),
    description: t('out_of_office.description'),
    trigger_type: 'new_message_received',
    trigger_config: {},
    steps: [
      {
        step_type: 'condition',
        step_config: {
          subject: 'time_of_day',
          operand: '18:00-09:00',
        },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: t('out_of_office.text'),
        },
        parent_index: 0,
        branch: 'yes',
      },
    ],
  },
  lead_qualifier: {
    slug: 'lead_qualifier',
    name: t('lead_qualifier.name'),
    description: t('lead_qualifier.description'),
    trigger_type: 'keyword_match',
    trigger_config: {
      keywords: keywords('lead_qualifier.keywords'),
      match_type: 'contains',
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: t('lead_qualifier.text'),
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 10, unit: 'minutes' },
      },
      {
        step_type: 'assign_conversation',
        step_config: { mode: 'round_robin' },
      },
    ],
  },
  follow_up_reminder: {
    slug: 'follow_up_reminder',
    name: t('follow_up_reminder.name'),
    description: t('follow_up_reminder.description'),
    trigger_type: 'new_message_received',
    trigger_config: {},
    steps: [
      {
        step_type: 'wait',
        step_config: { amount: 1, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: t('follow_up_reminder.text'),
        },
      },
    ],
  },
  unitpost_omnichannel_outreach: {
    slug: 'unitpost_omnichannel_outreach',
    name: 'Unitpost Omnichannel Drip & AI Agent Qualifier',
    description: 'Multi-step outreach sequence: WhatsApp intro with spintax -> 24h wait -> Support email follow-up -> AI autonomous qualification on reply.',
    trigger_type: 'new_contact_created',
    trigger_config: {},
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: '{Hi|Hello|Hey} {{contact.name}}, {saw your business online|noticed your profile} and wanted to reach out regarding our omnichannel CRM & WhatsApp calling tools. {Are you exploring automation this quarter?|Quick question if you have 2 mins?}',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 1, unit: 'days' },
      },
      {
        step_type: 'send_email',
        step_config: {
          subject: '{Quick follow-up|Checking in}: WhatsApp automation for your team',
          body_html: '<p>{Hi|Hello} {{contact.name}},</p><p>Wanted to follow up on my WhatsApp message regarding all-in-one messaging and calling with zero software subscriptions.</p><p>Best regards,<br/>UniCRM Outreach</p>',
        },
      },
      {
        step_type: 'ai_outreach_reply',
        step_config: {
          goal: 'qualify_lead',
          system_instructions: 'Qualify if the business needs WhatsApp messaging or calling. Offer to connect with founders or schedule a demo.',
          auto_create_deal: true,
        },
      },
    ],
  },
}

export function getTemplate(slug: string): AutomationTemplateDefinition | null {
  return AUTOMATION_TEMPLATES[slug as TemplateSlug] ?? null
}
