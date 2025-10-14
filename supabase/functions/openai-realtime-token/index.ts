import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, OpenAI-Beta",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    if (!OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OPENAI_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    // Use the exact model for WebRTC - must match in POST SDP request!
    const model =
      body.model ||
      Deno.env.get("OPENAI_REALTIME_MODEL") ||
      "gpt-4o-realtime-preview-2024-12-17";
    
    console.log('🎯 Creating GA client_secret for model:', model);

    // GA endpoint: /v1/realtime/client_secrets
    // This endpoint does NOT accept model/voice/instructions - those go in the WebSocket!
    const createRes = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // Empty body or just expires_in
        // expires_in: 60, // optional
      }),
    });

    if (!createRes.ok) {
      const txt = await createRes.text();
      console.error("❌ OpenAI API error:", createRes.status, txt);
      return new Response(JSON.stringify({ error: "OpenAI error", status: createRes.status, details: txt }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await createRes.json();
    console.log('📦 OpenAI response keys:', Object.keys(json));
    
    // The response structure is: { value: "ek_...", expires_at: ..., session: {...} }
    const ephemeralKey = json.value;
    
    console.log('✅ GA client_secret created:', {
      hasToken: !!ephemeralKey,
      tokenPrefix: ephemeralKey?.substring(0, 10),
      sessionId: json.session?.id
    });
    
    // Return simple format for WebRTC
    return new Response(JSON.stringify({
      ephemeralKey,
      model,
      expires_at: json.expires_at
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
