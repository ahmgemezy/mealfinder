-- Drop potentially conflicting or incomplete policies
drop policy if exists "Recipes are viewable by everyone" on recipes;
drop policy if exists "Anyone can insert recipes" on recipes;
drop policy if exists "Anyone can update recipes" on recipes;

-- Create a single, comprehensive policy that allows everything
-- This covers SELECT, INSERT, UPDATE, and DELETE
create policy "Enable all access for all users"
on recipes
for all
using (true)
with check (true);
