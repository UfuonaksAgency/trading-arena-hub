import { ExternalLink, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const TradingPlatforms = () => {
  const platforms = [
    {
      name: 'WEEX Exchange',
      description: 'Professional crypto trading platform with advanced tools and competitive fees',
      url: 'https://support.weex.com/en/register?vipCode=mp9nh',
      badge: 'VIP Code: mp9nh',
      features: ['Low Trading Fees', 'Advanced Charting', 'High Security'],
      color: 'bg-blue-500'
    },
    {
      name: 'BingX',
      description: 'Leading social trading platform with copy trading and futures trading',
      url: 'https://bingx.pro/partner/KELVINARENA',
      badge: 'Partner Code: KELVINARENA',
      features: ['Copy Trading', 'Futures Trading', 'Social Features'],
      color: 'bg-orange-500'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground">
              Recommended Trading Platforms
            </h2>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Trade on professional platforms with exclusive benefits using Mr. K's partner codes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {platforms.map((platform) => (
            <Card key={platform.name} className="group hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                      {platform.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {platform.description}
                    </CardDescription>
                  </div>
                  <div className={`w-4 h-4 rounded-full ${platform.color} opacity-60`} />
                </div>
                <Badge variant="secondary" className="w-fit mt-3">
                  {platform.badge}
                </Badge>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {platform.features.map((feature) => (
                    <Badge key={feature} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                <Button 
                  asChild 
                  className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
                  size="lg"
                >
                  <a href={platform.url} target="_blank" rel="noopener noreferrer">
                    <span>Start Trading</span>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Using these referral codes helps support Mr. K Trading Arena and provides you with exclusive benefits
          </p>
        </div>
      </div>
    </section>
  );
};

export default TradingPlatforms;