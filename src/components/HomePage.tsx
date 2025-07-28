
import { useState, useEffect } from 'react';
import { Download, ExternalLink, Calendar, Star, TrendingUp, FileText, BarChart3, Users, Target, Clock, BookOpen, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ScrollReveal } from '@/hooks/useScrollReveal';
import BlogCard from '@/components/BlogCard';

const HomePage = () => {
  const tradingTools = [
    {
      name: 'TradingView',
      description: 'Advanced charting and technical analysis platform',
      icon: BarChart3,
      url: 'https://tradingview.com',
    },
    {
      name: 'Notion',
      description: 'Trading journal and strategy planning workspace',
      icon: FileText,
      url: 'https://notion.so',
    },
    {
      name: 'Coinglass',
      description: 'Crypto market analytics and liquidation data',
      icon: TrendingUp,
      url: 'https://coinglass.com',
    },
    {
      name: 'CoinMarketMan',
      description: 'Portfolio tracking and performance management',
      icon: Target,
      url: '#',
    },
    {
      name: 'BingX',
      description: 'Professional crypto trading exchange',
      icon: TrendingUp,
      url: 'https://bingx.com',
    },
    {
      name: 'WEEX',
      description: 'Advanced derivatives trading platform',
      icon: BarChart3,
      url: '#',
    },
  ];

  const [featuredResources, setFeaturedResources] = useState<any[]>([]);
  const [featuredBlogPosts, setFeaturedBlogPosts] = useState<any[]>([]);

  useEffect(() => {
    fetchFeaturedResources();
    fetchFeaturedBlogPosts();
  }, []);

  const fetchFeaturedResources = async () => {
    try {
      const { data, error } = await supabase
        .from('free_resources')
        .select('*')
        .eq('is_active', true)
        .order('display_order')
        .limit(3);

      if (error) throw error;
      setFeaturedResources(data || []);
    } catch (error) {
      console.error('Error fetching featured resources:', error);
    }
  };

  const fetchFeaturedBlogPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('is_published', true)
        .eq('is_featured', true)
        .order('published_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setFeaturedBlogPosts(data || []);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setFeaturedBlogPosts([]);
    }
  };

  const tradingBrands = ['TradingView', 'Notion', 'Coinglass', 'CoinMarketMan', 'BingX (Exchange)', 'WEEX (Exchange)'];

  const BlogPreviewSection = () => (
    <ScrollReveal delay={600} duration={800}>
      <section className="py-20 px-4 bg-gradient-to-br from-primary/5 to-black/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white text-sm font-medium mb-6 backdrop-blur-sm bg-white/5">
              <BookOpen className="w-4 h-4 mr-2" />
              Latest Trading Insights
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">From the Blog</h2>
            <p className="text-white/80 text-lg">
              Stay updated with the latest trading strategies and market insights
            </p>
          </div>
          
          {featuredBlogPosts.length > 0 ? (
            <>
              <div className="grid md:grid-cols-3 gap-8 mb-12">
                {featuredBlogPosts.map((post, index) => (
                  <ScrollReveal key={post.id} delay={700 + (index * 100)} duration={600}>
                    <BlogCard post={post} />
                  </ScrollReveal>
                ))}
              </div>
              <div className="text-center">
                <Link to="/blog">
                  <Button className="bg-white text-black hover:bg-white/90 px-8 py-3">
                    Read All Posts
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No blog posts available yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>
    </ScrollReveal>
  );

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="simple-hero min-h-screen flex items-center justify-center">
        <ScrollReveal delay={200} duration={1000} distance="50px">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white text-sm font-medium mb-8 backdrop-blur-sm bg-white/5">
              <Star className="w-4 h-4 mr-2" />
              Professional Trading Guidance
            </div>
            <h1 className="stage-light-title text-6xl md:text-8xl font-bold mb-8 text-white tracking-tight">
              Mr. K Trading Arena
            </h1>
            <div className="section-header text-2xl md:text-3xl mb-8 max-w-4xl mx-auto text-white">
              Where Strategy Meets Success
            </div>
            <p className="text-lg md:text-xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Helping traders grow through <span className="text-white font-semibold">free resources</span>, 
              <span className="text-white font-semibold"> proven strategies</span>, and personalized guidance.
              Join thousands who've transformed their trading journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/free-resources">
                <Button className="btn-primary text-lg px-10 py-4">
                  <TrendingUp className="mr-3 h-6 w-6" />
                  Explore Resources
                </Button>
              </Link>
              <Link to="/book-consultation">
                <Button className="btn-ghost text-lg px-10 py-4">
                  <Calendar className="mr-3 h-6 w-6" />
                  Book 30-Min Call
                </Button>
              </Link>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* About Mr. K Section */}
      <ScrollReveal delay={300} duration={800}>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">About Mr. K</h2>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 md:p-12">
              <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-6">
                Professional crypto trader with years of experience navigating volatile markets. 
                I specialize in technical analysis, risk management, and developing winning strategies 
                that consistently generate profits.
              </p>
              <p className="text-white/80 text-base md:text-lg leading-relaxed">
                My mission is simple: <span className="text-white font-semibold">help traders like you make money with crypto trading</span>. 
                Through proven strategies, personalized mentorship, and comprehensive resources, 
                I've helped hundreds of traders transform their approach and achieve financial success.
              </p>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Enhanced Trading Tools Section */}
      <ScrollReveal delay={400} duration={800}>
        <section className="py-20 bg-gradient-to-br from-black/20 to-primary/5 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="stage-light-title text-3xl md:text-4xl font-bold mb-4 text-white">Tools I Use in Trading</h2>
              <p className="text-white/70 text-lg mb-8">Professional-grade platforms and analytics that power my trading success</p>
            </div>
            <div className="relative mb-12">
              <div className="flex animate-scroll-brands md:animate-scroll-brands-md lg:animate-scroll-brands-lg">
                {[...tradingBrands, ...tradingBrands].map((brand, index) => (
                  <div 
                    key={index} 
                    className="text-2xl md:text-3xl font-bold text-white/60 hover:text-white/90 transition-all duration-300 cursor-default whitespace-nowrap mx-12 flex-shrink-0"
                    style={{ fontFamily: 'Dancing Script, cursive' }}
                  >
                    {brand}
                  </div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <Link to="/tools">
                <Button className="bg-white text-black hover:bg-white/90 text-lg px-8 py-4">
                  <ExternalLink className="mr-3 h-5 w-5" />
                  Explore All Tools
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Free Resources Preview Section */}
      <ScrollReveal delay={500} duration={800}>
        <section className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Free Resources</h2>
              <p className="text-white/80 text-lg">
                Get started with these essential trading resources—completely free
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {featuredResources.map((resource, index) => (
                <ScrollReveal key={resource.id} delay={600 + (index * 100)} duration={600}>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
                    <div className="flex items-center justify-between mb-4">
                      <span className="px-3 py-1 bg-white/10 text-white text-xs font-medium rounded-full">
                        {resource.type}
                      </span>
                      <Download className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2 text-white">{resource.title}</h3>
                    <p className="text-white/70 text-sm mb-4 leading-relaxed">{resource.description}</p>
                    <Button className="bg-white text-black hover:bg-white/90 w-full text-sm py-2">
                      <Download className="mr-2 w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </ScrollReveal>
              ))}
            </div>
            <div className="text-center">
              <Link to="/free-resources">
                <Button className="bg-white text-black hover:bg-white/90 px-8 py-3">
                  View All Resources
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* Blog Preview Section */}
      <BlogPreviewSection />

      {/* Ready to Level Up Section */}
      <ScrollReveal delay={700} duration={800}>
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Level Up Your Trading?</h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              Book a personalized 30-minute consultation to discuss your trading goals, 
              get strategy recommendations, and receive professional guidance.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-white/10 border border-white/20 rounded-full text-white/90 text-sm font-medium mb-8">
              <Clock className="w-4 h-4 mr-2" />
              30-minute session • $50 USD
            </div>
            <Link to="/book-consultation">
              <Button className="bg-white text-black hover:bg-white/90 text-lg px-10 py-4">
                <Calendar className="mr-3 h-6 w-6" />
                Schedule Your Call
              </Button>
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default HomePage;
