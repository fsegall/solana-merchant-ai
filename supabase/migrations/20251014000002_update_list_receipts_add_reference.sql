-- Update list_receipts function to include reference column
-- First drop the old function
DROP FUNCTION IF EXISTS public.list_receipts(timestamptz, timestamptz);

CREATE OR REPLACE FUNCTION public.list_receipts(
  _from timestamptz,
  _to timestamptz
)
RETURNS TABLE(
  id uuid,
  ref text,
  amount_brl numeric,
  status text,
  created_at timestamptz,
  tx_hash text,
  product_ids uuid[],
  payment_id uuid,
  reference text  -- Added reference field
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _merchant_id uuid;
BEGIN
  _merchant_id := public.current_merchant();
  IF _merchant_id IS NULL THEN
    RAISE EXCEPTION 'No default merchant set for user';
  END IF;

  RETURN QUERY
  SELECT
    i.id,
    i.ref,
    i.amount_brl,
    COALESCE(p.status::text, i.status::text) AS status,
    i.created_at,
    p.tx_hash,
    i.product_ids,
    p.id AS payment_id,
    i.reference  -- Include reference in SELECT
  FROM public.invoices i
  LEFT JOIN public.payments p ON p.invoice_id = i.id
  WHERE i.merchant_id = _merchant_id
    AND i.created_at >= _from
    AND i.created_at <= _to
  ORDER BY i.created_at DESC;
END;
$$;

