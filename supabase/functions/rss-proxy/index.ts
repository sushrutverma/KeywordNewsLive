const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function isIpAddress(host: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(host) || host.includes(":");
}

function isPrivateOrReservedIp(ip: string): boolean {
  // IPv4 checks
  const parts = ip.split(".").map(Number);
  if (parts.length === 4 && parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
    const [a, b] = parts;
    if (a === 0) return true; // 0.0.0.0/8
    if (a === 10) return true; // 10.0.0.0/8
    if (a === 127) return true; // 127.0.0.0/8 (loopback)
    if (a === 169 && b === 254) return true; // 169.254.0.0/16 (link-local / cloud metadata)
    if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
    if (a === 192 && b === 168) return true; // 192.168.0.0/16
    if (a >= 224) return true; // Multicast / reserved
    return false;
  }

  // IPv6 checks
  const cleanIp = ip.replace(/^\[|\]$/g, "").toLowerCase();
  if (
    cleanIp === "::1" ||
    cleanIp === "::" ||
    cleanIp.startsWith("fe80:") ||
    cleanIp.startsWith("fc00:") ||
    cleanIp.startsWith("fd00:")
  ) {
    return true;
  }

  return false;
}

function validateUrl(parsedUrl: URL): { safe: boolean; reason?: string } {
  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return { safe: false, reason: "Only HTTP/HTTPS protocols are allowed" };
  }

  if (parsedUrl.username || parsedUrl.password) {
    return { safe: false, reason: "Credentials in URLs are forbidden" };
  }

  if (parsedUrl.port && !["80", "443"].includes(parsedUrl.port)) {
    return { safe: false, reason: "Non-standard ports are forbidden" };
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname.endsWith(".local") ||
    hostname.endsWith(".internal") ||
    hostname.endsWith(".lan") ||
    hostname === "metadata.google.internal"
  ) {
    return { safe: false, reason: "Access to internal, loopback, or cloud metadata domains is forbidden" };
  }

  if (isIpAddress(hostname) && isPrivateOrReservedIp(hostname)) {
    return { safe: false, reason: "Access to private, loopback, or metadata IP addresses is forbidden" };
  }

  return { safe: true };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Verify caller authorization
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Missing or invalid Authorization header" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
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

    // Validate URL syntax
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(feedUrl);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid URL format provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // SSRF & Protocol validation
    const validation = validateUrl(parsedUrl);
    if (!validation.safe) {
      return new Response(
        JSON.stringify({ error: validation.reason || "Forbidden URL destination" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch(parsedUrl.href, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KeywordsNewsBot/1.0)",
        "Accept": "application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, application/xhtml+xml, */*",
      },
      signal: AbortSignal.timeout(10000),
      redirect: "follow",
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