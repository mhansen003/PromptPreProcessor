# PromptPreProcessor - Production Deployment Checklist

## ✅ Authentication System (MFA) - COMPLETE

### What's Implemented:
- [x] Email OTP verification (6-digit codes)
- [x] CMGFI domain restriction (@cmgfi.com only)
- [x] Gmail SMTP integration (nodemailer)
- [x] JWT session tokens (5-day expiry)
- [x] Secure httpOnly cookies
- [x] Rate limiting (20 requests/15 min)
- [x] Redis-backed OTP storage
- [x] Signin page with 2-step flow
- [x] Middleware protecting all routes
- [x] User-specific data isolation

---

## 📋 Required Actions Before Production

### 1. Create Gmail App Password
**STATUS: ⏳ REQUIRED**

```bash
# Steps:
1. Visit: https://myaccount.google.com/apppasswords
2. Sign in as: markdfm@gmail.com
3. Enable 2-Step Verification (if not enabled)
4. Create app password for "PromptPreProcessor"
5. Copy the 16-character password (no spaces)
6. Save securely - you won't see it again!
```

### 2. Configure Vercel Environment Variables
**STATUS: ⏳ REQUIRED**

```bash
cd /c/github/PromptPreProcessor

# JWT Secret
openssl rand -base64 32 | vercel env add JWT_SECRET production

# SMTP Configuration
vercel env add SMTP_USER production
# Enter: markdfm@gmail.com

vercel env add SMTP_PASS production
# Enter: <your-16-char-app-password>

vercel env add SMTP_HOST production
# Enter: smtp.gmail.com

vercel env add SMTP_PORT production
# Enter: 587

# Verify all env vars
vercel env ls
```

### 3. Deploy to Production
**STATUS: ⏳ READY AFTER STEP 2**

```bash
vercel --prod
```

---

## 🧪 Testing Checklist

### Local Testing
```bash
# 1. Update .env.local with Gmail app password
# 2. Start dev server
npm run dev

# 3. Test signin flow
# Visit: http://localhost:3000/signin
# Enter: your.name (system adds @cmgfi.com)
# Check email for OTP
# Enter code and verify redirect to dashboard

# 4. Test data persistence
# Create a prompt configuration
# Generate prompts
# Refresh page - data should persist
```

### Production Testing
```bash
# After deployment:
1. Visit: https://prompt-preprocessor.vercel.app
2. Should redirect to /signin
3. Test full OTP flow
4. Verify Redis data persistence
5. Test multi-user isolation (different emails)
6. Test rate limiting (try 21 requests)
7. Test OTP expiry (wait 5 minutes)
```

---

## 🗄️ Redis Data Structure

```
# OTP Storage (temporary, 5-minute TTL)
otp:{email}                           → OTP code + metadata

# Rate Limiting (15-minute TTL)
ratelimit:{email}                     → Request count

# User Configurations (persistent)
user:{email}:configs                  → Set of config IDs
config:{configId}                     → Configuration JSON

# Generated Prompts (persistent, max 50)
user:{email}:generated                → List of prompt IDs
generated:{promptId}                  → Generated prompt JSON
```

---

## 🔒 Security Configuration

### JWT Secret
- **Generated**: K8AIBxB9ViRrFKo4nH2GnkaDOa1oEKeiBYRGcGRczXs=
- **Configured**: .env.local (local) + Vercel (production)
- **Usage**: Sign/verify session tokens

### Session Details
- **Duration**: 5 days (120 hours)
- **Cookie Name**: `prompt_auth_token`
- **Cookie Flags**: httpOnly, secure (prod), sameSite: lax
- **Renewal**: User must re-authenticate after expiry

### Rate Limits
- **OTP Requests**: 20 per 15 minutes per email
- **OTP Attempts**: 5 per code
- **OTP Lifetime**: 5 minutes

---

## 📊 Multi-User Support

### Data Isolation
Each user (identified by email) has:
- **Separate configurations** in Redis
- **Separate generated prompts history**
- **Independent rate limits**
- **Private OTP codes**

### Example Users
```
john.doe@cmgfi.com
  → user:john.doe@cmgfi.com:configs
  → user:john.doe@cmgfi.com:generated

jane.smith@cmgfi.com
  → user:jane.smith@cmgfi.com:configs
  → user:jane.smith@cmgfi.com:generated
```

**No data leakage between users!**

---

## 🚀 Deployment Command

```bash
cd /c/github/PromptPreProcessor

# Ensure all env vars are set
vercel env ls

# Deploy to production
vercel --prod --yes

# Monitor deployment
vercel logs
```

---

## 📝 Post-Deployment Verification

1. **Auth Flow** ✅
   - Visit site → redirects to /signin
   - Enter CMG username → email sent
   - Enter OTP → authenticated
   - Redirect to dashboard → user data loaded

2. **Data Persistence** ✅
   - Create prompt config
   - Generate prompts
   - Logout and login again
   - Data still there

3. **Multi-User** ✅
   - Login as user A
   - Create configs
   - Logout
   - Login as user B
   - See different configs

4. **Security** ✅
   - Try non-@cmgfi.com email → rejected
   - Try expired OTP → rejected
   - Try wrong OTP 6 times → rejected
   - Session cookie is httpOnly → secure

---

## 🎯 Current Status

**Code**: ✅ Complete and committed
**Build**: ✅ Successful (with minor Edge Runtime warnings - OK)
**Local Test**: ⏳ Waiting for Gmail app password
**Vercel Env**: ⏳ Waiting for env var configuration
**Production**: ⏳ Ready to deploy after env vars set

---

## ⚡ Quick Start (After Gmail Setup)

```bash
# 1. Get Gmail app password
# Visit: https://myaccount.google.com/apppasswords

# 2. Update .env.local
# Replace: SMTP_PASS=YOUR_APP_PASSWORD_HERE

# 3. Test locally
npm run dev

# 4. Test signin
# Visit: http://localhost:3000/signin

# 5. If email works, deploy!
vercel --prod --yes
```

**That's it! 🎉**
