# Gmail SMTP Setup Guide for PromptPreProcessor

## Overview
PromptPreProcessor uses Gmail SMTP to send email verification codes (OTP) for user authentication. Only @cmgfi.com email addresses are allowed.

---

## Step 1: Create Gmail App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/apppasswords
   - Sign in with markdfm@gmail.com

2. **Enable 2-Step Verification** (if not already enabled)
   - Click "Security" in the left sidebar
   - Find "2-Step Verification" and enable it
   - This is required before creating app passwords

3. **Create App Password**
   - Go back to https://myaccount.google.com/apppasswords
   - Click "Select app" → Choose "Mail"
   - Click "Select device" → Choose "Other (Custom name)"
   - Enter: "PromptPreProcessor"
   - Click "Generate"

4. **Copy the 16-Character Password**
   - Google will show a 16-character password like: `abcd efgh ijkl mnop`
   - Remove spaces: `abcdefghijklmnop`
   - **Save this password** - you won't see it again!

---

## Step 2: Configure Environment Variables

### Local Development (.env.local)

Already configured in `.env.local`:

```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=markdfm@gmail.com
SMTP_PASS=YOUR_APP_PASSWORD_HERE  # ← Replace with 16-char password
```

**Action Required:**
- Replace `YOUR_APP_PASSWORD_HERE` with your actual app password

### Vercel Production

Add environment variables in Vercel dashboard or via CLI:

```bash
cd /c/github/PromptPreProcessor

# Add SMTP credentials
echo "your-16-char-app-password" | vercel env add SMTP_PASS production
vercel env add SMTP_USER production
# Enter: markdfm@gmail.com

vercel env add SMTP_HOST production
# Enter: smtp.gmail.com

vercel env add SMTP_PORT production
# Enter: 587

# Add JWT secret
openssl rand -base64 32 | vercel env add JWT_SECRET production
```

---

## Step 3: Test Email Sending

### Test Locally

1. Update `.env.local` with your app password
2. Start dev server: `npm run dev`
3. Visit: http://localhost:3000/signin
4. Enter a test CMG username
5. Check that email arrives at @cmgfi.com address

### Test in Production

1. Deploy: `vercel --prod`
2. Visit: https://prompt-preprocessor.vercel.app/signin
3. Test the full login flow

---

## Step 4: Verify Redis Connection

The app uses Vercel KV (Redis) for:
- Storing OTP codes (5-minute TTL)
- Rate limiting (20 requests per 15 minutes)
- User configurations (persistent)
- Generated prompts history (last 50 per user)

**Vercel will automatically configure these:**
- `KV_URL`
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `KV_REST_API_READ_ONLY_TOKEN`

---

## Email Flow

```
User enters username (e.g., "john.doe")
  ↓
System appends "@cmgfi.com" → "john.doe@cmgfi.com"
  ↓
Validates domain is @cmgfi.com
  ↓
Generates 6-digit OTP code
  ↓
Saves OTP to Redis with 5-minute expiry
  ↓
Sends email via Gmail SMTP
  ↓
User checks email and enters code
  ↓
System verifies code (5 attempts max)
  ↓
Creates JWT session token (valid 5 days)
  ↓
Sets httpOnly cookie
  ↓
User redirected to dashboard
```

---

## Security Features

✅ **Email Domain Restriction**: Only @cmgfi.com allowed
✅ **OTP Expiry**: 5 minutes
✅ **Rate Limiting**: Max 20 requests per 15 minutes
✅ **Attempt Limiting**: Max 5 wrong OTP attempts
✅ **Secure Cookies**: httpOnly, sameSite, secure in production
✅ **JWT Expiry**: 5-day sessions
✅ **Auto-cleanup**: Redis automatically deletes expired OTPs

---

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**
   ```bash
   vercel env ls
   ```
   Ensure SMTP_USER and SMTP_PASS are set

2. **Verify app password**
   - Must be 16-character app-specific password
   - NOT your regular Gmail password
   - Regenerate if needed

3. **Check Gmail security settings**
   - 2-Step Verification must be ON
   - Less secure app access OFF (use app passwords instead)

### "Too many requests" Error

- Rate limit: 20 requests per 15 minutes per email
- Wait 15 minutes or clear Redis: `vercel kv exec "DEL ratelimit:user@cmgfi.com"`

### Redis Connection Errors

- Verify Vercel KV is connected to your project
- Check environment variables are set
- Review logs: `vercel logs`

---

## Environment Variables Checklist

### Required for Local Development:
- [x] OPENAI_API_KEY
- [ ] JWT_SECRET
- [ ] SMTP_USER
- [ ] SMTP_PASS (Gmail app password)
- [ ] SMTP_HOST
- [ ] SMTP_PORT

### Required for Production (Vercel):
- [ ] OPENAI_API_KEY (already set)
- [ ] JWT_SECRET (needs to be added)
- [ ] SMTP_USER (needs to be added)
- [ ] SMTP_PASS (needs to be added)
- [ ] SMTP_HOST (needs to be added)
- [ ] SMTP_PORT (needs to be added)
- [x] KV_* variables (auto-configured by Vercel)

---

## Next Steps

1. **Create Gmail App Password** (follow Step 1 above)
2. **Update .env.local** with app password
3. **Test locally** at http://localhost:3000/signin
4. **Add env vars to Vercel** (see Step 2 above)
5. **Deploy and test** in production

Once configured, all @cmgfi.com users can sign in securely with email verification!
