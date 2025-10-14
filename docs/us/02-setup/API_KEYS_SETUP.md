# API Keys Setup Guide

This guide will help you obtain the necessary API keys for the Passkey integration.

---

## 🔑 Required API Keys

### 1. Para SDK API Key (REQUIRED)

**What is it?**  
Para SDK enables Passkey authentication (Face ID, Touch ID, Windows Hello) for Solana wallets.

**How to get it:**

1. **Visit Para Dashboard**  
   Go to: https://para.build or https://dashboard.para.build

2. **Sign Up / Log In**  
   Create an account or log in

3. **Create a New Project**  
   - Project Name: `Solana Merchant AI`
   - Blockchain: `Solana`
   - Environment: `Development` (for testing)

4. **Get Your API Key**  
   - Navigate to API Keys section
   - Copy your API key (starts with `beta_`)
   
5. **Add to .env file**
   ```bash
   VITE_PARA_API_KEY=beta_YOUR_ACTUAL_KEY_HERE
   ```

**Note**: For the MVP, you can use the **free tier** which is sufficient for testing. The default placeholder `beta_YOUR_API_KEY_GOES_HERE` may work for basic testing, but for production you need a real key.

---

### 2. Helius RPC API Key (OPTIONAL but RECOMMENDED)

**What is it?**  
Helius provides high-performance RPC nodes for Solana with better reliability and speed than public RPCs.

**Why use it?**  
- Faster transaction confirmations
- Higher rate limits
- Better reliability for Passkey transactions
- Free tier available

**How to get it:**

1. **Visit Helius**  
   Go to: https://helius.dev or https://dashboard.helius.dev

2. **Sign Up**  
   Create a free account

3. **Create API Key**  
   - Navigate to API Keys
   - Click "Create API Key"
   - Name: `Solana Merchant AI Dev`
   - Copy the key

4. **Add to .env file**
   ```bash
   VITE_HELIUS_API_KEY=your-helius-api-key-here
   ```

**If you don't add Helius key:**  
The app will fallback to the default Solana RPC:
- Devnet: `https://api.devnet.solana.com`
- Mainnet: `https://api.mainnet-beta.solana.com`

---

## ⚙️ Complete .env Configuration

Your `.env` file should look like this:

```bash
# Supabase LOCAL (para dev)
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Solana Configuration - devnet
VITE_SOLANA_CLUSTER=devnet
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_MERCHANT_RECIPIENT=5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE
VITE_BRZ_MINT_DEVNET=6PzmkfqSn8uoN8adp4uk6nsL8VbdRrJocpB8LxEH4pA4

# OpenAI
OPENAI_API_KEY=

# Dev Mode
DEMO_MODE=false

# Para SDK (Passkeys) - REQUIRED for Passkey auth
VITE_PARA_API_KEY=beta_YOUR_ACTUAL_PARA_KEY_HERE

# Helius RPC - OPTIONAL but recommended
VITE_HELIUS_API_KEY=your-helius-key-here
```

---

## 🚀 After Adding Keys

1. **Restart the development server**
   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   npm run dev
   ```

2. **Verify in browser console**
   - Open DevTools (F12)
   - Check for Para SDK initialization logs
   - Look for "Para SDK initialized with..." message

3. **Test Passkey flow**
   - Navigate to `/onboarding` or POS page
   - Click "Create Wallet with Passkeys"
   - Follow browser prompts

---

## 🔍 Troubleshooting

### "Para SDK failed to initialize"
- ✅ Check that `VITE_PARA_API_KEY` is set in `.env`
- ✅ Restart dev server after adding key
- ✅ Check browser console for detailed error

### "RPC request failed"
- ✅ Add Helius API key for better reliability
- ✅ Check Solana cluster is set to `devnet`
- ✅ Verify internet connection

### "Invalid API key format"
- ✅ Para keys should start with `beta_`
- ✅ No quotes around the key in `.env`
- ✅ No extra spaces before/after key

---

## 📊 Free Tier Limits

### Para SDK (Free Tier)
- ✅ Unlimited Passkey authentications
- ✅ Unlimited wallet creations
- ✅ Perfect for MVP/testing

### Helius (Free Tier)
- ✅ 100,000 requests/month
- ✅ Sufficient for development and testing
- ✅ Upgrade available for production

---

## 🎯 Quick Start (Minimum Required)

If you want to test immediately:

1. **Get Para API Key** (5 minutes)
   - https://para.build → Sign up → Create project → Copy key

2. **Add to .env**
   ```bash
   VITE_PARA_API_KEY=beta_abc123...
   ```

3. **Restart server**
   ```bash
   npm run dev
   ```

4. **Test!** 🚀
   - Open http://localhost:8080
   - Look for Passkey option in wallet connection

---

**Next Steps**: After setting up keys, refer to `PARA_TESTING_GUIDE.md` for complete testing instructions.

