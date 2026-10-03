-- Create saved_articles table for cross-device bookmark syncing
create table if not exists public.saved_articles (
  id text not null,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  link text,
  pub_date text,
  content text,
  image text,
  source text,
  created_at timestamptz default now(),
  primary key (id, user_id)
);

-- Ensure columns exist
alter table public.saved_articles add column if not exists link text;
alter table public.saved_articles add column if not exists pub_date text;
alter table public.saved_articles add column if not exists content text;
alter table public.saved_articles add column if not exists image text;

-- Enable Row Level Security
alter table public.saved_articles enable row level security;

-- Policies for authenticated users
do $$ 
begin
  if not exists (
    select 1 from pg_policies 
    where tablename = 'saved_articles' 
    and policyname = 'Users can read own saved articles'
  ) then
    create policy "Users can read own saved articles"
      on public.saved_articles for select
      to authenticated
      using (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'saved_articles' 
    and policyname = 'Users can insert own saved articles'
  ) then
    create policy "Users can insert own saved articles"
      on public.saved_articles for insert
      to authenticated
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies 
    where tablename = 'saved_articles' 
    and policyname = 'Users can delete own saved articles'
  ) then
    create policy "Users can delete own saved articles"
      on public.saved_articles for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end $$;
