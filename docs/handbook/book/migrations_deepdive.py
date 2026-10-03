from reportlab.platypus import Paragraph, Spacer, Table, TableStyle, PageBreak, HRFlowable
from reportlab.lib import colors
from book.styles import ChapterMarker, add_callout, add_code_block

def build_migrations_deepdive(styles):
    story = []
    
    PRIMARY = colors.HexColor("#0F172A")
    SECONDARY = colors.HexColor("#1D4ED8")
    
    # =========================================================================
    # CHAPTER 12B: ALL SUPABASE MIGRATIONS UNABRIDGED
    # =========================================================================
    story.append(ChapterMarker("ch12b"))
    story.append(Paragraph("Chapter 12B: Complete Supabase Migrations & Database Evolution", styles['ChapterTitle']))
    story.append(HRFlowable(width="100%", thickness=1, color=SECONDARY, spaceAfter=14, spaceBefore=4))
    
    story.append(Paragraph(
        "To ensure complete architectural independence, this chapter presents all five PostgreSQL database migrations "
        "chronologically, exactly as committed under <code>supabase/migrations/</code>, along with architectural commentary "
        "explaining why each change was introduced.",
        styles['Body']
    ))
    
    story.append(Paragraph("<b>12B.1 Migration 1: The Initial Profiles Table (June 3, 2025)</b>", styles['H2']))
    story.append(Paragraph(
        "File: <code>supabase/migrations/20250603185832_floating_lagoon.sql</code><br/>"
        "<i>Purpose: Scaffold the initial public.profiles table tied to auth.users, establish Row Level Security, "
        "and define basic duration filtering.</i>",
        styles['BodyItalic']
    ))
    
    m1_code = """-- Migration: 20250603185832_floating_lagoon.sql
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  article_duration_filter text DEFAULT '7 days',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);"""
    story.extend(add_code_block(m1_code, styles))
    
    story.append(Paragraph("<b>12B.2 Migration 2: Idempotent Policy Fixes (June 4, 2025)</b>", styles['H2']))
    story.append(Paragraph(
        "File: <code>supabase/migrations/20250604170124_spring_plain.sql</code><br/>"
        "<i>Purpose: Resolved deployment conflicts by wrapping RLS policy creation in PL/pgSQL existence checks, "
        "and adding an automated trigger to keep updated_at in sync on every row modification.</i>",
        styles['BodyItalic']
    ))
    
    m2_code = """-- Migration: 20250604170124_spring_plain.sql
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  article_duration_filter text DEFAULT '7 days',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();"""
    story.extend(add_code_block(m2_code, styles))
    
    story.append(Paragraph("<b>12B.3 Migration 3: Adding Onboarding & Personalization Fields (August 9, 2026)</b>", styles['H2']))
    story.append(Paragraph(
        "File: <code>supabase/migrations/20260809124900_add_onboarding_fields_to_profiles.sql</code><br/>"
        "<i>Purpose: Expanded the profiles schema to support the 3-step onboarding wizard: storing user full name, "
        "occupation, daily reading goal (minutes), followed topic array, and an INSERT RLS policy.</i>",
        styles['BodyItalic']
    ))
    
    m3_code = """-- Migration: 20260809124900_add_onboarding_fields_to_profiles.sql
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name text,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS reading_goal integer DEFAULT 15,
ADD COLUMN IF NOT EXISTS followed_topics text[] DEFAULT '{}'::text[];

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can insert own profile'
  ) THEN
    CREATE POLICY "Users can insert own profile"
      ON profiles FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;"""
    story.extend(add_code_block(m3_code, styles))
    story.append(PageBreak())
    
    return story
