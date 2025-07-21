
import { useState, useEffect } from 'react';
import { Download, ExternalLink, Calendar, Star, TrendingUp, FileText, BarChart3, Users, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

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

  useEffect(() => {
    fetchFeaturedResources();
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

  const tradingBrands = ['TradingView', 'Notion', 'Coinglass', 'CoinMarketMan', 'BingX (Exchange)', 'WEEX (Exchange)'];


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="simple-hero">
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
      </section>

      {/* Trading Tools Animation Section */}
      <section className="py-16 bg-muted/5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-white/90 text-sm uppercase tracking-wide">Tools I Use in Trading</p>
          </div>
          <div className="relative">
            <div className="flex animate-scroll-brands">
              {[...tradingBrands, ...tradingBrands].map((brand, index) => (
                <div 
                  key={index} 
                  className="text-xl md:text-2xl font-bold text-white/60 hover:text-white/80 transition-colors duration-300 cursor-default whitespace-nowrap mx-8 flex-shrink-0"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Free Resources Preview Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Free Resources</h2>
            <p className="text-white/80 text-lg">
              Get started with these essential trading resources—completely free
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {featuredResources.map((resource) => (
              <div key={resource.id} className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 group">
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

      {/* Ready to Level Up Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to Level Up Your Trading?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
            Book a personalized 30-minute consultation to discuss your trading goals, 
            get strategy recommendations, and receive professional guidance.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-medium mb-8">
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
    </div>
  );
};

export default HomePage;
