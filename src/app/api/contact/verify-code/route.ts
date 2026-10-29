import { NextResponse } from 'next/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { sendEmail } from '@/lib/email/sender';

const SECRET_SALT = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXTAUTH_SECRET || 'unicrm-email-otp-secret-salt-2026';

function signOtpPayload(email: string, code: string, expiresAt: number): string {
  const data = `${email.toLowerCase().trim()}:${code}:${expiresAt}`;
  return createHmac('sha256', SECRET_SALT).update(data).digest('hex');
}

/**
 * POST /api/contact/verify-code
 * Action: 'send' -> generates 6-digit OTP, sends via Unitpost email, returns { token, expiresAt }
 * Action: 'verify' -> verifies { email, code, token, expiresAt }, returns { verified: true }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, code, token, expiresAt } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Valid email address is required.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!isEmailValid) {
      return NextResponse.json({ error: 'Invalid email format.' }, { status: 400 });
    }

    // 1. ACTION: SEND OTP
    if (action === 'send') {
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
      const codeExpiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
      const verificationToken = signOtpPayload(cleanEmail, generatedCode, codeExpiresAt);

      const emailHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f9fa; margin: 0; padding: 24px; color: #111827; }
            .card { max-width: 460px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e5e7eb; box-shadow: 0 4px 16px rgba(0,0,0,0.04); }
            .code-box { background: #f3f4f6; border-radius: 12px; padding: 18px; text-align: center; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #0f172a; margin: 24px 0; border: 1px dashed #cbd5e1; }
            .footer { font-size: 12px; color: #6b7280; text-align: center; margin-top: 24px; }
          </style>
        </head>
        <body>
          <div class="card">
            <h2 style="margin-top:0; font-size: 20px; font-weight: 700; color: #0f172a;">DFY UniCRM Verification Code</h2>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.5;">
              Use the following verification code to confirm your inquiry with our live support team:
            </p>
            <div class="code-box">${generatedCode}</div>
            <p style="font-size: 13px; color: #6b7280; line-height: 1.4;">
              This code expires in 10 minutes. If you did not request this verification, you can safely ignore this email.
            </p>
            <div class="footer">
              &copy; DFY UniCRM • Zero Software Subscriptions
            </div>
          </div>
        </body>
        </html>
      `;

      const sendResult = await sendEmail({
        to: cleanEmail,
        subject: `${generatedCode} is your DFY UniCRM Verification Code`,
        html: emailHtml,
        text: `Your DFY UniCRM verification code is: ${generatedCode}. It expires in 10 minutes.`,
      });

      if (!sendResult.success) {
        console.error('[verify-code] failed to send email via Unitpost:', sendResult.error);
        return NextResponse.json(
          { error: 'Could not deliver verification email. Please check your email address or use WhatsApp.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent to your email.',
        token: verificationToken,
        expiresAt: codeExpiresAt,
      });
    }

    // 2. ACTION: VERIFY OTP
    if (action === 'verify') {
      if (!code || typeof code !== 'string' || !token || !expiresAt) {
        return NextResponse.json({ error: 'Code, token, and expiry are required.' }, { status: 400 });
      }

      if (Date.now() > Number(expiresAt)) {
        return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
      }

      const expectedToken = signOtpPayload(cleanEmail, code.trim(), Number(expiresAt));

      const isMatch =
        expectedToken.length === token.length &&
        timingSafeEqual(Buffer.from(expectedToken), Buffer.from(token));

      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect verification code. Please check and try again.' }, { status: 400 });
      }

      // Success
      return NextResponse.json({
        success: true,
        verified: true,
        email: cleanEmail,
      });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('[verify-code] error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
