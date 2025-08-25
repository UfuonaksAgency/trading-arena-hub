-- Update RLS policy to allow view count updates for published posts
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow view count updates for published posts" ON public.blog_posts;

-- Create new policies for blog posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (is_published = true);

CREATE POLICY "Allow view count updates for published posts" 
ON public.blog_posts 
FOR UPDATE 
USING (is_published = true)
WITH CHECK (is_published = true);

-- Initialize some view counts for existing posts (for demo purposes)
UPDATE public.blog_posts 
SET view_count = FLOOR(RANDOM() * 100) + 50
WHERE is_published = true AND (view_count IS NULL OR view_count = 0);