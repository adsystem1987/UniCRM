-- ============================================================
-- Migration 057: Profile Phone & Onboarding Verification Handshake
-- Adds phone, verification code, and phone_verified to profiles
-- for anti-spam onboarding gate & 1-click WhatsApp handshake.
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_code'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_code TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'verification_code_expires_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN verification_code_expires_at TIMESTAMPTZ;
  END IF;
END $$;

-- Fast index on profiles(verification_code) for inbound verification handshake lookup
CREATE INDEX IF NOT EXISTS idx_profiles_verification_code
  ON profiles(verification_code)
  WHERE verification_code IS NOT NULL;

-- Automatically mark platform owners as pre-verified so they are never blocked
UPDATE profiles
SET phone_verified = TRUE
WHERE email IN ('brosir2019@gmail.com', 'help@dfyunicrm.com');
