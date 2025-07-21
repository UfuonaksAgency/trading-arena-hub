import { Download, FileText, Video, Calculator, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const FreeResources = () => {
  const resources = [
    {
      title: 'Complete Trading Strategy Guide',
      type: 'PDF',
      description: 'Comprehensive 50-page guide covering risk management, entry/exit strategies, market analysis, and psychology. Perfect for beginners to intermediate traders.',
      features: ['Risk Management Framework', 'Chart Pattern Recognition', 'Entry/Exit Strategies', 'Market Psychology'],
      downloadUrl: '#',
      icon: FileText,
      size: '4.2 MB',
      pages: '50 pages'
    },
    {
      title: 'Weekly Market Analysis Webinar',
      type: 'VIDEO',
      description: 'Live recorded sessions where Mr. K breaks down weekly market trends, identifies opportunities, and shares trade setups.',
      features: ['Live Market Analysis', 'Trade Setup Examples', 'Q&A Sessions', 'Market Outlook'],
      downloadUrl: '#',
      icon: Video,
      size: '720p HD',
      pages: '45 min'
    },
    {
      title: 'Risk Management Calculator',
      type: 'TOOL',
      description: 'Excel spreadsheet tool to calculate position sizes, risk-to-reward ratios, and manage your trading portfolio effectively.',
      features: ['Position Size Calculator', 'R:R Ratio Analysis', 'Portfolio Tracker', 'Stop Loss Calculator'],
      downloadUrl: '#',
      icon: Calculator,
      size: '1.1 MB',
      pages: 'Excel Tool'
    },
    {
      title: 'Crypto Trading Cheat Sheet',
      type: 'PDF',
      description: 'Quick reference guide for crypto trading including key indicators, support/resistance levels, and trading patterns.',
      features: ['Technical Indicators', 'Chart Patterns', 'Crypto-specific Tips', 'Quick Reference'],
      downloadUrl: '#',
      icon: FileText,
      size: '2.8 MB',
      pages: '12 pages'
    },
    {
      title: 'Psychology of Trading Course',
      type: 'VIDEO',
      description: 'Deep dive into the mental aspects of trading, overcoming FOMO, managing emotions, and developing discipline.',
      features: ['Emotional Control', 'FOMO Management', 'Discipline Building', 'Mindset Training'],
      downloadUrl: '#',
      icon: Video,
      size: '1080p HD',
      pages: '2.5 hours'
    },
    {
      title: 'Market Scanner Setup Guide',
      type: 'PDF',
      description: 'Step-by-step guide to setting up market scanners in TradingView and other platforms to find the best trading opportunities.',
      features: ['Scanner Configuration', 'Alert Setup', 'Screening Criteria', 'Platform Guides'],
      downloadUrl: '#',
      icon: FileText,
      size: '3.5 MB',
      pages: '28 pages'
    }
  ];

  const handleDownload = (resourceTitle: string, downloadUrl: string) => {
    // This will be connected to Supabase once integration is set up
    console.log(`Downloading: ${resourceTitle}`);
    // For now, just log the action
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return FileText;
      case 'VIDEO':
        return Video;
      case 'TOOL':
        return Calculator;
      default:
        return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'VIDEO':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'TOOL':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        {/* Hero Section */}
        <section className="px-4 mb-16">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-6">
              <Download className="w-4 h-4 mr-2" />
              100% Free Resources
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Free Trading{' '}
              <span className="text-primary">
                Resources
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Everything you need to start your trading journey. No strings attached, 
              no email required. Just valuable content to help you succeed.
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-accent/10 border border-accent/20 rounded-lg text-accent">
              <Star className="w-5 h-5 mr-2" />
              <span className="font-medium">All resources are regularly updated</span>
            </div>
          </div>
        </section>

        {/* Resources Grid */}
        <section className="px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {resources.map((resource, index) => {
                const IconComponent = getTypeIcon(resource.type);
                return (
                  <Card key={index} className="minimal-card group">
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(resource.type)}`}>
                          {resource.type}
                        </span>
                        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                          <span>{resource.size}</span>
                          <span>•</span>
                          <span>{resource.pages}</span>
                        </div>
                      </div>

                      {/* Icon and Title */}
                      <div className="flex items-center mb-4">
                        <div className="w-12 h-12 bg-primary/10 border border-primary/20 rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                          <IconComponent className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-white">{resource.title}</h3>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {resource.description}
                      </p>

                      {/* Features */}
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-white mb-3">What's Included:</h4>
                        <ul className="space-y-2">
                          {resource.features.map((feature, featureIndex) => (
                            <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                              <div className="w-1.5 h-1.5 bg-primary rounded-full mr-3"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Download Button */}
                      <Button 
                        onClick={() => handleDownload(resource.title, resource.downloadUrl)}
                        className="w-full btn-primary"
                      >
                        <Download className="mr-2 w-4 h-4" />
                        Download Now
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-4 mt-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="minimal-card">
              <h2 className="text-3xl font-bold mb-4 text-white">
                Found These Resources Helpful?
              </h2>
              <p className="text-muted-foreground mb-8">
                Take your trading to the next level with personalized mentorship and one-on-one consultations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="btn-ghost">
                  <a href="/mentorship">Explore Mentorship</a>
                </Button>
                <Button className="btn-primary">
                  <a href="/#contact">Book Consultation</a>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default FreeResources;