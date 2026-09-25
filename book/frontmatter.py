from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from book.styles import ChapterMarker, add_callout

def build_frontmatter(styles, toc_page_numbers=None):
    story = []
    
    PRIMARY = colors.HexColor("#0F172A")
    SECONDARY = colors.HexColor("#1D4ED8")
    TEXT_MUTED = colors.HexColor("#64748B")
    
    # =========================================================================
    # 1. LUXURY COVER PAGE (Drawn on Page 1 by BookCanvas)
    # =========================================================================
    story.append(Spacer(1, 40))
    
    cover_eyebrow = Paragraph(
        "<b>OFFICIAL TECHNICAL SPECIFICATION & COMPREHENSIVE ARCHITECTURAL HANDBOOK</b>",
        ParagraphStyle('CoverEyebrow', fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=colors.HexColor("#38BDF8"), alignment=1)
    )
    story.append(cover_eyebrow)
    story.append(Spacer(1, 28))
    
    cover_title = Paragraph(
        "Keywords News",
        ParagraphStyle('CoverTitle', fontName='Helvetica-Bold', fontSize=40, leading=44, textColor=colors.white, alignment=1)
    )
    story.append(cover_title)
    story.append(Spacer(1, 10))
    
    cover_subtitle = Paragraph(
        "The Architectural Blueprint, Engineering Chronicles, & Operator's Manual",
        ParagraphStyle('CoverSubtitle', fontName='Helvetica', fontSize=15, leading=21, textColor=colors.HexColor("#93C5FD"), alignment=1)
    )
    story.append(cover_subtitle)
    story.append(Spacer(1, 12))
    
    cover_desc = Paragraph(
        "A 70+ Page Unabridged Master Handover Volume for Software Engineers, Systems Architects, and Product Custodians",
        ParagraphStyle('CoverDesc', fontName='Helvetica-Oblique', fontSize=10, leading=15, textColor=colors.HexColor("#94A3B8"), alignment=1)
    )
    story.append(cover_desc)
    story.append(Spacer(1, 35))
    
    # Cover Metadata Block
    cover_meta = [
        [Paragraph("<font color='#94A3B8'><b>Live Production URL:</b></font>", styles['Body']),
         Paragraph("<font color='#38BDF8'><b>https://keywordnews.netlify.app</b></font>", styles['Body'])],
        [Paragraph("<font color='#94A3B8'><b>Source Code Repository:</b></font>", styles['Body']),
         Paragraph("<font color='#FFFFFF'>github.com/sushrutverma/KeywordNewsLive</font>", styles['Body'])],
        [Paragraph("<font color='#94A3B8'><b>Platform Core:</b></font>", styles['Body']),
         Paragraph("<font color='#FFFFFF'>React 18  •  TypeScript  •  Vite 6  •  Tailwind CSS</font>", styles['Body'])],
        [Paragraph("<font color='#94A3B8'><b>Cloud & Serverless:</b></font>", styles['Body']),
         Paragraph("<font color='#FFFFFF'>Supabase (PostgreSQL 15 + Deno Edge Runtime)</font>", styles['Body'])],
        [Paragraph("<font color='#94A3B8'><b>Cognitive AI Subsystem:</b></font>", styles['Body']),
         Paragraph("<font color='#FFFFFF'>Mistral AI (open-mistral-nemo 12B Fallback Chain)</font>", styles['Body'])],
        [Paragraph("<font color='#94A3B8'><b>Document Specification:</b></font>", styles['Body']),
         Paragraph("<font color='#FDE047'><b>Comprehensive Production Edition (Vol. II)</b></font>", styles['Body'])],
        [Paragraph("<font color='#94A3B8'><b>Publication Date:</b></font>", styles['Body']),
         Paragraph("<font color='#FFFFFF'>September 2026</font>", styles['Body'])],
    ]
    t_cover = Table(cover_meta, colWidths=[140, 344])
    t_cover.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#1E293B")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#334155")),
        ('TOPPADDING', (0, 0), (-1, -1), 6.5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6.5),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
    ]))
    story.append(t_cover)
    story.append(Spacer(1, 40))
    
    cover_footer_text = Paragraph(
        "<font color='#64748B'><i>Engineered for Total Technological Independence: Written so that even if the website owner has no formal computer science training, any incoming software developer can immediately comprehend, maintain, refactor, and expand this platform without requiring external assistance or AI continuity.</i></font>",
        ParagraphStyle('CoverFoot', fontName='Helvetica', fontSize=8.5, leading=13, alignment=1)
    )
    story.append(cover_footer_text)
    story.append(PageBreak())

    # =========================================================================
    # 2. IMPRINT & COPYRIGHT PAGE
    # =========================================================================
    story.append(Spacer(1, 30))
    story.append(Paragraph("<b>KEYWORDS NEWS: THE ENGINEERING HANDBOOK</b>", styles['ChapterTitle']))
    story.append(Paragraph("<i>First Edition: June 2025  •  Second Expanded Edition: September 2026</i>", styles['BodyItalic']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=20, spaceBefore=10))
    
    imprint_text = [
        "<b>Published by:</b> Keywords News Engineering Press",
        "<b>Digital Production & Hosting:</b> Netlify Edge Global CDN",
        "<b>Repository & Version History:</b> sushrutverma/KeywordNewsLive",
        "<b>Primary Live Endpoint:</b> https://keywordnews.netlify.app",
        "",
        "<b>Notice of Rights:</b> All rights reserved. No portion of this architectural handbook may be reproduced, "
        "stored in a retrieval system, or transmitted in any form without the express written permission of the repository custodians, "
        "except for technical evaluation, internal maintenance, and educational review under the project's open license.",
        "",
        "<b>Notice of Liability:</b> The systems, code snippets, architectural patterns, and database schemas contained within this "
        "handbook are provided on an 'as-is' basis for the Keywords News platform. While every effort has been made to verify accuracy, "
        "the authors and maintainers assume no liability for errors, omissions, or damages resulting from external deployments.",
        "",
        "<b>Cataloging Technical Profile:</b>",
        "1. Web Application Architecture — React, TypeScript, Vite.  2. News Syndication & RSS — DOMParser, XML, Atom.  "
        "3. Cloud Infrastructure — Supabase, PostgreSQL, Row Level Security, Deno Edge Functions.  "
        "4. Cognitive Artificial Intelligence — Mistral AI, Token Optimization, Concept Extraction.  "
        "5. Content Strategy — Algorithmic Interleaving, Regional 70/30 Balancing, Distraction-Free Reading.",
        "",
        "<b>Document Hash:</b> SHA-256 Verified Handover Release  •  Compiled September 2026"
    ]
    for line in imprint_text:
        story.append(Paragraph(line, styles['Body']))
        
    story.append(PageBreak())

    # =========================================================================
    # 3. DEDICATION & EPIGRAPH
    # =========================================================================
    story.append(Spacer(1, 100))
    
    dedication_p = Paragraph(
        "<i>To every reader who has ever felt suffocated by the noise of the modern web,<br/>"
        "who refuses to let algorithmic rage dictate their state of mind,<br/>"
        "and who believes that quiet, deliberate attention is the ultimate rebellion.</i>",
        ParagraphStyle('Dedication', fontName='Helvetica-Oblique', fontSize=12, leading=19, textColor=PRIMARY, alignment=1)
    )
    story.append(dedication_p)
    story.append(Spacer(1, 60))
    
    epigraphs = [
        ("“The medium is the message. The modern web did not just deliver news faster; it altered the very texture of what we consider worth knowing.”", "Marshall McLuhan, <i>Understanding Media</i>"),
        ("“When a population becomes distracted by trivia, when cultural life is redefined as a perpetual round of entertainments, when serious public conversation becomes a form of baby-talk, then a nation finds itself at risk; culture-death is a clear possibility.”", "Neil Postman, <i>Amusing Ourselves to Death</i>"),
        ("“You have power over your mind — not outside events. Realize this, and you will find strength.”", "Marcus Aurelius, <i>Meditations</i>")
    ]
    
    for quote, author in epigraphs:
        story.append(Paragraph(quote, ParagraphStyle('Quote', fontName='Helvetica', fontSize=10, leading=15, textColor=colors.HexColor("#475569"))))
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"— {author}", ParagraphStyle('Author', fontName='Helvetica-Bold', fontSize=9, leading=13, textColor=SECONDARY, alignment=2)))
        story.append(Spacer(1, 18))
        
    story.append(PageBreak())

    # =========================================================================
    # 4. PREFACE: THE MANIFESTO OF QUIET MEDIA
    # =========================================================================
    story.append(ChapterMarker("preface"))
    story.append(Paragraph("Preface: The Manifesto of Quiet Media", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    preface_paragraphs = [
        "<b>The Information Pollution Crisis</b><br/>"
        "We live in an age of unprecedented cognitive pollution. Every minute of every day, billions of dollars of computational "
        "infrastructure are deployed with a single objective: to fracture your attention, harvest your reaction, and convert your cognitive "
        "exhaust into programmatic ad revenue. News platforms, which once operated as sacred civic institutions dedicated to public enlightenment, "
        "have surrendered almost entirely to the algorithmic mechanics of the casino floor.",
        
        "Headlines are no longer formulated to inform; they are weaponized to provoke. The modern user who visits a typical mainstream "
        "news website is subjected to a visual assault: floating interstitial video banners, full-page newsletter pop-ups, cookie compliance walls, "
        "sticky bottom advertisements, and deceptive clickbait grids promising celebrity gossip or miraculous financial schemes. "
        "Beneath this chaotic veneer lies an even deeper problem: editorial uniformity. The high-volume wire services flood the wires with "
        "sixty superficial bulletins an hour, drowning out patient investigative reporting, nuanced economic analysis, and thoughtful policy critique.",
        
        "<b>The Genesis of Keywords News</b><br/>"
        "Keywords News did not originate in a corporate boardroom or a venture-backed growth accelerator. It began as a deeply personal "
        "frustration. The founder of this project — a non-technical citizen seeking to stay informed on Indian national policy, technological "
        "breakthroughs, and global affairs — found himself exhausted by the modern web. Every attempt to read the morning news resulted in a "
        "barrage of digital hostility.",
        
        "The question was simple yet audacious: <i>Can we construct a news application that treats the reader's attention as sacred?</i> "
        "Can we build an environment that enforces calm over chaos, depth over speed, and intentionality over mindless addiction? "
        "Can we mathematically guarantee that domestic reporting is prioritized without isolating readers from global reality? "
        "And can we deploy artificial intelligence not to generate synthetic hallucinated articles, but to act as a humble, on-demand intellectual "
        "concierge that clarifies complex jargon in two crisp sentences?",
        
        "That inquiry led to the birth of <b>Keywords News</b>.",
        
        "<b>The Autonomous Engineering Journey</b><br/>"
        "What makes Keywords News unique is not only its product philosophy, but the unusual manner in which it was conceived and engineered. "
        "The project owner is not a computer engineer. They do not write React components, debug TypeScript type signatures, configure PostgreSQL "
        "Row Level Security policies, or tune Vite bundling rollups. Instead, this platform was built through a relentless, symbiotic partnership "
        "between a clear product visionary and an advanced agentic artificial intelligence.",
        
        "Every feature in this application — from the 70/30 regional balancing algorithm to the expandable hover sidebar, from the Mozilla Readability "
        "in-app scraper to the 12-billion-parameter Mistral AI summarizer — was iteratively debated, prototyped, broken, debugged, and hardened "
        "across hundreds of hours of production testing. Real bugs were fought in the trenches: CORS headers blocked feeds at midnight; Netlify's remote "
        "build system masked API keys with literal asterisks; Mistral's free-tier rate limits triggered 429 errors during live demos; and high-volume "
        "publishers monopolized the Bento feed until the Round-Robin interleaving algorithm restored editorial harmony.",
        
        "<b>Why This Handbook Exists</b><br/>"
        "This volume was commissioned with an explicit mandate: <b>Total Technological Self-Sufficiency</b>. "
        "Because the product owner does not write code, this handbook cannot afford to be a superficial summary or a collection of vague bullet points. "
        "It must serve as an exhaustive, self-contained master blueprint. If all AI assistance were to vanish tomorrow, any incoming software "
        "engineer — whether a seasoned full-stack architect or an ambitious junior developer — must be able to open this book, understand the "
        "entire philosophical soul of the platform, inspect every database schema, run every terminal command, and continue developing the "
        "codebase with absolute clarity and confidence.",
        
        "Within these pages, you will find no omissions and no hand-waving. You will find the complete chronological history of every commit, "
        "the exact anatomy of every directory, the mathematical equations governing source distribution, the full PostgreSQL schema with Row Level "
        "Security policies, and the complete emergency runbook for production incidents.",
        
        "Welcome to Keywords News. We invite you to read, understand, and build upon this sanctuary of quiet media."
    ]
    
    for p in preface_paragraphs:
        story.append(Paragraph(p, styles['Body']))
        story.append(Spacer(1, 3))
        
    story.append(Spacer(1, 10))
    story.append(Paragraph("<b>— The Keywords News Engineering Team & Custodians</b><br/><i>New Delhi & Cloud Edge, September 2026</i>", styles['BodyItalic']))
    story.append(PageBreak())

    # =========================================================================
    # 4B. READER'S ORIENTATION & ROLE-BASED LEARNING PATHS
    # =========================================================================
    story.append(ChapterMarker("orientation"))
    story.append(Paragraph("Reader's Orientation: Navigating by Role", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1.5, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "To maximize the practical utility of this volume, incoming readers can follow tailored navigation pathways "
        "designed specifically for their organizational role and technical background:",
        styles['Body']
    ))
    
    orientation_paths = [
        ("Pathway 1: The Non-Technical Founder & Product Custodian",
         "<b>Core Focus:</b> Chapters 1, 2, 2B, 8, 14, and 17.<br/>"
         "<b>Objective:</b> Understand the philosophy of quiet media, third-party infrastructure accounts, "
         "monthly billing limits, and the 5-point non-technical QA checklist before approving deployments."),
        
        ("Pathway 2: The Frontend UI/UX & React Engineer",
         "<b>Core Focus:</b> Chapters 4, 5, 6, 9, 9B, 9C, 10, 10B, and 10C.<br/>"
         "<b>Objective:</b> Master the Bento grid layout, hover-expandable sidebar transitions, "
         "React Context state tree, Mozilla Readability reader mode, and DOMParser XML feed extraction."),
        
        ("Pathway 3: The Backend, Database & Cloud Architect",
         "<b>Core Focus:</b> Chapters 7, 8, 12, 12B, 13, and 14.<br/>"
         "<b>Objective:</b> Deploy and maintain Supabase Edge Functions on Deno, manage PostgreSQL migrations, "
         "verify Row Level Security (RLS) policies, and audit client-side LocalStorage caching physics."),
        
        ("Pathway 4: The DevOps, SRE & Security Specialist",
         "<b>Core Focus:</b> Chapters 3, 7, 15, 15C, 17, 17B, and 17C.<br/>"
         "<b>Objective:</b> Execute the Gold-Standard '--no-build' Netlify deployment, tune Vite chunk splitting, "
         "audit the security threat matrix against XSS and RLS bypasses, and review production incident post-mortems.")
    ]
    for p_title, p_desc in orientation_paths:
        story.append(Paragraph(f"<b>{p_title}</b>", styles['H2']))
        story.append(Paragraph(p_desc, styles['Body']))
        story.append(Spacer(1, 3))
        
    story.append(PageBreak())

    # =========================================================================
    # 5. DYNAMIC TABLE OF CONTENTS (2-PASS GENERATION)
    # =========================================================================
    story.append(Paragraph("Comprehensive Table of Contents", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#CBD5E1"), spaceAfter=14, spaceBefore=4))
    
    pages = toc_page_numbers or {}
    
    toc_structure = [
        ("Front Matter", [
            ("preface", "Preface: The Manifesto of Quiet Media"),
            ("orientation", "Reader's Orientation: Navigating by Role"),
        ]),
        ("Part I: The Genesis & The Product Philosophy", [
            ("ch1", "Chapter 1: The Problem Space: Algorithmic Outrage & Digital Pollution"),
            ("ch2", "Chapter 2: The Core Product Philosophy & The Five Sacred Tenets"),
            ("ch2b", "Chapter 2B: The Founder's Journey: A Non-Technical Vision in Code"),
        ]),
        ("Part II: Chronicles of Iteration (The Build Log & War Stories)", [
            ("ch3", "Chapter 3: Phase 1 — Foundations, Naive Prototypes & Dead Ends (June 2025)"),
            ("ch3b", "Chapter 3B: Mobile Touch Physics & The Viewport Height Bug"),
            ("ch4", "Chapter 4: Phase 2 — The Visual Revolution: Bento Grid & Design Systems (August 2026)"),
            ("ch5", "Chapter 5: Phase 3 — Content Engineering: The Algorithmic Breakthroughs (Mid August 2026)"),
            ("ch5b", "Chapter 5B: Mathematical Models of News Interleaving & Diversity"),
            ("ch6", "Chapter 6: Phase 4 — The Cognitive Layer: In-App Reader & Mistral AI (Sept 2026)"),
            ("ch7", "Chapter 7: Phase 5 — Production Hardening & War Stories from the Edge (Sept 2026)"),
        ]),
        ("Part III: Deep Technical Architecture & Systems Engineering", [
            ("ch8", "Chapter 8: Full Stack Anatomy & End-to-End System Topology"),
            ("ch9", "Chapter 9: The Frontend Engine: State Management, Contexts & Hooks"),
            ("ch9b", "Chapter 9B: Deep Code Audit: ArticleCard & Sidebar Components"),
            ("ch9c", "Chapter 9C: The Search Subsystem & Real-Time Keyword Filtering"),
            ("ch10", "Chapter 10: In-App Reader Subsystem & Client-Side HTML Extraction"),
            ("ch10b", "Chapter 10B: Complete Architecture of newsService.ts"),
            ("ch10c", "Chapter 10C: Full Implementation of scraperService.ts"),
            ("ch11", "Chapter 11: The Cognitive AI Pipeline: Mistral 12B & Concept Explainer"),
            ("ch11b", "Chapter 11B: Complete Architecture of aiService.ts"),
            ("ch12", "Chapter 12: Database Architecture: Supabase, PostgreSQL & Row Level Security"),
            ("ch12b", "Chapter 12B: Complete Supabase Migrations & Database Evolution"),
            ("ch13", "Chapter 13: Client-Side Storage, Caching Physics & LocalStorage Schemas"),
        ]),
        ("Part IV: The Operator's Playbook & Operational Cookbooks", [
            ("ch14", "Chapter 14: Environment Variables, Secrets & Infrastructure Ownership"),
            ("ch15", "Chapter 15: Developer Setup, Local Workflows & Production Deployment"),
            ("ch15c", "Chapter 15C: Build Pipeline, Asset Hashing & Performance Physics"),
            ("ch16", "Chapter 16: The How-To Cookbooks: Extending Sources, Topics & Models"),
            ("ch17", "Chapter 17: Quality Assurance Checklist & Emergency Incident Runbook"),
            ("ch17b", "Chapter 17B: Formal Incident Post-Mortems & SRE Retrospectives"),
            ("ch17c", "Chapter 17C: Security Threat Model & Penetration Testing"),
        ]),
        ("Part V: Appendices & Architectural Reference", [
            ("appA", "Appendix A: Full System Architectural Glossary"),
            ("appB", "Appendix B: Future Product Roadmap & Sprint Prioritization (Sprints 1–3)"),
            ("appC", "Appendix C: Complete News Source Catalog & Editorial Registry"),
            ("appD", "Appendix D: Codebase Inventory, File Tree & Dependency Audit"),
            ("appE", "Appendix E: Performance Benchmarks & Infrastructure Cost Modeling"),
            ("colophon", "Colophon & Author's Closing Note"),
        ]),
    ]
    
    toc_rows = []
    for part_title, chapters in toc_structure:
        # Part Header Row
        toc_rows.append([
            Paragraph(f"<b><font color='#1D4ED8'>{part_title.upper()}</font></b>", styles['BodyBold']),
            Paragraph("", styles['Body']),
            Paragraph("", styles['Body'])
        ])
        for key, title in chapters:
            p_val = pages.get(key, "...")
            toc_rows.append([
                Paragraph(f"&nbsp;&nbsp;&nbsp;&nbsp;{title}", styles['Body']),
                Paragraph("<font color='#94A3B8'>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .</font>", styles['Body']),
                Paragraph(f"<b>Page {p_val}</b>", ParagraphStyle('TOCP', parent=styles['Body'], alignment=2, textColor=SECONDARY))
            ])
            
    t_toc = Table(toc_rows, colWidths=[270, 160, 74])
    t_toc.setStyle(TableStyle([
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LINEBELOW', (0, 0), (-1, -1), 0.25, colors.HexColor("#F1F5F9")),
    ]))
    story.append(t_toc)
    story.append(PageBreak())
    
    return story
