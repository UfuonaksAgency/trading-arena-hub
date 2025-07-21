
import { Download, ExternalLink, Calendar, Star, TrendingUp, FileText, BarChart3, Users, Target, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Link } from 'react-router-dom';

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

  const featuredResources = [
    {
      title: 'Complete Trading Strategy Guide',
      type: 'PDF',
      description: 'Comprehensive 50-page guide covering risk management, entry/exit strategies, and market analysis.',
      downloadUrl: '#',
    },
    {
      title: 'Weekly Market Analysis',
      type: 'VIDEO',
      description: 'Live recorded sessions with market breakdowns and trade setups.',
      downloadUrl: '#',
    },
    {
      title: 'Risk Management Calculator',
      type: 'TOOL',
      description: 'Excel tool to calculate position sizes and risk-to-reward ratios.',
      downloadUrl: '#',
    },
  ];

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be connected to Calendly integration
    console.log('30-minute consultation form submitted');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="simple-hero">
        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center px-6 py-3 border border-black/20 rounded-full text-black text-sm font-medium mb-8 backdrop-blur-sm bg-black/5">
            <Star className="w-4 h-4 mr-2" />
            Professional Trading Guidance
          </div>
          <h1 className="stage-light-title text-6xl md:text-8xl font-bold mb-8 text-black tracking-tight">
            Mr. K Trading Arena
          </h1>
          <div className="section-header text-2xl md:text-3xl mb-8 max-w-4xl mx-auto text-black">
            Where Strategy Meets Success
          </div>
          <p className="text-lg md:text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed">
            Helping traders grow through <span className="text-black font-semibold">free resources</span>, 
            <span className="text-black font-semibold"> proven strategies</span>, and personalized guidance.
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

      {/* About Mr. K Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <h2 className="section-header">About Mr. K</h2>
          <div className="minimal-card">
            <p className="text-lg text-foreground leading-relaxed mb-8">
              With over 8 years in the trading industry, I've helped thousands of traders 
              develop profitable strategies and maintain disciplined risk management. 
              My mission is simple: provide you with the tools, knowledge, and guidance 
              needed to succeed in today's volatile markets. No get-rich-quick schemes—just 
              proven strategies backed by real experience.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">8+</div>
                <div className="text-muted-foreground">Years Trading</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">1000+</div>
                <div className="text-muted-foreground">Students Mentored</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">95%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tools I Use Section */}
      <section id="tools" className="py-20 px-4">
        <div className="max-w-7xl mx-auto scroll-reveal">
          <div className="text-center mb-16">
            <h2 className="section-header">Tools I Use</h2>
            <p className="text-foreground text-lg">
              The essential platforms and tools that power my daily trading operations
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tradingTools.map((tool, index) => (
              <div key={index} className="tool-grid-item group">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-secondary border border-border rounded-xl flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <tool.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">{tool.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{tool.description}</p>
                  <a 
                    href={tool.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors text-sm font-medium group"
                  >
                    Visit Platform <ExternalLink className="ml-2 w-4 h-4 inline group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section id="resources" className="py-20 px-4 bg-muted/10">
        <div className="max-w-7xl mx-auto scroll-reveal">
          <div className="text-center mb-16">
            <h2 className="section-header">Free Resources</h2>
            <p className="text-foreground text-lg">
              Valuable trading resources to kickstart your journey—completely free
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <div key={index} className="minimal-card group">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-2 bg-secondary text-secondary-foreground text-xs font-medium rounded-full border border-border">
                      {resource.type}
                    </span>
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{resource.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{resource.description}</p>
                  <Button className="btn-ghost w-full">
                    <Download className="mr-2 w-4 h-4" />
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/free-resources">
              <Button className="btn-primary">
                View All Resources
                <ExternalLink className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Talk to a Pro Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-header">Ready to Level Up Your Trading?</h2>
          <p className="text-foreground text-lg mb-8 max-w-2xl mx-auto">
            Book a personalized 30-minute consultation to discuss your trading goals, 
            get strategy recommendations, and receive professional guidance.
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-accent border border-border rounded-full text-accent-foreground text-sm font-medium mb-8">
            <Clock className="w-4 h-4 mr-2" />
            30-minute session • $50 USD
          </div>
          <Link to="/book-consultation">
            <Button className="btn-primary text-lg px-10 py-4">
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
