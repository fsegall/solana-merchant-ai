# 🔧 Configuração de Variáveis de Ambiente no Vercel

## ⚠️ Problema Atual

O erro `ERR_NAME_NOT_RESOLVED` com `seu-project.supabase.co` indica que as variáveis de ambiente não estão configuradas no Vercel.

## ✅ Solução

### Opção 1: Via Dashboard (Recomendado)

1. Acesse: https://vercel.com/fsegalls-projects/pos-cashier/settings/environment-variables

2. Adicione as seguintes variáveis de ambiente para **Production**:

```env
VITE_SUPABASE_URL=https://niocfujcwmbwictdpfsn.supabase.co
```

```env
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2NmdWpjd21id2ljdGRwZnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzkzOTQsImV4cCI6MjA3NTA1NTM5NH0.4DdbL340eBQ7Tfd9HJZaqMwFYs4reVFU_k-NFz78zYE
```

3. Clique em **Save**

4. Vá para a aba **Deployments**

5. Clique no menu (...) do último deployment e selecione **Redeploy**

### Opção 2: Via CLI

```bash
# Adicionar VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_URL production

# Quando solicitado, digite:
# https://niocfujcwmbwictdpfsn.supabase.co

# Adicionar VITE_SUPABASE_ANON_KEY
vercel env add VITE_SUPABASE_ANON_KEY production

# Quando solicitado, digite:
# eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pb2NmdWpjd21id2ljdGRwZnNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0NzkzOTQsImV4cCI6MjA3NTA1NTM5NH0.4DdbL340eBQ7Tfd9HJZaqMwFYs4reVFU_k-NFz78zYE

# Fazer redeploy
vercel --prod
```

## 📝 Variáveis Opcionais (Recomendadas)

Para funcionalidades completas, considere adicionar:

```env
VITE_SOLANA_NETWORK=devnet
VITE_SOLANA_ENDPOINT=https://api.devnet.solana.com
```

## ✅ Após Configurar

O login e signup devem funcionar corretamente. Teste:
- Login existente
- Signup de novo usuário
- Redefinição de senha (se implementado)

