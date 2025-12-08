-- Initial Schema Migration
-- This migration creates the core tables for the recipe application

-- ============================================================================
-- RECIPES TABLE
-- ============================================================================
-- Stores cached recipe data from external APIs (TheMealDB, Spoonacular)
-- This is a public cache table with no RLS to allow anonymous access

create table if not exists recipes (
  id text primary key,
  data jsonb not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create index for performance on created_at
create index if not exists idx_recipes_created_at on recipes(created_at desc);

-- Disable RLS for recipes table (public cache)
alter table recipes disable row level security;

-- Drop any existing policies (cleanup from previous migrations)
drop policy if exists "Anyone can insert recipes" on recipes;
drop policy if exists "Recipes are viewable by everyone" on recipes;
drop policy if exists "Enable all access for all users" on recipes;
drop policy if exists "Enable read access for all users" on recipes;
drop policy if exists "Enable insert access for all users" on recipes;
drop policy if exists "Enable update access for all users" on recipes;

-- ============================================================================
-- FAVORITES TABLE
-- ============================================================================
-- Stores user's favorite recipes with proper RLS policies

create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipe_id text not null,
  recipe_name text not null,
  recipe_thumbnail text,
  recipe_category text,
  recipe_area text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Ensure a user can't favorite the same recipe twice
  constraint unique_user_recipe unique (user_id, recipe_id)
);

-- Create indexes for performance
create index if not exists idx_favorites_user_id on favorites(user_id);
create index if not exists idx_favorites_created_at on favorites(created_at desc);
create index if not exists idx_favorites_recipe_id on favorites(recipe_id);

-- Enable RLS for favorites table
alter table favorites enable row level security;

-- Drop any existing policies (cleanup)
drop policy if exists "Users can view their own favorites" on favorites;
drop policy if exists "Users can insert their own favorites" on favorites;
drop policy if exists "Users can delete their own favorites" on favorites;

-- RLS Policies for favorites
-- Users can only see their own favorites
create policy "Users can view their own favorites"
  on favorites for select
  using (auth.uid() = user_id);

-- Users can only insert their own favorites
create policy "Users can insert their own favorites"
  on favorites for insert
  with check (auth.uid() = user_id);

-- Users can only delete their own favorites
create policy "Users can delete their own favorites"
  on favorites for delete
  using (auth.uid() = user_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Trigger to automatically update updated_at on recipes table
drop trigger if exists update_recipes_updated_at on recipes;
create trigger update_recipes_updated_at
  before update on recipes
  for each row
  execute function update_updated_at_column();
