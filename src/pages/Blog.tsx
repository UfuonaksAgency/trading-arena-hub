import { useState, useEffect } from 'react';
import { Search, BookOpen, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  featured_image_url?: string;
  tags?: string[];
  reading_time?: number;
  published_at?: string;
  author_id: string;
  view_count?: number;
  is_featured: boolean;
  content: string;
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    // Health check
    fetch('/health.json')
      .then(res => res.json())
      .then(data => console.log('Deployment health:', data))
      .catch(err => console.error('Health check failed:', err));

    fetchPosts();
    
    // Set up real-time subscription for view count updates
    const channel = supabase
      .channel('blog-views')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'blog_posts',
          filter: 'is_published=eq.true'
        },
        (payload) => {
          // Update the specific post in our state
          setPosts(currentPosts => 
            currentPosts.map(post => 
              post.id === payload.new.id 
                ? { ...post, view_count: payload.new.view_count }
                : post
            )
          );
          
          // Also update featured posts if needed
          setFeaturedPosts(currentFeatured =>
            currentFeatured.map(post =>
              post.id === payload.new.id
                ? { ...post, view_count: payload.new.view_count }
                : post
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      setError(null);
      
      // Fetch all published blog posts
      const { data: allPosts, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .order('published_at', { ascending: false });

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw new Error(`Failed to load blog posts: ${fetchError.message}`);
      }

      const posts = (allPosts || []) as BlogPost[];
      
      if (posts.length === 0) {
        console.warn('No published blog posts found');
      }
      
      setPosts(posts);

      // Separate featured posts
      const featured = posts.filter(post => post.is_featured).slice(0, 3);
      setFeaturedPosts(featured);

      // Extract unique tags
      const tags = [...new Set(posts.flatMap(post => post.tags || []))];
      setAllTags(tags);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError(error instanceof Error ? error.message : 'Failed to load blog posts');
      setPosts([]);
      setFeaturedPosts([]);
      setAllTags([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTag = !selectedTag || post.tags?.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
          <div className="text-white text-lg">Loading blog posts...</div>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-white text-2xl font-bold mb-4">Unable to Load Blog</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="btn-primary">
              Retry
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div 
        className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black"
        style={{
          minHeight: '100vh',
          opacity: 1,
          visibility: 'visible',
          WebkitBackfaceVisibility: 'hidden',
        }}
        data-ios-safe="true"
      >
        <noscript>
          <div style={{ padding: '2rem', color: 'white', textAlign: 'center' }}>
            <h1>JavaScript Required</h1>
            <p>This page requires JavaScript to function. Please enable JavaScript in your browser settings.</p>
          </div>
        </noscript>
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4 animate-fade-in">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white text-sm font-medium mb-8 backdrop-blur-sm bg-white/5">
              <BookOpen className="w-4 h-4 mr-2" />
              Trading Insights & Education
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white">
              Trading <span className="text-primary">Blog</span>
            </h1>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Discover proven trading strategies, market analysis, and insights to elevate your trading journey
            </p>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <section className="py-12 px-4 animate-fade-in">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center mb-8">
                <TrendingUp className="w-6 h-6 text-primary mr-3" />
                <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Posts</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-8">
                {featuredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Search and Filter */}
        <section className="py-12 px-4 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-4 h-4" />
                    <Input
                      type="text"
                      placeholder="Search blog posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                    />
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === '' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag('')}
                    className={selectedTag === '' ? 'btn-primary' : 'btn-ghost'}
                  >
                    All Posts
                  </Button>
                  {allTags.slice(0, 6).map(tag => (
                    <Button
                      key={tag}
                      variant={selectedTag === tag ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedTag(tag)}
                      className={selectedTag === tag ? 'btn-primary' : 'btn-ghost'}
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* All Posts */}
        <section className="py-12 px-4 animate-fade-in">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
              {searchTerm || selectedTag ? 'Search Results' : 'All Posts'}
              <span className="text-white/60 text-lg font-normal ml-2">
                ({filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'})
              </span>
            </h2>
            
            {filteredPosts.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white/70 mb-2">No posts found</h3>
                <p className="text-white/60">
                  {searchTerm || selectedTag 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Check back soon for new trading insights!'
                  }
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Blog;