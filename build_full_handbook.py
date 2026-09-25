import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Flowable
)
from reportlab.pdfgen import canvas

# Global map to store dynamic chapter page numbers
chapter_page_map = {}

class ChapterMarker(Flowable):
    def __init__(self, key):
        super().__init__()
        self.key = key

    def wrap(self, availWidth, availHeight):
        return 0, 0

    def draw(self):
        chapter_page_map[self.key] = self.canv.getPageNumber()

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, total_pages):
        if self._pageNumber == 1:
            # Elegant cover border and banner accent
            self.saveState()
            self.setFillColor(colors.HexColor("#0F172A"))
            self.rect(0, 0, 8.5 * 72, 11 * 72, fill=True, stroke=False)
            
            # Subtle top accent bar
            self.setFillColor(colors.HexColor("#2563EB"))
            self.rect(0, 11 * 72 - 16, 8.5 * 72, 16, fill=True, stroke=False)
            
            # Subtle bottom accent bar
            self.setFillColor(colors.HexColor("#0284C7"))
            self.rect(0, 0, 8.5 * 72, 12, fill=True, stroke=False)
            self.restoreState()
            return

        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Running Header
        self.drawString(54, 11 * 72 - 36, "KEYWORDS NEWS")
        self.setFont("Helvetica", 7.5)
        self.drawString(135, 11 * 72 - 36, "—  ENGINEERING HANDBOOK & TECHNICAL SPECIFICATION")
        self.drawRightString(8.5 * 72 - 54, 11 * 72 - 36, "PRODUCTION VERSION 2.0")
        
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)
        
        # Running Footer
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(8.5 * 72 - 54, 34, page_str)
        self.drawString(54, 34, "Confidential & Proprietary — Keywords News (Live at keywordnews.netlify.app)")
        self.line(54, 46, 8.5 * 72 - 54, 46)
        
        self.restoreState()

def create_story(toc_page_numbers=None):
    styles = getSampleStyleSheet()
    
    PRIMARY = colors.HexColor("#0F172A")    # Deep Navy/Slate
    SECONDARY = colors.HexColor("#2563EB")  # Vivid Blue
    ACCENT = colors.HexColor("#0284C7")     # Ocean Cyan
    DARK_BG = colors.HexColor("#1E293B")    # Slate 800
    LIGHT_BG = colors.HexColor("#F8FAFC")   # Slate 50
    BORDER = colors.HexColor("#CBD5E1")     # Slate 300
    TEXT_MAIN = colors.HexColor("#334155")  # Slate 700
    CODE_BG = colors.HexColor("#0F172A")
    ALERT_BG = colors.HexColor("#EFF6FF")
    ALERT_BORDER = colors.HexColor("#3B82F6")
    
    # Typography
    body_style = ParagraphStyle(
        'BookBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14.5,
        textColor=TEXT_MAIN,
        spaceAfter=6
    )
    
    body_bold = ParagraphStyle(
        'BookBodyBold',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    bullet_style = ParagraphStyle(
        'BookBullet',
        parent=body_style,
        leftIndent=16,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    h1_style = ParagraphStyle(
        'BookH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=21,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'BookH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16.5,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    h3_style = ParagraphStyle(
        'BookH3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=PRIMARY,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )
    
    code_style = ParagraphStyle(
        'BookCode',
        fontName='Courier',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#F1F5F9"),
        spaceAfter=0
    )
    
    alert_style = ParagraphStyle(
        'BookAlert',
        parent=body_style,
        fontName='Helvetica-Oblique',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1E3A8A")
    )
    
    story = []
    
    def add_code_block(code_text):
        lines = code_text.strip().split('\n')
        paragraphs = [Paragraph(l.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace(' ', '&nbsp;'), code_style) for l in lines]
        t = Table([[paragraphs]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), CODE_BG),
            ('TOPPADDING', (0, 0), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#334155")),
        ]))
        story.append(Spacer(1, 4))
        story.append(t)
        story.append(Spacer(1, 8))
        
    def add_alert_box(title, text):
        p_title = Paragraph(f"<b>{title.upper()}</b>", ParagraphStyle('AlertTitle', parent=alert_style, fontName='Helvetica-Bold'))
        p_text = Paragraph(text, alert_style)
        t = Table([[p_title], [p_text]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), ALERT_BG),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LINELEFT', (0, 0), (0, -1), 3.5, ALERT_BORDER),
            ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor("#BFDBFE")),
        ]))
        story.append(Spacer(1, 4))
        story.append(t)
        story.append(Spacer(1, 8))

    # =========================================================================
    # COVER PAGE (DARK THEME)
    # =========================================================================
    story.append(Spacer(1, 50))
    
    badge_p = Paragraph("<b>OFFICIAL TECHNICAL SPECIFICATION & DEVELOPER HANDBOOK</b>", ParagraphStyle('CoverBadge', fontName='Helvetica-Bold', fontSize=9.5, textColor=colors.HexColor("#38BDF8"), alignment=1))
    story.append(badge_p)
    story.append(Spacer(1, 25))
    
    cover_title = Paragraph("Keywords News", ParagraphStyle('CoverMainTitle', fontName='Helvetica-Bold', fontSize=36, leading=40, textColor=colors.white, alignment=1))
    cover_sub = Paragraph("The Comprehensive Engineering Blueprint & Architectural Manual", ParagraphStyle('CoverSub', fontName='Helvetica', fontSize=15, leading=20, textColor=colors.HexColor("#93C5FD"), alignment=1))
    cover_tag = Paragraph("A Fully Self-Contained Handover Reference for Software Engineers, Architects, and Non-Technical Owners", ParagraphStyle('CoverTag', fontName='Helvetica-Oblique', fontSize=10, leading=15, textColor=colors.HexColor("#94A3B8"), alignment=1))
    
    story.append(cover_title)
    story.append(Spacer(1, 10))
    story.append(cover_sub)
    story.append(Spacer(1, 12))
    story.append(cover_tag)
    story.append(Spacer(1, 35))
    
    # Metadata Table inside Cover
    cover_rows = [
        [Paragraph("<font color='#94A3B8'><b>Live Production Site:</b></font>", body_style), Paragraph("<font color='#38BDF8'><b>https://keywordnews.netlify.app</b></font>", body_style)],
        [Paragraph("<font color='#94A3B8'><b>Source Repository:</b></font>", body_style), Paragraph("<font color='#FFFFFF'>github.com/sushrutverma/KeywordNewsLive</font>", body_style)],
        [Paragraph("<font color='#94A3B8'><b>Platform Architecture:</b></font>", body_style), Paragraph("<font color='#FFFFFF'>React 18 + TypeScript + Vite + Supabase + Mistral AI</font>", body_style)],
        [Paragraph("<font color='#94A3B8'><b>Hosting & Edge CDN:</b></font>", body_style), Paragraph("<font color='#FFFFFF'>Netlify Global CDN (SPA Route Handlers)</font>", body_style)],
        [Paragraph("<font color='#94A3B8'><b>Database Engine:</b></font>", body_style), Paragraph("<font color='#FFFFFF'>Supabase PostgreSQL 15 with Row Level Security (RLS)</font>", body_style)],
        [Paragraph("<font color='#94A3B8'><b>Edge Function Proxy:</b></font>", body_style), Paragraph("<font color='#FFFFFF'>Supabase Deno Serverless Runtime (rss-proxy)</font>", body_style)],
        [Paragraph("<font color='#94A3B8'><b>Document Edition:</b></font>", body_style), Paragraph("<font color='#FDE047'><b>Version 2.0 (Production Master Release)</b></font>", body_style)],
        [Paragraph("<font color='#94A3B8'><b>Publication Date:</b></font>", body_style), Paragraph("<font color='#FFFFFF'>September 2026</font>", body_style)],
    ]
    c_table = Table(cover_rows, colWidths=[150, 334])
    c_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#1E293B")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    story.append(c_table)
    
    story.append(Spacer(1, 40))
    cover_note = Paragraph(
        "<font color='#64748B'><i>Notice: This handbook contains complete, unabridged technical documentation. "
        "It is engineered so that any software engineer can maintain, debug, and scale this application "
        "even in an air-gapped environment without past conversational context or AI assistance.</i></font>",
        ParagraphStyle('CoverNotice', fontName='Helvetica', fontSize=8.5, leading=13, alignment=1)
    )
    story.append(cover_note)
    story.append(PageBreak())

    # =========================================================================
    # EXECUTIVE SUMMARY & READER'S ORIENTATION
    # =========================================================================
    story.append(Paragraph("Executive Summary & Stakeholder Orientation", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Welcome to the <b>Keywords News Engineering Handbook</b>. This document is the definitive master manual "
        "for the Keywords News web application, currently deployed live in production at "
        "<b>https://keywordnews.netlify.app</b>.",
        body_style
    ))
    
    story.append(Paragraph("<b>How to Use This Handbook by Stakeholder Role:</b>", h2_style))
    
    roles = [
        ("For Non-Technical Product Owners",
         "Focus on <b>Chapter 1</b> (Philosophy & Tenets), <b>Chapter 8</b> (Third-Party Infrastructure & Billing Map), and <b>Chapter 14</b> (The 5-Point QA Acceptance Checklist). These sections explain what you own, what companies bill you, and how to verify that updates function properly without looking at code."),
        
        ("For Incoming Software Engineers",
         "Read <b>Chapter 4</b> (Architecture), <b>Chapter 5</b> (Directory Guide), <b>Chapter 6</b> (Data Flow), and <b>Chapter 12</b> (Setup Playbook). You can be productive and ship features within 15 minutes of cloning the repository."),
        
        ("For Database Administrators & Backend Leads",
         "Examine <b>Chapter 7</b> (Complete Database Schema & Supabase SQL DDL). It contains the complete, copy-pasteable PostgreSQL DDL for <code>profiles</code>, Row Level Security policies, and trigger definitions."),
        
        ("For Site Reliability Engineers & DevOps",
         "Review <b>Chapter 3</b> (The Hall of Solved Engineering Challenges), <b>Chapter 10</b> (Security & Secrets Boundaries), and <b>Chapter 14</b> (Emergency Troubleshooting Runbook). These cover CORS resolutions, Netlify build quirks, and fallback architectures.")
    ]
    for r_title, r_desc in roles:
        story.append(Paragraph(f"• <b>{r_title}:</b> {r_desc}", bullet_style))
        story.append(Spacer(1, 2))
        
    story.append(Spacer(1, 10))
    add_alert_box("Guiding Architectural Principle", "Keywords News is deliberately constructed using open web standards: standard React 18, standard Vite 6, and Vanilla/Tailwind CSS. There are zero proprietary runtime locks or obscure dependencies.")
    story.append(PageBreak())

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    story.append(Paragraph("Table of Contents", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=14, spaceBefore=4))
    
    pages = toc_page_numbers or {}
    
    toc_items = [
        ("ch1", "Chapter 1", "The Philosophy & Core Product Tenets"),
        ("ch2", "Chapter 2", "Complete Timeline of Updates & Evolution (2025–2026)"),
        ("ch3", "Chapter 3", "The Hall of Solved Engineering Challenges"),
        ("ch4", "Chapter 4", "Full Technical Architecture & System Design"),
        ("ch5", "Chapter 5", "Comprehensive Directory & File-by-File Guide"),
        ("ch6", "Chapter 6", "Data Flow: Lifecycle of a News Article"),
        ("ch7", "Chapter 7", "Database Architecture & Complete Supabase Schema (SQL DDL)"),
        ("ch8", "Chapter 8", "Third-Party Infrastructure & Service Ownership Map"),
        ("ch9", "Chapter 9", "Client-Side State, React Query & Storage Map"),
        ("ch10", "Chapter 10", "Security Boundaries & Secret Management"),
        ("ch11", "Chapter 11", "Environment Variables & Credentials Directory"),
        ("ch12", "Chapter 12", "Developer Playbook: Local Setup, Build & Bundle Optimization"),
        ("ch13", "Chapter 13", "How-To Recipes: Adding Sources, Topics & AI Features"),
        ("ch14", "Chapter 14", "Quality Assurance Checklist & Emergency Runbook"),
        ("appA", "Appendix A", "Full System Glossary & Architectural Terminology"),
        ("appB", "Appendix B", "Future Product Roadmap & Sprint Prioritization"),
    ]
    
    toc_rows = []
    for key, num, title in toc_items:
        p_num = f"Page {pages.get(key, '...')}"
        toc_rows.append([
            Paragraph(f"<b>{num}</b>", body_bold),
            Paragraph(f"<b>{title}</b>", body_style),
            Paragraph(p_num, ParagraphStyle('TOCPage', parent=body_style, alignment=2, textColor=SECONDARY))
        ])
        
    t_toc = Table(toc_rows, colWidths=[80, 360, 64])
    t_toc.setStyle(TableStyle([
        ('LINEBELOW', (0, 0), (-1, -1), 0.5, colors.HexColor("#E2E8F0")),
        ('TOPPADDING', (0, 0), (-1, -1), 5.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5.5),
    ]))
    story.append(t_toc)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 1: PHILOSOPHY & VISION
    # =========================================================================
    story.append(ChapterMarker("ch1"))
    story.append(Paragraph("Chapter 1: The Philosophy & Core Product Tenets", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph("<b>The Modern Crisis in News Consumption</b>", h2_style))
    story.append(Paragraph(
        "The contemporary internet news landscape is broken by commercial misalignments. "
        "Traditional platforms maximize advertising revenue by optimizing for emotional stimulation, outrage, and time-on-app. "
        "Mainstream news portals subject readers to intrusive ad networks, privacy-invasive trackers, paywalls, and auto-playing video players. "
        "Simultaneously, single mainstream outlets flood RSS feeds with dozens of low-value micro-bulletins per hour, "
        "obscuring serious investigative journalism and deep policy analysis.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Keywords News</b> was engineered from the ground up to restore sanity, calm, and depth to daily reading. "
        "Every line of code and architectural decision adheres to five immutable product tenets:",
        body_style
    ))
    
    tenets = [
        ("1. Zero Algorithmic Dopamine",
         "The app rejects engagement-optimized recommendation engines. There are no infinite algorithmic feeds designed to addict. News is curated into explicit, high-intent topic verticals (UPSC & Governance, Tech & Design, Men's Style, Running, Automotive, Photography). Readers consume what they intend to consume and leave informed."),
        
        ("2. The Strict 70/30 Regional Balance",
         "A mathematical guarantee is hard-coded into the news aggregation engine: <b>70% Indian National/Regional Reporting</b> and <b>30% Global International Reporting</b>. This ensures Indian readers remain deeply grounded in domestic policy, economy, and civic affairs without becoming geographically insular."),
        
        ("3. Anti-Monopoly Round-Robin Source Interleaving",
         "High-frequency wire publishers (e.g. Times of India) publish 50+ articles an hour, while specialized journals (e.g. Livemint or The Hindu) publish 5 thoughtful long-form pieces. Without curation, high-frequency outlets flood the feed. Our Round-Robin interleaving algorithm groups articles by publisher and draws in rotation, ensuring rich editorial diversity."),
        
        ("4. Distraction-Free In-App Reader",
         "Rather than redirecting users to noisy publisher websites loaded with banner ads and trackers, the in-app Reader Mode scrapes full article bodies using Mozilla Readability. Articles render in clean, serene typography with custom serif fonts, dark/light contrast, and zero external trackers."),
        
        ("5. Cognitive AI Assistance (Not Synthetic Generation)",
         "Keywords News does not generate synthetic, hallucinated AI articles. Instead, AI serves as an on-demand cognitive aid: providing 2-3 sentence executive summaries and an interactive floating <b>Concept Explainer</b> for deciphering complex policy, legal, or financial terminology.")
    ]
    for title, desc in tenets:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", body_style))
        story.append(Spacer(1, 3))
        
    story.append(Spacer(1, 10))
    add_alert_box("Core Product Mission", "Keywords News is built as an intentional reading sanctuary. It values the reader's attention as sacred and rejects the engagement-maximizing mechanics of modern ad-tech.")
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 2: TIMELINE OF UPDATES & EVOLUTION
    # =========================================================================
    story.append(ChapterMarker("ch2"))
    story.append(Paragraph("Chapter 2: Complete Timeline of Updates & Evolution", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "Keywords News progressed across several structured engineering phases between June 2025 and September 2026. "
        "Understanding this chronological progression provides essential context on why specific systems were chosen and why others were deprecated.",
        body_style
    ))
    
    milestones = [
        ("Milestone 1: Architectural Foundations & Prototyping (June 2025)",
         "Commits 6813880 → 87c6acb",
         "The project was scaffolded using Vite, React 18, and TypeScript. Initial RSS parsing was tested directly from the client. "
         "Initial experiments included a custom mobile gesture indicator (<code>ScrollNavigator</code>) and swipe navigators. "
         "<b>Deprecation Lesson:</b> The <code>ScrollNavigator</code> was subsequently retired after usability testing revealed that mobile users strongly prefer native browser gestures over synthetic scroll indicators. "
         "The first Supabase connection was wired and basic Netlify deployments were established."),
        
        ("Milestone 2: Bento Grid & Design System Overhaul (Early August 2026)",
         "Commit 4d6b9ee",
         "A total aesthetic overhaul transitioned the application from generic news cards into an editorial-grade Bento grid. "
         "The design system integrated glassmorphism, responsive light/dark themes, and custom typography: <i>Playfair Display</i> for editorial headlines, <i>Lora</i> for long-form reading, and <i>Plus Jakarta Sans</i> for crisp UI controls. "
         "Developed the desktop hover-expandable navigation sidebar (collapsing into a 76px icon rail and smoothly expanding to 260px on hover)."),
        
        ("Milestone 3: Content Engineering & Algorithmic Diversity (Mid August 2026)",
         "Commits a80e60d, 98aa06b, 2432be7, cd888a6",
         "The news source registry expanded to 40+ curated publications across 7 specialized verticals. "
         "To solve publisher feed monopolization, the <b>Round-Robin Interleaving Algorithm</b> was implemented in <code>newsService.ts</code>. "
         "Added the 70/30 Regional India/World ratio balancing engine. "
         "Introduced the 3-step user onboarding wizard (capturing occupation, reading goals, and preferred topics) and synced it to Supabase."),
        
        ("Milestone 4: Reader Mode & Cognitive AI Intelligence (September 2026)",
         "ArticlePage.tsx & aiService.ts",
         "Engineered the in-app Reader Mode using <code>@mozilla/readability</code> to extract clean text without external redirects. "
         "Created the floating <b>AI Concept Explainer</b>: selecting 2-6 words of complex terminology renders an interactive floating tooltip with a 2-sentence explanation. "
         "Upgraded the AI summarization pipeline to Mistral AI's 12B model (<code>open-mistral-nemo</code>) with a multi-model fallback chain."),
        
        ("Milestone 5: Production Hardening & Infrastructure Reliability (September 2026)",
         "Production Release 2.0",
         "Permanently resolved Netlify SPA 404 routing errors using <code>_redirects</code> and <code>netlify.toml</code>. "
         "Diagnosed and eliminated Netlify's remote environment variable masking bug (where keys were replaced with asterisks) by instituting the Local Prebuild Gold Standard. "
         "Rebuilt the RSS engine into a 6-source concurrent streaming pipeline with <code>news_cache_v2</code>.")
    ]
    for title, ref, desc in milestones:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        story.append(Paragraph(f"<i>Reference: {ref}</i>", ParagraphStyle('Ref', parent=body_style, textColor=SECONDARY, fontSize=8.5)))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 3))
        
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 3: SOLVED ENGINEERING CHALLENGES
    # =========================================================================
    story.append(ChapterMarker("ch3"))
    story.append(Paragraph("Chapter 3: The Hall of Solved Engineering Challenges", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "Below is the complete engineering retrospective detailing the six critical technical crises encountered during the platform's development, "
        "their technical root causes, and their permanent resolutions.",
        body_style
    ))
    
    challenges = [
        ("1. Browser CORS & RSS Feed Blocking",
         "Modern web browsers enforce strict Same-Origin Policies (CORS). Directly calling fetch('https://www.thehindu.com/feeder/default.rss') from client JavaScript is blocked by the browser with 'CORS header Access-Control-Allow-Origin missing'. Public CORS proxies (cors-anywhere, allorigins) proved slow, rate-limited, and unreliable.",
         "Engineered a dedicated Deno Edge Function in Supabase (supabase/functions/rss-proxy/index.ts). The frontend queries our edge proxy with the target feed URL as an encoded parameter. The proxy fetches the upstream XML server-to-server and returns it with Access-Control-Allow-Origin: * headers and a 120-second Cache-Control header."),
        
        ("2. Feed Monopolization by High-Frequency Publishers",
         "High-frequency newsrooms (like Times of India) publish up to 60 articles an hour, while investigative periodicals (like The Hindu or Livemint) publish 5 high-depth articles. Sorting chronologically flooded the feed with 10 consecutive articles from the same outlet, ruining content diversity.",
         "Engineered the Round-Robin Source Interleaving Algorithm in newsService.ts. Articles are partitioned into buckets by publication name. The interleaver rotates across buckets, drawing one article from each in sequence until exhausted, ensuring no single publication ever dominates the reader's view."),
        
        ("3. Indian vs. International Content Imbalance",
         "Global tech feeds generate vastly more RSS volume than Indian public policy feeds. Without curation, the front page degraded into a generic US tech blog rather than an India-focused daily briefing.",
         "Introduced an isIndian: boolean flag in newsSources.ts. Engineered mixRegionalArticles() in newsService.ts which enforces a strict 7-to-3 ratio: exactly 7 Indian articles followed by 3 World articles across the interleaved stream."),
        
        ("4. Mistral AI 429 Rate Limiting on Free Tier",
         "The initial AI integration used mistral-small-latest. During peak reading sessions, Mistral returned HTTP 429 (Too Many Requests / Quota Exceeded) because smaller legacy tiers have low concurrent requests per minute.",
         "Upgraded the primary model to open-mistral-nemo (12B parameters), which provides superior token throughput and analytical synthesis. Built a 3-tier fallback chain (open-mistral-nemo → open-mistral-7b → mistral-tiny) in aiService.ts and pre-trimmed input text to 3,000 characters."),
        
        ("5. Netlify Remote Build Env Variable Masking",
         "When building on Netlify's remote infrastructure, secrets in the environment were being injected into the compiled bundle as literal asterisks (****************KilA), causing silent 401 Unauthorized errors in production.",
         "Instituted the Local Prebuild Gold Standard: The developer builds locally with raw .env keys using npm run build, then deploys the compiled dist/ directory with netlify deploy --prod --dir dist --no-build. This ensures authentic keys are embedded without remote masking."),
        
        ("6. Direct Link & Refresh 404 Errors (SPA Routing)",
         "Reloading any non-root URL (e.g. /article/123 or /saved) returned a 404 because Netlify sought physical HTML files that do not exist in single-page React applications.",
         "Added public/_redirects (/* /index.html 200) and netlify.toml fallback rules, ensuring all HTTP requests are routed to index.html for client-side resolution by react-router-dom.")
    ]
    for title, cause, sol in challenges:
        story.append(Paragraph(f"<b>{title}</b>", h2_style))
        story.append(Paragraph(f"<b>Root Cause:</b> {cause}", body_style))
        story.append(Paragraph(f"<b>Permanent Resolution:</b> {sol}", body_style))
        story.append(Spacer(1, 4))
        
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 4: TECHNICAL ARCHITECTURE & SYSTEM DESIGN
    # =========================================================================
    story.append(ChapterMarker("ch4"))
    story.append(Paragraph("Chapter 4: Technical Architecture & System Design", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "Keywords News is built upon modern serverless JAMstack principles. There is no monolithic server to patch, "
        "scale, or maintain. Every layer operates independently with high availability and resilience:",
        body_style
    ))
    
    arch_data = [
        ["System Layer", "Technology Stack", "Core Architectural Responsibility"],
        ["Client Presentation", "React 18, TypeScript, Tailwind CSS, Lucide Icons", "Bento grid rendering, responsive dark/light theme, pull-to-refresh, modal state, reader mode."],
        ["Global Edge Hosting", "Netlify Global CDN", "Global static distribution, automatic SSL/TLS termination, single-page application route rewrites."],
        ["CORS Proxy Gateway", "Supabase Edge Functions (Deno Runtime)", "Proxies 40+ external RSS feeds, circumvents browser CORS restrictions, injects 120s caching headers."],
        ["Database & Auth", "Supabase (PostgreSQL 15 + GoTrue Auth)", "User identity, session management, user profile preferences, Row Level Security (RLS) enforcement."],
        ["Local Storage Cache", "Browser LocalStorage (news_cache_v2)", "Client-side article caching with 2-minute time-to-live, preventing redundant network requests."],
        ["Cognitive AI Tier", "Mistral AI (open-mistral-nemo 12B)", "Generates 2-3 sentence executive summaries and contextual floating definitions for highlighted terms."]
    ]
    t_arch = Table(arch_data, colWidths=[100, 150, 254])
    t_arch.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    story.append(t_arch)
    story.append(Spacer(1, 12))
    
    story.append(Paragraph("<b>End-to-End System Interaction Model:</b>", h2_style))
    story.append(Paragraph(
        "1. <b>Client Initialization:</b> The browser loads the prebuilt SPA bundle from Netlify's nearest edge node.<br/>"
        "2. <b>Cache Check:</b> The application inspects <code>localStorage.getItem('news_cache_v2')</code>. If valid, articles render immediately.<br/>"
        "3. <b>Streaming Fetch:</b> If expired, <code>newsService.ts</code> dispatches concurrent batches of 6 feeds through the Supabase edge proxy.<br/>"
        "4. <b>Normalization:</b> Raw XML is parsed via browser-native <code>DOMParser</code> into normalized <code>Article</code> interfaces.<br/>"
        "5. <b>Interleaving:</b> The Round-Robin and 70/30 balancing engines sort the stream and progressively update the UI.<br/>"
        "6. <b>Reading & AI:</b> Reader Mode scrapes clean text with Mozilla Readability and requests summaries from Mistral AI.",
        body_style
    ))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 5: COMPREHENSIVE DIRECTORY GUIDE
    # =========================================================================
    story.append(ChapterMarker("ch5"))
    story.append(Paragraph("Chapter 5: Comprehensive Directory & File Guide", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "The repository is organized into distinct functional domains. Incoming engineers can locate any system component using this directory reference:",
        body_style
    ))
    
    dir_entries = [
        ["File / Path", "Role", "Description & Key Exports"],
        ["public/_redirects", "Config", "Netlify redirect rule (/* /index.html 200) ensuring SPA client routes work on refresh."],
        ["src/components/ArticleCard.tsx", "Component", "Bento grid card rendering article thumbnails, metadata, share, save, and AI summary trigger."],
        ["src/components/Sidebar.tsx", "Component", "Expandable desktop hover navigation rail (76px → 260px) and mobile slide-out drawer."],
        ["src/components/ArticleSkeleton.tsx", "Component", "Shimmer skeleton animation displayed while batched articles are streaming into state."],
        ["src/contexts/NewsContext.tsx", "Context", "Master news state: active topic, progressive feed loading, search query, and cache management."],
        ["src/contexts/AuthContext.tsx", "Context", "Supabase authentication state, user session listener, login/logout, and profile sync."],
        ["src/contexts/ThemeContext.tsx", "Context", "Theme provider managing light/dark mode and toggling the .dark class on the root <html> tag."],
        ["src/pages/HomePage.tsx", "Page Route", "Main feed interface, horizontal topic selector, bento grid layout, and pull-to-refresh."],
        ["src/pages/ArticlePage.tsx", "Page Route", "Distraction-free Reader Mode with Mozilla Readability, AI summary, and floating explainer tooltip."],
        ["src/pages/OnboardingPage.tsx", "Page Route", "3-step wizard collecting user name, occupation, reading goals, and topic subscriptions."],
        ["src/services/newsService.ts", "Core Service", "RSS fetching, DOMParser XML parsing, 70/30 regional balancing, and round-robin interleaving."],
        ["src/services/newsSources.ts", "Data Registry", "Master catalog of 40+ news publications with category IDs, URLs, and regional flags."],
        ["src/services/aiService.ts", "Core Service", "Mistral AI client with multi-model fallback chain (nemo → 7b → tiny) and text sanitization."],
        ["src/services/scraperService.ts", "Core Service", "Client-side HTML scraping engine extracting distraction-free article text via Readability."],
        ["supabase/functions/rss-proxy/", "Edge Function", "Deno-based serverless proxy fetching upstream RSS feeds and injecting open CORS headers."],
        ["supabase/migrations/", "SQL Migrations", "Database schema definitions for public.profiles, RLS policies, and timestamp triggers."]
    ]
    t_dir = Table(dir_entries, colWidths=[150, 80, 274])
    t_dir.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    story.append(t_dir)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 6: DATA FLOW: LIFECYCLE OF A NEWS ARTICLE
    # =========================================================================
    story.append(ChapterMarker("ch6"))
    story.append(Paragraph("Chapter 6: Data Flow: Lifecycle of an Article", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "To understand how data moves through Keywords News, review the eight discrete stages in the lifecycle of a news article:",
        body_style
    ))
    
    flow_steps = [
        ("Stage 1: Client Cache Inspection",
         "When the reader opens the app, NewsContext checks localStorage for news_cache_v2 and news_cache_timestamp_v2. "
         "If the timestamp is within CACHE_DURATION (120,000 ms), the cached articles render immediately in 0ms."),
        
        ("Stage 2: Concurrent Batched Source Fetching",
         "If cache is cold or expired, newsService.ts groups the 40+ publications into concurrent batches of 6 feeds. "
         "Batching prevents browser connection saturation while delivering near-instant initial render."),
        
        ("Stage 3: Edge Proxy & CORS Resolution",
         "Each feed URL is sent to the Supabase Edge Function: /functions/v1/rss-proxy?url=FEED_URL. "
         "The Deno edge runtime executes the upstream GET request, verifies the response, and injects Access-Control-Allow-Origin: * headers."),
        
        ("Stage 4: Browser-Native XML Parsing",
         "newsService.ts feeds the raw XML body into browser DOMParser. It dynamically detects whether the feed is RSS 2.0 (<item>) or Atom (<entry>). "
         "It extracts title, link, pubDate, media:content, enclosure, and contentSnippet."),
        
        ("Stage 5: Round-Robin Interleaving",
         "Parsed articles are grouped into buckets by publisher name. The interleaver draws one article per bucket in rotation, "
         "preventing single high-frequency publishers from dominating the view."),
        
        ("Stage 6: 70/30 Regional Balance Enforcement",
         "mixRegionalArticles() separates articles into Indian and International pools. It executes an interleaving loop drawing "
         "7 Indian articles followed by 3 World articles in sequence."),
        
        ("Stage 7: Progressive UI Streaming",
         "As each batch resolves, onProgress() triggers a React state update. Articles appear smoothly in the Bento grid without full-page reloads."),
        
        ("Stage 8: Reader Mode & AI Augmentation",
         "When a reader clicks an article, ArticlePage.tsx passes the URL to scraperService.ts. Mozilla Readability extracts clean body paragraphs. "
         "Mistral AI generates a 2-3 sentence summary and provides on-demand definitions for highlighted terms.")
    ]
    for title, desc in flow_steps:
        story.append(Paragraph(f"<b>{title}:</b> {desc}", body_style))
        story.append(Spacer(1, 2))
        
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 7: DATABASE ARCHITECTURE & SUPABASE SCHEMA
    # =========================================================================
    story.append(ChapterMarker("ch7"))
    story.append(Paragraph("Chapter 7: Database Architecture & Supabase Schema", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "Keywords News uses <b>Supabase (PostgreSQL 15)</b> for user identity, profiles, and reading preferences. "
        "If you need to set up a brand new Supabase project or recreate the database from scratch, execute this complete, "
        "idempotent SQL script in the <b>Supabase SQL Editor</b>:",
        body_style
    ))
    
    sql_schema = """-- 1. Create the public.profiles table
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

-- 3. Create RLS Policies (Users can only access their own data)
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Automatic Timestamp Update Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"""
    add_code_block(sql_schema)
    
    story.append(Paragraph("<b>Deploying the Supabase Edge Function (rss-proxy)</b>", h2_style))
    story.append(Paragraph(
        "The RSS proxy function lives in <code>supabase/functions/rss-proxy/index.ts</code>. "
        "Deploy it using the Supabase CLI:",
        body_style
    ))
    proxy_cmd = """# Step 1: Install Supabase CLI locally
npm install -g supabase

# Step 2: Authenticate with Supabase
npx supabase login

# Step 3: Link local repo to remote project
npx supabase link --project-ref jwksmchxpprxkpbsmhxo

# Step 4: Deploy function (--no-verify-jwt is critical so public users can fetch feeds)
npx supabase functions deploy rss-proxy --no-verify-jwt"""
    add_code_block(proxy_cmd)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 8: THIRD-PARTY INFRASTRUCTURE MAP
    # =========================================================================
    story.append(ChapterMarker("ch8"))
    story.append(Paragraph("Chapter 8: Third-Party Infrastructure & Service Map", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "For non-technical owners and new developers, this matrix lists all third-party services powering Keywords News, "
        "their account identifiers, free-tier thresholds, and emergency recovery actions:",
        body_style
    ))
    
    infra_matrix = [
        ["Service", "Identifier / Project ID", "Monthly Free Quotas", "What To Do If Exceeded"],
        ["Netlify", "keywordnews.netlify.app\nID: a0e3c54d-6a5c-43f1-b924-adfe8423ef82", "100 GB Bandwidth\n300 Build Minutes", "Upgrade to Netlify Pro ($19/mo) or switch to Cloudflare Pages."],
        ["Supabase", "Ref: jwksmchxpprxkpbsmhxo\nRegion: ap-south-1 (Mumbai)", "500 MB Database\n50,000 Active Users\n500,000 Edge Invocations", "Upgrade to Supabase Pro ($25/mo) if user base exceeds 50,000."],
        ["Mistral AI", "Model: open-mistral-nemo\nConsole: console.mistral.ai", "Pay-as-you-go credit pool\n($0.15 / 1M input tokens)", "Add credit in Mistral Billing if AI summaries return 401 or 429."],
        ["Resend", "Domain: keywordnews.app\nConsole: resend.com", "3,000 Emails / month", "Upgrade to Pro ($20/mo) when weekly digest subscribers exceed 3k."],
        ["GitHub", "sushrutverma/KeywordNewsLive", "Unlimited Public/Private Storage", "Repository home for all version control and code collaboration."]
    ]
    i_table = Table(infra_matrix, colWidths=[80, 150, 130, 144])
    i_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    story.append(i_table)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 9: CLIENT STATE & LOCALSTORAGE SCHEMA
    # =========================================================================
    story.append(ChapterMarker("ch9"))
    story.append(Paragraph("Chapter 9: Client State & Storage Schema", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "Keywords News uses a hybrid storage model: Supabase for persistent cloud profiles, and the browser's <code>localStorage</code> "
        "for instant, zero-latency caching. Below is the complete client-side storage schema:",
        body_style
    ))
    
    storage_keys = [
        ["Key Name", "Data Type", "Default", "Purpose & Cache Invalidation"],
        ["news_cache_v2", "JSON Article[]", "null", "Parsed articles cache. Prevents unnecessary network calls during navigation."],
        ["news_cache_timestamp_v2", "Timestamp (ms)", "null", "Evaluated against CACHE_DURATION (120,000 ms = 2 min). Expired data triggers background refresh."],
        ["savedArticles", "JSON Article[]", "[]", "User bookmarks library. Persists indefinitely until explicitly removed by the user."],
        ["followedTopics", "JSON string[]", "7 topics", "Array of followed topic IDs shown in top navigation tab bar."],
        ["searchHistory", "JSON string[]", "[]", "Recent keyword searches, capped at 10 items for fast autocomplete."],
        ["theme", "String ('light' | 'dark')", "System", "Persists theme preference and controls .dark class on &lt;html&gt; tag."]
    ]
    s_table = Table(storage_keys, colWidths=[140, 94, 70, 200])
    s_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    story.append(s_table)
    story.append(Spacer(1, 14))
    
    add_alert_box("Defensive Storage Design", "If a user's browser localStorage becomes corrupted or exceeds browser quota limits, newsService.ts catches the JSON parse error, logs a console warning, automatically clears news_cache_v2, and gracefully loads fresh news without crashing the application.")
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 10: SECURITY BOUNDARIES & SECRETS
    # =========================================================================
    story.append(ChapterMarker("ch10"))
    story.append(Paragraph("Chapter 10: Security Boundaries & Secret Management", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "Understanding frontend vs. backend security in modern web applications is essential for incoming engineers and owners:",
        body_style
    ))
    
    add_alert_box("CRITICAL SECURITY PRINCIPLE", "Any environment variable starting with VITE_ is compiled directly into the client JavaScript bundle. It is visible to ANYONE who opens browser Developer Tools. Never place administrative or private database keys in VITE_ variables!")
    
    sec_points = [
        ("VITE_SUPABASE_ANON_KEY is Public by Design",
         "This key allows client browsers to communicate with Supabase. It is completely safe to be public because Supabase Row Level Security (RLS) protects the database. Even with this key, an attacker cannot read or alter another user's profile data."),
        
        ("SUPABASE_SECRET_KEY / SERVICE_ROLE Must Never Enter Frontend Code",
         "The Service Role key bypasses all RLS policies. It must NEVER have a VITE_ prefix, must never be committed to Git, and must never be referenced inside the src/ folder."),
        
        ("Commercial Scaling of Mistral AI Key",
         "Currently, VITE_MISTRAL_API_KEY is called client-side for rapid prototyping. For enterprise commercial scale, developers should route AI completions through an authenticated Supabase Edge Function (mistral-proxy) to keep the key entirely server-side.")
    ]
    for title, desc in sec_points:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
        story.append(Spacer(1, 4))
        
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 11: ENVIRONMENT VARIABLES REFERENCE
    # =========================================================================
    story.append(ChapterMarker("ch11"))
    story.append(Paragraph("Chapter 11: Environment Variables & Credentials", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "Below is the complete reference of all environment variables required for local development (<code>.env</code>) and production (Netlify Dashboard):",
        body_style
    ))
    
    env_table_data = [
        ["Variable Name", "Required By", "Sample Format / Purpose", "Where to Obtain"],
        ["VITE_SUPABASE_URL", "Frontend / Vite", "https://[project-ref].supabase.co", "Supabase Dashboard → Settings → API"],
        ["VITE_SUPABASE_ANON_KEY", "Frontend / Vite", "sb_publishable_[token] or JWT", "Supabase Dashboard → Settings → API (anon/public)"],
        ["VITE_MISTRAL_API_KEY", "Frontend (aiService)", "32-char alphanumeric string", "console.mistral.ai → API Keys"],
        ["VITE_MISTRAL_MODEL", "Optional Override", "open-mistral-nemo", "Default is open-mistral-nemo"],
        ["SUPABASE_URL", "Backend Scripts", "https://[project-ref].supabase.co", "Supabase Dashboard → Settings → API"],
        ["SUPABASE_SECRET_KEY", "Backend Admin", "sb_secret_[token] (Keep Secret!)", "Supabase Dashboard → Settings → API (service_role)"],
        ["RESEND_API_KEY", "Email Digest", "re_[token]", "resend.com → API Keys"]
    ]
    e_table = Table(env_table_data, colWidths=[130, 94, 150, 130])
    e_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BG),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 8.5),
        ('BACKGROUND', (0, 1), (-1, -1), LIGHT_BG),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('FONTSIZE', (0, 1), (-1, -1), 8),
    ]))
    story.append(e_table)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 12: DEVELOPER PLAYBOOK & BUNDLE OPTIMIZATION
    # =========================================================================
    story.append(ChapterMarker("ch12"))
    story.append(Paragraph("Chapter 12: Developer Playbook & Build Optimization", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph("<b>1. Local Setup Workflow</b>", h2_style))
    local_cmds = """# Clone the repository
git clone https://github.com/sushrutverma/KeywordNewsLive.git
cd KeywordNewsLive

# Install project dependencies
npm install

# Start development server
npm run dev"""
    add_code_block(local_cmds)
    
    story.append(Paragraph("<b>2. Production Build & Netlify Deployment</b>", h2_style))
    story.append(Paragraph(
        "To avoid Netlify remote environment variable masking bugs, use the Local Prebuild Gold Standard:",
        body_style
    ))
    deploy_cmds = """# Step 1: Compile TypeScript & bundle assets locally
npm run build

# Step 2: Deploy prebuilt dist folder directly
node node_modules/netlify/bin/run.js deploy --prod --dir dist --no-build"""
    add_code_block(deploy_cmds)
    
    story.append(Paragraph("<b>3. Bundle Size Optimization Recipe (vite.config.ts)</b>", h2_style))
    story.append(Paragraph(
        "To eliminate the Vite &gt;500kB warning and optimize first contentful paint, configure manual chunk splitting:",
        body_style
    ))
    chunk_code = """// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-icons': ['lucide-react'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-supabase': ['@supabase/supabase-js'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});"""
    add_code_block(chunk_code)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 13: HOW-TO RECIPES
    # =========================================================================
    story.append(ChapterMarker("ch13"))
    story.append(Paragraph("Chapter 13: How-To Recipes for Common Tasks", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph("<b>Recipe 1: How to Add a New RSS News Source</b>", h2_style))
    story.append(Paragraph("Open <code>src/services/newsSources.ts</code> and append to <code>news_sources</code>:", body_style))
    r1_code = """{
  name: "MIT Technology Review",
  url: "https://www.technologyreview.com/feed/",
  category: "tech-design", // Must match an existing topic ID
  isIndian: false,         // true = Indian, false = International
  richContent: true        // true = Long-form analytical
}"""
    add_code_block(r1_code)
    
    story.append(Paragraph("<b>Recipe 2: How to Add a New Topic Vertical</b>", h2_style))
    story.append(Paragraph(
        "1. In <code>src/services/newsSources.ts</code>, add the topic to the <code>topics</code> array.<br/>"
        "2. In <code>src/contexts/NewsContext.tsx</code>, add the new topic ID to default <code>followedTopics</code>.<br/>"
        "3. Add news sources tagged with that topic ID.",
        body_style
    ))
    r2_code = """{
  id: "climate-energy",
  name: "Climate & Energy",
  description: "Renewable energy, climate policy, and environmental science."
}"""
    add_code_block(r2_code)
    
    story.append(Paragraph("<b>Recipe 3: How to Update or Switch AI Models</b>", h2_style))
    story.append(Paragraph("Open <code>src/services/aiService.ts</code> and modify <code>CANDIDATE_MODELS</code>:", body_style))
    r3_code = """const CANDIDATE_MODELS = [
  import.meta.env.VITE_MISTRAL_MODEL || 'open-mistral-nemo', // Primary
  'open-mistral-7b',                                         // Secondary fallback
  'mistral-tiny'                                             // Emergency fallback
];"""
    add_code_block(r3_code)
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 14: QA CHECKLIST & EMERGENCY RUNBOOK
    # =========================================================================
    story.append(ChapterMarker("ch14"))
    story.append(Paragraph("Chapter 14: QA Checklist & Emergency Runbook", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph("<b>Pre-Flight 5-Point Quality Assurance Checklist</b>", h2_style))
    qa_items = [
        ("1. 70/30 Regional Ratio", "Load homepage. Verify that out of every 10 articles, approximately 7 originate from Indian publications and 3 from global sources."),
        ("2. Round-Robin Interleaving", "Verify that the same publisher never appears consecutively more than twice in the Bento feed."),
        ("3. Reader Mode Verification", "Click an article card. Verify the reader view renders clean typography without banner ads or raw XML artifacts."),
        ("4. AI Summary & Concept Explainer", "Click 'Generate AI Summary'. Highlight a term ('Fiscal Deficit') and confirm the floating tooltip gives a 2-sentence explanation."),
        ("5. Auth & Onboarding Sync", "Create a test account. Complete onboarding steps and verify data appears in Supabase public.profiles.")
    ]
    for title, desc in qa_items:
        story.append(Paragraph(f"• <b>{title}:</b> {desc}", bullet_style))
    
    story.append(Spacer(1, 8))
    story.append(Paragraph("<b>Emergency Troubleshooting Runbook</b>", h2_style))
    
    trouble_cases = [
        ("Issue: Feed is Empty / Articles Not Loading",
         "1. Check if dist/assets/index-[hash].js contains masked asterisks (****************). If so, update Netlify env vars and redeploy with --no-build.<br/>"
         "2. Clear browser cache: DevTools → Application → Local Storage → Delete news_cache_v2.<br/>"
         "3. Test Supabase proxy in terminal: fetch('https://jwksmchxpprxkpbsmhxo.supabase.co/functions/v1/rss-proxy?url=https%3A%2F%2Fwww.thehindu.com%2Ffeeder%2Fdefault.rss')."),
        
        ("Issue: AI Summary Returns 401 or 429",
         "1. Verify VITE_MISTRAL_API_KEY in .env.<br/>"
         "2. Test key in terminal using fetch to https://api.mistral.ai/v1/chat/completions.<br/>"
         "3. If quota exhausted, log in to console.mistral.ai and add billing credits."),
        
        ("Issue: Page Refresh Produces 404 Error",
         "1. Verify public/_redirects exists and contains: /*  /index.html  200<br/>"
         "2. Verify netlify.toml has [[redirects]] from = '/*' to = '/index.html' status = 200.")
    ]
    for title, desc in trouble_cases:
        story.append(Paragraph(f"<b>{title}</b>", h3_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 4))
        
    story.append(PageBreak())

    # =========================================================================
    # APPENDIX A: GLOSSARY OF ARCHITECTURAL TERMS
    # =========================================================================
    story.append(ChapterMarker("appA"))
    story.append(Paragraph("Appendix A: Full System Architectural Glossary", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    glossary = [
        ("CORS (Cross-Origin Resource Sharing)", "A browser security rule preventing web pages from making HTTP requests to a different domain unless permitted. Circumvented by our Supabase Edge Function proxy."),
        ("SPA (Single-Page Application)", "A web application that loads a single HTML page and dynamically updates content using JavaScript (React Router) without full-page reloads."),
        ("DOMParser", "A browser-native API that parses XML and HTML text strings into a navigable DOM object. Used in newsService.ts to extract RSS articles with high performance."),
        ("RLS (Row Level Security)", "PostgreSQL database security mechanism where queries automatically enforce user ownership rules (e.g. auth.uid() = id). Ensures users cannot access other accounts even with public API keys."),
        ("Deno Runtime", "A modern, secure JavaScript and TypeScript runtime used by Supabase Edge Functions to execute serverless logic close to users with minimal cold-start times."),
        ("Bento Grid", "A modern layout design system organizing diverse content cards into asymmetric, harmonious grids inspired by Japanese bento boxes."),
        ("Readability.js", "A standalone library created by Mozilla (used in Firefox Reader View) that strips navigational elements, sidebars, and ads to extract core article content."),
        ("Atom vs. RSS 2.0", "Two complementary XML syndication standards. RSS 2.0 uses <item> elements, while Atom uses <entry> elements. Our DOMParser supports both.")
    ]
    for term, defn in glossary:
        story.append(Paragraph(f"• <b>{term}:</b> {defn}", bullet_style))
        story.append(Spacer(1, 2))
        
    story.append(PageBreak())

    # =========================================================================
    # APPENDIX B: FUTURE PRODUCT ROADMAP
    # =========================================================================
    story.append(ChapterMarker("appB"))
    story.append(Paragraph("Appendix B: Future Product Roadmap (Sprints 1–3)", h1_style))
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER, spaceAfter=12, spaceBefore=4))
    
    story.append(Paragraph(
        "To guide future developers and product leads, this appendix summarizes the prioritized enhancements from <code>TODO.md</code>:",
        body_style
    ))
    
    sprints = [
        ("Sprint 1: Performance, Stability & Code Splitting (P0 - Immediate)",
         "• Implement Vite manualChunks bundle splitting to reduce JS bundle size from 647kB to <250kB.<br/>"
         "• Code-split ArticlePage.tsx using React.lazy and Suspense for faster homepage load.<br/>"
         "• Add visual toast feedback when articles are saved or shared.<br/>"
         "• Persist user followed topics to Supabase public.profiles on every change."),
        
        ("Sprint 2: Core UX, Search & Personalization (P1 - High Priority)",
         "• Multi-Keyword AND/OR Search Filtering across cached headlines.<br/>"
         "• Audio Reader Mode: integrate browser Web Speech API (speechSynthesis) for on-the-go listening.<br/>"
         "• Daily Reading Streak Counter: visualize reading habits against the user's daily goal.<br/>"
         "• Export bookmarks to Markdown, JSON, and Instapaper/Pocket formats."),
        
        ("Sprint 3: Intelligence, Retention & Growth (P2 - Growth)",
         "• Weekly Sunday AI Digest: batch top articles and dispatch via Resend API.<br/>"
         "• Topic Sentiment & Perspective Balance indicator (Policy vs. Markets).<br/>"
         "• PWA Offline Support: Cache read articles using Service Workers for flight and commute reading.")
    ]
    for s_title, s_desc in sprints:
        story.append(Paragraph(f"<b>{s_title}</b>", h2_style))
        story.append(Paragraph(s_desc, body_style))
        story.append(Spacer(1, 4))
        
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=8))
    final_signoff = Paragraph(
        "<b>Architectural Handover Complete:</b> Keywords News is fully documented, resiliently structured, and ready for long-term production operations.",
        ParagraphStyle('FinalSign', parent=body_style, fontName='Helvetica-Oblique', alignment=1, textColor=PRIMARY)
    )
    story.append(final_signoff)
    
    return story

def build_pdf_handbook(output_path="KeywordsNews_Developer_Handbook.pdf"):
    print("--- PASS 1: Measuring Page Numbers ---")
    doc_dummy = SimpleDocTemplate(
        "temp_measure.pdf",
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story_pass1 = create_story(toc_page_numbers={})
    doc_dummy.build(story_pass1, canvasmaker=NumberedCanvas)
    
    measured_pages = dict(chapter_page_map)
    print("Measured Chapter Pages:", measured_pages)
    if os.path.exists("temp_measure.pdf"):
        os.remove("temp_measure.pdf")
        
    print("--- PASS 2: Compiling Final Handbook with Dynamic TOC ---")
    doc_final = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    story_pass2 = create_story(toc_page_numbers=measured_pages)
    doc_final.build(story_pass2, canvasmaker=NumberedCanvas)
    print(f"✅ Master PDF Handbook successfully generated at: {output_path}")

if __name__ == '__main__':
    out = sys.argv[1] if len(sys.argv) > 1 else "KeywordsNews_Developer_Handbook.pdf"
    build_pdf_handbook(out)
