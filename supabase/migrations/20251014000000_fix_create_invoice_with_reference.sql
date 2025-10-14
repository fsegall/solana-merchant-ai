-- Fix create_invoice_with_payment to accept and save solana reference
-- This allows the validate-payment edge function to find invoices by reference

create or replace function app.create_invoice_with_payment(
  _amount_brl numeric,
  _ref text,
  _product_ids uuid[] default '{}',
  _reference text default null
)
returns uuid 
language plpgsql 
security definer
set search_path = public
as $$
declare 
  _merchant_id uuid;
  _invoice_id uuid;
begin
  -- Pega merchant padrão
  _merchant_id := app.current_merchant();
  if _merchant_id is null then 
    raise exception 'No default merchant set for user'; 
  end if;

  -- Cria invoice com reference (solana_reference)
  insert into public.invoices (merchant_id, amount_brl, ref, status, product_ids, reference)
    values (_merchant_id, _amount_brl, _ref, 'pending', _product_ids, _reference)
    returning id into _invoice_id;
  
  -- Cria payment pendente associado
  insert into public.payments (invoice_id, amount_brl, status)
    values (_invoice_id, _amount_brl, 'pending');
  
  return _invoice_id;
end;
$$;

