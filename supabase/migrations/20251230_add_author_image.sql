
-- Add author_image column to blog_posts table
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS author_image TEXT;

-- Optional: Add a comment to the column
COMMENT ON COLUMN blog_posts.author_image IS 'URL or path to the author avatar image';
