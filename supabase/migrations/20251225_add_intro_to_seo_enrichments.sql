-- Add intro column to recipe_seo_enrichments
ALTER TABLE recipe_seo_enrichments
ADD COLUMN IF NOT EXISTS intro TEXT;
