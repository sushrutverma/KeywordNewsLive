const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const feedUrl = url.searchParams.get("url");

    if (!feedUrl) {
      return new Response(
        JSON.stringify({ error: "Missing 'url' query parameter" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate it's a proper URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(feedUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Only allow http/https
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: "Only HTTP/HTTPS URLs are allowed" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(feedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KeywordsNewsBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml, */*",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Feed returned status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const contentType = response.headers.get("content-type") || "application/xml";
    const body = await response.text();

    return new Response(body, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=120",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});