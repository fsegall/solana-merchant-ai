# Environment Variables Setup Guide

This guide explains all environment variables needed for **Solana Merchant AI**.

---

## 🔑 Frontend Environment Variables

Create a `.env` file in the project root with the following variables:

### Para SDK (Passkeys & Embedded Wallets)

```bash
# Get your API key from: https://developer.para.com/
VITE_PARA_API_KEY=beta_YOUR_PARA_API_KEY_HERE
```

**How to get it:**
1. Visit [Para Developer Portal](https://developer.para.com/)
2. Sign up or log in
3. Create a new project
4. Copy your API key

---

### Helius (High-Performance Solana RPC)

```bash
# Get your API key from: https://dev.helius.xyz/
VITE_HELIUS_API_KEY=YOUR_HELIUS_API_KEY_HERE
```

**How to get it:**
1. Visit [Helius Developer Portal](https://dev.helius.xyz/)
2. Sign up or log in
3. Create an API key
4. Copy it

---

### Solana Configuration

```bash
# Network: devnet | mainnet-beta | testnet
VITE_SOLANA_CLUSTER=devnet

# Optional: Custom RPC URL (if not using Helius)
# VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

### Supabase Configuration

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 🔧 Backend Environment Variables

Configure these in `supabase/functions/.env`:

### Wise API (Multi-Currency Settlement)

```bash
WISE_API_TOKEN=your-wise-sandbox-token
WISE_PROFILE_ID=your-profile-id
WISE_RECIPIENT_ID=your-recipient-id
WISE_WEBHOOK_SECRET=your-webhook-secret
```

### Circle API (USDC Settlement)

```bash
CIRCLE_API_KEY=TEST_API_KEY:your-circle-key
CIRCLE_BASE_URL=https://api-sandbox.circle.com
CIRCLE_WALLET_ID=your-wallet-id
CIRCLE_WEBHOOK_SECRET=your-webhook-secret
```

### OpenAI (AI Assistant)

```bash
OPENAI_API_KEY=sk-your-key-here
```

### Demo Mode

```bash
# Enable for testing without real transfers
DEMO_MODE=true
```

---

## 📋 Complete Example

**Frontend (`.env` in project root):**

```bash
# Para SDK
VITE_PARA_API_KEY=beta_abc123xyz789

# Helius
VITE_HELIUS_API_KEY=def456uvw012

# Solana
VITE_SOLANA_CLUSTER=devnet

# Supabase
VITE_SUPABASE_URL=https://niocfujcwmbwictdpfsn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Backend (`supabase/functions/.env`):**

```bash
# Wise
WISE_API_TOKEN=live_abc123
WISE_PROFILE_ID=12345678
WISE_RECIPIENT_ID=87654321
WISE_WEBHOOK_SECRET=secret_xyz

# Circle
CIRCLE_API_KEY=TEST_API_KEY:abc123:def456
CIRCLE_BASE_URL=https://api-sandbox.circle.com
CIRCLE_WALLET_ID=1234-5678-9012-3456
CIRCLE_WEBHOOK_SECRET=whsec_xyz789

# OpenAI
OPENAI_API_KEY=sk-proj-abc123xyz789

# Demo Mode
DEMO_MODE=true
```

---

## ✅ Verification

After setting up, verify your configuration:

1. **Para SDK:**
   ```bash
   # Check if modal appears
   npm run dev
   # Click any "Connect" button
   ```

2. **Helius RPC:**
   ```bash
   # Check browser console for successful RPC calls
   # You should see fast response times (<100ms)
   ```

3. **Supabase:**
   ```bash
   # Try logging in
   # Check Supabase Dashboard for activity
   ```

---

## 🔒 Security Notes

- ❌ **Never commit `.env` files** to version control
- ✅ `.env` is already in `.gitignore`
- ✅ Use different keys for dev/staging/prod
- ✅ Rotate keys periodically
- ✅ Keep backend keys only in `supabase/functions/.env`

---

## 🚀 Quick Start

1. Copy this template to `.env`:
   ```bash
   cp docs/us/02-setup/ENV_SETUP_GUIDE.md .env
   # Edit with your values
   ```

2. Get your keys:
   - Para: https://developer.para.com/
   - Helius: https://dev.helius.xyz/
   - Supabase: Project settings

3. Start dev server:
   ```bash
   npm run dev
   ```

---

## 📚 Related Docs

- [Para SDK Documentation](https://docs.getpara.com/v2/react/quickstart)
- [Helius Documentation](https://docs.helius.dev/)
- [Supabase Environment Variables](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)


