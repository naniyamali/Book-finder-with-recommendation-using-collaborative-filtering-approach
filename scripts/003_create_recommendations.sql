-- Create recommendations table for collaborative filtering
create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recommended_book_id text not null,
  recommended_book_title text,
  recommended_book_author text,
  recommended_book_cover_url text,
  score decimal(5,2) not null default 0.0,
  reason text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.recommendations enable row level security;

-- RLS Policies for recommendations
create policy "Users can view their own recommendations"
  on public.recommendations for select
  using (auth.uid() = user_id);

create policy "Users can insert their own recommendations"
  on public.recommendations for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own recommendations"
  on public.recommendations for update
  using (auth.uid() = user_id);

create policy "Users can delete their own recommendations"
  on public.recommendations for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists recommendations_user_id_idx on public.recommendations(user_id);
create index if not exists recommendations_score_idx on public.recommendations(score desc);
create index if not exists recommendations_created_at_idx on public.recommendations(created_at desc);

-- Create unique constraint
create unique index if not exists recommendations_user_book_unique 
  on public.recommendations(user_id, recommended_book_id);
