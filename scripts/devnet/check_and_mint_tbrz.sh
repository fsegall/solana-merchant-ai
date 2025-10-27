#!/bin/bash

echo "🔍 Checking merchant wallet balance..."
echo "Merchant: 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE"
echo ""

# Check SOL balance
SOL_BALANCE=$(solana balance 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE --url devnet 2>/dev/null | grep -oE '[0-9]+\.[0-9]+' || echo "0")

echo "💰 SOL Balance: $SOL_BALANCE SOL"
echo ""

if (( $(echo "$SOL_BALANCE < 0.5" | bc -l) )); then
  echo "⚠️  SOL balance is low! Need > 0.5 SOL for operations"
  echo "💡 Solution: Use Solana Devnet Faucet"
  echo "   https://faucet.solana.com/"
  echo ""
fi

# Check for tBRZ ATA
echo "🔍 Checking tBRZ token account..."
tBRZ_MINT="6PzmkfYKqUVatwSKdPHjVpqKKgrE3mbFwEPYHXZCRCSM"

# Try to get token accounts
TOKEN_ACCOUNTS=$(spl-token accounts "$tBRZ_MINT" --owner 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE --url devnet 2>/dev/null || echo "")

if [ -z "$TOKEN_ACCOUNTS" ]; then
  echo "⚠️  No tBRZ token account found"
  echo "💡 Solution: Mint tBRZ to merchant wallet"
  echo ""
  echo "Run these commands:"
  echo "  solana airdrop 1 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE --url devnet"
  echo "  spl-token mint $tBRZ_MINT 1000 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE --url devnet"
else
  echo "✅ tBRZ account exists:"
  echo "$TOKEN_ACCOUNTS"
  
  # Get balance
  BALANCE=$(spl-token balance "$tBRZ_MINT" --owner 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE --url devnet 2>/dev/null || echo "0")
  echo "📊 tBRZ Balance: $BALANCE"
  
  if [ "$BALANCE" = "0" ]; then
    echo "⚠️  Balance is 0 - need to mint tBRZ!"
    echo ""
    echo "Run: spl-token mint $tBRZ_MINT 1000 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE --url devnet"
  fi
fi
