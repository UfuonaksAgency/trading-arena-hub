import { Calendar, Clock, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const BookConsultation = () => {
  const handleConsultationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This will be connected to Calendly integration
    console.log('30-minute consultation form submitted');
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20">
        {/* Header */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white text-sm font-medium mb-8 backdrop-blur-sm bg-white/5">
              <Star className="w-4 h-4 mr-2" />
              Professional Trading Consultation
            </div>
            <h1 className="section-header">Book Your 30-Minute Strategy Call</h1>
            <p className="text-white text-lg max-w-3xl mx-auto leading-relaxed">
              Get personalized trading advice, strategy recommendations, and answers to your specific 
              trading questions in a focused 30-minute session with Mr. K.
            </p>
            <div className="inline-flex items-center px-4 py-2 bg-accent/10 border border-accent/20 rounded-full text-accent text-sm font-medium mt-6">
              <Clock className="w-4 h-4 mr-2" />
              30-minute session • $50 USD
            </div>
          </div>
        </section>

        {/* What You'll Get */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="section-header">What You'll Get</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: CheckCircle,
                  title: "Personalized Strategy",
                  description: "Tailored trading advice based on your experience level and goals"
                },
                {
                  icon: CheckCircle,
                  title: "Risk Management",
                  description: "Professional risk assessment and position sizing guidance"
                },
                {
                  icon: CheckCircle,
                  title: "Platform Setup",
                  description: "Recommendations for tools and platform configurations"
                },
                {
                  icon: CheckCircle,
                  title: "Q&A Session",
                  description: "Direct answers to your specific trading questions and challenges"
                }
              ].map((benefit, index) => (
                <Card key={index} className="minimal-card text-center">
                  <div className="p-6">
                    <benefit.icon className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                    <p className="text-gray-100 text-sm">{benefit.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Booking Form */}
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
                  <Input id="name" placeholder="Enter your full name" required className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white">Email Address</Label>
                  <Input id="email" type="email" placeholder="Enter your email" required className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" />
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <Label htmlFor="telegram" className="text-white">Telegram Handle (Optional)</Label>
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
                <Label htmlFor="experience" className="text-white">Trading Experience Level</Label>
                <Select>
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
                  placeholder="Tell me about your trading goals, specific challenges, current strategies, and what you'd like to focus on during our 30-minute call..."
                  rows={4}
                  required
                  className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>
              
              <Button type="submit" className="btn-primary w-full">
                <Calendar className="mr-2 w-5 h-5" />
                Request Consultation Link
              </Button>
              
              <p className="text-center text-sm text-muted-foreground mt-4">
                You'll receive a Calendly link within 24 hours to schedule your preferred time slot.
              </p>
            </form>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
};

export default BookConsultation;
