-- Create the recipes table
create table if not exists recipes (
  id text primary key,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table recipes enable row level security;

-- Allow public read access
create policy "Recipes are viewable by everyone"
  on recipes for select
  using ( true );

-- Allow insert access (for the app to cache recipes)
create policy "Anyone can insert recipes"
  on recipes for insert
  with check ( true );
