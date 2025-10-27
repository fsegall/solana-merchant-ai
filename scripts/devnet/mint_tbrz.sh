#!/bin/bash

# Merchant keypair path
MERCHANT_KEYPAIR=~/.config/solana/merchant.json

# Devnet URLs
SOLANA_RPC_URL=https://api.devnet.solana.com
export SOLANA_URL=$SOLANA_RPC_URL

# Mint address
tBRZ_MINT=6PzmkfYKqUVatwSKdPHjVpqKKgrE3mbFwEPYHXZCRCSM

# Merchant wallet
MERCHANT_WALLET=5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE

echo "🪙 Minting tBRZ to merchant wallet..."
echo ""

# Check if keypair exists
if [ ! -f "$MERCHANT_KEYPAIR" ]; then
  echo "❌ Keypair not found: $MERCHANT_KEYPAIR"
  echo "💡 Create it with: solana-keygen new -o ~/.config/solana/merchant.json"
  exit 1
fi

echo "✅ Using keypair: $MERCHANT_KEYPAIR"
echo ""

# Check SOL balance
echo "💵 Checking SOL balance..."
SOL_BALANCE=$(solana balance --url $SOLANA_RPC_URL -k "$MERCHANT_KEYPAIR" 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' | head -1 || echo "0")
echo "Balance: $SOL_BALANCE SOL"
echo ""

if (( $(echo "$SOL_BALANCE < 0.5" | bc -l 2>/dev/null || echo "1") )); then
  echo "⚠️  Low balance! Requesting airdrop..."
  solana airdrop 1 $MERCHANT_WALLET --url $SOLANA_RPC_URL -k "$MERCHANT_KEYPAIR"
  sleep 2
fi

# Check if ATA exists
echo "🔍 Checking for existing ATA..."
EXISTING_ATA=$(spl-token accounts "$tBRZ_MINT" --owner "$MERCHANT_WALLET" --url "$SOLANA_RPC_URL" -k "$MERCHANT_KEYPAIR" 2>/dev/null | grep -oE '^[A-Za-z0-9]{44}$' | head -1)

if [ -z "$EXISTING_ATA" ]; then
  echo "📝 Creating ATA..."
  spl-token create-account "$tBRZ_MINT" --owner "$MERCHANT_WALLET" --url "$SOLANA_RPC_URL" -k "$MERCHANT_KEYPAIR"
  sleep 2
else
  echo "✅ ATA exists: $EXISTING_ATA"
fi

# Mint tBRZ
echo "🪙 Minting 1000 tBRZ..."
spl-token mint "$tBRZ_MINT" 1000 "$MERCHANT_WALLET" --url "$SOLANA_RPC_URL" -k "$MERCHANT_KEYPAIR"

echo ""
echo "✅ Done! Checking balance..."
sleep 2

# Show balance
spl-token balance "$tBRZ_MINT" --owner "$MERCHANT_WALLET" --url "$SOLANA_RPC_URL"

echo ""
echo "🎉 tBRZ minted successfully!"
