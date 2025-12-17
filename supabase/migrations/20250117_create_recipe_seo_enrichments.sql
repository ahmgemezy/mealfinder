-- Create table for SEO enrichments cache
CREATE TABLE IF NOT EXISTS recipe_seo_enrichments (
  recipe_id TEXT PRIMARY KEY,
  faq JSONB,
  meta_description TEXT,
  keywords TEXT[],
  cultural_snippet TEXT,
  related_recipes TEXT[],
  related_posts TEXT[],
  enriched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups by recipe_id (already primary key, but explicit for clarity)
COMMENT ON TABLE recipe_seo_enrichments IS 'SEO metadata cache for recipes generated via JINA.ai';

-- Index on enriched_at for cache invalidation queries
CREATE INDEX idx_recipe_seo_enrichments_enriched_at ON recipe_seo_enrichments(enriched_at);
