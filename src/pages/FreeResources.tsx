import { useState, useEffect } from 'react';
import { Download, ExternalLink, FileText, Video, Calculator, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { ScrollReveal } from '@/hooks/useScrollReveal';

interface FreeResource {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'TOOL';
  description: string;
  features: string[];
  download_url?: string;
  external_link?: string;
  icon_name: string;
  size_info: string;
  page_info: string;
  display_order: number;
}

const FreeResources = () => {
  const [resources, setResources] = useState<FreeResource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('free_resources')
        .select('*')
        .eq('is_active', true)
        .order('display_order');

      if (error) throw error;
      setResources((data || []) as FreeResource[]);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResourceAccess = async (resource: FreeResource) => {
    const targetUrl = resource.external_link || resource.download_url;
    
    if (!targetUrl) {
      console.error('No URL available for this resource');
      alert('This resource will be available soon. Please contact us for early access.');
      return;
    }

    // Track the access/download
    try {
      await supabase.functions.invoke('track-download', {
        body: { 
          resource_id: resource.id,
          session_id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36)
        }
      });
    } catch (error) {
      console.error('Error tracking resource access:', error);
    }

    // Open URL (external link or download)
    window.open(targetUrl, '_blank');
  };

  const getTypeIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileText':
        return FileText;
      case 'Video':
        return Video;
      case 'Calculator':
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
        <ScrollReveal delay={200} duration={1000} distance="50px">
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
        </ScrollReveal>

        {/* Resources Grid */}
        <ScrollReveal delay={400} duration={800}>
          <section className="px-4">
            <div className="max-w-7xl mx-auto">
              {loading ? (
                <div className="text-center py-20">
                  <div className="text-white">Loading resources...</div>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {resources.map((resource, index) => {
                    const IconComponent = getTypeIcon(resource.icon_name);
                    return (
                      <ScrollReveal key={resource.id} delay={600 + (index * 100)} duration={600}>
                        <Card className="minimal-card group">
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(resource.type)}`}>
                            {resource.type}
                          </span>
                          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                            <span>{resource.size_info}</span>
                            <span>•</span>
                            <span>{resource.page_info}</span>
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

                        {/* Access Button */}
                        <Button 
                          onClick={() => handleResourceAccess(resource)}
                          className="w-full btn-primary"
                          disabled={!resource.external_link && !resource.download_url}
                        >
                          {resource.external_link ? (
                            <>
                              <ExternalLink className="mr-2 w-4 h-4" />
                              Access Resource
                            </>
                          ) : (
                            <>
                              <Download className="mr-2 w-4 h-4" />
                              Download Now
                            </>
                          )}
                        </Button>
                        </div>
                      </Card>
                      </ScrollReveal>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </ScrollReveal>

        {/* Call to Action */}
        <ScrollReveal delay={800} duration={800}>
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
        </ScrollReveal>
      </div>
      <Footer />
    </>
  );
};

export default FreeResources;