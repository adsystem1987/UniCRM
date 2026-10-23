import type { TemplatePayload } from './template-validators';

/**
 * Curated list of battle-tested starter templates designed for quick approval by Meta.
 * Follows Meta Cloud API rules:
 * - Proper category classification (Marketing / Utility)
 * - Contiguous positional parameters {{1}}, {{2}}...
 * - Matching sample values
 * - Valid button combinations (QUICK_REPLY or URL)
 */
export const STARTER_TEMPLATES: Array<
  TemplatePayload & {
    displayName: string;
    description: string;
  }
> = [
  {
    displayName: 'Welcome New Lead',
    description: 'Greet new leads instantly with interactive response buttons.',
    name: 'welcome_lead_intro',
    category: 'Marketing',
    language: 'en_US',
    body_text:
      'Hello {{1}}, thanks for reaching out to {{2}}! We received your message and our team is ready to assist you. How can we help you today?',
    sample_values: {
      body: ['John', 'UniCRM Support'],
    },
    buttons: [
      {
        type: 'QUICK_REPLY',
        text: 'Talk to an Agent',
      },
      {
        type: 'QUICK_REPLY',
        text: 'View Services',
      },
    ],
  },
  {
    displayName: 'Appointment Reminder',
    description: 'Reduce no-shows by reminding clients about upcoming meetings or appointments.',
    name: 'appointment_reminder_notice',
    category: 'Utility',
    language: 'en_US',
    body_text:
      'Hi {{1}}, this is a friendly reminder of your upcoming appointment with {{2}} scheduled on {{3}} at {{4}}. Please let us know if you need to reschedule.',
    sample_values: {
      body: ['Sarah', 'UniCRM', 'Monday, Nov 10', '10:30 AM'],
    },
    buttons: [
      {
        type: 'QUICK_REPLY',
        text: 'Confirm Appointment',
      },
      {
        type: 'QUICK_REPLY',
        text: 'Request Reschedule',
      },
    ],
  },
  {
    displayName: 'Payment & Order Confirmation',
    description: 'Send instant transaction receipts or order status updates.',
    name: 'order_payment_confirmed',
    category: 'Utility',
    language: 'en_US',
    body_text:
      'Hello {{1}}, we have received your payment of {{2}} for Order #{{3}}. Thank you for doing business with {{4}}!',
    sample_values: {
      body: ['Alex', '₹1,500', '10842', 'UniCRM'],
    },
    footer_text: 'Thank you for your business.',
    buttons: [
      {
        type: 'QUICK_REPLY',
        text: 'Check Order Status',
      },
    ],
  },
  {
    displayName: 'Inquiry Follow-up',
    description: 'Re-engage prospects after initial contact or website inquiry.',
    name: 'inquiry_follow_up_touch',
    category: 'Marketing',
    language: 'en_US',
    body_text:
      'Hi {{1}}, following up on our recent conversation regarding {{2}}. Do you have 5 minutes for a quick call today to discuss details?',
    sample_values: {
      body: ['David', 'our CRM software'],
    },
    buttons: [
      {
        type: 'QUICK_REPLY',
        text: 'Yes, call me',
      },
      {
        type: 'QUICK_REPLY',
        text: 'Not right now',
      },
    ],
  },
  {
    displayName: 'Customer Feedback & Review',
    description: 'Collect high-converting ratings and reviews after service delivery.',
    name: 'customer_satisfaction_check',
    category: 'Utility',
    language: 'en_US',
    body_text:
      'Hi {{1}}, thank you for choosing {{2}}! How was your experience with our team today? Your feedback helps us improve.',
    sample_values: {
      body: ['Priya', 'UniCRM'],
    },
    buttons: [
      {
        type: 'QUICK_REPLY',
        text: '⭐ Excellent Service',
      },
      {
        type: 'QUICK_REPLY',
        text: '💬 Need Assistance',
      },
    ],
  },
];
