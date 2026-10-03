import os
import sys
from reportlab.lib.pagesizes import letter, landscape
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

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
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748B")) # Slate 500
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 570, "KEYWORD NEWS • EXECUTIVE CODE AUDIT & MODERNIZATION")
            self.drawRightString(738, 570, "OCTOBER 2026")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.5)
            self.line(54, 562, 738, 562)

        # Footer
        self.setFont("Helvetica", 8)
        self.drawString(54, 25, "Confidential • Prepared for Keyword News Leadership")
        self.drawRightString(738, 25, f"Page {self._pageNumber} of {page_count}")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 35, 738, 35)
        self.restoreState()

def build_pdf(filename="Keyword_News_Code_Audit_Report.pdf"):
    # Landscape Letter: 792 x 612 pt
    doc = SimpleDocTemplate(
        filename,
        pagesize=landscape(letter),
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    
    # Custom Palette
    C_PRIMARY = colors.HexColor("#1E293B")   # Slate 800
    C_INDIGO = colors.HexColor("#4F46E5")    # Indigo 600
    C_EMERALD = colors.HexColor("#059669")   # Emerald 600
    C_AMBER = colors.HexColor("#D97706")     # Amber 600
    C_ROSE = colors.HexColor("#E11D48")      # Rose 600
    C_MUTED = colors.HexColor("#64748B")     # Slate 500
    C_BG_CARD = colors.HexColor("#F8FAFC")   # Slate 50
    C_BORDER = colors.HexColor("#E2E8F0")    # Slate 200

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=C_PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=C_MUTED,
        spaceAfter=15
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=22,
        textColor=C_PRIMARY,
        spaceBefore=10,
        spaceAfter=8
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=colors.HexColor("#334155")
    )

    card_title_style = ParagraphStyle(
        'CardTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=C_PRIMARY,
        spaceAfter=4
    )

    story = []

    # ================= PAGE 1: TITLE & EXECUTIVE SUMMARY =================
    tag_p = Paragraph("<font color='#4F46E5'><b>EXECUTIVE REPORT</b></font> • CODEBASE AUDIT & ACTION PLAN", body_style)
    story.append(tag_p)
    story.append(Spacer(1, 4))
    story.append(Paragraph("Keyword News Aggregator", title_style))
    story.append(Paragraph("A Non-Technical Overview of Current Architecture, Optimization Findings, and Performance Strategy", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1, color=C_BORDER, spaceAfter=15))

    # Executive Overview Cards Table
    card1_html = """<b>🏎️ The Good News: Strong Engine</b><br/><br/>
    • Core systems are rock solid: RSS feeds, Supabase database, and Mistral AI summaries run with high reliability.<br/>
    • Sleek modern presentation: Dark mode, layout animations, and responsive cards create a high-end reader experience.<br/>
    • Fully automated SEO: Search-engine pre-rendering and dynamic sitemaps are active on Netlify."""
    
    card2_html = """<b>⚠️ The Opportunity: Spring Cleaning</b><br/><br/>
    • Unused packages: The website is packing and downloading tools it never actually uses (dead weight in the trunk).<br/>
    • Double math: Every topic tap triggers a phantom second recalculation of the news feed.<br/>
    • Component sprawl: Three massive files are doing 5 jobs at once instead of having specialized helpers."""

    t_summary = Table(
        [[Paragraph(card1_html, body_style), Paragraph(card2_html, body_style)]],
        colWidths=[330, 330]
    )
    t_summary.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (0,0), colors.HexColor("#F0FDF4")), # Mint tint
        ('BACKGROUND', (1,0), (1,0), colors.HexColor("#FFFBEB")), # Amber tint
        ('BOX', (0,0), (0,0), 1, colors.HexColor("#BBF7D0")),
        ('BOX', (1,0), (1,0), 1, colors.HexColor("#FDE68A")),
        ('PADDING', (0,0), (-1,-1), 14),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_summary)
    story.append(Spacer(1, 15))

    # 3 High Level Metrics
    m1 = "<b>CURRENT RATING</b><br/><font size='18' color='#059669'><b>B+</b></font><br/>Strong core, ready for clean-up"
    m2 = "<b>TARGET SAVINGS</b><br/><font size='18' color='#4F46E5'><b>~100 KB+</b></font><br/>Prune ghost packages & lean types"
    m3 = "<b>FEED SPEED</b><br/><font size='18' color='#0284C7'><b>Instant (1-Pass)</b></font><br/>Eliminate double-render recalculations"
    
    t_metrics = Table(
        [[Paragraph(m1, body_style), Paragraph(m2, body_style), Paragraph(m3, body_style)]],
        colWidths=[215, 215, 215]
    )
    t_metrics.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_CARD),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('PADDING', (0,0), (-1,-1), 10),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_metrics)

    story.append(PageBreak())

    # ================= PAGE 2: THE 5 AUDIT FINDINGS =================
    story.append(Paragraph("Detailed Audit Findings (In Plain English)", section_heading))
    story.append(Paragraph("Understanding the areas of friction in your current software and how fixing them benefits your users.", subtitle_style))

    findings_data = [
        [
            Paragraph("<b>Finding 1: Dead Baggage in the Trunk</b><br/><font size='8' color='#E11D48'>UNNECESSARY DOWNLOAD PACKAGES</font>", card_title_style),
            Paragraph("The website currently packs two software packages (<code>rss-parser</code> and <code>uuid</code>) into its download bundle that are <b>never imported or used</b> anywhere. Every mobile visitor downloads dozens of kilobytes of ghost code before the feed appears.<br/><b>The Fix:</b> Delete the unused tools immediately with zero visual or functional risk.", body_style)
        ],
        [
            Paragraph("<b>Finding 2: Doing the Same Math Twice</b><br/><font size='8' color='#D97706'>DOUBLE-RENDERING ON TOPIC CLICKS</font>", card_title_style),
            Paragraph("Whenever a reader switches topics or searches, the app displays the articles and then immediately reruns the exact same clustering and ranking math a phantom second time in the background.<br/><b>The Fix:</b> Convert the calculation to <i>'Calculate once and display instantly'</i> (via <code>useMemo</code>) to save battery and boost responsiveness.", body_style)
        ],
        [
            Paragraph("<b>Finding 3: Overcrowded Rooms</b><br/><font size='8' color='#4F46E5'>MONOLITHIC COMPONENT FILES</font>", card_title_style),
            Paragraph("Three components (Article Page, Market Pulse Ribbon, and Article Cards) are doing 5 jobs at once. For example, every single news card on screen loads its own hidden AI summary popup in memory, even if the reader never clicks it.<br/><b>The Fix:</b> Split large files into focused helpers and load popups on demand.", body_style)
        ],
        [
            Paragraph("<b>Finding 4: Developer Sticky Notes</b><br/><font size='8' color='#0284C7'>BACKGROUND CHATTER & 35 WARNINGS</font>", card_title_style),
            Paragraph("The automated code quality scanner flagged <b>35 errors/warnings</b> (unused imports, empty error handlers). Additionally, 9 developer <code>console.log</code> statements print messages to the console on every click.<br/><b>The Fix:</b> Silence production logs and clean all 35 warnings for a 100% clean, professional build.", body_style)
        ],
        [
            Paragraph("<b>Finding 5: The Cluttered Front Porch</b><br/><font size='8' color='#64748B'>ROOT DIRECTORY DOCUMENTATION CLUTTER</font>", card_title_style),
            Paragraph("Old Python book generator scripts and 170 KB of reference PDF handbooks sit in the main project folder next to website code, making git checkouts heavier than necessary.<br/><b>The Fix:</b> Move all non-production manuals and generator scripts into a clean <code>docs/handbook/</code> archive.", body_style)
        ]
    ]

    t_findings = Table(findings_data, colWidths=[200, 460])
    t_findings.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.white),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('PADDING', (0,0), (-1,-1), 8),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_findings)

    story.append(PageBreak())

    # ================= PAGE 3: PAYOFF & 3-STEP ACTION PLAN =================
    story.append(Paragraph("Action Plan & Business Payoff", section_heading))
    story.append(Paragraph("A structured, low-risk roadmap to achieve an ultra-lean, high-performance web app.", subtitle_style))

    # Payoff Comparison Table
    table_data = [
        [Paragraph("<b>Area</b>", body_style), Paragraph("<b>Current State (Before)</b>", body_style), Paragraph("<b>Optimized State (After)</b>", body_style)],
        [Paragraph("<b>Download Weight</b>", body_style), Paragraph("Carries 2 dead packages and bulky types", body_style), Paragraph("<font color='#059669'><b>Lean download (~100 KB+ lighter)</b></font>", body_style)],
        [Paragraph("<b>Topic Switching</b>", body_style), Paragraph("Recalculates feed twice per click", body_style), Paragraph("<font color='#059669'><b>Instant, single-pass render</b></font>", body_style)],
        [Paragraph("<b>Memory Footprint</b>", body_style), Paragraph("30 hidden modals in device RAM", body_style), Paragraph("<font color='#059669'><b>Modals created only when tapped</b></font>", body_style)],
        [Paragraph("<b>Code Warnings</b>", body_style), Paragraph("35 warnings and active console chatter", body_style), Paragraph("<font color='#059669'><b>0 warnings, silent production console</b></font>", body_style)],
        [Paragraph("<b>Future Upgrades</b>", body_style), Paragraph("Harder to modify 680-line mixed files", body_style), Paragraph("<font color='#059669'><b>Clean, modular components</b></font>", body_style)]
    ]
    t_payoff = Table(table_data, colWidths=[130, 260, 270])
    t_payoff.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#F1F5F9")),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('INNERGRID', (0,0), (-1,-1), 0.5, C_BORDER),
        ('PADDING', (0,0), (-1,-1), 6),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(t_payoff)
    story.append(Spacer(1, 14))

    # 3-Step Strategy
    p1_text = """<b>Step 1: The Quick Win (15 Mins)</b><br/>
    • Delete dead packages (<code>rss-parser</code>, <code>uuid</code>)<br/>
    • Clear all 35 code warnings & dead imports<br/>
    • Silence production <code>console.log</code> spam<br/>
    <i>Result: 100% clean, error-free build with zero visual changes.</i>"""

    p2_text = """<b>Step 2: Engine Tune-Up (30 Mins)</b><br/>
    • Convert feed filtering to single-pass <code>useMemo</code><br/>
    • Stop double calculations on topic clicks<br/>
    • Memoize providers to stop wasted re-renders<br/>
    <i>Result: Snappier navigation, cooler device running, lower battery drain.</i>"""

    p3_text = """<b>Step 3: Room Makeover (Modular)</b><br/>
    • Split ArticlePage into Sentiment & Explainer helpers<br/>
    • Separate Market Ribbon from Watchlist Modal<br/>
    • Move reference PDFs & scripts to <code>docs/</code> archive<br/>
    <i>Result: Clean architecture that is joyful to maintain and extend.</i>"""

    t_steps = Table(
        [[Paragraph(p1_text, body_style), Paragraph(p2_text, body_style), Paragraph(p3_text, body_style)]],
        colWidths=[215, 215, 215]
    )
    t_steps.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), C_BG_CARD),
        ('BOX', (0,0), (-1,-1), 1, C_BORDER),
        ('PADDING', (0,0), (-1,-1), 10),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ]))
    story.append(t_steps)

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ Executive PDF Report successfully saved to: {filename}")
    return filename

if __name__ == "__main__":
    build_pdf()
