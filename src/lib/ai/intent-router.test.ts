import { describe, it, expect } from 'vitest';
import { evaluateTextIntent } from './intent-router';

describe('Fast Intent Router & Auto-Classifier', () => {
  it('classifies general product inquiry (Option A) with no hot lead tag', () => {
    const decision = evaluateTextIntent(
      'Can you explain how Google Drive storage works with call recordings?'
    );
    expect(decision.intent).toBe('inquiry');
    expect(decision.isHotLead).toBe(false);
    expect(decision.requiresHuman).toBe(false);
    expect(decision.suggestedTags).toContain('GeneralInquiry');
  });

  it('detects pricing & quotation as Hot Lead (Option B)', () => {
    const decision = evaluateTextIntent(
      'What is the price of the 1000 setup? Can you send me a quote and package rates?'
    );
    expect(decision.intent).toBe('pricing');
    expect(decision.isHotLead).toBe(true);
    expect(decision.suggestedTags).toContain('PricingInquiry');
  });

  it('detects urgent bookings as Hot Lead (Option B)', () => {
    const decision = evaluateTextIntent(
      'Need cab booking emergency abhi confirm karo room available today'
    );
    expect(decision.intent).toBe('urgent_booking');
    expect(decision.isHotLead).toBe(true);
    expect(decision.suggestedTags).toContain('UrgentBooking');
    expect(decision.suggestedTags).toContain('HotLead');
  });

  it('detects human handoff demand and requires human escalation', () => {
    const decision = evaluateTextIntent(
      'I want to speak with a human agent or manager please call me'
    );
    expect(decision.intent).toBe('human_handoff');
    expect(decision.requiresHuman).toBe(true);
    expect(decision.suggestedTags).toContain('HumanRequested');
  });
});
