export interface OTPData {
  code: string;
  email: string;
  attempts: number;
  createdAt: string;
  expiresAt: string;
}

export interface SendOTPRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  code: string;
}

export interface AuthSession {
  email: string;
  issuedAt: number;
  expiresAt: number;
}
