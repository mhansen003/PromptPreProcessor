'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const router = useRouter();
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const otpInputs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Auto-focus first OTP input
  useEffect(() => {
    if (step === 'otp' && otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, [step]);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || email.trim().length === 0) {
      setError('Please enter your CMG username');
      return;
    }

    // Smart email parsing: handle @cmgfi.com if provided, validate domain, or auto-append
    const trimmedInput = email.trim();
    let fullEmail: string;

    if (trimmedInput.includes('@')) {
      // User included @ symbol - validate it's @cmgfi.com
      const [username, domain] = trimmedInput.split('@');

      if (!username || username.length === 0) {
        setError('Please enter a username before @');
        return;
      }

      if (domain && domain.toLowerCase() !== 'cmgfi.com') {
        setError('Only @cmgfi.com email addresses are allowed');
        return;
      }

      // If they typed just "username@" without domain, append it
      fullEmail = domain ? `${username}@${domain.toLowerCase()}` : `${username}@cmgfi.com`;
    } else {
      // No @ symbol - just append @cmgfi.com
      fullEmail = `${trimmedInput}@cmgfi.com`;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send code');
      }

      setSuccess('Verification code sent! Check your email.');
      setStep('otp');
      setCountdown(300);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5 && otpInputs.current[index + 1]) {
      otpInputs.current[index + 1]?.focus();
    }
  };

  const handleOTPKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputs.current[index - 1]?.focus();
    }
  };

  const handleOTPPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = pastedData.split('');
    while (newOtp.length < 6) newOtp.push('');
    setOtp(newOtp);

    const lastIndex = Math.min(pastedData.length, 5);
    otpInputs.current[lastIndex]?.focus();

    if (pastedData.length === 6) {
      setTimeout(() => {
        const form = otpInputs.current[0]?.closest('form');
        if (form) form.requestSubmit();
      }, 100);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    // Smart email parsing: handle @cmgfi.com if provided, or auto-append
    const trimmedInput = email.trim();
    let fullEmail: string;

    if (trimmedInput.includes('@')) {
      const [username, domain] = trimmedInput.split('@');
      fullEmail = domain ? `${username}@${domain.toLowerCase()}` : `${username}@cmgfi.com`;
    } else {
      fullEmail = `${trimmedInput}@cmgfi.com`;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, code }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid code');
      }

      setSuccess('✅ Verified! Redirecting...');

      setTimeout(() => {
        window.location.href = '/';
      }, 1500);
    } catch (err: any) {
      setError(err.message);
      setOtp(['', '', '', '', '', '']);
      otpInputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setOtp(['', '', '', '', '', '']);
    await handleSendOTP(new Event('submit') as any);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-robinhood-dark flex items-center justify-center p-4">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-robinhood-green/10 rounded-full blur-3xl animate-pulse-slow"
        />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-robinhood-green">⚡</span> PromptPreProcessor
          </h1>
          <p className="text-gray-400">CMG Financial - Secure Access</p>
        </div>

        {/* Login Card */}
        <div className="bg-robinhood-card border border-robinhood-border rounded-2xl p-8 shadow-2xl">
          {step === 'email' ? (
            <form onSubmit={handleSendOTP}>
              <h2 className="text-2xl font-bold text-white mb-2">Sign In</h2>
              <p className="text-gray-400 mb-6">
                Enter your CMG username or email to receive a verification code
              </p>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  CMG Username or Email
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="firstname.lastname or firstname.lastname@cmgfi.com"
                    className="w-full px-4 py-3 bg-robinhood-darker border border-robinhood-border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-robinhood-green focus:ring-1 focus:ring-robinhood-green transition-colors"
                    required
                    disabled={loading}
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1.5">
                  Enter your username (we'll add @cmgfi.com) or full email
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full py-3 bg-robinhood-green text-robinhood-dark font-bold rounded-lg hover:bg-robinhood-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed glow-green"
              >
                {loading ? 'Sending Code...' : 'Send Verification Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP}>
              <button
                type="button"
                onClick={() => setStep('email')}
                className="text-gray-400 hover:text-white mb-4 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Change email
              </button>

              <h2 className="text-2xl font-bold text-white mb-2">Enter Code</h2>
              <p className="text-gray-400 mb-6">
                We sent a 6-digit code to <strong>
                  {email.includes('@') ? email : `${email}@cmgfi.com`}
                </strong>
              </p>

              <div className="mb-6">
                <div className="flex gap-2 justify-center" onPaste={handleOTPPaste}>
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        otpInputs.current[index] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOTPChange(index, e.target.value)}
                      onKeyDown={(e) => handleOTPKeyDown(index, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-robinhood-darker border-2 border-robinhood-border rounded-lg text-white focus:outline-none focus:border-robinhood-green focus:ring-2 focus:ring-robinhood-green/50 transition-all"
                      disabled={loading}
                    />
                  ))}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-robinhood-green/10 border border-robinhood-green/50 rounded-lg text-robinhood-green text-sm">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || otp.some((d) => !d)}
                className="w-full py-3 bg-robinhood-green text-robinhood-dark font-bold rounded-lg hover:bg-robinhood-green/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0}
                  className="text-sm text-gray-400 hover:text-robinhood-green disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {countdown > 0
                    ? `Resend code in ${formatTime(countdown)}`
                    : 'Resend code'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">
          Only @cmgfi.com emails are allowed
        </p>
      </div>
    </div>
  );
}
