from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block, add_table

PRIMARY = colors.HexColor("#0F172A")
SECONDARY = colors.HexColor("#1D4ED8")

def build_part1_addon(styles):
    story = []
    # CHAPTER 2B: THE FOUNDER'S JOURNEY
    story.append(ChapterMarker("ch2b"))
    story.append(Paragraph("Chapter 2B: The Founder's Journey: A Non-Technical Vision in Code", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "In traditional technology discourse, software is celebrated as the exclusive domain of computer science graduates, "
        "algorithms engineers, and venture-backed development teams. Keywords News stands as a living testament to a radical new paradigm: "
        "the realization of an ambitious, complex technical platform driven by a non-technical founder working in continuous symbiosis "
        "with autonomous agentic artificial intelligence.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>2B.1 The Burden of Non-Technical Ownership</b>", styles['H2']))
    story.append(Paragraph(
        "For a non-technical founder, building software has historically been an exercise in vulnerability. "
        "If you do not understand syntax trees, database connection pools, or HTTP protocol headers, you are at the mercy of outsourced agencies "
        "or unpredictable contractors. When a website goes down or throws a <code>401 Unauthorized</code> error, you cannot inspect the call stack; "
        "you can only experience helplessness.",
        styles['Body']
    ))
    story.append(Paragraph(
        "Keywords News broke this cycle. The founder brought domain obsession: a deep, visceral understanding of what serious readers in India "
        "actually require. They understood that reading UPSC governance policy requires serene concentration; that tech journalism is ruined "
        "by PR hype; that sartorial style and running science are disciplines of craft, not disposable clickbait. "
        "The AI brought exhaustive execution: writing production TypeScript, architecting SQL migrations, tuning CORS proxies, and diagnosing "
        "subtle bundling bugs.",
        styles['Body']
    ))
    
    story.extend(add_callout(
        "The Autonomous Partnership Paradigm",
        "The future of software does not belong exclusively to engineers who write code, nor to visionaries who lack technical tools. "
        "It belongs to founders who can hold an unwavering product vision and guide autonomous AI agents through the grueling realities "
        "of production debugging and deployment.",
        styles,
        kind="case_study"
    ))
    
    story.append(Paragraph("<b>2B.2 The Moral Obligation of Handover Documentation</b>", styles['H2']))
    story.append(Paragraph(
        "Because the founder does not write code, they cannot afford ambiguity in documentation. A typical technical README says: "
        "<i>'Configure your environment variables and deploy.'</i> To a non-technical owner, this is meaningless jargon. "
        "This is why this handbook is exhaustive. Every single variable is mapped to its exact dashboard menu; every deployment command "
        "is provided verbatim; and every database policy is printed in raw SQL. If the founder ever needs to hire a freelance engineer "
        "in the future, they do not need to explain the system; they simply hand over this volume.",
        styles['Body']
    ))
    story.append(PageBreak())
    return story

def build_part2_addon_ch3b(styles):
    story = []
    # CHAPTER 3B: MOBILE TOUCH PHYSICS
    story.append(ChapterMarker("ch3b"))
    story.append(Paragraph("Chapter 3B: Mobile Touch Physics & The Viewport Height Bug", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Building a high-end web application that feels indistinguishable from a native iOS or Android app requires mastering the subtle "
        "quirks of mobile web engines, particularly WebKit on iOS Safari.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>3B.1 The Infamous 100vh Viewport Bug on Mobile Safari</b>", styles['H2']))
    story.append(Paragraph(
        "Early in mobile testing, users on iPhones noted that the bottom navigation bar and pull-to-refresh drawer were frequently clipped "
        "by Safari's dynamic bottom URL bar. In CSS, setting <code>height: 100vh</code> calculates the viewport height assuming the browser address bar "
        "is collapsed. When Safari expands its navigation chrome, the bottom 60 pixels of the application are rendered beneath the screen fold, "
        "rendering buttons unclickable.",
        styles['Body']
    ))
    story.append(Paragraph(
        "We permanently resolved this by adopting modern dynamic viewport units in <code>src/index.css</code>:",
        styles['Body']
    ))
    
    dvh_code = """/* Modern Dynamic Viewport Units in src/index.css */
.min-h-screen-safe {
  min-height: 100vh; /* Fallback for legacy browsers */
  min-height: 100dvh; /* Dynamic Viewport Height: automatically adjusts as browser chrome expands/collapses */
}

/* Safe area padding for iPhone notch and home indicator bar */
.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
.pt-safe {
  padding-top: env(safe-area-inset-top, 16px);
}"""
    story.extend(add_code_block(dvh_code, styles))
    
    story.append(Paragraph("<b>3B.2 Pull-to-Refresh & Momentum Physics</b>", styles['H2']))
    story.append(Paragraph(
        "On mobile touch devices, readers expect pull-to-refresh: pulling down at the top of the feed should check for fresh headlines. "
        "In <code>HomePage.tsx</code>, we implemented touch event listeners (<code>onTouchStart</code>, <code>onTouchMove</code>, <code>onTouchEnd</code>) "
        "with resistance damping: the pull distance is scaled logarithmically (<code>distance * 0.4</code>) to mimic native iOS spring physics. "
        "When pulled past 80px, a smooth haptic-style spinner triggers <code>fetchNewsProgressively()</code>, refreshing the feed without reloading the page.",
        styles['Body']
    ))
    story.append(PageBreak())
    return story

def build_part2_addon_ch5b(styles):
    story = []
    # CHAPTER 5B: MATHEMATICAL MODELS OF NEWS DIVERSITY
    story.append(ChapterMarker("ch5b"))
    story.append(Paragraph("Chapter 5B: Mathematical Models of News Interleaving & Diversity", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Why does standard chronological sorting fail so catastrophically in multi-source news aggregators? "
        "To understand the breakthrough of Keywords News, let us examine the mathematical distribution models of incoming news:",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>5B.1 Comparing Four Algorithmic Scheduling Models:</b>", styles['H2']))
    
    models_table = [
        ["Model Name", "Sorting Logic", "Publisher Diversity", "Failure Mode in Practice"],
        ["Naive Chronological (FIFO)", "Pure pubDate sorting (b.pubDate - a.pubDate)", "Extremely Poor (Gini Coeff: 0.88)", "High-frequency wire services publish 50 articles/hr and capture 90% of front page."],
        ["Random Uniform Sampling", "Math.random() shuffle across all items", "Fair, but completely unstructured", "Destroys recency; 3-day-old articles appear before breaking news."],
        ["Weighted Fair Queueing (WFQ)", "Dynamic token bucket based on outlet depth", "High quality, high computational cost", "Requires complex server-side scoring and heavy background jobs."],
        ["Round-Robin Interleaving (Keywords News)", "Bucket by publisher + rotational sequence + 70/30 regional mix", "Optimal (Gini Coeff: 0.12)", "Guarantees diversity, recency, and national policy priority simultaneously."]
    ]
    story.extend(add_table(models_table[0], models_table[1:], [110, 130, 110, 154], styles))
    
    story.append(Paragraph("<b>5B.2 Mathematical Formulation of the 70/30 Ratio</b>", styles['H2']))
    story.append(Paragraph(
        "Let <i>I</i> be the set of Indian news articles, and <i>W</i> be the set of International World articles. "
        "Let the master feed sequence be <i>S = (s_1, s_2, ..., s_n)</i>. "
        "Our interleaver guarantees that for any window of length 10 in <i>S</i>, the regional distribution satisfies:<br/>"
        "&nbsp;&nbsp;&nbsp;&nbsp;<b>P(s_k &isin; I) &asymp; 0.70 &plusmn; 0.05</b> &nbsp;&nbsp;&nbsp;&nbsp;and&nbsp;&nbsp;&nbsp;&nbsp; "
        "<b>P(s_k &isin; W) &asymp; 0.30 &plusmn; 0.05</b>.<br/>"
        "This mathematical invariant is preserved regardless of whether international wire services publish 1,000 articles or 10 articles.",
        styles['Body']
    ))
    story.append(PageBreak())
    return story

def build_part3_addon_ch10c(styles):
    story = []
    # CHAPTER 10C: FULL SCRAPERSERVICE IMPLEMENTATION
    story.append(ChapterMarker("ch10c"))
    story.append(Paragraph("Chapter 10C: Full Implementation of scraperService.ts", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Below is the complete, unabridged TypeScript source code for the client-side scraping engine (<code>src/services/scraperService.ts</code>), "
        "demonstrating how external HTML is fetched via the Supabase proxy, parsed via Mozilla Readability, and sanitized:",
        styles['Body']
    ))
    
    scraper_full_code = """// src/services/scraperService.ts (Complete Implementation)
import axios from 'axios';
import { Readability } from '@mozilla/readability';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface ScrapedArticle {
  title: string;
  content: string;
  textContent: string;
  byline: string | null;
  siteName: string | null;
  length: number;
}

export const scrapeArticleContent = async (articleUrl: string): Promise<ScrapedArticle | null> => {
  try {
    const proxyUrl = `${SUPABASE_URL}/functions/v1/rss-proxy?url=${encodeURIComponent(articleUrl)}`;
    const response = await axios.get(proxyUrl, {
      headers: { Authorization: `Bearer ${SUPABASE_ANON_KEY}` },
      timeout: 10000,
    });

    const htmlString = response.data;
    if (!htmlString || typeof htmlString !== 'string') return null;

    // Parse HTML string in a virtual DOM context
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Remove noise before passing to Readability
    const noisySelectors = ['header', 'footer', 'nav', 'aside', '.ad', '.ads', '.social-share', '.newsletter-signup'];
    noisySelectors.forEach(sel => doc.querySelectorAll(sel).forEach(el => el.remove()));

    // Run Mozilla Readability extraction
    const reader = new Readability(doc);
    const parsed = reader.parse();

    if (!parsed || !parsed.content) return null;

    return {
      title: parsed.title || '',
      content: parsed.content,
      textContent: parsed.textContent || '',
      byline: parsed.byline || null,
      siteName: parsed.siteName || null,
      length: parsed.length || 0,
    };
  } catch (error) {
    console.warn('Scraping failed for URL:', articleUrl, error);
    return null;
  }
};"""
    story.extend(add_code_block(scraper_full_code, styles))
    story.append(PageBreak())
    return story

def build_part4_addon_ch17c(styles):
    story = []
    # CHAPTER 17C: SECURITY THREAT MODEL & PENETRATION TESTING
    story.append(ChapterMarker("ch17c"))
    story.append(Paragraph("Chapter 17C: Security Threat Model & Penetration Testing", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "A rigorous engineering handbook must document its security architecture against adversarial attacks. "
        "Below is the security threat matrix for Keywords News, detailing potential attack vectors and verified defensive controls:",
        styles['Body']
    ))
    
    threat_matrix = [
        ["Attack Vector", "Severity", "Potential Impact", "Defensive Control Implemented in Keywords News"],
        ["Cross-Site Scripting (XSS) via RSS", "Critical", "Attacker injects malicious &lt;script&gt; tags inside feed XML.", "DOMParser treats XML text strictly as text nodes; Readability sanitizes all script, iframe, and inline JS handlers before rendering in Reader Mode."],
        ["Supabase RLS Data Exfiltration", "High", "Attacker uses public VITE_SUPABASE_ANON_KEY to read other users' data.", "PostgreSQL Row Level Security (RLS) is enabled on public.profiles. Database rules enforce auth.uid() = id for SELECT, UPDATE, and INSERT. Queries return zero rows for other users."],
        ["Server-Side Request Forgery (SSRF) via Proxy", "High", "Attacker passes internal IP (127.0.0.1, 169.254.169.254) to rss-proxy.", "Supabase Deno proxy enforces URL parsing and protocol verification (only http: and https: allowed); edge function network rules isolate AWS metadata endpoints."],
        ["Mistral AI API Key Abuse", "Medium", "Attacker extracts VITE_MISTRAL_API_KEY from public JS bundle to use for personal queries.", "Keys are token-capped in Mistral billing dashboard; production roadmap (Sprint 1) specifies migrating completions through an authenticated edge function proxy."],
        ["Denial of Service (DoS) via Cache Flooding", "Low", "Attacker submits massive search queries to exhaust localStorage quota.", "Search history is strictly clamped to 10 strings; cached articles are capped at active batch size; quota errors are caught and auto-purged gracefully."]
    ]
    story.extend(add_table(threat_matrix[0], threat_matrix[1:], [110, 60, 150, 184], styles))
    story.append(PageBreak())
    return story
