import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN
from pptx.enum.shapes import MSO_SHAPE

def create_deck(filename="Keyword_News_Code_Audit_Presentation.pptx"):
    prs = Presentation()
    # 16:9 Widescreen
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette (Tailwind Slate / Indigo / Emerald / Amber)
    BG_COLOR = RGBColor(15, 23, 42)       # Slate 900 #0f172a
    CARD_BG = RGBColor(30, 41, 59)        # Slate 800 #1e293b
    CARD_BORDER = RGBColor(51, 65, 85)    # Slate 700 #334155
    WHITE = RGBColor(255, 255, 255)
    TEXT_MUTED = RGBColor(148, 163, 184)  # Slate 400 #94a3b8
    TEXT_LIGHT = RGBColor(226, 232, 240)  # Slate 200 #e2e8f0
    INDIGO = RGBColor(99, 102, 241)       # Indigo 500 #6366f1
    EMERALD = RGBColor(16, 185, 129)      # Emerald 500 #10b981
    AMBER = RGBColor(245, 158, 11)        # Amber 500 #f59e0b
    ROSE = RGBColor(244, 63, 94)          # Rose 500 #f43f5e
    SKY = RGBColor(56, 189, 248)          # Sky 400 #38bdf8

    def apply_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_COLOR
        bg.line.fill.background()
        return bg

    def add_card(slide, left, top, width, height, bg_color=CARD_BG, border_color=CARD_BORDER):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        card.line.color.rgb = border_color
        card.line.width = Pt(1.5)
        return card

    def add_header(slide, title_text, category="KEYWORD NEWS • CODE AUDIT"):
        header_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.5), Inches(11.7), Inches(1.1))
        tf = header_box.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        
        # Category tag
        p0 = tf.paragraphs[0]
        p0.text = category.upper()
        p0.font.size = Pt(11)
        p0.font.bold = True
        p0.font.color.rgb = SKY
        p0.font.name = "Segoe UI"
        
        # Title
        p1 = tf.add_paragraph()
        p1.text = title_text
        p1.font.size = Pt(26)
        p1.font.bold = True
        p1.font.color.rgb = WHITE
        p1.font.name = "Segoe UI"
        p1.space_before = Pt(4)

    # ==========================================================
    # SLIDE 1: Title Slide
    # ==========================================================
    s1 = prs.slides.add_slide(blank_layout)
    apply_bg(s1)

    # Accent decorative pill
    pill = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(2.8), Inches(0.42))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(30, 27, 75) # Dark indigo
    pill.line.color.rgb = INDIGO
    pill_tf = pill.text_frame
    pill_tf.margin_top = Inches(0.08)
    p_pill = pill_tf.paragraphs[0]
    p_pill.text = "NON-TECHNICAL EXECUTIVE REPORT"
    p_pill.font.size = Pt(10)
    p_pill.font.bold = True
    p_pill.font.color.rgb = SKY
    p_pill.alignment = PP_ALIGN.CENTER
    p_pill.font.name = "Segoe UI"

    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(2.2), Inches(11.7), Inches(2.4))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0

    p_t = tf1.paragraphs[0]
    p_t.text = "Keyword News Aggregator"
    p_t.font.size = Pt(44)
    p_t.font.bold = True
    p_t.font.color.rgb = WHITE
    p_t.font.name = "Segoe UI"

    p_sub = tf1.add_paragraph()
    p_sub.text = "Comprehensive Code Audit & Modernization Roadmap"
    p_sub.font.size = Pt(22)
    p_sub.font.color.rgb = TEXT_MUTED
    p_sub.font.name = "Segoe UI"
    p_sub.space_before = Pt(10)

    # 3 Stat Cards on Title Slide
    metrics = [
        ("Current Code Rating", "B+", "Functional & stable, ripe for spring cleaning", EMERALD),
        ("Audit Optimization Target", "100% Lean", "Prune dead packages & optimize memory", SKY),
        ("User Experience Impact", "Instant Feed", "Zero double-render & snappier mobile load", INDIGO)
    ]
    card_w = Inches(3.64)
    for i, (m_title, m_val, m_desc, m_col) in enumerate(metrics):
        cx = Inches(0.8) + i * Inches(4.0)
        cy = Inches(4.9)
        add_card(s1, cx, cy, card_w, Inches(1.8))
        tb = s1.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.2), card_w - Inches(0.5), Inches(1.4))
        ctf = tb.text_frame
        ctf.word_wrap = True
        ctf.margin_top = ctf.margin_left = ctf.margin_bottom = ctf.margin_right = 0
        
        p = ctf.paragraphs[0]
        p.text = m_title.upper()
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = TEXT_MUTED
        p.font.name = "Segoe UI"
        
        p2 = ctf.add_paragraph()
        p2.text = m_val
        p2.font.size = Pt(32)
        p2.font.bold = True
        p2.font.color.rgb = m_col
        p2.font.name = "Segoe UI"
        p2.space_before = Pt(4)
        
        p3 = ctf.add_paragraph()
        p3.text = m_desc
        p3.font.size = Pt(11)
        p3.font.color.rgb = TEXT_LIGHT
        p3.font.name = "Segoe UI"
        p3.space_before = Pt(4)

    # ==========================================================
    # SLIDE 2: The Sports Car Analogy (Executive Summary)
    # ==========================================================
    s2 = prs.slides.add_slide(blank_layout)
    apply_bg(s2)
    add_header(s2, "Executive Overview: The Sports Car Analogy")

    # Left Card: The State
    add_card(s2, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    tb_l = s2.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    
    p = tf_l.paragraphs[0]
    p.text = "🏎️ The Good News: The Engine is Strong"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.font.name = "Segoe UI"

    bullets_l = [
        "Core capabilities are live: RSS ingestion, Supabase cloud sync, AI news summaries, and story clustering are fully operational.",
        "Aesthetic appeal is top-tier: Modern typography, refined dark mode, and smooth layout animations give users a high-end feel.",
        "Zero downtime: The app successfully builds and runs smoothly on Netlify with automated SEO pre-rendering."
    ]
    for b in bullets_l:
        p = tf_l.add_paragraph()
        p.text = "• " + b
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_before = Pt(14)

    # Right Card: The Opportunities
    add_card(s2, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.0))
    tb_r = s2.shapes.add_textbox(Inches(7.2), Inches(2.1), Inches(5.0), Inches(4.4))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    
    p = tf_r.paragraphs[0]
    p.text = "⚠️ The Hidden Friction: Spring Cleaning Needed"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.font.name = "Segoe UI"

    bullets_r = [
        "Luggage in the trunk: Packing and downloading 2 software tools that are never actually used (costing bandwidth).",
        "Doing the math twice: The feed recalculates itself a phantom second time whenever someone picks a topic or keyword.",
        "Overcrowded rooms: Three large components are doing 5 jobs at once instead of having specialized helpers.",
        "Chatty logs: 9 debug messages logging continuously in production, plus 35 minor quality code warnings."
    ]
    for b in bullets_r:
        p = tf_r.add_paragraph()
        p.text = "• " + b
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_before = Pt(12)

    # ==========================================================
    # SLIDE 3: Finding 1 - Dead Baggage (Unused Packages)
    # ==========================================================
    s3 = prs.slides.add_slide(blank_layout)
    apply_bg(s3)
    add_header(s3, "Finding 1: Dead Baggage in the Trunk", "CORE FINDINGS • ASSET EFFICIENCY")

    cards_data = [
        ("The Issue: Ghost Packages", 
         "The app is carrying 'rss-parser' and 'uuid' in its download bundle. Neither is imported or used by the code (our app already parses RSS feeds via native browser XML parsers).",
         ROSE),
        ("The User Impact: Slower Downloads", 
         "Every new mobile visitor downloads dozens of kilobytes of ghost code they do not need before the news feed can render.",
         AMBER),
        ("The Solution: Unpack & Prune", 
         "Delete the 2 ghost packages and align React 18 types. Shrinks the initial download bundle immediately with zero visual or functional risk.",
         EMERALD)
    ]
    for i, (title, desc, color) in enumerate(cards_data):
        cx = Inches(0.8) + i * Inches(4.0)
        cy = Inches(1.8)
        add_card(s3, cx, cy, Inches(3.64), Inches(5.0))
        tb = s3.shapes.add_textbox(cx + Inches(0.3), cy + Inches(0.35), Inches(3.04), Inches(4.3))
        ctf = tb.text_frame
        ctf.word_wrap = True
        
        p = ctf.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = color
        p.font.name = "Segoe UI"
        
        p2 = ctf.add_paragraph()
        p2.text = desc
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_LIGHT
        p2.font.name = "Segoe UI"
        p2.space_before = Pt(16)

    # ==========================================================
    # SLIDE 4: Finding 2 - Double Math (Double-Rendering)
    # ==========================================================
    s4 = prs.slides.add_slide(blank_layout)
    apply_bg(s4)
    add_header(s4, "Finding 2: Doing the Same Math Twice", "CORE FINDINGS • COMPUTATIONAL PERFORMANCE")

    add_card(s4, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    tb = s4.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    tf = tb.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = "🔄 What Is Happening Today"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = ROSE
    p.font.name = "Segoe UI"

    t1 = ("When a reader clicks a topic (like 'Tech & Design' or 'UPSC Policy') or types in the search bar, the website:\n\n"
          "1. Filters the articles and shows the new feed.\n"
          "2. Immediately triggers a background secondary effect.\n"
          "3. Re-runs the exact same clustering, ranking, and regional math.\n"
          "4. Redraws the entire page a second time in under a second.\n\n"
          "Result: Double computational cycles for every user tap.")
    for line in t1.split("\n\n"):
        p = tf.add_paragraph()
        p.text = line
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_before = Pt(8)

    add_card(s4, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.0))
    tb2 = s4.shapes.add_textbox(Inches(7.2), Inches(2.1), Inches(5.0), Inches(4.4))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    p = tf2.paragraphs[0]
    p.text = "⚡ The Modernized 'One-Touch' Solution"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = EMERALD
    p.font.name = "Segoe UI"

    t2 = ("Convert the filter system to calculate once and remember results directly (via useMemo):\n\n"
          "• Single-pass rendering: The feed updates instantly on the first pass without a phantom second calculation.\n"
          "• Lower device temperature & battery usage: Reduces CPU spikes during active browsing on mobile phones.\n"
          "• Smoother animations: Eliminates micro-stutter when switching between different topic tabs.")
    for line in t2.split("\n\n"):
        p = tf2.add_paragraph()
        p.text = line
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_before = Pt(8)

    # ==========================================================
    # SLIDE 5: Finding 3 - Overcrowded Rooms (Monoliths)
    # ==========================================================
    s5 = prs.slides.add_slide(blank_layout)
    apply_bg(s5)
    add_header(s5, "Finding 3: Overcrowded Rooms (Component Sprawl)", "CORE FINDINGS • CODE ARCHITECTURE")

    monoliths = [
        ("Article Reading Page", "682 Lines", 
         "Currently bundles article display, web scraping, AI summarization, dictionary tooltips, and sentiment scoring into one mega-file.",
         "Extract dedicated helpers for Sentiment Meter and Concept Explainer Tooltip."),
        ("Market Pulse Ribbon", "567 Lines", 
         "Combines the top live ticker bar with an entire 300-line watchlist customization search modal.",
         "Separate the ticker bar from the modal dialog. Keep the ribbon super-fast and lightweight."),
        ("Article Feed Cards", "456 Lines", 
         "Every single card loads its own hidden AI summary popup window in memory simultaneously.",
         "Streamline card rendering and load the summary modal on demand when clicked.")
    ]
    for i, (m_name, m_size, m_problem, m_fix) in enumerate(monoliths):
        cx = Inches(0.8) + i * Inches(4.0)
        cy = Inches(1.8)
        add_card(s5, cx, cy, Inches(3.64), Inches(5.0))
        tb = s5.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.3), Inches(3.14), Inches(4.4))
        ctf = tb.text_frame
        ctf.word_wrap = True
        
        p = ctf.paragraphs[0]
        p.text = m_name
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.font.name = "Segoe UI"
        
        p_badge = ctf.add_paragraph()
        p_badge.text = f"Current Size: {m_size}"
        p_badge.font.size = Pt(11)
        p_badge.font.bold = True
        p_badge.font.color.rgb = AMBER
        p_badge.font.name = "Segoe UI"
        p_badge.space_before = Pt(2)
        
        p_h1 = ctf.add_paragraph()
        p_h1.text = "THE PROBLEM:"
        p_h1.font.size = Pt(10)
        p_h1.font.bold = True
        p_h1.font.color.rgb = TEXT_MUTED
        p_h1.font.name = "Segoe UI"
        p_h1.space_before = Pt(14)
        
        p_desc1 = ctf.add_paragraph()
        p_desc1.text = m_problem
        p_desc1.font.size = Pt(12)
        p_desc1.font.color.rgb = TEXT_LIGHT
        p_desc1.font.name = "Segoe UI"
        p_desc1.space_before = Pt(4)
        
        p_h2 = ctf.add_paragraph()
        p_h2.text = "THE CLEANUP:"
        p_h2.font.size = Pt(10)
        p_h2.font.bold = True
        p_h2.font.color.rgb = EMERALD
        p_h2.font.name = "Segoe UI"
        p_h2.space_before = Pt(14)
        
        p_desc2 = ctf.add_paragraph()
        p_desc2.text = m_fix
        p_desc2.font.size = Pt(12)
        p_desc2.font.color.rgb = TEXT_LIGHT
        p_desc2.font.name = "Segoe UI"
        p_desc2.space_before = Pt(4)

    # ==========================================================
    # SLIDE 6: Findings 4 & 5 - Noise & Workspace Clutter
    # ==========================================================
    s6 = prs.slides.add_slide(blank_layout)
    apply_bg(s6)
    add_header(s6, "Findings 4 & 5: Background Noise & Root Clutter", "CORE FINDINGS • CODE HYGIENE")

    # Left: Background Noise
    add_card(s6, Inches(0.8), Inches(1.8), Inches(5.6), Inches(5.0))
    tb_l = s6.shapes.add_textbox(Inches(1.1), Inches(2.1), Inches(5.0), Inches(4.4))
    tf_l = tb_l.text_frame
    tf_l.word_wrap = True
    
    p = tf_l.paragraphs[0]
    p.text = "🔇 Finding 4: Developer Sticky Notes"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = SKY
    p.font.name = "Segoe UI"

    bullets_noise = [
        "35 Automated Quality Warnings: Automated checks flag 31 minor errors and 4 warnings across 10 files (unused imports, empty catch blocks).",
        "Active Console Noise: 9 production 'console.log' statements print debug status to the browser console on every keystroke and render.",
        "The Fix: Remove all unused imports, add safe typed error handlers, and silence production logs for a 100% clean, professional build."
    ]
    for b in bullets_noise:
        p = tf_l.add_paragraph()
        p.text = "• " + b
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_before = Pt(14)

    # Right: Root Clutter
    add_card(s6, Inches(6.9), Inches(1.8), Inches(5.6), Inches(5.0))
    tb_r = s6.shapes.add_textbox(Inches(7.2), Inches(2.1), Inches(5.0), Inches(4.4))
    tf_r = tb_r.text_frame
    tf_r.word_wrap = True
    
    p = tf_r.paragraphs[0]
    p.text = "📁 Finding 5: The Cluttered Front Porch"
    p.font.size = Pt(18)
    p.font.bold = True
    p.font.color.rgb = AMBER
    p.font.name = "Segoe UI"

    bullets_clutter = [
        "Out-of-Place Files: Non-production Python scripts ('build_full_book.py', 'build_full_handbook.py') and large PDF files are stored in the root folder alongside website code.",
        "Heavier Syncs: Every git checkout downloads 170 KB of binary PDFs that are not needed by the website runtime.",
        "The Fix: Create a clean dedicated 'docs/handbook/' folder and archive all generator scripts and reference PDFs neatly."
    ]
    for b in bullets_clutter:
        p = tf_r.add_paragraph()
        p.text = "• " + b
        p.font.size = Pt(13)
        p.font.color.rgb = TEXT_LIGHT
        p.font.name = "Segoe UI"
        p.space_before = Pt(14)

    # ==========================================================
    # SLIDE 7: Before vs After Comparison
    # ==========================================================
    s7 = prs.slides.add_slide(blank_layout)
    apply_bg(s7)
    add_header(s7, "The Measurable Payoff: Before vs After", "BUSINESS IMPACT & VALUE")

    rows = [
        ("Download Bundle Weight", "Carries 2 unused packages & heavy types", "Lean, trimmed bundle (~100 KB+ lighter)", EMERALD),
        ("Topic & Search Switching", "Double-renders feed (recalculates twice)", "Instant single-pass render (useMemo)", SKY),
        ("Memory Footprint", "30 hidden modals in device RAM", "Modals instantiate only when requested", INDIGO),
        ("Code Quality & Linting", "35 warnings & errors, active console logs", "0 warnings, 0 errors, silent production console", EMERALD),
        ("Ease of Future Upgrades", "Large 680-line files with mixed logic", "Modular, single-responsibility files", SKY)
    ]

    card_y = Inches(1.8)
    card_h = Inches(0.92)
    for i, (metric, before, after, col) in enumerate(rows):
        cy = card_y + i * Inches(1.02)
        add_card(s7, Inches(0.8), cy, Inches(11.7), card_h)
        
        # Metric
        tb_m = s7.shapes.add_textbox(Inches(1.0), cy + Inches(0.18), Inches(3.2), Inches(0.6))
        tf_m = tb_m.text_frame
        tf_m.word_wrap = True
        p = tf_m.paragraphs[0]
        p.text = metric
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = WHITE
        p.font.name = "Segoe UI"
        
        # Before
        tb_b = s7.shapes.add_textbox(Inches(4.4), cy + Inches(0.18), Inches(3.6), Inches(0.6))
        tf_b = tb_b.text_frame
        tf_b.word_wrap = True
        p = tf_b.paragraphs[0]
        p.text = "BEFORE: " + before
        p.font.size = Pt(11)
        p.font.color.rgb = RGBColor(248, 113, 113) # Red 400
        p.font.name = "Segoe UI"
        
        # After
        tb_a = s7.shapes.add_textbox(Inches(8.2), cy + Inches(0.18), Inches(4.1), Inches(0.6))
        tf_a = tb_a.text_frame
        tf_a.word_wrap = True
        p = tf_a.paragraphs[0]
        p.text = "AFTER: " + after
        p.font.size = Pt(11)
        p.font.bold = True
        p.font.color.rgb = col
        p.font.name = "Segoe UI"

    # ==========================================================
    # SLIDE 8: The 3-Step Action Plan
    # ==========================================================
    s8 = prs.slides.add_slide(blank_layout)
    apply_bg(s8)
    add_header(s8, "Recommended Roadmap: The 3-Step Plan", "EXECUTION STRATEGY")

    phases = [
        ("Step 1: The Quick Win", "15 Minutes • Zero Risk",
         "• Remove dead packages ('rss-parser', 'uuid')\n"
         "• Clear all 35 ESLint warnings & dead imports\n"
         "• Silence all production 'console.log' statements\n"
         "• Align React 18 types for flawless stability\n\n"
         "Result: 100% clean, error-free build with zero visual changes.",
         EMERALD),
        ("Step 2: Smooth Engine", "30 Minutes • Performance",
         "• Convert feed filtering to single-pass 'useMemo'\n"
         "• Eliminate double-rendering on topic clicks\n"
         "• Memoize context providers to stop wasted re-renders\n"
         "• Optimize card memory footprint\n\n"
         "Result: Noticeably faster browsing, lower battery drain.",
         SKY),
        ("Step 3: Room Makeover", "Modular Architecture",
         "• Split ArticlePage into Sentiment & Explainer helpers\n"
         "• Separate Market Ribbon from Watchlist Modal\n"
         "• Move handbook PDFs and scripts to 'docs/' archive\n"
         "• Write clean project README and documentation\n\n"
         "Result: Code becomes lean, beautiful, and easy to expand.",
         INDIGO)
    ]
    for i, (p_title, p_time, p_content, col) in enumerate(phases):
        cx = Inches(0.8) + i * Inches(4.0)
        cy = Inches(1.8)
        add_card(s8, cx, cy, Inches(3.64), Inches(5.0))
        tb = s8.shapes.add_textbox(cx + Inches(0.25), cy + Inches(0.3), Inches(3.14), Inches(4.4))
        ctf = tb.text_frame
        ctf.word_wrap = True
        
        p = ctf.paragraphs[0]
        p.text = p_title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = col
        p.font.name = "Segoe UI"
        
        p_badge = ctf.add_paragraph()
        p_badge.text = p_time
        p_badge.font.size = Pt(11)
        p_badge.font.bold = True
        p_badge.font.color.rgb = TEXT_MUTED
        p_badge.font.name = "Segoe UI"
        p_badge.space_before = Pt(2)
        
        for block in p_content.split("\n\n"):
            p_b = ctf.add_paragraph()
            p_b.text = block
            p_b.font.size = Pt(12)
            p_b.font.color.rgb = TEXT_LIGHT
            p_b.font.name = "Segoe UI"
            p_b.space_before = Pt(12)

    prs.save(filename)
    print(f"✅ PowerPoint Presentation successfully saved to: {filename}")
    return filename

if __name__ == "__main__":
    create_deck()
