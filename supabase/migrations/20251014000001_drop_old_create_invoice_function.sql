-- Drop old version of create_invoice_with_payment without _reference parameter
-- This ensures only the new version with _reference is used
DROP FUNCTION IF EXISTS app.create_invoice_with_payment(_amount_brl numeric, _ref text, _product_ids uuid[]);

