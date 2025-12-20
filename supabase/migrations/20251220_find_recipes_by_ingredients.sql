-- Function to search recipes by ingredients (case-insensitive partial match on ingredient names)
-- Returns recipes where ANY of the input ingredients match ANY of the recipe's ingredients.
-- Ordered by number of matches (descending).

CREATE OR REPLACE FUNCTION find_recipes_by_ingredients(
  search_ingredients text[],
  match_threshold int DEFAULT 1
)
RETURNS SETOF recipes
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT r.*
  FROM recipes r,
       -- Extract ingredient names from the JSONB array
       LATERAL (
         SELECT array_agg(LOWER(ele->>'name')) as names
         FROM jsonb_array_elements(r.data->'ingredients') ele
       ) ing
  WHERE 
    -- STRICT MATCHING: The number of search terms that match at least one recipe ingredient
    -- must equal the total number of search terms.
    (
      SELECT count(DISTINCT s_term)
      FROM unnest(search_ingredients) s_term
      WHERE EXISTS (
        SELECT 1 
        FROM unnest(ing.names) r_ing
        WHERE r_ing ILIKE ('%' || s_term || '%')
      )
    ) = array_length(search_ingredients, 1)
  ORDER BY 
    -- Rank by number of matching ingredients
    (
      SELECT count(*)
      FROM unnest(ing.names) i_name
      WHERE i_name = ANY(
        SELECT LOWER(x) FROM unnest(search_ingredients) x
      )
    ) DESC;
END;
$$;
