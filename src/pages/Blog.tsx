import { useState, useEffect } from 'react';
import { Search, BookOpen, TrendingUp } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BlogCard from '@/components/BlogCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { ScrollReveal } from '@/hooks/useScrollReveal';

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
}

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      // For now, return empty array until blog_posts table exists
      setPosts([]);
      setFeaturedPosts([]);
      setAllTags([]);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
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

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Hero Section */}
        <section className="pt-24 pb-12 px-4">
          <ScrollReveal delay={200} duration={1000}>
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
          </ScrollReveal>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <ScrollReveal delay={300} duration={800}>
            <section className="py-12 px-4">
              <div className="max-w-6xl mx-auto">
                <div className="flex items-center mb-8">
                  <TrendingUp className="w-6 h-6 text-primary mr-3" />
                  <h2 className="text-2xl md:text-3xl font-bold text-white">Featured Posts</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {featuredPosts.map((post, index) => (
                    <ScrollReveal key={post.id} delay={400 + (index * 100)} duration={600}>
                      <BlogCard post={post} />
                    </ScrollReveal>
                  ))}
                </div>
              </div>
            </section>
          </ScrollReveal>
        )}

        {/* Search and Filter */}
        <ScrollReveal delay={500} duration={800}>
          <section className="py-12 px-4">
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
        </ScrollReveal>

        {/* All Posts */}
        <ScrollReveal delay={600} duration={800}>
          <section className="py-12 px-4">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
                {searchTerm || selectedTag ? 'Search Results' : 'All Posts'}
                <span className="text-white/60 text-lg font-normal ml-2">
                  ({filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'})
                </span>
              </h2>
              
              {filteredPosts.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post, index) => (
                    <ScrollReveal key={post.id} delay={700 + (index * 50)} duration={600}>
                      <BlogCard post={post} />
                    </ScrollReveal>
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
        </ScrollReveal>
      </div>
      <Footer />
    </>
  );
};

export default Blog;