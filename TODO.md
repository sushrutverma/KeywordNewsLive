# Keywords News — Product Enhancement & Roadmap TODO

> Prioritized using RICE Scoring, Kano Model, and Value vs. Complexity analysis.  
> Reference: [prioritization_analysis_report.md](file:///C:/Users/sushr/.gemini/antigravity-ide/brain/f0a08522-f2c2-400e-ade6-e622c743e726/prioritization_analysis_report.md)

---

## 🚀 Sprint 1: Feed Modernization & Instant Wins (P0 Priority)

- [ ] **1. Multi-Style AI Summaries** *(RICE: 720 | Effort: ~2 days)*
  - [ ] Add summary format selector in `ArticleCard.tsx` and `ArticlePage.tsx`:
    - `Quick Bullets` (3 high-impact takeaways with bold key terms)
    - `Key Figures & Data` (extracted statistics, dates, percentages, and financial numbers)
    - `ELI5` (simplified, jargon-free explanation)
    - `Comprehensive Analysis` (2-3 detailed paragraphs)
  - [ ] Update `aiService.ts` with dedicated prompt templates per mode using `open-mistral-nemo`.
  - [ ] Persist the user's preferred summary format in `localStorage`.

- [ ] **2. 1-Click De-Clickbait Headline Rewriter** *(RICE: 680 | Effort: ~1 day)*
  - [ ] Add a "De-Clickbait" magic wand icon button on `ArticleCard.tsx`.
  - [ ] Add `aiService.declickbaitTitle(headline, content)` to return a factual, transparent headline.
  - [ ] Cache rewritten titles in `sessionStorage` to avoid redundant API calls.

- [x] **3. Client-Side Story Clustering & Feed Deduplication** *(RICE: 633 | Effort: ~2 days)*
  - [x] Implement `clusterArticles(articles)` in `newsService.ts` using title token Jaccard similarity & stemming within a 48h sliding window.
  - [x] Group duplicate stories under a single primary card on `HomePage.tsx` with automatic rich-content/image promotion.
  - [x] Display a multi-source pill on clustered cards: *"Covered by X sources"*.
  - [x] Add an accordion drawer to preview different publisher snippets directly from the card.

---

## 🎙️ Sprint 2: Multimodal & Interactive Intelligence (P1 Priority)

- [ ] **4. Native Hands-Free Audio Morning Briefing** *(RICE: 540 | Effort: ~2-3 days)*
  - [ ] Build floating audio player bar in `Header.tsx` or bottom bar on `HomePage.tsx`.
  - [ ] Implement `audioService.ts` leveraging browser-native `window.speechSynthesis` (zero API cost, instant audio generation).
  - [ ] Sequential playback of top 5 story summaries in the user's active topic tab.
  - [ ] Include playback controls: Play, Pause, 15s Skip Forward/Backward, 1.25x/1.5x Speed Toggle.

- [ ] **5. "Ask this Article" In-Context Q&A** *(RICE: 480 | Effort: ~2 days)*
  - [ ] Add an interactive Q&A bar beneath the reader view in `ArticlePage.tsx`.
  - [ ] Display 3 quick starter chips:
    - *"What are the economic/policy implications?"*
    - *"Who are the key people and organizations involved?"*
    - *"What is expected to happen next?"*
  - [ ] Implement `aiService.askArticle(question, articleContent)` grounded strictly in the scraped article text.

---

## 🌐 Sprint 3: Strategic Moats & User Retention (P2 Priority)

- [ ] **6. Multi-Angle Coverage Hub (Perspective / Bias Lens)** *(RICE: 363 | Effort: ~3 days)*
  - [ ] In clustered story cards, add a "Compare Perspectives" tab.
  - [ ] Contrast institutional framing:
    - *National / Institutional:* The Hindu / Indian Express
    - *Business / Markets:* LiveMint / Economic Times
    - *International:* The Guardian / BBC / Reuters
  - [ ] Quick AI synthesis: *"How coverage differs between Indian and International media"*.

- [ ] **7. Tracked Keywords & Automated Email Digest** *(RICE: 315 | Effort: ~2-3 days)*
  - [ ] Allow users to save custom tracked keywords in their Supabase profile.
  - [ ] Integrate existing `RESEND_API_KEY` with a scheduled Supabase Edge Function.
  - [ ] Send an optional, beautifully formatted daily or weekly 8:00 AM email brief for tracked keywords.

---

## 🛠️ Ongoing Architecture & Quality Checklist

- [ ] Add service worker PWA offline caching for saved articles.
- [ ] Implement client-side reading time estimator badge on article cards.
- [ ] Code-split large bundles via `vite.config.ts` (`rollupOptions.output.manualChunks`).
