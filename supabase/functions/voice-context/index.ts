import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { adminClient } from "../_shared/supabase.ts";
import { json } from "../_shared/responses.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = adminClient();
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing Authorization header');
    }
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Get merchant_id
    const { data: memberData } = await supabase
      .from('merchant_members')
      .select('merchant_id')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .eq('status', 'active')
      .single();

    if (!memberData) {
      throw new Error('No merchant found');
    }

    const merchantId = memberData.merchant_id;

    // Get recent invoices for context
    const { data: invoices } = await supabase
      .from('invoices')
      .select('ref, amount_brl, status, created_at')
      .eq('merchant_id', merchantId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Build context
    const context = {
      merchantId,
      recentInvoices: invoices?.map(inv => ({
        ref: inv.ref,
        amount: inv.amount_brl,
        status: inv.status,
        date: inv.created_at
      })) || []
    };

    return json({ context });

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return json({ error: errorMessage }, 500);
  }
});

