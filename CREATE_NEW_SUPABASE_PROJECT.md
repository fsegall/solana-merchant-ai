# 🚀 Create New Supabase Project from Scratch

## 📋 Complete Step-by-Step Guide

### 1️⃣ Create New Project on Supabase

1. Visit: https://supabase.com/dashboard
2. Click **"New Project"**
3. Fill in:
   - **Name**: `pos-cashier-production`
   - **Database Password**: (save this!)
   - **Region**: choose the closest one (recommend: us-east-1)
4. Click **"Create new project"**
5. **Wait** ~2 minutes for creation

### 2️⃣ Get Credentials

After creation, go to **Settings > API** and copy:

```env
# In .env.local file (for local testing)
VITE_SUPABASE_URL=https://manapcpsteotonrpdtjw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

### 3️⃣ Link Project Locally

Run in terminal:

```bash
# Link the new project
npx supabase link --project-ref YOUR-PROJECT-ID

# Replace YOUR-PROJECT-ID with the project ID (without .supabase.co)
# Example: npx supabase link --project-ref abcdefghijklmnop
```

### 4️⃣ Apply All Migrations

```bash
# This will apply all 22 migrations in the correct order
npx supabase db push
```

This will create:
- ✅ Tables (merchants, invoices, payments, etc.)
- ✅ RPC Functions (create_invoice_with_payment, etc.)
- ✅ Views
- ✅ RLS Policies
- ✅ Indexes

### 5️⃣ Create First User

Visit **Authentication > Users** and create a test user:

1. Go to: Settings > Authentication
2. Copy invite email OR create manually
3. Use this user for testing

### 6️⃣ Update Vercel

Visit: https://vercel.com/fsegalls-projects/pos-cashier/settings/environment-variables

Update these variables:

```env
VITE_SUPABASE_URL=https://YOUR-NEW-PROJECT-ID.supabase.co
VITE_SUPABASE_ANON_KEY=your-new-anon-key
```

### 7️⃣ Redeploy

```bash
vercel --prod
```

## ⚠️ Important

- **Backup**: If you had data on Lovable project, export before migrating
- **Users**: You'll need to create new users (Lovable is separate)
- **Merchants**: Create merchants manually via SQL or create interface

## 📝 SQL to Create First Merchant

After applying migrations, run this in SQL Editor:

```sql
-- Create a test merchant
INSERT INTO public.merchants (name, status) 
VALUES ('My Merchant', 'active')
RETURNING id;

-- Note the returned ID and associate with your user (replace UUIDs):
INSERT INTO public.merchant_members (merchant_id, user_id, role, status, is_default)
VALUES (
  'MERCHANT_ID_ABOVE',
  auth.uid(), 
  'owner', 
  'active',
  true
);
```