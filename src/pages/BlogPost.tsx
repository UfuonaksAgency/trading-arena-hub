import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Clock, Tag, ArrowLeft, Eye, Share2, BookOpen } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ScrollReveal } from '@/hooks/useScrollReveal';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  tags?: string[];
  reading_time?: number;
  published_at?: string;
  author_id: string;
  view_count?: number;
  seo_title?: string;
  seo_description?: string;
}

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchPost();
    }
  }, [slug]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      // Fetch the blog post by slug
      const { data: postData, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('is_published', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setNotFound(true);
          return;
        }
        throw error;
      }

      setPost(postData as BlogPost);

      // Increment view count
      await supabase
        .from('blog_posts')
        .update({ view_count: (postData.view_count || 0) + 1 })
        .eq('id', postData.id);

      // Fetch related posts based on tags
      if (postData.tags && postData.tags.length > 0) {
        const { data: relatedData } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('is_published', true)
          .neq('id', postData.id)
          .overlaps('tags', postData.tags)
          .limit(3);

        setRelatedPosts((relatedData || []) as BlogPost[]);
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post?.title,
          text: post?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-lg">Loading blog post...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (notFound || !post) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-center">
            <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Post Not Found</h1>
            <p className="text-white/70 mb-6">The blog post you're looking for doesn't exist.</p>
            <Link to="/blog">
              <Button className="btn-primary">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Back Button */}
        <div className="pt-24 px-4">
          <div className="max-w-4xl mx-auto">
            <Link to="/blog">
              <Button variant="ghost" className="text-white/70 hover:text-white mb-6">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>

        {/* Article Header */}
        <ScrollReveal delay={200} duration={1000}>
          <article className="px-4 pb-8">
            <div className="max-w-4xl mx-auto">
              {post.featured_image_url && (
                <div className="aspect-video mb-8 rounded-xl overflow-hidden">
                  <img 
                    src={post.featured_image_url} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="bg-white/5 border border-white/10 rounded-xl p-8">
                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-white/10 text-white/80 text-sm font-medium rounded-full flex items-center"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-white/60 text-sm mb-8 pb-6 border-b border-white/10">
                  {post.published_at && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(post.published_at)}
                    </div>
                  )}
                  {post.reading_time && (
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      {post.reading_time} min read
                    </div>
                  )}
                  {post.view_count !== undefined && (
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-2" />
                      {post.view_count} views
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="text-white/60 hover:text-white p-0 h-auto"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                {/* Content */}
                <div 
                  className="prose prose-invert prose-lg max-w-none text-white/90 leading-relaxed"
                  style={{ 
                    fontSize: '1.125rem',
                    lineHeight: '1.75'
                  }}
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
              </div>
            </div>
          </article>
        </ScrollReveal>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <ScrollReveal delay={400} duration={800}>
            <section className="py-16 px-4">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-8 text-center">
                  Related Posts
                </h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedPosts.map((relatedPost, index) => (
                    <ScrollReveal key={relatedPost.id} delay={500 + (index * 100)} duration={600}>
                      <BlogCard post={relatedPost} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}
      </div>
      <Footer />
    </>
  );
};

export default BlogPost;