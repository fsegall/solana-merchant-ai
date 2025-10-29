# 🚀 Setup Completo do Supabase - Do Zero

## 📋 Passo a Passo

### 1️⃣ Criar Novo Projeto no Supabase

1. Acesse: https://supabase.com/dashboard
2. Clique em "New Project"
3. Preencha:
   - **Name**: `pos-cashier` (ou outro nome)
   - **Database Password**: (anote a senha!)
   - **Region**: escolha a mais próxima
4. Clique em "Create new project"

### 2️⃣ Obter Credenciais do Projeto

Após a criação, vá em **Settings > API**:

```bash
# Copie estes valores:
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
```

### 3️⃣ Linkar o Projeto Local com o Supabase

Execute no terminal:

```bash
# Link o projeto
npx supabase link --project-ref xxxxx

# Onde xxxxx é o ID do seu projeto (sem .supabase.co)
# Exemplo: niocfujcwmbwictdpfsn
```

### 4️⃣ Aplicar Todas as Migrations

```bash
# Aplicar todas as migrations do zero
npx supabase db push
```

Isso aplicará todas as 22 migrations na ordem correta.

### 5️⃣ Atualizar Variáveis de Ambiente

Atualize o arquivo `.env` ou variáveis no Vercel:

```env
VITE_SUPABASE_URL=https://seu-novo-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-nova-anon-key
```

### 6️⃣ Fazer Deploy Atualizado

```bash
git add .
git commit -m "feat: link with new Supabase project"
git push

# Ou deploy direto
vercel --prod
```

## 🗂️ Migrations que serão Aplicadas

1. ✅ Tabela merchants
2. ✅ Tabela merchant_members
3. ✅ Tabela invoices
4. ✅ Tabela payments
5. ✅ Tabela products
6. ✅ Tabela settlements
7. ✅ Tabela webhook_events
8. ✅ Functions (create_invoice_with_payment, list_receipts, etc.)
9. ✅ Views (settlement_dashboard)
10. ✅ RLS Policies

## ⚠️ Importante

- **Backup**: Se você tinha dados no projeto antigo (Lovable), exporte antes
- **Credentials**: Anote todas as credenciais do novo projeto
- **Test**: Após aplicar, teste login, criação de invoice e pagamento

