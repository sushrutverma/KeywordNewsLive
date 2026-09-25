from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block, add_table

def build_part4(styles):
    story = []
    
    PRIMARY = colors.HexColor("#0F172A")
    SECONDARY = colors.HexColor("#1D4ED8")
    
    # =========================================================================
    # PART IV TITLE PAGE
    # =========================================================================
    story.append(Spacer(1, 140))
    story.append(Paragraph("PART IV", styles['PartNumber']))
    story.append(Paragraph("THE OPERATOR'S PLAYBOOK", styles['PartTitle']))
    story.append(HRFlowable(width="60%", thickness=2, color=SECONDARY, spaceAfter=14, spaceBefore=6, hAlign='CENTER'))
    story.append(Paragraph("Operational Runbooks, Infrastructure Ownership, Developer Setup, and Emergency Incident Protocols", styles['PartSubtitle']))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 14: ENVIRONMENT VARIABLES & INFRASTRUCTURE OWNERSHIP
    # =========================================================================
    story.append(ChapterMarker("ch14"))
    story.append(Paragraph("Chapter 14: Environment Variables, Secrets & Infrastructure Ownership", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "For non-technical owners and new software maintainers, this chapter establishes the exact directory of third-party platforms, "
        "billing accounts, credentials, and security rules governing Keywords News:",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>14.1 The Iron Rule of Frontend Secrets in Vite</b>", styles['H2']))
    story.extend(add_callout(
        "CRITICAL SECURITY BOUNDARY",
        "In Vite, any environment variable prefixed with VITE_ (such as VITE_SUPABASE_ANON_KEY) is compiled directly into the public client "
        "JavaScript bundle. It is visible to ANYONE who opens browser Developer Tools.<br/>"
        "1. VITE_SUPABASE_ANON_KEY is safe to be public ONLY because Supabase Row Level Security (RLS) protects the database.<br/>"
        "2. SUPABASE_SECRET_KEY / SERVICE_ROLE must NEVER have a VITE_ prefix, must NEVER be placed in client code, and must NEVER be committed to Git.",
        styles,
        kind="warning"
    ))
    
    story.append(Paragraph("<b>14.2 Complete Credentials Directory:</b>", styles['H2']))
    env_rows = [
        ["Variable Name", "Required By", "Sample Format", "Provider Location"],
        ["VITE_SUPABASE_URL", "Frontend / Vite", "https://[ref].supabase.co", "Supabase Dashboard → Settings → API"],
        ["VITE_SUPABASE_ANON_KEY", "Frontend / Vite", "sb_publishable_[token]", "Supabase Dashboard → Settings → API (anon/public)"],
        ["VITE_MISTRAL_API_KEY", "Frontend (aiService)", "32-char alphanumeric", "console.mistral.ai → API Keys"],
        ["VITE_MISTRAL_MODEL", "Optional Override", "open-mistral-nemo", "Defaults to open-mistral-nemo"],
        ["SUPABASE_URL", "Backend Scripts", "https://[ref].supabase.co", "Supabase Dashboard → Settings → API"],
        ["SUPABASE_SECRET_KEY", "Admin Scripts", "sb_secret_[token] (Secret!)", "Supabase Dashboard → Settings → API (service_role)"],
        ["RESEND_API_KEY", "Email Digest", "re_[token]", "resend.com → API Keys"]
    ]
    story.extend(add_table(env_rows[0], env_rows[1:], [130, 94, 140, 140], styles))
    
    story.append(Paragraph("<b>14.3 Third-Party Service Ownership & Quota Matrix:</b>", styles['H2']))
    service_matrix = [
        ["Service", "Identifier / Project Ref", "Monthly Quotas", "What to Do If Quota Exceeded"],
        ["Netlify", "keywordnews.netlify.app\nID: a0e3c54d-6a5c-43f1-b924-adfe8423ef82", "100 GB Bandwidth\n300 Build Minutes", "Upgrade to Pro ($19/mo) or migrate to Cloudflare Pages."],
        ["Supabase", "Project: jwksmchxpprxkpbsmhxo\nRegion: ap-south-1 (Mumbai)", "500 MB DB\n50,000 MAUs\n500,000 Edge Invocations", "Upgrade to Supabase Pro ($25/mo) if active users exceed 50k."],
        ["Mistral AI", "open-mistral-nemo\nConsole: console.mistral.ai", "Pay-as-you-go credit pool\n($0.15 / 1M tokens)", "Add prepaid credits if summaries return 401 or 429."],
        ["Resend", "Domain: keywordnews.app\nConsole: resend.com", "3,000 emails / month", "Upgrade to Pro ($20/mo) when newsletter list exceeds 3k."],
        ["GitHub", "sushrutverma/KeywordNewsLive", "Unlimited Git storage", "Primary repository home for version control."]
    ]
    story.extend(add_table(service_matrix[0], service_matrix[1:], [75, 145, 130, 154], styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 15: DEVELOPER SETUP & PRODUCTION DEPLOYMENT
    # =========================================================================
    story.append(ChapterMarker("ch15"))
    story.append(Paragraph("Chapter 15: Developer Setup, Local Workflows & Production Deployment", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "This chapter provides the exact, copy-paste terminal playbook for bootstrapping a new development machine, "
        "compiling production builds, deploying to Netlify without key-masking errors, and tuning bundle performance:",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>15.1 Prerequisites & Operating System Support</b>", styles['H2']))
    story.append(Paragraph(
        "Keywords News is verified to run on macOS (Apple Silicon & Intel), Windows 11 (PowerShell & WSL2), and Ubuntu Linux 22.04+.<br/>"
        "• <b>Node.js:</b> v18.0.0 or higher (v20 or v22 LTS strongly recommended).<br/>"
        "• <b>npm:</b> v9.0.0 or higher.<br/>"
        "• <b>Git:</b> Installed and configured with your SSH key or GitHub Personal Access Token.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>15.2 Local Environment Setup</b>", styles['H2']))
    setup_cmd = """# 1. Clone the repository
git clone https://github.com/sushrutverma/KeywordNewsLive.git
cd KeywordNewsLive

# 2. Install dependencies (verified against package-lock.json)
npm install

# 3. Create your local .env file (ensure VITE_ keys are populated)
# Start local development server (with sub-second Hot Module Replacement)
npm run dev"""
    story.extend(add_code_block(setup_cmd, styles))
    
    story.append(Paragraph("<b>15.3 The Gold-Standard Deployment Recipe</b>", styles['H2']))
    story.append(Paragraph(
        "To prevent Netlify's remote runners from masking your authentic credentials with asterisks, always compile locally and deploy the prebuilt assets:",
        styles['Body']
    ))
    deploy_cmd = """# Step 1: Compile TypeScript & bundle assets locally using verified .env
npm run build

# Step 2: Deploy prebuilt 'dist' directory directly to production with --no-build
node node_modules/netlify/bin/run.js deploy --prod --dir dist --no-build"""
    story.extend(add_code_block(deploy_cmd, styles))
    
    story.append(Paragraph("<b>15.4 Bundle Optimization: Resolving the 500kB Warning</b>", styles['H2']))
    story.append(Paragraph(
        "When running <code>npm run build</code>, Vite outputs a warning that chunks exceed 500kB. "
        "To split vendor libraries into separate, cached bundles, update <code>vite.config.ts</code>:",
        styles['Body']
    ))
    vite_chunk_code = """// vite.config.ts - Production Bundle Splitting
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
    story.extend(add_code_block(vite_chunk_code, styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 16: THE HOW-TO COOKBOOKS
    # =========================================================================
    story.append(ChapterMarker("ch16"))
    story.append(Paragraph("Chapter 16: The How-To Cookbooks: Extending Sources, Topics & Models", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "Keywords News is modular by design. Incoming developers can extend sources, categories, or AI providers "
        "by following these standard recipes:",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>Recipe 16.1: Adding a New RSS News Source</b>", styles['H2']))
    story.append(Paragraph("Open <code>src/services/newsSources.ts</code> and append an entry to <code>news_sources</code>:", styles['Body']))
    r1_code = """{
  name: "Car and Driver",
  url: "https://www.caranddriver.com/rss/all.xml/",
  category: "auto",      // Must match a registered topic ID
  isIndian: false,       // false = International, true = Indian
  richContent: true      // true = Long-form, false = Wire brief
}"""
    story.extend(add_code_block(r1_code, styles))
    
    story.append(Paragraph("<b>Recipe 16.2: Adding a New Topic Vertical</b>", styles['H2']))
    story.append(Paragraph(
        "1. In <code>src/services/newsSources.ts</code>, add the topic object to <code>topics</code>.<br/>"
        "2. Add at least two news sources tagged with this topic ID in <code>news_sources</code>.<br/>"
        "3. In <code>src/contexts/NewsContext.tsx</code>, append the new topic ID to default <code>followedTopics</code>.",
        styles['Body']
    ))
    r2_code = """// Example new topic in src/services/newsSources.ts
{
  id: "aerospace-defense",
  name: "Aerospace & Defense",
  description: "Space exploration, civil aviation, and defense technology."
}"""
    story.extend(add_code_block(r2_code, styles))
    
    story.append(Paragraph("<b>Recipe 16.3: Upgrading or Switching AI Models</b>", styles['H2']))
    story.append(Paragraph("Open <code>src/services/aiService.ts</code> and adjust <code>CANDIDATE_MODELS</code>:", styles['Body']))
    r3_code = """const CANDIDATE_MODELS = [
  import.meta.env.VITE_MISTRAL_MODEL || 'open-mistral-nemo', // Primary
  'open-mistral-7b',                                         // Fallback Tier 2
  'mistral-tiny'                                             // Fallback Tier 3
];"""
    story.extend(add_code_block(r3_code, styles))
    story.append(PageBreak())

    # =========================================================================
    # CHAPTER 17: QUALITY ASSURANCE & EMERGENCY RUNBOOK
    # =========================================================================
    story.append(ChapterMarker("ch17"))
    story.append(Paragraph("Chapter 17: Quality Assurance Checklist & Emergency Incident Runbook", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph("<b>17.1 Pre-Flight 5-Point Non-Technical QA Checklist</b>", styles['H2']))
    story.append(Paragraph(
        "Before approving any pull request or deploying an update, execute this 3-minute manual test suite:",
        styles['Body']
    ))
    
    qa_suite = [
        ("1. The 70/30 Regional Ratio Test", "Open homepage. Count 10 consecutive articles in the Bento feed. Confirm approximately 7 originate from Indian publications and 3 from international sources."),
        ("2. Round-Robin Diversity Test", "Inspect the publisher badges. Verify that the same news outlet never appears twice in succession."),
        ("3. Reader Mode Test", "Click any article card. Confirm the in-app Reader Mode renders clean typography without advertising banners or raw HTML artifacts."),
        ("4. AI Summary & Explainer Test", "Click 'Generate AI Summary'. Highlight a term (e.g. 'Fiscal Deficit') and confirm the floating tooltip produces a 2-sentence explanation."),
        ("5. Auth & Onboarding Sync", "Create a test account. Complete the 3 onboarding steps. Verify that the user profile is written to Supabase public.profiles.")
    ]
    for q_num, q_desc in qa_suite:
        story.append(Paragraph(f"• <b>{q_num}:</b> {q_desc}", styles['Bullet']))
        
    story.append(Spacer(1, 6))
    story.append(Paragraph("<b>17.2 Emergency Incident Runbook</b>", styles['H2']))
    
    incidents = [
        ("Incident A: Empty Feed / Articles Stopped Loading",
         "1. Check if Netlify keys were masked: search dist/assets/index-xxx.js for '****'. If found, redeploy locally with --no-build.<br/>"
         "2. Clear browser cache: Open DevTools → Application → Local Storage → Delete news_cache_v2.<br/>"
         "3. Test Supabase Edge Proxy health in terminal:<br/>"
         "<code>node -e \"fetch('https://jwksmchxpprxkpbsmhxo.supabase.co/functions/v1/rss-proxy?url=https%3A%2F%2Fwww.thehindu.com%2Ffeeder%2Fdefault.rss', { headers: { Authorization: 'Bearer [ANON_KEY]' } }).then(r => console.log('STATUS:', r.status))\"</code>"),
        
        ("Incident B: AI Summaries Fail with 401 or 429",
         "1. Verify VITE_MISTRAL_API_KEY in .env.<br/>"
         "2. If 429 (Rate Limit), log in to console.mistral.ai and verify account billing credit balance.<br/>"
         "3. aiService.ts will automatically attempt fallback to open-mistral-7b and mistral-tiny."),
        
        ("Incident C: Page Refresh Returns Netlify 404",
         "1. Confirm public/_redirects exists and contains: /*  /index.html  200<br/>"
         "2. Confirm netlify.toml exists in root and contains [[redirects]] from = '/*' to = '/index.html' status = 200.")
    ]
    for inc_title, inc_steps in incidents:
        story.append(Paragraph(f"<b>{inc_title}</b>", styles['H3']))
        story.append(Paragraph(inc_steps, styles['Body']))
        story.append(Spacer(1, 3))
        
    story.append(PageBreak())
    return story
