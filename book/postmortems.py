from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block, add_table

def build_postmortems(styles):
    story = []
    
    PRIMARY = colors.HexColor("#0F172A")
    SECONDARY = colors.HexColor("#1D4ED8")
    
    # =========================================================================
    # CHAPTER 17B: FORMAL PRODUCTION INCIDENT POST-MORTEMS
    # =========================================================================
    story.append(ChapterMarker("ch17b"))
    story.append(Paragraph("Chapter 17B: Formal Incident Post-Mortems & SRE Retrospectives", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "In world-class software engineering organizations, failures are not concealed — they are rigorously analyzed. "
        "Below are the formal Site Reliability Engineering (SRE) post-mortems for the three major production incidents "
        "encountered by Keywords News, structured under standard post-mortem conventions:",
        styles['Body']
    ))
    
    # Post-Mortem 1
    story.append(Paragraph("<b>Post-Mortem 101: The Mistral AI 429 Quota Exhaustion Outage</b>", styles['H2']))
    pm1_meta = [
        ["Date of Incident", "September 12, 2026", "Severity", "P1 (Degraded User Experience)"],
        ["Incident Lead", "Lead AI Systems Architect", "Time to Resolution", "45 Minutes"],
        ["Root Cause", "Concurrent free-tier rate limits on mistral-small-latest model", "Impact", "AI summaries and concept explainers failed with 429 errors."]
    ]
    story.extend(add_table(["Attribute", "Details", "Attribute", "Details"], pm1_meta, [100, 152, 100, 152], styles))
    
    story.append(Paragraph("<b>Timeline:</b>", styles['H3']))
    story.append(Paragraph("• 14:15 IST — User reports AI summaries failing across multiple articles simultaneously.<br/>"
                           "• 14:22 IST — Network tab inspection confirms HTTP 429 (Too Many Requests) returned from api.mistral.ai.<br/>"
                           "• 14:35 IST — Code audit reveals mistral-small-latest shares low concurrency limits on free tier.<br/>"
                           "• 15:00 IST — Upgraded primary model to open-mistral-nemo (12B) and deployed 3-tier fallback chain. Verified resolution.", styles['Body']))
    
    story.append(Paragraph("<b>Preventative Actions:</b>", styles['H3']))
    story.append(Paragraph("1. Implemented input text slicing to 3,000 characters to prevent excessive context consumption.<br/>"
                           "2. Added automatic fallback recursion from 12B Nemo to 7B to Tiny in aiService.ts.<br/>"
                           "3. Configured account billing balance alerts at 20% credit remaining.", styles['Body']))
    story.append(Spacer(1, 8))
    
    # Post-Mortem 2
    story.append(Paragraph("<b>Post-Mortem 102: The Netlify Remote Build Environment Masking Failure</b>", styles['H2']))
    pm2_meta = [
        ["Date of Incident", "September 13, 2026", "Severity", "P0 (Total Service Outage)"],
        ["Incident Lead", "DevOps & Cloud Infrastructure Lead", "Time to Resolution", "60 Minutes"],
        ["Root Cause", "Netlify remote build runner masked Supabase anon key with asterisks", "Impact", "Zero articles loaded on live site; 401 Unauthorized errors."]
    ]
    story.extend(add_table(["Attribute", "Details", "Attribute", "Details"], pm2_meta, [100, 152, 100, 152], styles))
    
    story.append(Paragraph("<b>Timeline:</b>", styles['H3']))
    story.append(Paragraph("• 09:30 IST — User triggers Netlify remote build. Production site deployed successfully.<br/>"
                           "• 09:35 IST — Site shows permanent loading skeleton; console reports 401 Unauthorized from Supabase.<br/>"
                           "• 10:05 IST — Discovered compiled dist/assets/index.js contains literal asterisks (****************KilA).<br/>"
                           "• 10:30 IST — Deployed using local prebuild recipe (npm run build followed by netlify deploy --dir dist --no-build). Production fully restored.", styles['Body']))
    
    story.append(Paragraph("<b>Preventative Actions:</b>", styles['H3']))
    story.append(Paragraph("1. Deprecated all remote builds in netlify.toml and GitHub webhooks.<br/>"
                           "2. Enforced Local Prebuild Gold Standard as the mandatory deployment command.<br/>"
                           "3. Documented credential verification step in developer handbook runbook.", styles['Body']))
    
    story.append(PageBreak())
    return story
