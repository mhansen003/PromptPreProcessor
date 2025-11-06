import * as jose from 'jose';

export interface AuthSession {
  email: string;
  issuedAt: number;
  expiresAt: number;
}

// Configuration (shared across all auth modules)
export const AUTH_CONFIG = {
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 5,
  RATE_LIMIT_WINDOW_MINUTES: 15,
  MAX_REQUESTS_PER_WINDOW: 20,
  SESSION_EXPIRY_HOURS: 120, // 5 days
  ALLOWED_DOMAIN: 'cmgfi.com', // CMG Financial employees only
  COOKIE_NAME: 'prompt_auth_token',
};

// Validate email domain
export function isValidCMGEmail(email: string): boolean {
  const emailLower = email.toLowerCase().trim();
  return emailLower.endsWith(`@${AUTH_CONFIG.ALLOWED_DOMAIN}`);
}

// Create JWT token
export async function createAuthToken(email: string): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const session: AuthSession = {
    email,
    issuedAt: Date.now(),
    expiresAt: Date.now() + AUTH_CONFIG.SESSION_EXPIRY_HOURS * 60 * 60 * 1000,
  };

  const token = await new jose.SignJWT(session)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(`${AUTH_CONFIG.SESSION_EXPIRY_HOURS}h`)
    .sign(secret);

  return token;
}

// Verify JWT token
export async function verifyAuthToken(token: string): Promise<AuthSession | null> {
  if (!process.env.JWT_SECRET) {
    console.error('[Auth] JWT_SECRET not configured');
    throw new Error('JWT_SECRET not configured');
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    const decoded = payload as unknown as AuthSession;

    // Check if token is expired
    if (decoded.expiresAt < Date.now()) {
      console.log('[Auth] Token expired');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('[Auth] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

// Get OTP Redis key
export function getOTPKey(email: string): string {
  return `otp:${email.toLowerCase()}`;
}

// Get rate limit Redis key
export function getRateLimitKey(email: string): string {
  return `ratelimit:${email.toLowerCase()}`;
}
