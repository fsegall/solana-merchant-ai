# 🏦 Configurar Settlements - Guia Rápido

## 🎯 Opção mais fácil: DEMO MODE

### Configure no Supabase Dashboard:

1. Acesse: https://supabase.com/dashboard/project/manapcpsteotonrpdtjw/settings/functions
2. Vá em **Secrets**
3. Adicione:

```env
DEMO_MODE=true
```

✅ Isso faz settlements SIMULAREM sem APIs reais!

---

## 🔧 Para usar Wise/Circle de verdade:

### 1. Wise Sandbox (BRL)
- Crie conta: https://sandbox.transferwise.tech/
- Obtenha API token
- Configure no Vercel → Project Settings → Environment Variables:
  - `WISE_API_TOKEN`
  - `WISE_PROFILE_ID`
  - `WISE_RECIPIENT_ID`

### 2. Circle Sandbox (USD)
- Crie conta: https://sandbox.circle.com/
- Obtenha API key
- Configure no Vercel:
  - `CIRCLE_API_KEY`
  - `CIRCLE_BASE_URL=https://api-sandbox.circle.com`
  - `CIRCLE_WALLET_ID`

---

## ⚠️ IMPORTANTE

Essas variáveis precisam estar em **Ambos**:
1. Vercel Dashboard (para frontend)
2. Supabase Dashboard → Edge Functions → Secrets (para functions)

---

## 📚 Docs completas:
- Wise: `docs/us/03-apis/wise/setup-guide.md`
- Circle: `docs/us/03-apis/circle/`

