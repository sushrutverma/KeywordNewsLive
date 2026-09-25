from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block, add_table

def build_part2(styles):
    story = []
    
    PRIMARY = colors.HexColor("#0F172A")
    SECONDARY = colors.HexColor("#1D4ED8")
    
    # =========================================================================
    # PART II TITLE PAGE
    # =========================================================================
    story.append(Spacer(1, 140))
    story.append(Paragraph("PART II", styles['PartNumber']))
    story.append(Paragraph("CHRONICLES OF ITERATION", styles['PartTitle']))
    story.append(HRFlowable(width="60%", thickness=2, color=SECONDARY, spaceAfter=14, spaceBefore=6, hAlign='CENTER'))
    story.append(Paragraph("The Engineering Build Log, Napkin Sketches, Dead Ends, Algorithmic Breakthroughs & Production War Stories", styles['PartSubtitle']))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 3: FOUNDATIONS, NAIVE PROTOTYPES & DEAD ENDS
    # =========================================================================
    story.append(ChapterMarker("ch3"))
    story.append(Paragraph("Chapter 3: Phase 1 — Foundations, Naive Prototypes & Dead Ends", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Every production platform begins with naive assumptions. In June 2025, when the first repository commits "
        "(<code>6813880</code> through <code>87c6acb</code>) were pushed to GitHub, Keywords News was an exploratory prototype. "
        "Examining our early mistakes, architectural blind spots, and abandoned experiments reveals the fundamental engineering truths "
        "that govern the platform today.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>3.1 The Initial Stack Selection</b>", styles['H2']))
    story.append(Paragraph(
        "The project began with a deliberate choice of tooling: <b>Vite</b> for sub-second hot module replacement, <b>React 18</b> for "
        "declarative UI composition, <b>TypeScript</b> for compile-time interface verification, and <b>Tailwind CSS</b> for utility-first styling. "
        "The goal was maximum developer agility without the overhead of heavy full-stack frameworks like Next.js, which would have introduced "
        "unnecessary server maintenance for what was fundamentally an edge-distributed client application.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>3.2 The Naive Client-Side RSS Experiment (The First Crash)</b>", styles['H2']))
    story.append(Paragraph(
        "Our very first prototype attempted something extraordinarily simple: in a browser `useEffect` hook, we attempted to call "
        "<code>fetch('https://www.thehindu.com/feeder/default.rss')</code> directly from JavaScript. "
        "The result was immediate and catastrophic failure: the browser console lit up with bright red errors:",
        styles['Body']
    ))
    
    story.extend(add_code_block(
        "Access to fetch at 'https://www.thehindu.com/feeder/default.rss' from origin 'http://localhost:5173'\n"
        "has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.",
        styles
    ))
    
    story.append(Paragraph(
        "This was our introduction to the realities of browser security. Modern news outlets do not configure their RSS servers with "
        "permissive CORS headers because RSS was originally designed for desktop client software (like NetNewsWire or Thunderbird), "
        "not browser-based JavaScript sandboxes. When a browser initiates an HTTP request from an origin (e.g. <code>localhost:5173</code>) "
        "to an external origin (e.g. <code>thehindu.com</code>), it requires an explicit <code>Access-Control-Allow-Origin</code> header in response. "
        "Without it, the browser sandboxes the response and throws a network security exception.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>3.3 The Dead End: Public CORS Proxies</b>", styles['H2']))
    story.append(Paragraph(
        "In our initial scramble to bypass this restriction, we experimented with public community proxies: <code>cors-anywhere.herokuapp.com</code> "
        "and <code>api.allorigins.win</code>. For approximately 48 hours, the app worked. But as soon as we opened multiple tabs, the public proxies "
        "began rejecting our requests with HTTP 429 (Rate Limit Exceeded) and HTTP 502 (Bad Gateway).",
        styles['Body']
    ))
    story.append(Paragraph(
        "Public proxies were brittle, unmonitored, and introduced latency of 3,000 to 5,000 milliseconds per feed. "
        "Furthermore, routing user traffic through unverified third-party proxies opened severe man-in-the-middle (MITM) vulnerabilities. "
        "It became obvious that a production news aggregator could never rely on third-party charity infrastructure. "
        "We needed a dedicated, secure, serverless edge proxy under our complete operational control.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>3.4 The ScrollNavigator Experiment & Its Deprecation</b>", styles['H2']))
    story.append(Paragraph(
        "Another early dead end was the <b>ScrollNavigator</b> component. In an effort to optimize mobile reading, we engineered an "
        "on-screen gesture indicator: a floating widget that tracked scroll position and displayed visual directional cues as users scrolled through articles. "
        "We believed this would assist readers in navigating long lists of headlines.",
        styles['Body']
    ))
    story.append(Paragraph(
        "Below is the exact historical implementation of the deprecated component:",
        styles['Body']
    ))
    
    scroll_nav_code = """// Historical artifact: src/components/ScrollNavigator.tsx (DEPRECATED)
import React, { useState, useEffect } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

export const ScrollNavigator: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed right-4 bottom-20 z-50 flex flex-col items-center bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-full p-2 shadow-lg border">
      <button onClick={() => window.scrollBy({ top: -400, behavior: 'smooth' })}>
        <ChevronUp className="w-5 h-5" />
      </button>
      <span className="text-[10px] font-mono py-1">{Math.round(scrollProgress)}%</span>
      <button onClick={() => window.scrollBy({ top: 400, behavior: 'smooth' })}>
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
};"""
    story.extend(add_code_block(scroll_nav_code, styles))
    
    story.append(Paragraph(
        "During user testing, the feedback was overwhelmingly negative: <i>'The floating widget gets in the way of the headlines'</i>, "
        "<i>'It feels like a video game interface rather than a reading app'</i>, and <i>'Mobile browsers already have native momentum scrolling; why are you overriding it?'</i>. "
        "We learned a vital product lesson: <b>never fight the operating system's native physics</b>. We permanently deprecated and excised the "
        "<code>ScrollNavigator</code> component, committing instead to native, clean, momentum-based touch scrolling.",
        styles['Body']
    ))
    
    story.extend(add_callout(
        "Retrospective Lesson: Kill Your Darlings",
        "Just because a custom UI widget required complex mathematical calculations to implement does not mean it belongs in the product. "
        "If a feature does not actively serve the calm, quiet reading experience, it must be ruthlessly deleted.",
        styles,
        kind="case_study"
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 4: THE VISUAL REVOLUTION: BENTO GRID & DESIGN
    # =========================================================================
    story.append(ChapterMarker("ch4"))
    story.append(Paragraph("Chapter 4: Phase 2 — The Visual Revolution: Bento Grid & Design Systems", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "In early August 2026 (Commit <code>4d6b9ee</code>), Keywords News underwent a visual transformation that redefined its identity. "
        "The prototype had looked like every generic Bootstrap or Tailwind template: identical rectangular cards stacked in a predictable, "
        "visually monotonous three-column grid. It felt utilitarian, sterile, and uninspired.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>4.1 The Psychology of the Bento Grid Layout</b>", styles['H2']))
    story.append(Paragraph(
        "We looked for inspiration in classical print design: the front pages of the <i>Financial Times</i>, <i>The Economist</i>, and "
        "the visual balance of traditional Japanese Bento boxes. In a Bento layout, content items do not have uniform dimensions. "
        "Instead, the page is an asymmetric harmony: a high-priority investigative scoop occupies a 2x2 featured anchor block, "
        "analytical pieces span wide 2x1 horizontal cards, and breaking briefs fill compact 1x1 cells.",
        styles['Body']
    ))
    story.append(Paragraph(
        "This visual hierarchy communicates editorial weight instantly to the human brain. The reader's eye is naturally drawn to "
        "the anchor article before drifting across the secondary and tertiary analytical blocks. The Bento grid created a feeling of "
        "deliberate curation rather than an automated database dump.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>4.2 The Typographic Trinity: Playfair, Lora, and Plus Jakarta Sans</b>", styles['H2']))
    story.append(Paragraph(
        "Typography is the soul of any reading application. A news app rendered in generic system fonts (Arial, Roboto, or standard sans-serif) "
        "feels like a dashboard or an email inbox. We established a strict, three-tier typographic system:",
        styles['Body']
    ))
    
    typo_points = [
        ("Playfair Display (Editorial Headlines)",
         "A high-contrast transitional serif font influenced by John Baskerville's 18th-century letterforms. Used for major article headlines and section titles. It projects authority, gravitas, and classical journalistic dignity."),
        
        ("Lora (Long-Form Reader Body)",
         "A contemporary serif with roots in calligraphy. Designed specifically for digital screen reading, Lora features moderate contrast and generous counters. In our Reader Mode, Lora provides effortless optical flow over long paragraphs without eye strain."),
        
        ("Plus Jakarta Sans (UI Controls & Metadata)",
         "A crisp, geometric sans-serif font engineered for legibility at micro-sizes. Used for timestamps, publication badges, topic pills, search bars, and navigation toggles. It keeps user interface elements modern, sharp, and unobtrusive.")
    ]
    for name, desc in typo_points:
        story.append(Paragraph(f"• <b>{name}:</b> {desc}", styles['Bullet']))
        
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>4.3 The Expandable Hover Sidebar (Physics & Ergonomics)</b>", styles['H2']))
    story.append(Paragraph(
        "Traditional web navigation presents a painful trade-off: either you consume 260 pixels of horizontal screen width with a static sidebar, "
        "or you hide all navigation behind a hamburger menu icon that requires a click to inspect. "
        "We engineered a dynamic compromise: the <b>Desktop Hover-Expandable Sidebar</b> (<code>Sidebar.tsx</code>).",
        styles['Body']
    ))
    story.append(Paragraph(
        "In its resting state, the sidebar collapses into a sleek, 76-pixel rail displaying minimalist SVG icons (Home, Saved, UPSC, Tech, Settings). "
        "When the user hovers their cursor over the rail, it smoothly expands into a 260-pixel navigation drawer with smooth CSS cubic-bezier transitions "
        "(<code>transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1)</code>). The main content canvas does not reflow violently; instead, the drawer "
        "floats with subtle backdrop blur (glassmorphism), allowing immediate topic switching with zero visual friction.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>4.4 Optical Dark & Light Mode Color Palettes</b>", styles['H2']))
    story.append(Paragraph(
        "Many applications implement 'dark mode' by crudely turning the background pure black (<code>#000000</code>) and text pure white (<code>#FFFFFF</code>). "
        "This creates blinding contrast (halation effect) that strains human eyes during night reading. "
        "In Keywords News, our dark mode is formulated using deep, curated slate hues:",
        styles['Body']
    ))
    
    color_palette_table = [
        ["Theme Mode", "Token Name", "Hex Code", "Optical Usage & Context"],
        ["Dark Mode", "bg-slate-900", "#0F172A", "Deep canvas background, prevents OLED battery drain without harsh black."],
        ["Dark Mode", "bg-slate-800", "#1E293B", "Elevated Bento card surfaces, providing subtle depth and tactile layering."],
        ["Dark Mode", "text-slate-100", "#F1F5F9", "Primary headline color, softened to 94% luminance to eliminate halation."],
        ["Dark Mode", "text-slate-400", "#94A3B8", "Metadata, dates, and author bylines, keeping peripheral information gentle."],
        ["Light Mode", "bg-slate-50", "#F8FAFC", "Warm paper-like white canvas, avoiding sterile hospital-grade light."],
        ["Light Mode", "card-surface", "#FFFFFF", "Crisp card blocks with subtle box-shadows (rgba(0,0,0,0.04))."],
        ["Light Mode", "text-slate-900", "#0F172A", "Rich ink-like charcoal for headlines, providing authoritative readability."]
    ]
    story.extend(add_table(color_palette_table[0], color_palette_table[1:], [80, 95, 80, 249], styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 5: CONTENT ENGINEERING & ALGORITHMIC BREAKTHROUGHS
    # =========================================================================
    story.append(ChapterMarker("ch5"))
    story.append(Paragraph("Chapter 5: Phase 3 — Content Engineering: The Algorithmic Breakthroughs", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Mid-August 2026 marked the transition of Keywords News from a visual mockup into a sophisticated content-engineering platform. "
        "Once our RSS catalog expanded to 40+ feeds across 7 verticals, we encountered systemic content distribution bugs that required "
        "mathematical and algorithmic solutions.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>5.1 The Publisher Monopoly Crisis (The Times of India Flood)</b>", styles['H2']))
    story.append(Paragraph(
        "As soon as we added high-volume wire sources, our homepage broke conceptually. Wire outlets publish dozens of articles an hour. "
        "When the frontend simply fetched all feeds, combined them into an array, and sorted them with <code>articles.sort((a, b) => b.pubDate - a.pubDate)</code>, "
        "the first 12 articles on the page were all from a single publisher. The diverse analytical journalism from smaller, specialized feeds "
        "was buried on page three. The platform had become a mirror of the very wire services it sought to elevate.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>5.2 The Round-Robin Interleaving Algorithm</b>", styles['H2']))
    story.append(Paragraph(
        "To solve this permanently, we authored the <b>Round-Robin Interleaving Algorithm</b> inside <code>newsService.ts</code>. "
        "The logic operates as follows:",
        styles['Body']
    ))
    
    rr_steps = [
        ("Step 1: Source Partitioning", "Incoming articles are partitioned into discrete dictionary buckets keyed by the publisher's normalized name: <code>buckets[sourceName] = [Article1, Article2, ...]</code>."),
        ("Step 2: Internal Chronological Sorting", "Each bucket is independently sorted chronologically so the publisher's freshest reporting is at the head of their queue."),
        ("Step 3: Rotational Dequeueing", "A pointer loop cycles across the available publisher buckets, drawing exactly 1 article from each non-empty bucket per cycle into the output master array."),
        ("Step 4: Exhaustion & Balance", "The cycle repeats until all buckets are empty. The resulting array guarantees that no publisher ever appears twice in succession.")
    ]
    for st, sd in rr_steps:
        story.append(Paragraph(f"• <b>{st}:</b> {sd}", styles['Bullet']))
        
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>5.3 Enforcing the 70/30 Regional Balancing Equation</b>", styles['H2']))
    story.append(Paragraph(
        "Following Round-Robin interleaving, the stream passes into <code>mixRegionalArticles()</code>. "
        "Each source in <code>newsSources.ts</code> carries an explicit flag: <code>isIndian: boolean</code>. "
        "The algorithm partitions the interleaved stream into two queues: <code>indianArticles</code> and <code>worldArticles</code>.",
        styles['Body']
    ))
    story.append(Paragraph(
        "The balancing loop then draws articles in a strict <b>7-to-3 ratio</b>: it takes 7 articles from the Indian queue, "
        "followed by 3 articles from the World queue, and repeats this cycle throughout the entire master feed. "
        "If one queue is exhausted before the other, the remaining articles from the surviving queue are appended gracefully. "
        "This simple yet rigorous mathematical equation guarantees that our readers never lose touch with Indian national policy.",
        styles['Body']
    ))
    
    story.extend(add_code_block(
        "// Excerpt from src/services/newsService.ts\n"
        "const mixRegionalArticles = (articles: Article[]): Article[] => {\n"
        "  const indian = articles.filter(a => a.isIndian);\n"
        "  const world = articles.filter(a => !a.isIndian);\n"
        "  const result: Article[] = [];\n"
        "  let i = 0, w = 0;\n"
        "  while (i < indian.length || w < world.length) {\n"
        "    let indCount = 0;\n"
        "    while (indCount < 7 && i < indian.length) { result.push(indian[i++]); indCount++; }\n"
        "    let worldCount = 0;\n"
        "    while (worldCount < 3 && w < world.length) { result.push(world[w++]); worldCount++; }\n"
        "  }\n"
        "  return result;\n"
        "};",
        styles
    ))
    
    story.append(Paragraph("<b>5.4 The 3-Step User Onboarding Wizard Architecture</b>", styles['H2']))
    story.append(Paragraph(
        "To make the reading experience personal from day one, we designed the 3-step Onboarding Wizard (<code>OnboardingPage.tsx</code>). "
        "Upon registration, rather than dropping the user into an unconfigured feed, the wizard guides them through:",
        styles['Body']
    ))
    story.append(Paragraph(
        "1. <b>Identity & Occupation:</b> Capturing their name and professional context (e.g. Civil Servant, Software Engineer, Designer, Student).<br/>"
        "2. <b>Daily Reading Habit Goal:</b> Setting an intentional daily target (15, 30, or 45 minutes) to encourage mindful completion.<br/>"
        "3. <b>Topic Follow Preferences:</b> Selecting from the 7 curated verticals to customize their default top navigation tabs.",
        styles['Body']
    ))
    story.append(Paragraph(
        "These preferences are serialized and immediately synced to the Supabase <code>public.profiles</code> table, ensuring the user's "
        "reading sanctuary persists across devices and sessions.",
        styles['Body']
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 6: THE COGNITIVE LAYER: IN-APP READER & MISTRAL AI
    # =========================================================================
    story.append(ChapterMarker("ch6"))
    story.append(Paragraph("Chapter 6: Phase 4 — The Cognitive Layer: In-App Reader & Mistral AI", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "In September 2026, Keywords News crossed a major technical threshold: transforming from an intelligent headline aggregator "
        "into a complete, self-contained cognitive reading environment.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>6.1 Stripping the Web Clean with Mozilla Readability</b>", styles['H2']))
    story.append(Paragraph(
        "Directing users away to external publisher websites was always considered an architectural failure. "
        "In <code>ArticlePage.tsx</code> and <code>scraperService.ts</code>, we integrated <code>@mozilla/readability</code> — "
        "the same battle-tested engine powering Firefox Reader View. When a user opens an article, our proxy fetches the raw HTML, "
        "passes the DOM tree into Readability, and extracts clean, semantic paragraphs while stripping all script tags, stylesheets, "
        "iframes, and advertising containers. The article renders in our custom Lora serif layout, formatted for deep, immersive reading.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>6.2 The Floating AI Concept Explainer</b>", styles['H2']))
    story.append(Paragraph(
        "A primary friction point in reading high-level policy journalism (especially UPSC, economics, and advanced technology) "
        "is specialized jargon: terms like <i>'Fiscal Deficit'</i>, <i>'Capital Adequacy Ratio'</i>, <i>'CRISPR-Cas9'</i>, or <i>'Quantum Entanglement'</i>. "
        "Normally, a reader must leave the application, open a search engine, navigate through Wikipedia or ad-laden explainers, and return. "
        "This friction breaks reading comprehension.",
        styles['Body']
    ))
    story.append(Paragraph(
        "We built the <b>AI Floating Concept Explainer</b>: in <code>ArticlePage.tsx</code>, a mouse-up listener detects when a user highlights "
        "between 2 and 6 words of text. A discreet, floating tooltip button appears immediately above the selection. "
        "Clicking 'Explain' dispatches an asynchronous call to <code>aiService.explainConcept(selectedText, articleContext)</code>. "
        "Within 800 milliseconds, the tooltip unfolds, presenting a crisp, 2-sentence explanation tailored to the exact context of the article.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>6.3 The Battle with Rate Limits: Upgrading to Mistral 12B Nemo</b>", styles['H2']))
    story.append(Paragraph(
        "Initially, our AI summaries utilized <code>mistral-small-latest</code>. During active testing sessions with multiple users, "
        "Mistral's API began returning HTTP 429 (Too Many Requests / Quota Exceeded). "
        "The investigation revealed that smaller legacy models shared a lower concurrent request threshold on Mistral's platform.",
        styles['Body']
    ))
    story.append(Paragraph(
        "We resolved this by upgrading the primary model to <b><code>open-mistral-nemo</code></b> (Mistral's 12-billion parameter model). "
        "Nemo delivered two decisive advantages: significantly higher token processing allowances, and vastly superior executive synthesis. "
        "Furthermore, we engineered an automatic <b>Three-Tier Fallback Chain</b> in <code>aiService.ts</code>:",
        styles['Body']
    ))
    
    ai_chain = [
        ("Tier 1 (Primary)", "<code>open-mistral-nemo</code> (12B) — Delivers optimal nuance, speed, and analytical conciseness."),
        ("Tier 2 (Secondary Fallback)", "<code>open-mistral-7b</code> — Automatically invoked if Tier 1 returns 429, 500, or 503."),
        ("Tier 3 (Emergency Fallback)", "<code>mistral-tiny</code> — Lightweight legacy model ensuring users always receive an answer.")
    ]
    for t_name, t_desc in ai_chain:
        story.append(Paragraph(f"• <b>{t_name}:</b> {t_desc}", styles['Bullet']))
        
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 7: PRODUCTION HARDENING & WAR STORIES
    # =========================================================================
    story.append(ChapterMarker("ch7"))
    story.append(Paragraph("Chapter 7: Phase 5 — Production Hardening & War Stories from the Edge", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "The difference between an amateur hobby project and a resilient production platform lies in how it behaves under edge cases. "
        "In mid-September 2026, we encountered three insidious production bugs that tested our architectural assumptions.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>7.1 War Story: The Netlify Remote Build Masking Trap</b>", styles['H2']))
    story.append(Paragraph(
        "This was the most baffling bug in the project's history. Locally, the application compiled and fetched news flawlessly. "
        "However, whenever we triggered a build on Netlify's remote CI/CD servers, the deployed production website displayed an empty feed "
        "and threw constant <code>401 Unauthorized</code> errors from the Supabase client.",
        styles['Body']
    ))
    story.append(Paragraph(
        "Our initial hypothesis was that the environment variables were not set in the Netlify dashboard. "
        "We verified them: <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> were indeed present. "
        "Yet, when we inspected the compiled JavaScript bundle in the browser DevTools (<code>dist/assets/index-xxx.js</code>), "
        "we discovered something horrifying: Netlify's build daemon had literally injected masked asterisks into the client bundle!",
        styles['Body']
    ))
    
    story.extend(add_code_block(
        "// What was literally compiled into production by Netlify remote build:\n"
        "const SUPABASE_ANON_KEY = '****************KilA';\n"
        "const SUPABASE_URL = 'https://jwksmchxpprxkpbsmhxo.supabase.co';",
        styles
    ))
    
    story.append(Paragraph(
        "Because Netlify's security scanner treats API keys as sensitive secrets, it had masked the key during the build step, "
        "baking a string of literal asterisks directly into our production JavaScript bundle! The Supabase SDK was attempting to authenticate "
        "using asterisks, causing all requests to be rejected with 401 Unauthorized.",
        styles['Body']
    ))
    story.append(Paragraph(
        "<b>The Permanent Resolution:</b> We established the <b>Local Prebuild Gold Standard</b>. "
        "Instead of allowing Netlify's remote runners to compile the code, the developer compiles the project locally using their authentic <code>.env</code> file "
        "via <code>npm run build</code>, and then deploys the verified <code>dist/</code> folder directly using the Netlify CLI with the <code>--no-build</code> flag:",
        styles['Body']
    ))
    
    story.extend(add_code_block(
        "# The Gold Standard Deployment Recipe\n"
        "npm run build\n"
        "node node_modules/netlify/bin/run.js deploy --prod --dir dist --no-build",
        styles
    ))
    
    story.append(Paragraph("<b>7.2 War Story: Single-Page Application 404 Routing on Netlify</b>", styles['H2']))
    story.append(Paragraph(
        "Another classic production failure occurred when users attempted to refresh the browser on <code>https://keywordnews.netlify.app/saved</code> "
        "or open a shared link to <code>/article/123</code>. The server returned a standard Netlify 404 page: 'Page Not Found'.",
        styles['Body']
    ))
    story.append(Paragraph(
        "Because Keywords News is a single-page React application, physical HTML files like <code>/saved.html</code> do not exist on the CDN edge. "
        "All routing is handled dynamically in client JavaScript by <code>react-router-dom</code>. "
        "To resolve this permanently across all Netlify CDN edge nodes, we implemented a two-tier rewrite policy:",
        styles['Body']
    ))
    
    story.append(Paragraph(
        "1. Created <code>public/_redirects</code> containing: <code>/* &nbsp; /index.html &nbsp; 200</code><br/>"
        "2. Created <code>netlify.toml</code> in the project root declaring explicit SPA rewrite rules.",
        styles['Body']
    ))
    story.append(Paragraph(
        "This instructs Netlify's HTTP edge routers to rewrite all incoming traffic to <code>/index.html</code> with an HTTP 200 status, "
        "allowing React Router to take control and seamlessly mount the correct page.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>7.3 War Story: Cache Invalidation & Stale Feeds</b>", styles['H2']))
    story.append(Paragraph(
        "Early in production testing, users complained: <i>'I checked the website at 9 AM, and when I reopened it at 4 PM, it showed the exact same news from this morning.'</i>",
        styles['Body']
    ))
    story.append(Paragraph(
        "The root cause was our initial LocalStorage implementation: it cached articles indefinitely without evaluating time-to-live (TTL). "
        "To fix this, we created the dual-key cache system in <code>newsService.ts</code>: <code>news_cache_v2</code> and <code>news_cache_timestamp_v2</code>. "
        "We set <code>CACHE_DURATION = 120,000</code> (2 minutes). When the app launches, it checks if <code>(now - timestamp) < 120,000</code>. "
        "If under 2 minutes, it renders instantly; if older, it renders the cached data momentarily while silently dispatching a fresh background fetch. "
        "The feed updates smoothly without jarring content jumps.",
        styles['Body']
    ))
    
    story.append(PageBreak())
    return story
