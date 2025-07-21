import { useState } from 'react';
import { Star, CheckCircle, Clock, Users, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Mentorship = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    experience: '',
    tradingHistory: '',
    goals: '',
    availability: '',
    expectations: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Integration with form handling service would go here
    alert('Thank you for your interest! We will contact you within 24 hours.');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Personalized Strategy Development',
      description: 'Custom trading strategies tailored to your risk tolerance and market preferences.',
    },
    {
      icon: CheckCircle,
      title: 'Real-Time Market Analysis',
      description: 'Live market insights and trade setups during active trading sessions.',
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'One-on-one sessions scheduled around your availability and market hours.',
    },
    {
      icon: Users,
      title: 'Ongoing Support',
      description: 'Continuous guidance via Telegram for immediate questions and trade reviews.',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Crypto Trader',
      content: 'Mr. K transformed my crypto trading strategy. His DeFi insights and risk management saved me from major losses during the market crash.',
      rating: 5,
    },
    {
      name: 'Alex Chen',
      role: 'Crypto Day Trader',
      content: 'The altcoin strategies and technical analysis Mr. K taught me increased my portfolio by 340% in 6 months.',
      rating: 5,
    },
    {
      name: 'Maria Rodriguez',
      role: 'Bitcoin Trader',
      content: 'Best investment I made was Mr. K\'s crypto mentorship. Finally profitable trading Bitcoin and understanding market cycles.',
      rating: 5,
    },
  ];

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="px-4 mb-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 border border-white/30 rounded-full text-white text-sm font-medium mb-6 backdrop-blur-sm">
            <Star className="w-4 h-4 mr-2" />
            Exclusive Mentorship Program
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            1-on-1 Mentorship with{' '}
            <span className="text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] font-extrabold">
              Mr. K
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-8">
            Selection-only mentorship for serious traders ready to take their skills 
            to the professional level. Limited spots available.
          </p>
          <div className="inline-flex items-center px-6 py-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
            <Clock className="w-5 h-5 mr-2" />
            <span className="font-medium">Only 5 spots available this month</span>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 mb-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-header text-center mb-12">What You'll Get</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <Card key={index} className="minimal-card">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold">{benefit.title}</h3>
                  </div>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="px-4 mb-16 bg-card/50 py-16">
        <div className="max-w-7xl mx-auto">
          <h2 className="section-header text-center mb-12">Success Stories</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="minimal-card">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-header">Apply for Mentorship</h2>
            <p className="text-muted-foreground text-lg">
              Tell me about your trading journey and goals. Selected mentees will be contacted via Telegram/Zoom.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="minimal-card max-w-2xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input 
                  id="name" 
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  required 
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <Label htmlFor="telegram">Telegram Handle *</Label>
                <Input 
                  id="telegram" 
                  placeholder="@yourusername"
                  value={formData.telegram}
                  onChange={(e) => handleInputChange('telegram', e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="experience">Trading Experience *</Label>
                <Select onValueChange={(value) => handleInputChange('experience', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                    <SelectItem value="professional">Professional Trader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mb-6">
              <Label htmlFor="tradingHistory">Trading History & Current Strategy *</Label>
              <Textarea 
                id="tradingHistory"
                placeholder="Describe your trading journey, strategies you've tried, wins/losses, and current approach..."
                rows={4}
                value={formData.tradingHistory}
                onChange={(e) => handleInputChange('tradingHistory', e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="goals">Goals & Expectations *</Label>
              <Textarea 
                id="goals"
                placeholder="What are your trading goals? What do you hope to achieve through mentorship?"
                rows={4}
                value={formData.goals}
                onChange={(e) => handleInputChange('goals', e.target.value)}
                required
              />
            </div>

            <div className="mb-6">
              <Label htmlFor="availability">Availability & Time Commitment *</Label>
              <Textarea 
                id="availability"
                placeholder="When are you available for sessions? How much time can you dedicate to learning and practicing?"
                rows={3}
                value={formData.availability}
                onChange={(e) => handleInputChange('availability', e.target.value)}
                required
              />
            </div>

            <div className="mb-8">
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  <strong>Selection Process:</strong>
                </p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Applications are reviewed within 48 hours</li>
                  <li>• Selected candidates will receive a Telegram/Zoom interview</li>
                  <li>• Final acceptance is based on commitment level and learning readiness</li>
                  <li>• Payment details will be provided upon acceptance</li>
                </ul>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full btn-accent">
              <Calendar className="mr-2 w-5 h-5" />
              Submit Application
            </Button>
          </form>
        </div>
      </section>
      </div>
      <Footer />
    </>
  );
};

export default Mentorship;