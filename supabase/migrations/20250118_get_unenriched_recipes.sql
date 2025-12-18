-- Function to get recipes that have NOT been enriched yet
-- Efficiently joins recipes with enrichments table
-- Usage: SELECT * FROM get_unenriched_recipes(10);

CREATE OR REPLACE FUNCTION get_unenriched_recipes(limit_count INT)
RETURNS TABLE (id TEXT, data JSONB)
LANGUAGE sql
SECURITY DEFINER -- Run as owner to ensure access
AS $$
  SELECT r.id, r.data
  FROM recipes r
  LEFT JOIN recipe_seo_enrichments s ON r.id = s.recipe_id
  WHERE s.recipe_id IS NULL
  LIMIT limit_count;
$$;
