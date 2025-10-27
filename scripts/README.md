# 📜 Scripts Directory

Utility scripts for Solana Merchant AI development and testing.

## 📂 Structure

```
scripts/
├── README.md           # This file
├── devnet/             # Devnet setup and testing
│   ├── mint_tbrz.sh    # Mint tBRZ tokens for testing
│   └── check_and_mint_tbrz.sh  # Check balance and mint if needed
└── utils/              # General utilities
    ├── check-settlements.sh  # Check settlement status
    ├── create-wise-recipient.sh  # Create Wise recipient
    └── test-wise-token.sh  # Test Wise API token
```

## 🎯 Quick Reference

### Devnet Scripts

**`devnet/mint_tbrz.sh`**
- Mint test BRZ tokens on Solana Devnet
- Usage: `./scripts/devnet/mint_tbrz.sh [amount]`
- Default: 100 tBRZ

**`devnet/check_and_mint_tbrz.sh`**
- Check merchant wallet balance
- Automatically mint if balance is low
- Usage: `./scripts/devnet/check_and_mint_tbrz.sh`

### Utility Scripts

**`utils/check-settlements.sh`**
- Check settlement status in database
- Lists recent settlements
- Usage: `./scripts/utils/check-settlements.sh`

**`utils/create-wise-recipient.sh`**
- Create Wise API recipient
- Configure bank details
- Usage: `./scripts/utils/create-wise-recipient.sh`

**`utils/test-wise-token.sh`**
- Test Wise API authentication
- Verify API key is valid
- Usage: `./scripts/utils/test-wise-token.sh`

---

## 🔧 Requirements

Most scripts require:
- Solana CLI installed (`solana --version`)
- Supabase CLI installed (`supabase --version`)
- Appropriate API keys in `.env` files

---

**Last Updated:** October 27, 2025

