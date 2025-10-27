# 🎯 Quick Fixes for Hackathon Demo

## Status Check

### What's Working ✅
1. On-chain validation (tested with TX 3EVQUbMk...)
2. QR code generation
3. Wallet adapter
4. Database & RLS

### What Needs Testing 🧪
1. **Frontend E2E flow** - Create charge → Payment → Confirmation
2. **AI voice** - Edge Function works, UI needs test

---

## Test Plan (5 minutes)

### 1. Start Everything
```bash
# Terminal 1: Supabase
npx supabase start

# Terminal 2: Edge Functions (if needed)
cd supabase/functions
supabase functions serve --no-verify-jwt

# Terminal 3: Frontend
npm run dev
```

### 2. Test DEMO_MODE (Fastest)
- Login to app
- Go to POS
- Create charge R$ 10
- Should confirm automatically in ~5s
- ✅ Ready for recording!

### 3. Test AI Voice (Optional)
- Click mic button in header
- Should show popover with VoiceInput
- Edge Function confirmed working: `ek_68ff851b...`
- If UI has issue: safe to skip for demo video

---

## Demo Recording Script

**Pitch Video (3 min):**
1. Open app → POS
2. Create charge R$ 25
3. QR code appears
4. (Optional) Phantom payment OR DEMO auto-confirm
5. Status: confirmed ✅
6. Go to Receipts → Show transaction

**Technical Video (3 min):**
1. Show architecture: Vite + React + Supabase
2. Show Edge Functions in `supabase/functions/`
3. Show on-chain validation code
4. Show database schema with RLS
5. Show settlement architecture (Circle/Wise)

---

## Key Point

**DEMO_MODE makes this easy!** 
- No need for real blockchain transactions
- Fast and reliable
- Perfect for video recording
- Shows full flow working

