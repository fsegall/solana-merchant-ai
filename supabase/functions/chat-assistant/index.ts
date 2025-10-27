import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    const authHeader = req.headers.get('Authorization');
    
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || Deno.env.get('SUPABASE_LOCAL_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || Deno.env.get('SUPABASE_LOCAL_SERVICE_ROLE_KEY') || '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Get user from auth header
    const token = authHeader?.replace('Bearer ', '');
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

    // Build context for AI
    const context = `Você é um assistente de IA para gestão de pagamentos no Solana.
    
Contexto do usuário:
- Merchant ID: ${merchantId}
- Últimos pagamentos:
${invoices?.map(inv => `  - ${inv.ref}: R$ ${inv.amount_brl} (${inv.status})`).join('\n') || 'Nenhum pagamento recente'}

Seja conciso e útil. Valores em BRL. Responda perguntas sobre pagamentos.`;

    // Prepare messages for Gemini
    const geminiMessages = [
      { role: 'user', parts: [{ text: context }] },
      ...messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini Error:', response.status, errorText);
      throw new Error(`Gemini API Error: ${response.status}`);
    }

    const result = await response.json();
    const reply = result.candidates?.[0]?.content?.parts?.[0]?.text || 'Desculpe, não consegui processar sua mensagem.';

    return new Response(
      JSON.stringify({ message: reply }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
