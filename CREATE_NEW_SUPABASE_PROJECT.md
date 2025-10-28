# 🚀 Criar Novo Projeto Supabase do Zero

## 📋 Passo a Passo Completo

### 1️⃣ Criar Novo Projeto no Supabase

1. Acesse: https://supabase.com/dashboard
2. Clique em **"New Project"**
3. Preencha:
   - **Name**: `pos-cashier-production`
   - **Database Password**: (anote bem!)
   - **Region**: escolha a mais próxima (recommend: us-east-1)
4. Clique em **"Create new project"**
5. **Aguarde** ~2 minutos para a criação

### 2️⃣ Obter Credenciais

Após criar, vá em **Settings > API** e copie:

```env
# No arquivo .env.local (para testes locais)
VITE_SUPABASE_URL=https://manapcpsteotonrpdtjw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3️⃣ Linkar Projeto Localmente

Execute no terminal:

```bash
# Link o projeto novo
npx supabase link --project-ref SEU-PROJECT-ID

# Substitua SEU-PROJECT-ID pelo ID do projeto (sem .supabase.co)
# Exemplo: npx supabase link --project-ref abcdefghijklmnop
```

### 4️⃣ Aplicar Todas as Migrations

```bash
# Isso vai aplicar todas as 22 migrations na ordem correta
npx supabase db push
```

Isso vai criar:
- ✅ Tabelas (merchants, invoices, payments, etc.)
- ✅ Funções RPC (create_invoice_with_payment, etc.)
- ✅ Views
- ✅ RLS Policies
- ✅ Índices

### 5️⃣ Criar Primeiro Usuário

Acesse a seção **Authentication > Users** e crie um teste:

1. Vá em: Settings > Authentication
2. Copie o email de convite OU crie manualmente
3. Use esse usuário para testar

### 6️⃣ Atualizar Vercel

Acesse: https://vercel.com/fsegalls-projects/pos-cashier/settings/environment-variables

Atualize estas variáveis:

```env
VITE_SUPABASE_URL=https://SEU-NOVO-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=sua-nova-anon-key
```

### 7️⃣ Fazer Redeploy

```bash
vercel --prod
```

## ⚠️ Importante

- **Backup**: Se você tinha dados no projeto Lovable, faça export antes
- **Users**: Você precisará criar novos usuários (o Lovable é separado)
- **Merchants**: Criar merchants manualmente via SQL ou criar interface

## 📝 SQL para Criar Primeiro Merchant

Depois de aplicar migrations, execute isto no SQL Editor:

```sql
-- Criar um merchant de teste
INSERT INTO public.merchants (name, status) 
VALUES ('Meu Merchant', 'active')
RETURNING id;

-- Nota o ID retornado e associe ao seu usuário (substitua os UUIDs):
INSERT INTO public.merchant_members (merchant_id, user_id, role, status, is_default)
VALUES (
  'MERCHANT_ID_ACIMA',
  auth.uid(), 
  'owner', 
  'active',
  true
);
```

