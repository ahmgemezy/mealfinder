-- Create table for localized SEO content (caching translations)
CREATE TABLE IF NOT EXISTS recipe_seo_translations (
  recipe_id TEXT NOT NULL,
  locale TEXT NOT NULL,
  intro TEXT,
  faq JSONB,
  meta_description TEXT,
  keywords TEXT[],
  cultural_snippet TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  PRIMARY KEY (recipe_id, locale)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_recipe_seo_translations_lookup 
ON recipe_seo_translations(recipe_id, locale);

COMMENT ON TABLE recipe_seo_translations IS 'Cache for translated AI-generated SEO content';
