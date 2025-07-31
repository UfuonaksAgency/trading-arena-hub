import { useState, useEffect } from 'react';
import { Calendar, Clock, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ScrollReveal } from '@/hooks/useScrollReveal';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Declare Calendly type for TypeScript
declare global {
  interface Window {
    Calendly?: {
      initBadgeWidget: (options: {
        url: string;
        text: string;
        color: string;
        textColor: string;
        branding: boolean;
      }) => void;
    };
  }
}

const BookConsultation = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    preferred_time: '',
    experience_level: '',
    purpose: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const { toast } = useToast();

  // Load Calendly widget script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(link);
    };
  }, []);

  // Initialize Calendly badge after form submission
  useEffect(() => {
    if (showCalendly && window.Calendly) {
      window.Calendly.initBadgeWidget({ 
        url: 'https://calendly.com/tradewithmrk', 
        text: 'Schedule time with me', 
        color: '#0069ff', 
        textColor: '#ffffff', 
        branding: true 
      });
    }
  }, [showCalendly]);

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.preferred_time || !formData.experience_level || !formData.purpose) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-consultation-request', {
        body: formData
      });

      if (error) throw error;

      toast({
        title: "Request Submitted Successfully!",
        description: "You'll receive a confirmation email shortly. Click the Calendly badge to schedule your time slot.",
      });

      // Reset form and show Calendly badge
      setFormData({
        name: '',
        email: '',
        telegram: '',
        preferred_time: '',
        experience_level: '',
        purpose: ''
      });
      
      setShowCalendly(true);

    } catch (error) {
      console.error('Error submitting consultation request:', error);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        {/* Header */}
        <ScrollReveal delay={200} duration={1000} distance="50px">
          <section className="py-16 px-4">
            <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white text-sm font-medium mb-8 backdrop-blur-sm bg-white/5">
              <Star className="w-4 h-4 mr-2" />
              Professional Trading Consultation
            </div>
            <h1 className="section-header">Book Your 30-Minute Strategy Call</h1>
            <p className="text-white text-lg max-w-3xl mx-auto leading-relaxed">
              Get personalized trading advice, strategy recommendations, and answers to your specific 
              trading questions in a focused 30-minute session with our trading team.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-medium mt-6">
              <Clock className="w-4 h-4 mr-2" />
              30-minute session • $300 USD
            </div>
            </div>
          </section>
        </ScrollReveal>

        {/* What You'll Get */}
        <ScrollReveal delay={400} duration={800}>
          <section className="py-16 px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="section-header">What You'll Get</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                {
                  icon: CheckCircle,
                  title: "Personalized Strategy & Risk Management",
                  description: "Tailored trading advice based on your experience level, goals, and professional risk assessment with position sizing guidance"
                },
                {
                  icon: CheckCircle,
                  title: "Book a session with our team $300 for 30 minutes",
                  description: "Direct access to our professional trading team for specific questions, challenges, and personalized guidance"
                }
                ].map((benefit, index) => (
                  <ScrollReveal key={index} delay={600 + (index * 100)} duration={600}>
                    <Card className="minimal-card text-center">
                  <div className="p-6">
                    <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-100 text-sm">{benefit.description}</p>
                  </div>
                </Card>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>
        </ScrollReveal>

        {/* Booking Form */}
        <ScrollReveal delay={800} duration={800}>
          <section className="py-16 px-4">
            <div className="max-w-2xl mx-auto">
            <form onSubmit={handleConsultationSubmit} className="minimal-card">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Schedule Your Call</h2>
                <p className="text-gray-100">Fill out the form below and receive a Calendly link to book your preferred time</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="name" className="text-white">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name" 
                    required 
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" 
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email" 
                    required 
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" 
                  />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="telegram" className="text-white">Telegram Handle (Optional)</Label>
                  <Input 
                    id="telegram"
                    value={formData.telegram}
                    onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                    placeholder="@yourusername" 
                    className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" 
                  />
                </div>
                <div>
                  <Label htmlFor="timePreference" className="text-white">Preferred Time</Label>
                  <Select value={formData.preferred_time} onValueChange={(value) => setFormData({ ...formData, preferred_time: value })}>
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
                <Label htmlFor="experience" className="text-white">Trading Experience Level</Label>
                <Select value={formData.experience_level} onValueChange={(value) => setFormData({ ...formData, experience_level: value })}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/20">
                    <SelectItem value="beginner">Complete Beginner</SelectItem>
                    <SelectItem value="intermediate">Some Experience (6 months - 2 years)</SelectItem>
                    <SelectItem value="advanced">Experienced (2+ years)</SelectItem>
                    <SelectItem value="professional">Professional Trader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="mb-8">
                <Label htmlFor="purpose" className="text-white">What would you like to discuss?</Label>
                <Textarea 
                  id="purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  placeholder="Tell me about your trading goals, specific challenges, current strategies, and what you'd like to focus on during our 30-minute team session..."
                  rows={4}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <Button type="submit" className="btn-primary w-full" disabled={isSubmitting}>
                <Calendar className="mr-2 w-5 h-5" />
                {isSubmitting ? 'Submitting...' : 'Request Consultation'}
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                {showCalendly ? (
                  <>
                    <span className="text-green-400">✓ Request submitted!</span> 
                    <br />
                    Click the Calendly badge (bottom right) to schedule your time slot.
                  </>
                ) : (
                  "You'll receive a confirmation email and can schedule immediately after submitting."
                )}
              </p>
            </form>
            </div>
          </section>
        </ScrollReveal>
      </div>
      <Footer />
    </>
  );
};

export default BookConsultation;
