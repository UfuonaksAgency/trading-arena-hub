import { ArrowRight, Download, ExternalLink, Calendar, Star, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HomePage = () => {
  const tradingTools = [
    {
      name: 'TradingView',
      description: 'Advanced charting and technical analysis',
      icon: TrendingUp,
      url: 'https://tradingview.com',
    },
    {
      name: 'Notion',
      description: 'Trading journal and strategy planning',
      icon: Star,
      url: 'https://notion.so',
    },
    {
      name: 'Coinglass',
      description: 'Crypto market analytics and data',
      icon: TrendingUp,
      url: 'https://coinglass.com',
    },
    {
      name: 'CoinMarketMan',
      description: 'Portfolio tracking and management',
      icon: Star,
      url: '#',
    },
    {
      name: 'BingX',
      description: 'Trading platform for crypto',
      icon: TrendingUp,
      url: 'https://bingx.com',
    },
    {
      name: 'WEEX',
      description: 'Advanced trading platform',
      icon: Star,
      url: '#',
    },
  ];

  const freeResources = [
    {
      title: 'Complete Trading Strategy Guide',
      type: 'PDF',
      description: 'Comprehensive guide covering risk management, entry/exit strategies, and market analysis.',
      downloadUrl: '#',
    },
    {
      title: 'Market Analysis Webinar',
      type: 'VIDEO',
      description: 'Weekly market analysis and trading opportunities breakdown.',
      downloadUrl: '#',
    },
    {
      title: 'Risk Management Calculator',
      type: 'TOOL',
      description: 'Calculate your position sizes and risk-to-reward ratios.',
      downloadUrl: '#',
    },
  ];

  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be connected to Supabase once integration is set up
    console.log('Consultation form submitted');
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <Star className="w-4 h-4 mr-2" />
              Professional Trading Guidance
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Meet{' '}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                Mr. K
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Helping traders grow through free tools and real-world insights. 
              No fluff, just strategy. Join thousands of traders who've transformed 
              their approach to the markets.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-hero">
                Get Free Resources <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg">
                <Calendar className="mr-2 w-5 h-5" />
                Book 1-on-1 Session
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* About Me Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="section-header">About Mr. K</h2>
          <div className="trading-card">
            <p className="text-lg text-muted-foreground leading-relaxed">
              With over 8 years in the trading industry, I've helped thousands of traders 
              develop profitable strategies and maintain disciplined risk management. 
              My mission is simple: provide you with the tools, knowledge, and mentorship 
              needed to succeed in today's volatile markets.
            </p>
            <div className="grid md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">8+</div>
                <div className="text-muted-foreground">Years Trading</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">1000+</div>
                <div className="text-muted-foreground">Students Mentored</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">95%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Tools Section */}
      <section id="tools" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-header">Trading Tools I Use</h2>
            <p className="text-muted-foreground text-lg">
              The essential tools that power my trading strategies
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tradingTools.map((tool, index) => (
              <Card key={index} className="tool-grid-item group">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <tool.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-semibold">{tool.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-4">{tool.description}</p>
                  <Button variant="ghost" size="sm" className="p-0 h-auto">
                    Learn More <ExternalLink className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section id="resources" className="py-16 px-4 bg-card/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-header">Free Resources</h2>
            <p className="text-muted-foreground text-lg">
              Valuable trading resources to accelerate your learning
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {freeResources.map((resource, index) => (
              <Card key={index} className="trading-card group">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                      {resource.type}
                    </span>
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground mb-4">{resource.description}</p>
                  <Button variant="outline" size="sm" className="w-full">
                    <Download className="mr-2 w-4 h-4" />
                    Download
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA Section */}
      <section id="contact" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-header">Talk to a Pro</h2>
            <p className="text-muted-foreground text-lg">
              Ready to take your trading to the next level? Book a consultation call.
            </p>
          </div>
          
          <form onSubmit={handleConsultationSubmit} className="consultation-form">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" required />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" required />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="telegram">Telegram Handle</Label>
                <Input id="telegram" placeholder="@yourusername" />
              </div>
              <div>
                <Label htmlFor="timePreference">Preferred Time</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-6">
              <Label htmlFor="purpose">Purpose of Consultation</Label>
              <Textarea 
                id="purpose" 
                placeholder="Tell me about your trading experience, goals, and what you'd like to discuss..."
                rows={4}
                required
              />
            </div>
            
            <Button type="submit" size="lg" className="w-full btn-hero">
              <Calendar className="mr-2 w-5 h-5" />
              Book Free Consultation
            </Button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;