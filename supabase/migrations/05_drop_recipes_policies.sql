-- Drop all RLS policies from the recipes table
-- This resolves the Supabase security warnings about having policies defined
-- but RLS disabled. Since we intentionally disabled RLS for this public cache table,
-- we should also remove the policies.

-- Drop the policies if they exist
drop policy if exists "Anyone can insert recipes" on recipes;
drop policy if exists "Recipes are viewable by everyone" on recipes;
drop policy if exists "Enable all access for all users" on recipes;
drop policy if exists "Enable read access for all users" on recipes;
drop policy if exists "Enable insert access for all users" on recipes;
drop policy if exists "Enable update access for all users" on recipes;
