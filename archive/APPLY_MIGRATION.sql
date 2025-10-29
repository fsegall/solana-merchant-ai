-- Apply this SQL directly in your Supabase Dashboard > SQL Editor
-- This ensures create_invoice_with_payment works correctly

-- 1. Drop old versions of the function
DROP FUNCTION IF EXISTS app.create_invoice_with_payment(numeric, text, uuid[]);
DROP FUNCTION IF EXISTS app.create_invoice_with_payment(numeric, text, uuid[], text);
DROP FUNCTION IF EXISTS public.create_invoice_with_payment(numeric, uuid[], text);
DROP FUNCTION IF EXISTS public.create_invoice_with_payment(numeric, text, uuid[]);

-- 2. Create/update the function with correct signature in public schema
CREATE OR REPLACE FUNCTION public.create_invoice_with_payment(
  _amount_brl numeric,
  _ref text,
  _product_ids uuid[] DEFAULT '{}',
  _reference text DEFAULT NULL
)
RETURNS uuid 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE 
  _merchant_id uuid;
  _invoice_id uuid;
BEGIN
  -- Get current merchant
  _merchant_id := public.current_merchant();
  
  IF _merchant_id IS NULL THEN 
    RAISE EXCEPTION 'No default merchant set for user'; 
  END IF;

  -- Create invoice with reference field
  INSERT INTO public.invoices (
    merchant_id, 
    amount_brl, 
    ref, 
    reference,
    status, 
    product_ids
  )
  VALUES (
    _merchant_id, 
    _amount_brl, 
    _ref, 
    _reference,
    'pending', 
    _product_ids
  )
  RETURNING id INTO _invoice_id;
  
  -- Create payment
  INSERT INTO public.payments (invoice_id, amount_brl, status)
  VALUES (_invoice_id, _amount_brl, 'pending');
  
  RETURN _invoice_id;
END;
$$;

