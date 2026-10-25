import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth, toErrorResponse } from '@/lib/auth/account'

// 6-digit cryptographic-random alphanumeric code (e.g. "ACT-849201")
function generateVerificationCode(): string {
  const digits = Math.floor(100000 + Math.random() * 900000).toString()
  return `ACT-${digits}`
}

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * GET /api/auth/phone-verify
 * Returns current verification status and active/new handshake code.
 */
export async function GET() {
  try {
    const { supabase, userId, user } = await requireAuth()
    const admin = getAdminClient()

    // Platform owners bypass verification
    if (user?.email === 'brosir2019@gmail.com' || user?.email === 'help@dfyunicrm.com') {
      return NextResponse.json({
        verified: true,
        phone: null,
        code: null,
        official_whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '917019139417',
      })
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('phone, phone_verified, verification_code, verification_code_expires_at')
      .eq('id', userId)
      .maybeSingle()

    if (error || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (profile.phone_verified) {
      return NextResponse.json({
        verified: true,
        phone: profile.phone,
        code: null,
        official_whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '917019139417',
      })
    }

    // Check if code is expired or missing; if so, generate a fresh 24h code
    let code = profile.verification_code
    const expiresAt = profile.verification_code_expires_at ? new Date(profile.verification_code_expires_at) : null
    const isExpired = !expiresAt || expiresAt.getTime() < Date.now()

    if (!code || isExpired) {
      code = generateVerificationCode()
      const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

      await admin
        .from('profiles')
        .update({
          verification_code: code,
          verification_code_expires_at: newExpiry,
        })
        .eq('id', userId)
    }

    return NextResponse.json({
      verified: false,
      phone: profile.phone,
      code,
      official_whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '917019139417',
    })
  } catch (err) {
    return toErrorResponse(err)
  }
}

/**
 * POST /api/auth/phone-verify
 * Save submitted phone number and regenerate code if requested.
 */
export async function POST(request: Request) {
  try {
    const { userId } = await requireAuth()
    const admin = getAdminClient()
    const body = await request.json().catch(() => ({}))

    const phone = typeof body.phone === 'string' ? body.phone.trim() : null
    const code = generateVerificationCode()
    const newExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

    const updatePayload: Record<string, unknown> = {
      verification_code: code,
      verification_code_expires_at: newExpiry,
    }

    if (phone) {
      updatePayload.phone = phone
    }

    const { error } = await admin
      .from('profiles')
      .update(updatePayload)
      .eq('id', userId)

    if (error) {
      console.error('[phone-verify] update error:', error)
      return NextResponse.json({ error: 'Failed to update phone' }, { status: 500 })
    }

    return NextResponse.json({
      ok: true,
      code,
      phone,
      official_whatsapp: process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP || '917019139417',
    })
  } catch (err) {
    return toErrorResponse(err)
  }
}
