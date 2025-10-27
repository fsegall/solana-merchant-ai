# 🪙 Mint tBRZ para Teste E2E

## Problem
Merchant wallet não tem tBRZ para pagamentos reais.

## Solution
Mint tBRZ usando um keypair local (você é o owner do mint!).

---

## Passos para Mint tBRZ

### 1. Verificar configuração
```bash
solana config get
# Deve mostrar: Config File: ~/.config/solana/cli/config.yml
```

### 2. Se não estiver configurado, use wallet que você criou antes:
```bash
# Configure com keypair que você tem
solana config set --url devnet
solana config set --keypair ~/path/to/your-keypair.json

# Ou crie novo keypair para testes
solana-keygen new --outfile ~/devnet-test-keypair.json
solana config set --keypair ~/devnet-test-keypair.json
```

### 3. Verificar balance
```bash
solana balance
# Deve ter pelo menos 1 SOL
```

Se não tiver SOL:
```bash
solana airdrop 2 $(solana address)
```

### 4. Criar ATA e Mint tBRZ
```bash
# Create ATA
spl-token create-account 6PzmkfYKqUVatwSKdPHjVpqKKgrE3mbFwEPYHXZCRCSM \
  --owner 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE \
  --fee-payer ~/devnet-test-keypair.json \
  --url devnet

# Mint 1000 tBRZ
spl-token mint 6PzmkfYKqUVatwSKdPHjVpqKKgrE3mbFwEPYHXZCRCSM 1000 \
  5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE \
  --fee-payer ~/devnet-test-keypair.json \
  --url devnet

# Verify balance
spl-token balance 6PzmkfYKqUVatwSKdPHjVpqKKgrE3mbFwEPYHXZCRCSM \
  --owner 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE \
  --url devnet
```

---

## Alternative: Use DEMO_MODE

**Mais fácil para demo!** 

1. Set `DEMO_MODE=true` in `.env`
2. Payments confirm automatically
3. No need for real tokens

---

## Quick Test After Mint

```bash
# Test balance check
spl-token balance 6PzmkfYKqUVatwSKdPHjVpqKKgrE3mbFwEPYHXZCRCSM \
  --owner 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE \
  --url devnet
```

Expected output: `1000`

---

## Notes

- tBRZ mint: `6PzmkfYKqUVatwSKdPHjVpqKKgrE3mbFwEPYHXZCRCSM`
- Merchant wallet: `5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE`
- You are the owner of this mint (created on Oct 7)

