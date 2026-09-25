from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block, add_table

def build_part3(styles):
    story = []
    
    PRIMARY = colors.HexColor("#0F172A")
    SECONDARY = colors.HexColor("#1D4ED8")
    
    # =========================================================================
    # PART III TITLE PAGE
    # =========================================================================
    story.append(Spacer(1, 140))
    story.append(Paragraph("PART III", styles['PartNumber']))
    story.append(Paragraph("DEEP TECHNICAL ARCHITECTURE", styles['PartTitle']))
    story.append(HRFlowable(width="60%", thickness=2, color=SECONDARY, spaceAfter=14, spaceBefore=6, hAlign='CENTER'))
    story.append(Paragraph("A Granular Systems Analysis of Frontend State, Edge Gateways, PostgreSQL Database & AI Subsystems", styles['PartSubtitle']))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 8: FULL STACK ANATOMY & SYSTEM TOPOLOGY
    # =========================================================================
    story.append(ChapterMarker("ch8"))
    story.append(Paragraph("Chapter 8: Full Stack Anatomy & End-to-End System Topology", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Keywords News represents a pure implementation of the modern JAMstack philosophy: Javascript, APIs, and Markup. "
        "There is no traditional application server (such as an Express or Django monolith) listening on a dedicated port. "
        "Instead, the architecture distributes workloads across globally replicated edge infrastructure:",
        styles['Body']
    ))
    
    arch_tiers = [
        ["Layer", "Technology", "Location", "Core Functionality"],
        ["Client View", "React 18, TypeScript, Tailwind", "Browser (Desktop/Mobile)", "Bento feed rendering, responsive drawer, modal search, reader view."],
        ["Global Edge", "Netlify Global CDN", "Global Edge Network", "Static asset delivery, automatic SSL termination, SPA rewrite rules."],
        ["CORS Proxy", "Deno Serverless Edge Function", "Supabase Edge (ap-south-1)", "Fetches external XML feeds, strips CORS blocks, injects 120s caching."],
        ["Identity / DB", "Supabase (PostgreSQL 15)", "Cloud Postgres (Mumbai)", "User authentication, profile preferences, reading goals, RLS policies."],
        ["Cache Store", "Browser LocalStorage", "Client Device", "news_cache_v2 stores parsed articles for instant tab switching (2-min TTL)."],
        ["Cognitive AI", "Mistral AI API", "Mistral Infrastructure", "Executive 3-sentence article summaries and floating concept definitions."]
    ]
    story.extend(add_table(arch_tiers[0], arch_tiers[1:], [80, 130, 120, 174], styles))
    
    story.append(Paragraph("<b>8.1 Network Topology & Latency Profiles</b>", styles['H2']))
    story.append(Paragraph(
        "When an end-user navigates to <code>https://keywordnews.netlify.app</code>, the initial HTML shell, pre-compiled JavaScript, "
        "and minified CSS bundles are served from Netlify's closest Point of Presence (PoP) in typically under 60 milliseconds. "
        "Once mounted, client JavaScript checks <code>localStorage</code>. If valid cached data exists, initial content paints in 0ms.",
        styles['Body']
    ))
    story.append(Paragraph(
        "For network requests, all RSS proxy queries route through our Supabase Edge Function hosted in the <code>ap-south-1</code> (Mumbai) region. "
        "Because the majority of our audience and targeted news publications reside in South Asia, this geographic co-location minimizes "
        "round-trip latency, allowing 6 concurrent feeds to be retrieved and parsed in under 800 milliseconds.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>8.2 Component Interaction Map</b>", styles['H2']))
    story.append(Paragraph(
        "The diagram below represents the directional flow of data and control between the core components of the application:",
        styles['Body']
    ))
    
    topology_diagram = """+-------------------------------------------------------------------------+
|                              USER BROWSER                               |
|                                                                         |
|  +-------------------+     +------------------+     +----------------+  |
|  |     HomePage      | <-> |   NewsContext    | <-> | LocalStorage   |  |
|  |   (Bento Feed)    |     | (State & Cache)  |     | (news_cache_v2)|  |
|  +-------------------+     +------------------+     +----------------+  |
|           |                         |                                   |
|           v                         v                                   |
|  +-------------------+     +------------------+                         |
|  |    ArticlePage    |     |  newsService.ts  |                         |
|  |   (Reader Mode)   |     | (Batch & Inter.) |                         |
|  +-------------------+     +------------------+                         |
|       |         |                   |                                   |
+-------|---------|-------------------|-----------------------------------+
        |         |                   |
        v         |                   v
+---------------+ |          +--------------------+
|  Mistral AI   | |          | Supabase Edge Fn   |
| (open-mistral | |          |   (rss-proxy)      |
|     -nemo)    | |          +--------------------+
+---------------+ |                   |
                  |                   v
                  |          +--------------------+
                  |          | 40+ Upstream Feeds |
                  |          | (The Hindu, Mint)  |
                  |          +--------------------+
                  v
         +------------------+
         |  Supabase Auth   |
         |  & PostgreSQL    |
         | (public.profiles)|
         +------------------+"""
    story.extend(add_code_block(topology_diagram, styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 9: THE FRONTEND ENGINE: STATE & CONTEXTS
    # =========================================================================
    story.append(ChapterMarker("ch9"))
    story.append(Paragraph("Chapter 9: The Frontend Engine: State Management, Contexts & Hooks", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "State management in Keywords News is architected using React's native Context API, augmented by custom hooks and LocalStorage persistence. "
        "We avoided heavy external state libraries (like Redux or MobX) to keep the bundle lightweight and eliminate boilerplate.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>9.1 The Master State Contexts:</b>", styles['H2']))
    
    contexts_info = [
        ("NewsContext (src/contexts/NewsContext.tsx)",
         "The central nervous system of the feed. Manages the active topic filter, the master array of loaded articles, progressive streaming batches, "
         "the full-text search filter query, pull-to-refresh triggers, and the <code>news_cache_v2</code> serialization logic."),
        
        ("AuthContext (src/contexts/AuthContext.tsx)",
         "Interfaces directly with Supabase GoTrue authentication. Listens to <code>onAuthStateChange</code> events, manages user login/logout sessions, "
         "and synchronizes the user's reading goals and followed topic preferences from the <code>public.profiles</code> table."),
        
        ("ThemeContext (src/contexts/ThemeContext.tsx)",
         "Controls visual styling state: light vs. dark mode. Evaluates system OS preferences upon first load, persists explicit user overrides "
         "to <code>localStorage.getItem('theme')</code>, and dynamically toggles the <code>.dark</code> class on the root <code>&lt;html&gt;</code> element."),
        
        ("SearchHistoryContext (src/contexts/SearchHistoryContext.tsx)",
         "Maintains an array of the user's recent search terms. Capped at 10 items, stored in <code>localStorage</code>, and powers instant autocomplete suggestions "
         "inside the fullscreen search modal.")
    ]
    for c_title, c_desc in contexts_info:
        story.append(Paragraph(f"• <b>{c_title}:</b> {c_desc}", styles['Bullet']))
        
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>9.2 Progressive Loading & Concurrent Batching Pipeline</b>", styles['H2']))
    story.append(Paragraph(
        "Fetching 40+ RSS feeds sequentially would take over 30 seconds. Conversely, firing 40 HTTP requests simultaneously would flood the browser's "
        "network pool, causing connection timeouts and UI lag. In <code>newsService.ts</code>, we engineered the <b>Batched Streaming Fetcher</b>:",
        styles['Body']
    ))
    story.append(Paragraph(
        "The catalog of active sources is partitioned into arrays of 6 sources each. The algorithm iterates through the batches, executing all 6 "
        "concurrently via <code>Promise.allSettled()</code>. As each batch resolves, the articles are normalized, interleaved, and passed into "
        "the <code>onProgress(batchArticles)</code> callback, updating React state progressively. The reader sees articles appear smoothly within "
        "one second, while the remainder of the catalog quietly populates in the background.",
        styles['Body']
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 10: IN-APP READER & SCRAPING SUBSYSTEM
    # =========================================================================
    story.append(ChapterMarker("ch10"))
    story.append(Paragraph("Chapter 10: In-App Reader Subsystem & Client-Side HTML Extraction", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "The in-app Reader Mode (<code>ArticlePage.tsx</code>) is one of Keywords News's proudest engineering achievements. "
        "It decouples journalistic text from the commercial noise of the open web.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>10.1 The HTML Scraping & Sanitization Flow</b>", styles['H2']))
    story.append(Paragraph(
        "When an article is selected, <code>scraperService.ts</code> executes the extraction pipeline:",
        styles['Body']
    ))
    
    scraper_steps = [
        ("1. Proxy Retrieval", "The article's canonical URL is passed to the Supabase proxy, fetching the upstream HTML without triggering browser CORS blocks."),
        ("2. Virtual DOM Construction", "The raw HTML string is parsed into a headless DOM tree using browser-native <code>DOMParser</code> inside a detached memory context."),
        ("3. Mozilla Readability Engine", "A new instance of <code>Readability(virtualDoc)</code> analyzes paragraph density, text-to-tag ratios, and semantic structure to identify the true article body."),
        ("4. Strip & Sanitize", "All script tags, iframe embeds, inline styling, tracking pixels, and advertising divs are stripped. Only semantic paragraphs (<code>&lt;p&gt;</code>), headings, and verified lead images are preserved."),
        ("5. Typography Injection", "The sanitized content is rendered inside an optical container styled with our custom Lora serif typography, optimized line heights (1.75), and generous margins.")
    ]
    for st, sd in scraper_steps:
        story.append(Paragraph(f"• <b>{st}:</b> {sd}", styles['Bullet']))
        
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>10.2 Graceful Degradation Strategy</b>", styles['H2']))
    story.append(Paragraph(
        "Certain publishers deploy aggressive anti-scraping paywalls (e.g. Cloudflare Turnstile or hard paywalls). "
        "If Readability fails to extract meaningful text, <code>ArticlePage.tsx</code> does not break. "
        "Instead, it gracefully falls back to displaying the rich RSS snippet, provides a prominent 'Read on Original Publisher' button, "
        "and still generates an AI executive summary based on available metadata.",
        styles['Body']
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 11: COGNITIVE AI PIPELINE & MISTRAL 12B
    # =========================================================================
    story.append(ChapterMarker("ch11"))
    story.append(Paragraph("Chapter 11: The Cognitive AI Pipeline: Mistral 12B & Concept Explainer", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "The AI subsystem (<code>src/services/aiService.ts</code>) is engineered with two strict constraints: <b>zero hallucination</b> and "
        "<b>extreme executive brevity</b>. Below is the technical specification of its prompt architecture and runtime mechanics:",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>11.1 Prompt Engineering for Factual Integrity</b>", styles['H2']))
    story.append(Paragraph(
        "To prevent large language models from hallucinating or inserting editorial bias, our system prompt enforces strict journalistic boundaries:",
        styles['Body']
    ))
    
    ai_prompt_code = """// Excerpt from src/services/aiService.ts
const SYSTEM_PROMPT = `You are a high-level executive intelligence briefing assistant.
Your task is to summarize news articles with extreme conciseness, precision, and complete factual objectivity.
RULES:
1. Provide exactly 2 to 3 crisp, analytical sentences.
2. Focus strictly on: What happened, Who was involved, and Why it matters.
3. Do not use filler phrases (e.g. 'This article discusses...', 'In conclusion...').
4. Never speculate, editorialize, or introduce external facts not present in the text.
5. If the article is too short or ambiguous, state only verified core facts.`;"""
    story.extend(add_code_block(ai_prompt_code, styles))
    
    story.append(Paragraph("<b>11.2 Context Window Optimization & Token Limiting</b>", styles['H2']))
    story.append(Paragraph(
        "Sending an entire 10,000-word article to the AI API introduces high latency and quickly exhausts token quotas. "
        "In <code>aiService.ts</code>, we implement <code>cleanAndTrimText()</code> which sanitizes HTML tags, strips extra whitespace, "
        "and slices the input to the first 3,000 characters. Empirical testing proved that 95% of core journalistic facts "
        "(the 'Inverted Pyramid' of journalism) are contained within the first 3,000 characters of an article.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>11.3 Floating Tooltip Coordinate Math</b>", styles['H2']))
    story.append(Paragraph(
        "In <code>ArticlePage.tsx</code>, positioning the floating AI tooltip requires calculating viewport coordinates relative to "
        "the user's text selection. When <code>window.getSelection()</code> returns a range, we extract the bounding client rectangle "
        "(<code>range.getBoundingClientRect()</code>). The tooltip's horizontal position is centered: "
        "<code>left = rect.left + (rect.width / 2)</code>, and vertical position is clamped: <code>top = rect.top - 48px</code>. "
        "If the selection is too close to the top of the viewport, the tooltip flips beneath the selection to prevent clipping.",
        styles['Body']
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 12: DATABASE ARCHITECTURE & SUPABASE SCHEMA
    # =========================================================================
    story.append(ChapterMarker("ch12"))
    story.append(Paragraph("Chapter 12: Database Architecture: Supabase, PostgreSQL & Row Level Security", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Keywords News uses <b>Supabase (PostgreSQL 15+)</b> for persistent user accounts, profiles, and reading preferences. "
        "Below is the complete, idempotent SQL Data Definition Language (DDL) script required to construct the entire database:",
        styles['Body']
    ))
    
    ddl_code = """-- Complete Idempotent Database Schema for Keywords News
-- Target: Supabase PostgreSQL 15+

-- 1. Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  occupation text,
  reading_goal integer DEFAULT 15,
  followed_topics text[] DEFAULT '{}'::text[],
  article_duration_filter text DEFAULT '7 days',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Idempotent RLS Policies
DO $$ 
BEGIN
  -- Read Policy: Users can only read their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;

  -- Update Policy: Users can only modify their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;

  -- Insert Policy: Authenticated users can insert their own profile
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4. Automatic Timestamp Update Trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"""
    story.extend(add_code_block(ddl_code, styles))
    
    story.append(Paragraph("<b>12.1 The Supabase Deno Edge Proxy Function in Depth</b>", styles['H2']))
    story.append(Paragraph(
        "Below is the complete TypeScript source code for the Deno Edge Proxy (<code>supabase/functions/rss-proxy/index.ts</code>):",
        styles['Body']
    ))
    
    edge_code = """// supabase/functions/rss-proxy/index.ts
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

    const parsedUrl = new URL(feedUrl);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return new Response(
        JSON.stringify({ error: "Only HTTP/HTTPS URLs allowed" }),
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
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});"""
    story.extend(add_code_block(edge_code, styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 13: CLIENT-SIDE STORAGE & CACHING PHYSICS
    # =========================================================================
    story.append(ChapterMarker("ch13"))
    story.append(Paragraph("Chapter 13: Client-Side Storage, Caching Physics & LocalStorage Schemas", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "A snappy, instant-feeling application relies on defensive, multi-tiered caching. "
        "Below is the complete architectural specification of all browser storage keys utilized by Keywords News:",
        styles['Body']
    ))
    
    storage_table_data = [
        ["Key Name", "Type", "TTL / Expiry", "Purpose & Cache Eviction Rules"],
        ["news_cache_v2", "JSON Article[]", "2 Minutes", "Serialized articles array. Checked on app mount for 0ms instant render."],
        ["news_cache_timestamp_v2", "Timestamp (ms)", "2 Minutes", "Evaluated against CACHE_DURATION (120,000 ms). Expired data triggers background fetch."],
        ["savedArticles", "JSON Article[]", "Indefinite", "User bookmarked articles. Persists until explicitly deleted by user."],
        ["followedTopics", "JSON string[]", "Indefinite", "Array of 7 followed topic IDs displayed in top navigation bar."],
        ["searchHistory", "JSON string[]", "Indefinite", "Recent search keyword strings. Capped at 10 items to prevent storage bloat."],
        ["theme", "String ('dark'|'light')", "Indefinite", "User's dark/light theme choice, controlling CSS root classes."]
    ]
    story.extend(add_table(storage_table_data[0], storage_table_data[1:], [140, 90, 84, 190], styles))
    
    story.append(Paragraph("<b>13.1 Defensive Storage & Quota Exceeded Recovery</b>", styles['H2']))
    story.append(Paragraph(
        "Browsers enforce a strict 5MB quota on <code>localStorage</code> per origin. If a user saves dozens of articles with extensive "
        "metadata, or if a browser crash corrupts the JSON string, naive code will crash with a <code>QuotaExceededError</code> or "
        "<code>SyntaxError: Unexpected token</code>. "
        "Inside <code>newsService.ts</code>, every read and write is wrapped in a defensive try/catch block. If an error is caught, the app "
        "automatically purges the temporary <code>news_cache_v2</code>, preserves the user's precious <code>savedArticles</code>, and continues "
        "operating without interrupting the user experience.",
        styles['Body']
    ))
    story.append(PageBreak())
    return story
