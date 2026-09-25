import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable, Flowable
)
from reportlab.pdfgen import canvas

# Global page mapping for dynamic 2-pass Table of Contents
chapter_page_map = {}

class ChapterMarker(Flowable):
    """Flowable to capture the exact page number of chapters and sections."""
    def __init__(self, key):
        super().__init__()
        self.key = key

    def wrap(self, availWidth, availHeight):
        return 0, 0

    def draw(self):
        chapter_page_map[self.key] = self.canv.getPageNumber()

class BookCanvas(canvas.Canvas):
    """Two-pass canvas for total page count, elegant running headers and footers."""
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
        # Page 1: Cover
        if self._pageNumber == 1:
            self.saveState()
            # Deep Navy background
            self.setFillColor(colors.HexColor("#0B1120"))
            self.rect(0, 0, 8.5 * 72, 11 * 72, fill=True, stroke=False)
            
            # Subtle luxury geometric accent bars
            self.setFillColor(colors.HexColor("#2563EB"))
            self.rect(0, 11 * 72 - 14, 8.5 * 72, 14, fill=True, stroke=False)
            
            self.setFillColor(colors.HexColor("#0EA5E9"))
            self.rect(0, 11 * 72 - 20, 8.5 * 72, 6, fill=True, stroke=False)
            
            self.setFillColor(colors.HexColor("#F59E0B"))
            self.rect(0, 0, 8.5 * 72, 12, fill=True, stroke=False)
            self.restoreState()
            return

        # Pages 2, 3, 4: Imprint, Dedication (suppress header, allow footer)
        if self._pageNumber in [2, 3, 4]:
            self.saveState()
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            page_str = f"Page {self._pageNumber}"
            self.drawRightString(8.5 * 72 - 54, 36, page_str)
            self.drawString(54, 36, "Keywords News — Engineering Handbook & Retrospective")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 46, 8.5 * 72 - 54, 46)
            self.restoreState()
            return

        # Regular book pages (running header and footer)
        self.saveState()
        self.setFont("Helvetica-Bold", 7.5)
        self.setFillColor(colors.HexColor("#334155"))
        self.drawString(54, 11 * 72 - 36, "KEYWORDS NEWS")
        
        self.setFont("Helvetica", 7.5)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(138, 11 * 72 - 36, "—  ENGINEERING HANDBOOK & TECHNICAL SPECIFICATION")
        self.drawRightString(8.5 * 72 - 54, 11 * 72 - 36, "EDITION 2.0 (SEPTEMBER 2026)")
        
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)
        
        # Footer
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        page_str = f"Page {self._pageNumber} of {total_pages}"
        self.drawRightString(8.5 * 72 - 54, 36, page_str)
        self.drawString(54, 36, "Confidential & Proprietary  •  Live Production: keywordnews.netlify.app")
        self.line(54, 46, 8.5 * 72 - 54, 46)
        
        self.restoreState()

def get_book_styles():
    """Generates consistent typography hierarchy for the book."""
    styles = getSampleStyleSheet()
    
    PRIMARY = colors.HexColor("#0F172A")    # Deep Slate / Navy
    SECONDARY = colors.HexColor("#1D4ED8")  # Royal Blue
    ACCENT = colors.HexColor("#0284C7")     # Sky Blue
    DARK_BG = colors.HexColor("#1E293B")    # Slate 800
    LIGHT_BG = colors.HexColor("#F8FAFC")   # Slate 50
    BORDER = colors.HexColor("#CBD5E1")     # Slate 300
    TEXT_MAIN = colors.HexColor("#334155")  # Slate 700
    TEXT_MUTED = colors.HexColor("#64748B") # Slate 500
    
    s = {}
    
    s['Body'] = ParagraphStyle(
        'BookBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=15,
        textColor=TEXT_MAIN,
        spaceAfter=7
    )
    
    s['BodyBold'] = ParagraphStyle(
        'BookBodyBold',
        parent=s['Body'],
        fontName='Helvetica-Bold'
    )
    
    s['BodyItalic'] = ParagraphStyle(
        'BookBodyItalic',
        parent=s['Body'],
        fontName='Helvetica-Oblique'
    )
    
    s['Bullet'] = ParagraphStyle(
        'BookBullet',
        parent=s['Body'],
        leftIndent=16,
        firstLineIndent=-10,
        spaceAfter=5
    )
    
    s['PartNumber'] = ParagraphStyle(
        'BookPartNumber',
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        alignment=1,
        spaceAfter=6
    )
    
    s['PartTitle'] = ParagraphStyle(
        'BookPartTitle',
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        alignment=1,
        spaceAfter=12
    )
    
    s['PartSubtitle'] = ParagraphStyle(
        'BookPartSubtitle',
        fontName='Helvetica-Oblique',
        fontSize=11,
        leading=16,
        textColor=TEXT_MUTED,
        alignment=1,
        spaceAfter=20
    )
    
    s['ChapterTitle'] = ParagraphStyle(
        'BookChapterTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=17,
        leading=22,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    s['H2'] = ParagraphStyle(
        'BookH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=17,
        textColor=SECONDARY,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )
    
    s['H3'] = ParagraphStyle(
        'BookH3',
        parent=styles['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=15,
        textColor=PRIMARY,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    s['Code'] = ParagraphStyle(
        'BookCode',
        fontName='Courier',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#F1F5F9"),
        spaceAfter=0
    )
    
    s['AlertText'] = ParagraphStyle(
        'BookAlertText',
        parent=s['Body'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#1E3A8A"),
        spaceAfter=0
    )
    
    s['CaseStudyText'] = ParagraphStyle(
        'BookCaseStudyText',
        parent=s['Body'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=colors.HexColor("#78350F"),
        spaceAfter=0
    )
    
    return s

def add_code_block(code_text, styles, max_lines=26):
    """Formats code in pristine dark-themed boxes, chunked so ReportLab can paginate without overflowing."""
    code_style = styles['Code']
    lines = code_text.strip().split('\n')
    
    flowables = [Spacer(1, 4)]
    for i in range(0, len(lines), max_lines):
        chunk = lines[i:i + max_lines]
        paragraphs = [
            Paragraph(l.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace(' ', '&nbsp;'), code_style)
            for l in chunk
        ]
        t = Table([[paragraphs]], colWidths=[504])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor("#0F172A")),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('BOX', (0, 0), (-1, -1), 1, colors.HexColor("#334155")),
        ]))
        flowables.append(t)
        flowables.append(Spacer(1, 3))
    flowables.append(Spacer(1, 5))
    return flowables

def add_callout(title, text, styles, kind="info"):
    """Creates beautiful colored callout boxes for tips, warnings, and architectural tenets."""
    if kind == "warning":
        bg_col = colors.HexColor("#FEF2F2")
        border_col = colors.HexColor("#EF4444")
        text_col = colors.HexColor("#991B1B")
        box_border = colors.HexColor("#FECACA")
    elif kind == "case_study":
        bg_col = colors.HexColor("#FFFBEB")
        border_col = colors.HexColor("#F59E0B")
        text_col = colors.HexColor("#92400E")
        box_border = colors.HexColor("#FDE68A")
    else: # info
        bg_col = colors.HexColor("#EFF6FF")
        border_col = colors.HexColor("#3B82F6")
        text_col = colors.HexColor("#1E40AF")
        box_border = colors.HexColor("#BFDBFE")

    p_title = Paragraph(f"<b>{title.upper()}</b>", ParagraphStyle(
        'CalloutTitle', fontName='Helvetica-Bold', fontSize=8.5, leading=12, textColor=text_col
    ))
    p_text = Paragraph(text, ParagraphStyle(
        'CalloutBody', fontName='Helvetica', fontSize=8.5, leading=13, textColor=text_col
    ))
    
    t = Table([[p_title], [p_text]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_col),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LINELEFT', (0, 0), (0, -1), 3.5, border_col),
        ('BOX', (0, 0), (-1, -1), 0.5, box_border),
    ]))
    return [Spacer(1, 4), t, Spacer(1, 8)]

def add_table(header, rows, col_widths, styles):
    """Renders high-grade styled tables with alternating row shading."""
    DARK_BG = colors.HexColor("#1E293B")
    LIGHT_BG = colors.HexColor("#F8FAFC")
    BORDER = colors.HexColor("#CBD5E1")
    
    table_data = []
    header_cells = [Paragraph(f"<b>{h}</b>", ParagraphStyle('TH', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.white)) for h in header]
    table_data.append(header_cells)
    
    for row in rows:
        row_cells = []
        for cell in row:
            if isinstance(cell, str):
                row_cells.append(Paragraph(cell, ParagraphStyle('TD', fontName='Helvetica', fontSize=8, leading=11.5, textColor=colors.HexColor("#334155"))))
            else:
                row_cells.append(cell)
        table_data.append(row_cells)
        
    t = Table(table_data, colWidths=col_widths)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), DARK_BG),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 5),
        ('TOPPADDING', (0, 0), (-1, 0), 5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, LIGHT_BG]),
        ('TOPPADDING', (0, 1), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ]))
    return [Spacer(1, 4), t, Spacer(1, 8)]
