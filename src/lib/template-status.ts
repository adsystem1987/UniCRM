/**
 * Shared display config for message_templates.status.
 *
 * The DB stores Meta's raw enum (DRAFT / APPROVED / PENDING / REJECTED /
 * PAUSED / DISABLED / IN_APPEAL / PENDING_DELETION) — the UI maps it to
 * a human label + dark-theme badge classes here so the template manager,
 * inbox picker, and broadcast picker stay aligned.
 */

import type { MessageTemplateStatus } from '@/types';
import { getT } from '@/lib/i18n/translate';

export interface TemplateStatusDisplay {
  label: string;
  classes: string;
}

const t = getT('TemplateStatus');

export const templateStatusConfig: Record<
  MessageTemplateStatus,
  TemplateStatusDisplay
> = {
  DRAFT: {
    label: t('DRAFT'),
    classes: 'bg-muted text-muted-foreground border-border',
  },
  PENDING: {
    label: t('PENDING'),
    classes: 'bg-status-warning-bg text-status-warning border-status-warning-border',
  },
  APPROVED: {
    label: t('APPROVED'),
    classes: 'bg-status-success-bg text-status-success border-status-success-border',
  },
  REJECTED: {
    label: t('REJECTED'),
    classes: 'bg-status-danger-bg text-status-danger border-status-danger-border',
  },
  PAUSED: {
    label: t('PAUSED'),
    classes: 'bg-status-warning-bg text-status-warning border-status-warning-border',
  },
  DISABLED: {
    label: t('DISABLED'),
    classes: 'bg-status-danger-bg text-status-danger border-status-danger-border',
  },
  IN_APPEAL: {
    label: t('IN_APPEAL'),
    classes: 'bg-status-info-bg text-status-info border-status-info-border',
  },
  PENDING_DELETION: {
    label: t('PENDING_DELETION'),
    classes: 'bg-muted text-muted-foreground border-border',
  },
};
