# 🎯 E2E Testing Plan for Hackathon Demo

## Current Status

### ✅ Working
1. **On-chain validation** - Tested and confirmed ✅
2. **Database schema** - All RPCs moved to public schema ✅
3. **QR code generation** - Solana Pay working ✅
4. **Wallet adapter** - Phantom/Solflare/Backpack ✅
5. **Settlement infrastructure** - Circle/Wise ready ✅

### ⚠️ Needs Testing
1. **AI Voice Interface** - Edge Function works but UI needs polish
2. **Token Balance** - Need tBRZ in merchant wallet for real payments

---

## Solutions for Demo

### Option A: DEMO_MODE (Recommended for Video)
- Set `DEMO_MODE=true` in `.env`
- Payments confirm automatically without real blockchain transaction
- Fast and reliable for recording

### Option B: Real Devnet Transactions
- Mint tBRZ to merchant wallet
- Make real Devnet payments
- More realistic but slower

---

## Testing Flow (E2E)

### 1. Setup (One-time)
```bash
# Ensure Supabase is running
npx supabase start

# Ensure env is configured
cp .env.example .env
# Edit .env: VITE_MERCHANT_RECIPIENT=5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE

# Start dev server
npm run dev
```

### 2. Demo Script (for recording)
1. Open app → Login
2. Go to POS page
3. Enter amount: R$ 10.00
4. Click "Generate Charge"
5. **QR code appears** ✅
6. Click "Pay with Wallet" (if connected)
7. **Status updates to "confirmed"** ✅ (DEMO_MODE or real)
8. Go to Receipts → See confirmed transaction ✅

### 3. AI Voice (Optional Enhancement)
- Simplest: Remove mic button temporarily
- Or: Use console.log to show AI is working
- Or: Implement simple Gemini chat only

---

## Priority Actions

1. ✅ **Test DEMO_MODE** - Verify payments confirm quickly
2. ⏳ **Polish UI** - Ensure all buttons visible and working
3. ⏳ **Record videos** - Pitch + Technical (≤3 min each)
4. ⏳ **Deploy demo** - Vercel/Netlify

---

## Quick Win: Simplify AI for Demo

Instead of complex voice, show:
- ✅ Text-based chat (Gemini already working)
- ✅ "Show today's sales" queries
- ✅ Natural language → SQL execution

**This is easier to demo and more reliable for recording!**

