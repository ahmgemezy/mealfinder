-- Disable Row Level Security (RLS) on the recipes table
-- This completely removes the policy checks, allowing the app to Read and Write freely.
-- Since this table only stores public recipe data from an external API, this is safe.

alter table recipes disable row level security;
