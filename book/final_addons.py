from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block, add_table

PRIMARY = colors.HexColor("#0F172A")
SECONDARY = colors.HexColor("#1D4ED8")

def build_part3_addon_ch9c(styles):
    story = []
    # CHAPTER 9C: SEARCH ARCHITECTURE & FILTERING ENGINE
    story.append(ChapterMarker("ch9c"))
    story.append(Paragraph("Chapter 9C: The Search Subsystem & Real-Time Keyword Filtering", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Search in Keywords News is architected for zero-latency execution. Rather than dispatching round-trip network queries "
        "to a server database on every keystroke, the search subsystem operates entirely in memory against the pre-cached "
        "and normalized articles array.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>9C.1 The Fullscreen Search Modal Experience</b>", styles['H2']))
    story.append(Paragraph(
        "In <code>src/components/SearchModal.tsx</code>, tapping the search icon or pressing the global hotkey (<code>Ctrl+K</code> / <code>Cmd+K</code>) "
        "launches a distraction-free overlay with backdrop blur. The search input automatically captures keyboard focus. "
        "As the user types, a 200-millisecond debounce hook prevents unnecessary React re-render cycles.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>9C.2 Multi-Token Substring Matching Algorithm</b>", styles['H2']))
    story.append(Paragraph(
        "The filter engine breaks the user query into distinct whitespace-delimited tokens. Each article is evaluated against "
        "title, snippet, and publisher name using case-insensitive substring scoring:",
        styles['Body']
    ))
    
    search_filter_code = """// Search matching algorithm from src/components/SearchModal.tsx
const filterArticles = (query: string, articles: Article[]): Article[] => {
  if (!query.trim()) return [];
  const tokens = query.toLowerCase().split(/\\s+/).filter(Boolean);
  
  return articles.filter(article => {
    const targetText = `${article.title} ${article.contentSnippet || ''} ${article.source}`.toLowerCase();
    return tokens.every(token => targetText.includes(token));
  }).sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
};"""
    story.extend(add_code_block(search_filter_code, styles))
    
    story.append(Paragraph("<b>9C.3 Search History & Autocomplete Physics</b>", styles['H2']))
    story.append(Paragraph(
        "<code>src/contexts/SearchHistoryContext.tsx</code> manages persistent search history. "
        "When a user submits a query, it is unshifted to the head of <code>searchHistory</code> array. "
        "Duplicate queries are deduplicated, and the list is capped at 10 items to prevent storage bloat. "
        "Tapping a past query immediately executes the filter with zero typing required.",
        styles['Body']
    ))
    story.append(PageBreak())
    return story

def build_part4_addon_ch15c(styles):
    story = []
    # CHAPTER 15C: BUILD PIPELINE & VITE OPTIMIZATION
    story.append(ChapterMarker("ch15c"))
    story.append(Paragraph("Chapter 15C: Build Pipeline, Asset Hashing & Performance Physics", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "A production web application must achieve near-instant First Contentful Paint (FCP) across variable mobile cellular connections. "
        "This chapter details the compilation mechanics, Rollup chunking heuristics, and cache-busting strategies employed in Keywords News:",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>15C.1 Content-Hashed Asset Caching</b>", styles['H2']))
    story.append(Paragraph(
        "When <code>npm run build</code> executes, Vite processes JavaScript and CSS through esbuild and Rollup. "
        "Every output file in <code>dist/assets/</code> is suffixed with an 8-character cryptographic content hash (e.g. <code>index-CJt-F723.js</code>). "
        "This enables Netlify's CDN edge to serve static assets with immutable cache headers:<br/>"
        "<code>Cache-Control: public, max-age=31536000, immutable</code>.<br/>"
        "Browsers cache these files permanently. When a new version is deployed, the content hash changes, forcing immediate browser cache invalidation.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>15C.2 Gzip & Brotli Compression Profiling</b>", styles['H2']))
    story.append(Paragraph(
        "Below is the actual production bundle size analysis compiled during the latest release:",
        styles['Body']
    ))
    
    bundle_table = [
        ["Asset File", "Uncompressed Size", "Gzip Compressed", "Compression Ratio"],
        ["dist/index.html", "1.66 KB", "0.79 KB", "52.4% reduction"],
        ["dist/assets/index-[hash].css", "50.27 KB", "9.68 KB", "80.7% reduction"],
        ["dist/assets/index-[hash].js", "647.61 KB", "196.74 KB", "69.6% reduction"],
        ["Total Production Payload", "699.54 KB", "207.21 KB", "70.4% total savings"]
    ]
    story.extend(add_table(bundle_table[0], bundle_table[1:], [140, 110, 110, 144], styles))
    
    story.append(Paragraph("<b>15C.3 Tree-Shaking Lucide Icons</b>", styles['H2']))
    story.append(Paragraph(
        "A common pitfall in modern React apps is importing icons via barrel files: <code>import * as Icons from 'lucide-react'</code>. "
        "This can accidentally bundle all 1,200+ icons (adding 1.5MB to the bundle). "
        "In Keywords News, all icon imports are strictly named (e.g. <code>import { Bookmark, Share2 } from 'lucide-react'</code>). "
        "Rollup's dead-code elimination removes all unused icon definitions, keeping the SVG footprint under 15KB.",
        styles['Body']
    ))
    story.append(PageBreak())
    return story

def build_part5_addon_appD(styles):
    story = []
    # APPENDIX D: CODEBASE INVENTORY & FILE TREE
    story.append(ChapterMarker("appD"))
    story.append(Paragraph("Appendix D: Codebase Inventory, File Tree & Dependency Audit", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Below is the complete structural file tree and dependency manifest of the Keywords News production codebase:",
        styles['Body']
    ))
    
    file_tree = """KeywordsNews/
├── public/
│   ├── _redirects                 # Netlify SPA redirect rules
│   ├── manifest.json              # Progressive Web App manifest
│   └── vite.svg                   # Application favicon
├── src/
│   ├── components/
│   │   ├── ArticleCard.tsx        # Bento grid card component
│   │   ├── ArticleSkeleton.tsx    # Shimmer loading placeholders
│   │   ├── DurationFilter.tsx     # 24h, 3d, 1w time filter
│   │   ├── Header.tsx             # Responsive navigation header
│   │   ├── SearchBar.tsx          # Autocomplete search input
│   │   ├── SearchModal.tsx        # Fullscreen search experience
│   │   ├── Sidebar.tsx            # Desktop hover-expandable rail
│   │   └── ThemeToggle.tsx        # Animated dark/light toggle
│   ├── contexts/
│   │   ├── AuthContext.tsx        # Supabase auth session provider
│   │   ├── NewsContext.tsx        # Central news feed state
│   │   ├── SearchHistoryContext.tsx # User search history
│   │   └── ThemeContext.tsx       # Light/dark theme provider
│   ├── lib/
│   │   └── supabase.ts            # Supabase client singleton
│   ├── pages/
│   │   ├── ArticlePage.tsx        # In-app Reader Mode
│   │   ├── HomePage.tsx           # Bento feed & topic bar
│   │   ├── LoginPage.tsx          # Authentication screen
│   │   ├── OnboardingPage.tsx     # 3-step profile wizard
│   │   ├── SavedArticlesPage.tsx  # Bookmarks library
│   │   ├── SettingsPage.tsx       # User profile settings
│   │   └── SignupPage.tsx         # User registration screen
│   ├── services/
│   │   ├── aiService.ts           # Mistral AI client & fallback
│   │   ├── newsService.ts         # RSS parser & interleaver
│   │   ├── newsSources.ts         # 40+ source registry
│   │   └── scraperService.ts      # Mozilla Readability scraper
│   ├── types.ts                   # TypeScript interfaces
│   ├── App.tsx                    # React Router configuration
│   ├── main.tsx                   # React root mount
│   └── index.css                  # Tailwind & custom typography
├── supabase/
│   ├── functions/rss-proxy/       # Deno Edge Proxy function
│   └── migrations/                # 5 SQL migration files
├── netlify.toml                   # Netlify deployment configuration
├── package.json                   # Dependencies manifest
├── tailwind.config.js             # Tailwind CSS tokens
├── vite.config.ts                 # Bundler options
├── TODO.md                        # Prioritized future roadmap
└── DEVELOPER_GUIDE.md             # Technical handover manual"""
    story.extend(add_code_block(file_tree, styles))
    
    story.append(Paragraph("<b>D.1 Production Dependencies Audit</b>", styles['H2']))
    dep_rows = [
        ["Package Name", "Version", "Purpose & Architectural Justification"],
        ["react & react-dom", "^18.3.1", "Declarative UI component tree and state reconciliation."],
        ["react-router-dom", "^6.22.3", "Client-side routing for SPA without page reloads."],
        ["@supabase/supabase-js", "^2.39.7", "PostgreSQL database client, Auth listener, and Edge Function invocation."],
        ["@mozilla/readability", "^0.5.0", "Extracts distraction-free article text in browser."],
        ["axios", "^1.6.7", "Promise-based HTTP client for RSS and AI API requests."],
        ["lucide-react", "^0.344.0", "Clean, modern, tree-shakeable SVG UI icons."],
        ["uuid", "^9.0.1", "Generates unique identifiers for parsed articles."]
    ]
    story.extend(add_table(dep_rows[0], dep_rows[1:], [120, 70, 314], styles))
    story.append(PageBreak())
    return story
