# PromptPreProcessor Production Architecture Plan

## Executive Summary
Transform PromptPreProcessor into a production-ready, multi-user SaaS application with Redis persistence, authentication, and enhanced prompt generation capabilities for the financial/mortgage industry.

---

## Phase 1: UI/UX Enhancements (Immediate)

### 1.1 Structure Enhancements
**New Toggle Options:**
- ✅ Include Tables
- ✅ Include Snippets to Extract
- ✅ Include External References
- ✅ Show Thought Process (CoT - Chain of Thought)
- ✅ Include Step-by-Step Reasoning
- ✅ Include Summary Sections

**Layout Fix:**
- Move toggle descriptions directly under toggle labels
- Reduce spacing between label and toggle switch
- Group related toggles visually

### 1.2 Audience Targeting (Customer-Focused)
**Replace "Target Audience" dropdown:**
```
Current: general, technical, executive, beginner, expert
New:     Gen Z (18-27), Millennial (28-43), Gen X (44-59),
         Boomer (60-78), Senior (79+), Mixed Audience
```

### 1.3 Industry Knowledge Control
**New Slider:**
- Label: "Industry Terminology"
- Range: 0-100
- Left: "Explain All Terms"
- Right: "Use Industry Acronyms"
- Examples:
  - Low (0): "Annual Percentage Rate"
  - High (100): "APR"
- Context: Financial/Mortgage industry (LTV, DTI, ARM, etc.)

### 1.4 Configuration Management
**Improvements:**
- ✅ In-line rename (click name to edit in sidebar)
- ✅ Delete confirmation dialog with prompt name
- ✅ Duplicate creates "(name) Copy" automatically
- ❌ Remove "Stats" section entirely

---

## Phase 2: Enhanced Generate System

### 2.1 Multi-Generate Modal
**Trigger:** Click "⚡ Generate Prompt"

**Modal Features:**
- Title: "Generate System Prompts"
- Input: "How many variations? (1-10)"
- Quick buttons: [1] [3] [5] [10]
- Generate button: "🎨 Generate X Variations"
- Shows progress: "Generating 3 of 5..."

**Generation Logic:**
- Use OpenAI with temperature variation (0.5, 0.7, 0.9)
- Each generation uses slightly different phrasing
- Maintains same configuration intent

### 2.2 Generated Prompts History Panel
**Location:** Right side panel (replaces current action buttons)

**Features:**
- Title: "Generated Prompts History"
- Shows: Last 20 generated prompts
- Display:
  ```
  [📋 Copy]
  11/6/2025 7:45 PM
  Teaching Assistant (variation 1/3)
  "You are an AI assistant with..."
  ```
- Actions:
  - Copy individual prompt
  - Delete from history
  - View full prompt (modal)
- Persisted to Redis per user

### 2.3 Generation Results Modal
**After Generation:**
- Modal title: "Generated Prompts (5)"
- Navigation: [← Prev] [1][2][3][4][5] [Next →]
- Display current prompt with:
  - Configuration name
  - Variation number
  - Full prompt text
  - Character count
  - Copy button
  - "Save to History" button
- "Copy All" button at bottom

---

## Phase 3: Database Architecture (Redis)

### 3.1 Database: cmg-tools-db (Vercel Redis)

**Collections/Keys Pattern:**

```
user:{userId}:profile          → User profile data
user:{userId}:configs          → Set of config IDs
config:{configId}              → Configuration JSON
user:{userId}:generated        → List of generated prompts (FIFO, max 50)
generated:{promptId}           → Generated prompt data
session:{sessionId}            → Session data (NextAuth)
```

### 3.2 Data Schemas

**User Profile:**
```typescript
interface UserProfile {
  id: string;                    // UUID
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string;
  subscription: 'free' | 'pro';  // Future expansion
}
```

**Configuration:**
```typescript
interface SavedConfig extends PromptConfig {
  userId: string;                // Owner
  configId: string;              // UUID
  createdAt: string;
  updatedAt: string;
  isShared: boolean;             // Future: sharing
}
```

**Generated Prompt:**
```typescript
interface GeneratedPrompt {
  id: string;                    // UUID
  userId: string;
  configId: string;
  configName: string;
  promptText: string;
  variation: number;             // 1-10
  totalVariations: number;       // How many in batch
  temperature: number;           // 0.5-0.9
  characterCount: number;
  createdAt: string;
}
```

### 3.3 Redis Commands Used
```javascript
// Store user config
HSET config:{configId} field1 value1 field2 value2

// Add config to user's set
SADD user:{userId}:configs {configId}

// Store generated prompt in list (FIFO with max 50)
LPUSH user:{userId}:generated {promptId}
LTRIM user:{userId}:generated 0 49

// Get user's configs
SMEMBERS user:{userId}:configs
// For each: HGETALL config:{configId}

// Get generated prompts history
LRANGE user:{userId}:generated 0 19  // Last 20
```

---

## Phase 4: Authentication System

### 4.1 NextAuth.js Configuration

**Providers:**
- Email/Password (Credentials)
- Google OAuth (primary)
- GitHub OAuth (secondary)

**Setup:**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Verify against Redis
        // Return user object or null
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/auth/signout',
    error: '/auth/error',
  }
}
```

### 4.2 Protected Routes
```typescript
// middleware.ts
export { default } from "next-auth/middleware"

export const config = {
  matcher: [
    '/dashboard',
    '/api/configs/:path*',
    '/api/generate-prompt',
    '/api/test-prompt'
  ]
}
```

### 4.3 Sign In Page
- Logo + "PromptPreProcessor"
- Tagline: "Professional Prompt Engineering for Financial Services"
- "Sign in with Google" button
- "Sign in with Email" form
- "Don't have an account? Sign up"

---

## Phase 5: API Routes

### 5.1 Configuration Management
```
GET    /api/configs              → Get all user configs
POST   /api/configs              → Create new config
PUT    /api/configs/[id]         → Update config
DELETE /api/configs/[id]         → Delete config
```

### 5.2 Prompt Generation
```
POST   /api/generate-prompt      → Generate X variations
                                   Body: { config, count: 1-10 }
                                   Returns: { prompts: [...] }
```

### 5.3 Generated Prompts History
```
GET    /api/generated            → Get last 20 generated prompts
POST   /api/generated            → Save to history
DELETE /api/generated/[id]       → Remove from history
```

### 5.4 Test Harness
```
POST   /api/test-prompt          → Test with OpenAI
                                   (existing, update to save results)
```

---

## Phase 6: Environment Variables

```env
# Database
REDIS_URL=                        # Vercel Redis URL
REDIS_TOKEN=                      # Vercel Redis Token

# OpenAI
OPENAI_API_KEY=                   # Already have

# NextAuth
NEXTAUTH_URL=                     # https://prompt-preprocessor.vercel.app
NEXTAUTH_SECRET=                  # Random secret (openssl rand -base64 32)

# OAuth
GOOGLE_CLIENT_ID=                 # Google Cloud Console
GOOGLE_CLIENT_SECRET=             # Google Cloud Console
GITHUB_CLIENT_ID=                 # Optional
GITHUB_CLIENT_SECRET=             # Optional
```

---

## Phase 7: Updated UI Layout

```
┌─────────────┬───────────────────────────────────┬─────────────────┐
│   Sidebar   │        Main Controls              │  History Panel  │
│   (260px)   │          (flex-1)                 │     (340px)     │
├─────────────┼───────────────────────────────────┼─────────────────┤
│             │                                   │                 │
│ + New       │  [Config Name - editable]         │ Generated       │
│             │                                   │ Prompts (15)    │
│ • Teaching  │  Response Style:                  │                 │
│   Assistant │  - Detail [====●====]            │ [📋] 7:45 PM    │
│             │    Low: brief → High: detailed    │ Teaching...     │
│   Code      │                                   │ "You are an..." │
│   Review    │  - Formality [===●=====]         │                 │
│             │    Low: casual → High: formal     │ [📋] 7:42 PM    │
│ • Story     │                                   │ Code Review...  │
│   Teller    │  Structure:                       │                 │
│             │  ☑ Tables                         │ [📋] 7:40 PM    │
│             │    Include data tables            │ Executive...    │
│ [Profile]   │  ☑ Thought Process                │                 │
│ [Sign Out]  │    Show internal reasoning        │ [View All]      │
│             │                                   │                 │
│             │  Industry Knowledge:              │ Actions:        │
│             │  [====●========]                  │                 │
│             │  Explain ← → Use Acronyms         │ ⚡ Generate     │
│             │                                   │ 🧪 Test         │
│             │  Target Generation:               │ 📋 Duplicate    │
│             │  [Millennial (28-43) ▼]           │                 │
└─────────────┴───────────────────────────────────┴─────────────────┘
```

---

## Phase 8: Implementation Order

### Sprint 1: UI Updates (2-3 hours)
1. Add new structure toggles
2. Fix button/description spacing
3. Update Target Audience dropdown
4. Add Industry Knowledge slider
5. Improve configuration naming UI
6. Remove stats section

### Sprint 2: Multi-Generate Modal (2 hours)
1. Create generate modal component
2. Add variation count selector
3. Implement batch generation logic
4. Create results viewer with navigation

### Sprint 3: History Panel (1 hour)
1. Create history panel component
2. Add copy/delete functionality
3. Wire up to localStorage (temp)

### Sprint 4: Database Setup (3 hours)
1. Set up Vercel Redis (cmg-tools-db)
2. Create database utility functions
3. Design and test schemas
4. Create API routes

### Sprint 5: Authentication (4 hours)
1. Install NextAuth.js
2. Configure Google OAuth
3. Create sign-in page
4. Protect routes
5. Add user profile

### Sprint 6: Full Integration (3 hours)
1. Replace localStorage with Redis calls
2. Add user context throughout
3. Test full flow
4. Handle errors gracefully

### Sprint 7: Polish & Deploy (2 hours)
1. Error boundaries
2. Loading states
3. Success toasts
4. Production testing
5. Deploy to Vercel

**Total Estimated Time: 17-20 hours**

---

## Phase 9: Success Metrics

**User Experience:**
- ✅ Sign in < 5 seconds
- ✅ Config load < 1 second
- ✅ Generate prompt < 3 seconds
- ✅ Zero data loss (Redis persistence)

**Technical:**
- ✅ Redis connection pooling
- ✅ API rate limiting
- ✅ Error logging (Sentry?)
- ✅ Uptime > 99.5%

**Business:**
- ✅ User registration tracking
- ✅ Usage analytics (prompts generated per user)
- ✅ Most popular configurations
- ✅ Retention metrics

---

## Phase 10: Future Enhancements (Post-Launch)

1. **Team Collaboration**
   - Share configurations with team
   - Organization accounts

2. **Prompt Templates Library**
   - Pre-built industry templates
   - Community sharing

3. **Analytics Dashboard**
   - Usage graphs
   - Popular settings
   - A/B test results

4. **API Access**
   - REST API for integrations
   - Webhook support

5. **Advanced Features**
   - Version history for configs
   - Export/import configurations
   - Prompt performance scoring

---

## Ready to Build?

This plan provides:
- ✅ Clear architecture
- ✅ Defined schemas
- ✅ Implementation order
- ✅ Time estimates
- ✅ Success criteria

**Next Step:** Begin Sprint 1 - UI Updates

Would you like me to proceed with implementation?
