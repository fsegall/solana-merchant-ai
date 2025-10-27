# 🎉 Setup Completo - Pronto para Teste E2E!

## ✅ O que foi feito

1. **tBRZ Mint criado:** `CNgjfkVEKKkDspYS5ZZem8KpyhubmGi7MHXFuc55QtZV`
2. **Merchant wallet:** 1000 tBRZ ✅
3. **Phantom wallet:** 100 tBRZ ✅
4. **On-chain validation:** Testado e funcionando ✅

---

## 🔧 Atualizar .env

### Root .env:
```bash
# Add/Update this line:
VITE_BRZ_MINT_DEVNET=CNgjfkVEKKkDspYS5ZZem8KpyhubmGi7MHXFuc55QtZV
```

### supabase/functions/.env:
```bash
# Add/Update this line:
BRZ_MINT=CNgjfkVEKKkDspYS5ZZem8KpyhubmGi7MHXFuc55QtZV
```

---

## 🧪 Teste E2E Agora!

### 1. Atualize os .env files
```bash
# Root .env
nano .env  # Add VITE_BRZ_MINT_DEVNET

# Functions .env  
nano supabase/functions/.env  # Add BRZ_MINT
```

### 2. Iniciar serviços
```bash
# Terminal 1: Supabase
npx supabase start

# Terminal 2: Frontend
npm run dev
```

### 3. Testar fluxo
1. Abra `http://localhost:5173`
2. Login
3. Vá para POS
4. Crie charge: R$ 10.00
5. QR aparece
6. Abra Phantom (certifique-se que está em Devnet!)
7. Conecte à app
8. Click "Pay with Wallet"
9. ✅ Pagamento confirma on-chain em <10s!

---

## 📊 Balances

- **Merchant:** 5NxvepZmm5nBv6m3B5YG74PJLCdVLMdiLjvwLh1jKXE = 1000 tBRZ
- **Phantom:** 2YMAFCzvXhTmRJt9AZZCTG8jijV6VFJCu4ECEf48Lp9p = 100 tBRZ
- **Mint:** CNgjfkVEKKkDspYS5ZZem8KpyhubmGi7MHXFuc55QtZV

---

## 🎬 Próximo: Gravar Demo

Agora você pode:
1. ✅ Fazer teste E2E completo
2. ✅ Gravar pitch video (≤3min)
3. ✅ Gravar technical video (≤3min)
4. ✅ Deploy demo
5. ✅ Submeter hackathon!

