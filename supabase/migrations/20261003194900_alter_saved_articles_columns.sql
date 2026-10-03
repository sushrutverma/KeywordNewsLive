-- Ensure Article fields exist on saved_articles
alter table public.saved_articles add column if not exists link text;
alter table public.saved_articles add column if not exists pub_date text;
alter table public.saved_articles add column if not exists content text;
alter table public.saved_articles add column if not exists image text;

notify pgrst, 'reload schema';
