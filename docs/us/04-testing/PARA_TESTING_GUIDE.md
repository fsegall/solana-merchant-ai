# Para SDK + Helius Testing Guide

Quick testing guide for **Passkeys + Solana Pay** integration.

---

## 🚀 Quick Start

```bash
# 1. Set environment variables
cp .env.example .env
# Edit .env with your Para + Helius API keys

# 2. Start dev server
npm run dev

# 3. Open in browser
open http://localhost:5173
```

---

## ✅ Test Scenarios

### Scenario 1: Merchant Onboarding with Passkeys

**Goal:** Create embedded wallet using biometric auth

**Steps:**
1. Navigate to onboarding page
2. Click "Create Wallet with Passkeys"
3. Complete biometric prompt (Face ID/Touch ID)
4. Verify wallet address is displayed
5. Copy wallet address for testing

**Expected Result:**
- ✅ Passkey prompt appears
- ✅ Wallet created instantly
- ✅ Address shown in format: `AbC...XyZ`
- ✅ No extension installed

**Troubleshooting:**
- If no prompt: Check HTTPS is enabled
- If fails: Try Chrome/Safari browser
- If slow: Check network connection

---

### Scenario 2: Create Payment QR Code

**Goal:** Generate Solana Pay QR for customer

**Steps:**
1. Go to POS page
2. Enter amount (e.g., R$ 50.00)
3. Click "Generate QR Code"
4. Verify QR displays correctly
5. Check timer countdown works

**Expected Result:**
- ✅ QR code generates in <2s
- ✅ Amount shown correctly
- ✅ Timer starts at 10:00
- ✅ QR is scannable

---

### Scenario 3: Pay with Para Wallet (Passkey)

**Goal:** Complete payment using embedded wallet

**Steps:**
1. Ensure Para wallet is connected
2. Generate payment QR
3. Click "Pagar com Passkey" button
4. Approve biometric prompt
5. Wait for confirmation

**Expected Result:**
- ✅ Button shows fingerprint icon 🔐
- ✅ Biometric prompt appears
- ✅ Transaction sent in <3s
- ✅ Confirmation appears
- ✅ Status changes to "Paid"

**Verify On-Chain:**
```bash
# Copy transaction signature
# Visit Solana Explorer
https://explorer.solana.com/tx/YOUR_SIGNATURE?cluster=devnet
```

---

### Scenario 4: Pay with External Wallet (Phantom)

**Goal:** Verify backward compatibility

**Steps:**
1. Disconnect Para wallet
2. Connect Phantom wallet
3. Generate payment QR
4. Click "Pagar com Wallet Conectada"
5. Approve in Phantom popup

**Expected Result:**
- ✅ Button shows wallet icon 💳
- ✅ Phantom popup appears
- ✅ Transaction confirms
- ✅ Both wallet types work seamlessly

---

### Scenario 5: Check Helius RPC Performance

**Goal:** Verify using fast Helius endpoints

**Steps:**
1. Open browser DevTools → Network tab
2. Filter by "helius-rpc.com"
3. Generate QR and pay
4. Check request timing

**Expected Result:**
- ✅ Requests go to helius-rpc.com
- ✅ Response times <100ms
- ✅ No errors or rate limits
- ✅ Faster than public RPC

**Compare Public vs Helius:**
```bash
# Public RPC: ~500-1000ms
# Helius RPC: ~50-100ms
# 5-10x faster! 🚀
```

---

### Scenario 6: Switch Between Wallet Types

**Goal:** Test seamless switching

**Steps:**
1. Connect Para wallet (Passkey)
2. Generate QR, verify Passkey button
3. Disconnect Para
4. Connect Phantom
5. Verify button changes to Wallet

**Expected Result:**
- ✅ Hook detects wallet change
- ✅ UI updates automatically
- ✅ No errors or console warnings
- ✅ Smooth transition

---

## 🔍 Debugging

### Check Para SDK Status

```typescript
// Add to your component
import { useAccount, useWallet } from '@/contexts/ParaProvider';

function DebugPara() {
  const { isConnected } = useAccount();
  const { data: wallet } = useWallet();
  
  console.log('Para Status:', {
    isConnected,
    address: wallet?.address,
    network: import.meta.env.VITE_SOLANA_CLUSTER,
  });
}
```

### Check Helius RPC

```typescript
// Check connection endpoint
import { useConnection } from '@solana/wallet-adapter-react';

function DebugHelius() {
  const { connection } = useConnection();
  
  console.log('RPC Endpoint:', connection.rpcEndpoint);
  // Should show: https://devnet.helius-rpc.com/?api-key=XXX
}
```

### Check Unified Signer

```typescript
import { useParaSolanaSigner } from '@/hooks/useParaSolanaSigner';

function DebugSigner() {
  const {
    publicKey,
    walletType,
    isUsingParaWallet,
    isUsingExternalWallet,
  } = useParaSolanaSigner();
  
  console.log('Signer Status:', {
    address: publicKey?.toString(),
    type: walletType, // 'para-passkey' | 'external' | 'none'
    isPara: isUsingParaWallet,
    isExternal: isUsingExternalWallet,
  });
}
```

---

## 📊 Performance Benchmarks

### Target Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Passkey creation | <3s | ✅ |
| QR generation | <2s | ✅ |
| Transaction signing (Para) | <3s | ✅ |
| Transaction confirmation | <5s | ✅ |
| RPC latency | <100ms | ✅ |

### How to Measure

```typescript
// Time Passkey creation
const start = performance.now();
await openModal();
// Wait for connection
const end = performance.now();
console.log(`Passkey creation: ${end - start}ms`);

// Time transaction
const txStart = performance.now();
const signature = await sendTransaction(tx, connection);
await connection.confirmTransaction(signature);
const txEnd = performance.now();
console.log(`Transaction: ${txEnd - txStart}ms`);
```

---

## 🐛 Common Issues

### Issue: "No wallet connected"

**Cause:** Para SDK not initialized

**Fix:**
1. Check `.env` has `VITE_PARA_API_KEY`
2. Restart dev server
3. Hard refresh browser (Cmd+Shift+R)

### Issue: "Failed to create Passkey"

**Cause:** Browser/device not compatible

**Fix:**
1. Use HTTPS (localhost OK in dev)
2. Try Chrome or Safari
3. Enable biometric auth in OS
4. Check browser supports WebAuthn

### Issue: "RPC error" or slow transactions

**Cause:** Not using Helius RPC

**Fix:**
1. Check `.env` has `VITE_HELIUS_API_KEY`
2. Verify format: `https://devnet.helius-rpc.com/?api-key=XXX`
3. Check Helius dashboard for quota
4. Restart dev server

### Issue: Transaction fails silently

**Cause:** Insufficient SOL for fees

**Fix:**
```bash
# Request airdrop on devnet
solana airdrop 2 YOUR_WALLET_ADDRESS --url devnet

# Or use faucet
# https://faucet.solana.com/
```

---

## 🎬 Demo Script

Perfect for showing judges/users:

### 1. Introduction (30s)
```
"Solana Merchant AI uses cutting-edge Passkeys 
for authentication. No wallet extensions needed!"
```

### 2. Show Onboarding (1min)
```
1. Click "Create Wallet with Passkeys"
2. Touch fingerprint sensor
3. "That's it! Instant Solana wallet."
```

### 3. Create Payment (30s)
```
1. Enter amount: R$ 100
2. Generate QR code
3. "QR appears instantly thanks to Helius RPC"
```

### 4. Pay with Passkey (1min)
```
1. Click "Pay with Passkey"
2. Touch fingerprint
3. "Transaction sent and confirmed in seconds"
4. Show on Solana Explorer
```

### 5. Key Points (30s)
```
✅ No passwords
✅ No extensions
✅ Biometric security
✅ Lightning fast (Helius)
✅ 100% Solana native
```

---

## 📸 Screenshots to Take

For documentation/presentation:

1. [ ] Passkey creation prompt (biometric)
2. [ ] Wallet connected state
3. [ ] Payment QR code with amount
4. [ ] "Pay with Passkey" button
5. [ ] Transaction confirmation
6. [ ] Solana Explorer transaction
7. [ ] Helius dashboard (performance)
8. [ ] Mobile view (responsive)

---

## ✅ Final Checklist

Before presenting/submitting:

- [ ] All test scenarios pass
- [ ] Both Para and external wallets work
- [ ] Helius RPC is being used
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Passkey works on multiple devices
- [ ] Demo script rehearsed
- [ ] Screenshots taken
- [ ] Video recorded (optional)

---

**Ready to impress! 🚀**

Para SDK + Helius = Best Solana UX in the hackathon! 🏆


