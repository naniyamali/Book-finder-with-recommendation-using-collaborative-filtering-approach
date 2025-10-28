-- Create reading_history table to track user book interactions
create table if not exists public.reading_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id text not null,
  book_title text,
  book_author text,
  book_cover_url text,
  action_type text not null check (action_type in ('viewed', 'saved', 'read')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.reading_history enable row level security;

-- RLS Policies for reading_history
create policy "Users can view their own reading history"
  on public.reading_history for select
  using (auth.uid() = user_id);

create policy "Users can insert their own reading history"
  on public.reading_history for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own reading history"
  on public.reading_history for update
  using (auth.uid() = user_id);

create policy "Users can delete their own reading history"
  on public.reading_history for delete
  using (auth.uid() = user_id);

-- Create indexes for faster queries
create index if not exists reading_history_user_id_idx on public.reading_history(user_id);
create index if not exists reading_history_book_id_idx on public.reading_history(book_id);
create index if not exists reading_history_created_at_idx on public.reading_history(created_at desc);

-- Create unique constraint to prevent duplicate entries
create unique index if not exists reading_history_user_book_unique 
  on public.reading_history(user_id, book_id, action_type);
