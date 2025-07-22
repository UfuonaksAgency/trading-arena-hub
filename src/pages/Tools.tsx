
import { ExternalLink, BarChart3, FileText, TrendingUp, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Import logos
import tradingViewLogo from '@/assets/logos/tradingview-logo.png';
import notionLogo from '@/assets/logos/notion-logo.png';
import coinglassLogo from '@/assets/logos/coinglass-logo.webp';
import bingxLogo from '@/assets/logos/bingx-logo.svg';

const Tools = () => {
  const tradingTools = [
    {
      name: 'TradingView',
      description: 'Advanced charting and technical analysis platform with over 100 built-in indicators, drawing tools, and real-time market data across stocks, forex, crypto, and commodities.',
      icon: BarChart3,
      logo: tradingViewLogo,
      url: 'https://tradingview.com',
      features: ['100+ Technical Indicators', 'Real-time Data', 'Multi-timeframe Analysis', 'Custom Alerts', 'Social Trading Ideas']
    },
    {
      name: 'Notion',
      description: 'All-in-one workspace for trading journals, strategy documentation, and performance tracking. Essential for maintaining discipline and analyzing trading patterns.',
      icon: FileText,
      logo: notionLogo,
      url: 'https://notion.so',
      features: ['Trading Journal Templates', 'Strategy Documentation', 'Performance Analytics', 'Goal Tracking', 'Market Research Notes']
    },
    {
      name: 'Coinglass',
      description: 'Comprehensive crypto market analytics platform providing liquidation data, funding rates, and derivatives insights for informed trading decisions.',
      icon: TrendingUp,
      logo: coinglassLogo,
      url: 'https://coinglass.com',
      features: ['Liquidation Heatmaps', 'Funding Rate Analysis', 'Options Flow', 'Futures Data', 'Market Sentiment']
    },
    {
      name: 'CoinMarketMan',
      description: 'Advanced portfolio tracking and management tool specifically designed for cryptocurrency traders and investors.',
      icon: Target,
      logo: null,
      url: '#',
      features: ['Portfolio Analytics', 'P&L Tracking', 'Risk Assessment', 'Tax Reporting', 'Performance Metrics']
    },
    {
      name: 'BingX',
      description: 'Professional cryptocurrency exchange offering spot and derivatives trading with advanced order types and competitive fees.',
      icon: TrendingUp,
      logo: bingxLogo,
      url: 'https://bingx.com',
      features: ['Spot Trading', 'Futures & Options', 'Copy Trading', 'Low Fees', 'Advanced Order Types']
    },
    {
      name: 'WEEX',
      description: 'Cutting-edge derivatives trading platform with institutional-grade tools and deep liquidity for professional traders.',
      icon: BarChart3,
      logo: null,
      url: '#',
      features: ['Perpetual Contracts', 'Options Trading', 'Deep Liquidity', 'API Access', 'Risk Management Tools']
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        {/* Header */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="section-header">My Trading Arsenal</h1>
            <p className="text-white text-lg max-w-3xl mx-auto">
              The essential platforms and tools that power my daily trading operations. 
              Each tool serves a specific purpose in my systematic approach to market analysis and execution.
            </p>
          </div>
        </section>

        {/* Tools Grid */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {tradingTools.map((tool, index) => (
                <Card key={index} className="minimal-card group">
                  <div className="p-8">
                    <div className="flex items-center mb-6">
                      <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center mr-6 group-hover:bg-white/10 transition-all duration-300 p-2">
                        {tool.logo ? (
                          <img 
                            src={tool.logo} 
                            alt={`${tool.name} logo`}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <tool.icon className="w-8 h-8 text-white group-hover:text-primary transition-colors" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-2xl font-semibold text-white mb-2">{tool.name}</h3>
                        <a 
                          href={tool.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:text-white transition-colors text-sm font-medium group inline-flex items-center"
                        >
                          Visit Platform <ExternalLink className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>
                    
                    <p className="text-white mb-6 leading-relaxed">{tool.description}</p>
                    
                    <div className="space-y-2">
                      <h4 className="text-white font-medium mb-3">Key Features:</h4>
                      <ul className="space-y-1">
                        {tool.features.map((feature, idx) => (
                          <li key={idx} className="text-gray-100 text-sm flex items-center">
                            <span className="w-2 h-2 bg-primary rounded-full mr-3"></span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Why These Tools Section */}
        <section className="py-16 px-4 bg-muted/10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="section-header">Why These Tools?</h2>
            <div className="minimal-card">
              <p className="text-lg text-white leading-relaxed">
                After 8+ years in trading, I've tested countless platforms and tools. These six represent 
                the core of my trading infrastructure - each chosen for reliability, functionality, and 
                the specific edge they provide in today's markets. From charting to execution, 
                journaling to analytics, this stack covers every aspect of professional trading.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default Tools;
