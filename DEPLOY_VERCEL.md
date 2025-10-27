# 🚀 Deploy to Vercel

## Build Success! ✅

Build concluído com sucesso! O projeto está pronto para deploy no Vercel.

## Passos para Deploy

### 1. Conectar Repositório ao Vercel

1. Acesse [vercel.com](https://vercel.com)
2. Entre com sua conta GitHub
3. Clique em **"Add New Project"**
4. Escolha o repositório: `fsegall/solana-merchant-pay`

### 2. Configurar Variáveis de Ambiente

No painel do Vercel, adicione as seguintes variáveis de ambiente:

#### **Supabase**
```
VITE_SUPABASE_URL=seu-project-url
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

#### **Solana**
```
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_ENDPOINT=https://api.devnet.solana.com
VITE_MERCHANT_WALLET=SEU_WALLET_PUBKEY
```

#### **Helius (Opcional, mas recomendado)**
```
VITE_HELIUS_API_KEY=seu-helius-api-key
```

#### **Pagamentos**
```
VITE_PAYMENT_PROVIDER=solana-pay
VITE_JUPITER_API_URL=https://quote-api.jup.ag/v6
```

#### **Settlement (Opcional para demonstração)**
```
VITE_ENABLE_SETTLEMENTS=true
```

### 3. Configuração Automática

O arquivo `vercel.json` já está configurado com:
- ✅ Build command: `npm run build`
- ✅ Output directory: `dist`
- ✅ Framework: Vite
- ✅ Rewrites para SPA routing
- ✅ Headers de segurança
- ✅ CORS configurado para `manifest.json`

### 4. Deploy

O Vercel fará o deploy automaticamente quando você:
1. Conectar o repositório
2. Configurar as variáveis de ambiente
3. Clicar em **"Deploy"**

### 5. Próximos Passos

Após o deploy:

1. **Teste o Deploy:**
   - Acesse a URL gerada pela Vercel
   - Teste login/signup
   - Teste criação de pedido
   - Teste geração de QR code

2. **Configurar Edge Functions (Se aplicável):**
   - As Edge Functions do Supabase continuam funcionando
   - URLs: `https://seu-project.supabase.co/functions/v1/function-name`

3. **Atualizar README.md:**
   - Adicionar link do deploy
   - Documentar processo

## 🔗 Links Importantes

- **Repositório:** https://github.com/fsegall/solana-merchant-pay
- **Supabase:** [seu-project].supabase.co
- **Vercel Dashboard:** https://vercel.com/dashboard

## ⚠️ Problema Original Resolvido

O erro `exports is not defined` foi resolvido com:
- Configuração de `output.format: 'es'` no Vite
- Configuração de `esmExternals: true` no CommonJS
- Build bem-sucedido sem erros críticos

## 📝 Notas

- **Chunks grandes:** Alguns chunks são >500kB, mas aceitáveis para MVP
- **Demo Mode:** Settlement está em modo DEMO para hackathon
- **Devnet:** Atualmente configurado para Solana Devnet (testnet)

