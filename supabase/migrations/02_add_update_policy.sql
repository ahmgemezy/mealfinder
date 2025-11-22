-- Allow update access (required for upsert to work on existing rows)
create policy "Anyone can update recipes"
  on recipes for update
  using ( true )
  with check ( true );
