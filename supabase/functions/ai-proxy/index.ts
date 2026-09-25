const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const CANDIDATE_MODELS = [
  "open-mistral-nemo",
  "open-mistral-7b",
  "mistral-tiny",
];

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Verify caller authorization
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const body = await req.json();
    const { messages, temperature = 0.3 } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid 'messages' array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const mistralApiKey = Deno.env.get("MISTRAL_API_KEY") || Deno.env.get("VITE_MISTRAL_API_KEY");

    if (!mistralApiKey) {
      return new Response(
        JSON.stringify({ error: "Server MISTRAL_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let lastError = "All Mistral models failed";

    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${mistralApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages,
            temperature,
          }),
          signal: AbortSignal.timeout(25000),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          lastError = errData.message || `Mistral responded with status ${response.status}`;
          console.warn(`Model ${model} failed: ${lastError}`);
          continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content?.trim();
        if (content) {
          return new Response(
            JSON.stringify({ content, model }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      } catch (modelErr) {
        lastError = modelErr instanceof Error ? modelErr.message : "Request failed";
        console.warn(`Error calling model ${model}:`, lastError);
      }
    }

    return new Response(
      JSON.stringify({ error: `AI service failed: ${lastError}` }),
      { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
