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
      {/* Aurora Borealis Hero Section */}
      <section className="aurora-hero flex items-center justify-center">
        {/* Animated Aurora Background */}
        <div className="aurora-bg"></div>
        <div className="aurora-particles"></div>
        
        {/* Additional Starry Sky Effect */}
        <div className="absolute inset-0 opacity-60">
          <div className="absolute top-20 left-20 w-1 h-1 bg-white rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-32 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-20 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-1/3 left-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-3000"></div>
          <div className="absolute top-1/4 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-1500"></div>
          <div className="absolute top-3/4 left-1/5 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-2500"></div>
          <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white text-sm font-medium mb-8 backdrop-blur-sm bg-white/5">
            <Star className="w-4 h-4 mr-2" />
            Guided by Aurora's Light
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-8 text-white tracking-tight">
            Mr. K Trading Arena
          </h1>
          <div className="section-header text-2xl md:text-3xl mb-8 max-w-4xl mx-auto">
            Where Northern Lights Meet Trading Insights
          </div>
          <p className="text-lg md:text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Helping traders grow through <span className="text-white font-semibold">free tools</span> and 
            <span className="text-white font-semibold"> real-world insights</span>. No fluff, just strategy.
            Join thousands who've transformed their trading under the Aurora's guidance.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <button className="btn-aurora text-lg px-10 py-4">
              <TrendingUp className="mr-3 h-6 w-6" />
              Explore the Aurora
            </button>
            <button className="btn-ghost text-lg px-10 py-4">
              <Calendar className="mr-3 h-6 w-6" />
              Book Consultation
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 px-4 bg-muted/5">
        <div className="max-w-4xl mx-auto text-center scroll-reveal">
          <h2 className="section-header">About Mr. K</h2>
          <div className="minimal-card">
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              With over 8 years in the trading industry, I've helped thousands of traders 
              develop profitable strategies and maintain disciplined risk management. 
              My mission is simple: provide you with the tools, knowledge, and mentorship 
              needed to succeed in today's volatile markets.
            </p>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-aurora-cyan transition-colors">8+</div>
                <div className="text-muted-foreground">Years Trading</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-aurora-green transition-colors">1000+</div>
                <div className="text-muted-foreground">Students Mentored</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl font-bold text-white mb-2 group-hover:text-aurora-magenta transition-colors">95%</div>
                <div className="text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trading Tools Section */}
      <section id="tools" className="py-20 px-4">
        <div className="max-w-7xl mx-auto scroll-reveal">
          <div className="text-center mb-16">
            <h2 className="section-header">Essential Trading Stack</h2>
            <p className="text-muted-foreground text-lg">
              The minimalist toolkit that powers my trading strategies
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tradingTools.map((tool, index) => (
              <div key={index} className="tool-grid-item group">
                <div className="p-8">
                  <div className="flex items-center mb-6">
                    <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mr-4 group-hover:bg-white group-hover:text-black transition-all duration-300">
                      <tool.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">{tool.name}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{tool.description}</p>
                  <button className="text-white hover:text-aurora-cyan transition-colors text-sm font-medium group">
                    Explore Tool <ExternalLink className="ml-2 w-4 h-4 inline group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Resources Section */}
      <section id="resources" className="py-20 px-4 bg-muted/5">
        <div className="max-w-7xl mx-auto scroll-reveal">
          <div className="text-center mb-16">
            <h2 className="section-header">Aurora Resources</h2>
            <p className="text-muted-foreground text-lg">
              Illuminating your trading journey with valuable resources
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {freeResources.map((resource, index) => (
              <div key={index} className="minimal-card group">
                <div className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <span className="px-4 py-2 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20">
                      {resource.type}
                    </span>
                    <Download className="w-5 h-5 text-muted-foreground group-hover:text-aurora-cyan transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{resource.title}</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">{resource.description}</p>
                  <button className="btn-ghost w-full">
                    <Download className="mr-2 w-4 h-4" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Consultation CTA Section */}
      <section id="contact" className="py-20 px-4">
        <div className="max-w-4xl mx-auto scroll-reveal">
          <div className="text-center mb-16">
            <h2 className="section-header">Connect Under Aurora's Light</h2>
            <p className="text-muted-foreground text-lg">
              Ready to illuminate your trading journey? Book a consultation call.
            </p>
          </div>
          
          <form onSubmit={handleConsultationSubmit} className="minimal-card max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input id="name" placeholder="Enter your full name" required className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input id="email" type="email" placeholder="Enter your email" required className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="telegram" className="text-white">Telegram Handle</Label>
                <Input id="telegram" placeholder="@yourusername" className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" />
              </div>
              <div>
                <Label htmlFor="timePreference" className="text-white">Preferred Time</Label>
                <Select>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select preferred time" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="morning">Morning (9AM - 12PM)</SelectItem>
                    <SelectItem value="afternoon">Afternoon (12PM - 5PM)</SelectItem>
                    <SelectItem value="evening">Evening (5PM - 8PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mb-8">
              <Label htmlFor="purpose" className="text-white">Purpose of Consultation</Label>
              <Textarea 
                id="purpose" 
                placeholder="Tell me about your trading experience, goals, and what you'd like to discuss..."
                rows={4}
                required
                className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
            
            <button type="submit" className="btn-aurora w-full">
              <Calendar className="mr-2 w-5 h-5" />
              Book Aurora Consultation
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;