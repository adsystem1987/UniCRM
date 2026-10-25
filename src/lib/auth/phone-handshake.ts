import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Checks if an inbound WhatsApp message body contains an onboarding handshake code
 * format: "ACT-XXXXXX" (e.g. "Verify ACT-849201" or simply "ACT-849201").
 * If found and valid, marks the user's profile as phone_verified and records their phone number.
 */
export async function handlePhoneVerificationHandshake(
  supabaseAdmin: SupabaseClient,
  args: {
    senderPhone: string
    text: string
  }
): Promise<boolean> {
  const { senderPhone, text } = args
  if (!text || !senderPhone) return false

  // Match ACT-XXXXXX (case-insensitive)
  const match = text.match(/\b(ACT-\d{6})\b/i)
  if (!match) return false

  const code = match[1].toUpperCase()

  try {
    // Look up profile waiting for this verification code
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, phone, phone_verified, verification_code_expires_at')
      .eq('verification_code', code)
      .maybeSingle()

    if (error || !profile) {
      console.log(`[phone-verification] no profile found for code: ${code}`)
      return false
    }

    // Check expiration
    if (profile.verification_code_expires_at) {
      const expiresAt = new Date(profile.verification_code_expires_at)
      if (expiresAt.getTime() < Date.now()) {
        console.log(`[phone-verification] code expired for user: ${profile.id}`)
        return false
      }
    }

    // Mark as verified and record sender's real WhatsApp phone number
    const { error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({
        phone: senderPhone,
        phone_verified: true,
        verification_code: null, // Consume code
        verification_code_expires_at: null,
      })
      .eq('id', profile.id)

    if (updateErr) {
      console.error('[phone-verification] update error:', updateErr)
      return false
    }

    console.log(`[phone-verification] successfully verified user ${profile.email} with phone ${senderPhone}`)
    return true
  } catch (err) {
    console.error('[phone-verification] handshake error:', err)
    return false
  }
}
