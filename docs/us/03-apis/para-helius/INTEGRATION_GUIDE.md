# Para SDK + Helius Integration Guide

Complete guide for **Passkey authentication** and **high-performance Solana RPC** integration in **Solana Merchant AI**.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Setup](#setup)
4. [Implementation](#implementation)
5. [Usage Examples](#usage-examples)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What is Para SDK?

**Para SDK** enables passwordless authentication using **Passkeys** (WebAuthn) for Solana applications:

- ✅ **Biometric auth**: Face ID, Touch ID, Windows Hello
- ✅ **Embedded wallets**: No browser extensions needed
- ✅ **Native Solana**: Full compatibility with Solana Pay
- ✅ **OAuth support**: Google, Twitter, Telegram login
- ✅ **Recovery options**: Secure key recovery mechanisms

### What is Helius?

**Helius** provides enterprise-grade Solana infrastructure:

- ✅ **High-performance RPC**: <100ms latency
- ✅ **Enhanced APIs**: Webhooks, NFT API, etc.
- ✅ **99.9% uptime**: Production-ready reliability
- ✅ **Developer-friendly**: Great docs and support

### Why Both?

Using **Para + Helius** together gives you:

1. **Best UX**: Passkeys for frictionless onboarding
2. **Best Performance**: Helius RPC for fast transactions
3. **Best for Hackathons**: Using ecosystem tools shows alignment

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Solana Merchant AI                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐       ┌──────────────┐                    │
│  │  Para SDK    │       │  Helius RPC  │                    │
│  │              │       │              │                    │
│  │  • Passkeys  │◄─────►│  • Fast RPC  │                    │
│  │  • Embedded  │       │  • Webhooks  │                    │
│  │    Wallets   │       │  • APIs      │                    │
│  └──────────────┘       └──────────────┘                    │
│         │                       │                            │
│         └───────┬───────────────┘                            │
│                 ▼                                            │
│        ┌─────────────────┐                                   │
│        │  Unified Signer │                                   │
│        │  Hook           │                                   │
│        └─────────────────┘                                   │
│                 │                                            │
│                 ▼                                            │
│        ┌─────────────────┐                                   │
│        │  Solana Pay     │                                   │
│        │  QR Codes       │                                   │
│        └─────────────────┘                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Key Components

1. **ParaProvider** (`src/contexts/ParaProvider.tsx`)
   - Wraps app with Para SDK
   - Configures Helius RPC endpoint
   - Manages authentication state

2. **useParaSolanaSigner** (`src/hooks/useParaSolanaSigner.ts`)
   - Unified signing interface
   - Auto-detects wallet type (Para vs External)
   - Provides consistent API

3. **PasskeyOnboarding** (`src/components/PasskeyOnboarding.tsx`)
   - Merchant onboarding UI
   - Passkey creation flow
   - Wallet connection options

4. **SolanaPayQR** (updated)
   - Works with Para wallets
   - Shows Passkey icon when active
   - Handles all transaction signing

---

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install @getpara/react-sdk@alpha @tanstack/react-query --save-exact --legacy-peer-deps
```

### 2. Get API Keys

#### Para API Key

1. Visit [Para Developer Portal](https://developer.para.com/)
2. Sign up or log in
3. Create a new project
4. Copy your API key (starts with `beta_`)

#### Helius API Key

1. Visit [Helius Developer Portal](https://dev.helius.xyz/)
2. Sign up or log in
3. Create an API key
4. Choose network (devnet/mainnet)

### 3. Configure Environment

Create `.env` in project root:

```bash
# Para SDK
VITE_PARA_API_KEY=beta_your_para_api_key_here

# Helius RPC
VITE_HELIUS_API_KEY=your_helius_api_key_here

# Solana Network
VITE_SOLANA_CLUSTER=devnet
```

---

## 🛠️ Implementation

### Step 1: Provider Setup

**File:** `src/contexts/ParaProvider.tsx`

```typescript
import { ParaProvider as ParaSDKProvider } from '@getpara/react-sdk';
import '@getpara/react-sdk/styles.css';

export const ParaProvider = ({ children }) => {
  const paraApiKey = import.meta.env.VITE_PARA_API_KEY;
  const heliusApiKey = import.meta.env.VITE_HELIUS_API_KEY;
  const network = import.meta.env.VITE_SOLANA_CLUSTER || 'devnet';
  
  const heliusEndpoint = heliusApiKey 
    ? `https://${network}.helius-rpc.com/?api-key=${heliusApiKey}`
    : `https://api.${network}.solana.com`;

  return (
    <ParaSDKProvider
      paraClientConfig={{
        apiKey: paraApiKey,
      }}
      externalWalletConfig={{
        appName: 'Solana Merchant AI',
        wallets: ['PHANTOM', 'SOLFLARE', 'BACKPACK'],
        solanaConnector: {
          config: {
            endpoint: heliusEndpoint,
          },
        },
      }}
      paraModalConfig={{
        oAuthMethods: ['GOOGLE'],
        authLayout: ['AUTH:FULL', 'EXTERNAL:FULL'],
        recoverySecretStepEnabled: true,
      }}
    >
      {children}
    </ParaSDKProvider>
  );
};
```

### Step 2: Unified Signer Hook

**File:** `src/hooks/useParaSolanaSigner.ts`

```typescript
export const useParaSolanaSigner = () => {
  const { isConnected: isParaConnected } = useAccount();
  const { data: paraWallet } = useParaWallet();
  const paraSigner = useSolanaSigner();
  const { publicKey: externalPublicKey, sendTransaction: externalSendTransaction } = useSolanaWallet();

  const isUsingPara = isParaConnected && paraWallet;
  const publicKey = isUsingPara ? new PublicKey(paraWallet.address) : externalPublicKey;

  const sendTransaction = async (transaction, connection) => {
    if (isUsingPara && paraSigner) {
      const signedTx = await paraSigner.signTransaction(transaction);
      return await connection.sendRawTransaction(signedTx.serialize());
    } else {
      return await externalSendTransaction(transaction, connection);
    }
  };

  return { publicKey, sendTransaction, isUsingParaWallet: isUsingPara };
};
```

### Step 3: Update App.tsx

```typescript
import { ParaProvider } from './contexts/ParaProvider';
import { SolanaProvider } from './contexts/SolanaProvider';

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ParaProvider>
      <SolanaProvider>
        {/* Your app content */}
      </SolanaProvider>
    </ParaProvider>
  </QueryClientProvider>
);
```

---

## 💻 Usage Examples

### Example 1: Passkey Onboarding

```typescript
import { useModal, useAccount } from '@/contexts/ParaProvider';

function OnboardingPage() {
  const { openModal } = useModal();
  const { isConnected } = useAccount();

  return (
    <div>
      {!isConnected ? (
        <button onClick={() => openModal()}>
          Create Wallet with Passkeys
        </button>
      ) : (
        <p>Wallet connected! ✅</p>
      )}
    </div>
  );
}
```

### Example 2: Send Transaction with Para

```typescript
import { useParaSolanaSigner } from '@/hooks/useParaSolanaSigner';
import { Transaction, SystemProgram } from '@solana/web3.js';

function SendPayment() {
  const { publicKey, sendTransaction, connection, isUsingParaWallet } = useParaSolanaSigner();

  const handlePay = async () => {
    if (!publicKey) {
      alert('Connect wallet first!');
      return;
    }

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipientPublicKey,
        lamports: 1000000, // 0.001 SOL
      })
    );

    // Works with both Para and external wallets!
    const signature = await sendTransaction(transaction, connection);
    console.log('Transaction sent:', signature);
  };

  return (
    <button onClick={handlePay}>
      {isUsingParaWallet ? '🔐 Pay with Passkey' : '💳 Pay with Wallet'}
    </button>
  );
}
```

### Example 3: Check Wallet Type

```typescript
const { walletType, isUsingParaWallet, isUsingExternalWallet } = useParaSolanaSigner();

if (isUsingParaWallet) {
  console.log('User is using Para embedded wallet (Passkey)');
} else if (isUsingExternalWallet) {
  console.log('User is using external wallet (Phantom, Solflare, etc.)');
}
```

---

## 🧪 Testing

### Test Checklist

- [ ] Para SDK loads without errors
- [ ] Passkey creation works (Face ID/Touch ID)
- [ ] Helius RPC endpoint is being used
- [ ] Transaction signing works with Para wallet
- [ ] Transaction signing works with external wallet
- [ ] Switching between wallet types works
- [ ] QR codes display correctly
- [ ] Payments are confirmed on-chain

### Manual Testing Steps

1. **Test Passkey Creation:**
   ```bash
   npm run dev
   # Navigate to onboarding
   # Click "Create Wallet with Passkeys"
   # Complete biometric prompt
   # Verify wallet address appears
   ```

2. **Test Payment with Para:**
   ```bash
   # Create a payment QR code
   # Click "Pay with Passkey"
   # Approve biometric prompt
   # Verify transaction on Solana Explorer
   ```

3. **Test Helius RPC:**
   ```bash
   # Open browser console
   # Look for RPC requests
   # Verify they go to helius-rpc.com
   # Check response times (<100ms)
   ```

### Check Helius Dashboard

1. Go to https://dev.helius.xyz/dashboard
2. View API usage stats
3. Monitor request counts
4. Check error rates

---

## 🐛 Troubleshooting

### Issue: Para SDK not loading

**Symptoms:** Modal doesn't open, no passkey prompt

**Solutions:**
- Check VITE_PARA_API_KEY is set correctly
- Verify key starts with `beta_`
- Check browser console for errors
- Try incognito mode (extensions can interfere)

### Issue: Helius RPC not being used

**Symptoms:** Slow transactions, using public RPC

**Solutions:**
- Check VITE_HELIUS_API_KEY is set
- Verify network matches (devnet/mainnet)
- Check browser Network tab for helius-rpc.com requests

### Issue: Passkey creation fails

**Symptoms:** Biometric prompt doesn't appear

**Solutions:**
- Use HTTPS (required for WebAuthn)
- Try different browser (Chrome/Safari work best)
- Check device supports Passkeys
- Clear browser data and try again

### Issue: Transaction signing fails

**Symptoms:** Error when paying with Para wallet

**Solutions:**
- Check wallet has SOL for fees
- Verify recipient address is valid
- Try external wallet to isolate issue
- Check Solana Explorer for error details

---

## 📚 Additional Resources

- [Para SDK Documentation](https://docs.getpara.com/v2/react/quickstart)
- [Helius Documentation](https://docs.helius.dev/)
- [Solana Pay Specification](https://docs.solanapay.com/)
- [WebAuthn Guide](https://webauthn.guide/)

---

## 🎯 Next Steps

After integration:

1. ✅ Test thoroughly on testnet/devnet
2. ✅ Get real users to try Passkeys
3. ✅ Monitor Helius dashboard for performance
4. ✅ Consider mainnet migration
5. ✅ Add analytics to track adoption

---

## 🚀 Production Checklist

Before going live:

- [ ] Switch to production Para API key
- [ ] Use mainnet Helius RPC
- [ ] Add error monitoring (Sentry, etc.)
- [ ] Set up rate limiting
- [ ] Add fallback RPC endpoints
- [ ] Test on multiple devices
- [ ] Security audit
- [ ] Performance testing

---

**Built with ❤️ for the Solana Ecosystem**

Para SDK + Helius = Best-in-class UX + Performance 🚀


