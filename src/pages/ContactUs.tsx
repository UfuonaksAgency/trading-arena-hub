import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mail, Send, MessageSquare, Clock, CheckCircle, User, HelpCircle, CreditCard, BookOpen, Users, Briefcase, Camera } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { ScrollReveal } from '@/hooks/useScrollReveal';

const ContactUs = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    reason: '',
    message: '',
  });

  const contactReasons = [
    { value: 'technical-support', label: 'Technical Support', icon: HelpCircle },
    { value: 'payment-issues', label: 'Payment Issues', icon: CreditCard },
    { value: 'consultation-questions', label: 'Consultation Questions', icon: MessageSquare },
    { value: 'mentorship-inquiries', label: 'Mentorship Inquiries', icon: BookOpen },
    { value: 'general-questions', label: 'General Questions', icon: User },
    { value: 'partnership-opportunities', label: 'Partnership Opportunities', icon: Briefcase },
    { value: 'media-press', label: 'Media & Press', icon: Camera },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.reason || !formData.message.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: formData
      });

      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }

      if (data?.success) {
        toast({
          title: "Message Sent Successfully! ✅",
          description: "Thank you for contacting us. We'll get back to you within 24 hours.",
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          reason: '',
          message: '',
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      toast({
        title: "Failed to Send Message",
        description: error.message || "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const selectedReason = contactReasons.find(reason => reason.value === formData.reason);

  return (
    <>
      <Helmet>
        <title>Contact Us - Mr. K Trading Arena | Get Expert Trading Support</title>
        <meta name="description" content="Contact Mr. K Trading Arena for technical support, payment issues, consultation questions, and more. Get expert help from our professional trading team." />
        <meta name="keywords" content="contact trading support, trading help, technical support, payment assistance, consultation questions" />
        <link rel="canonical" href="https://tradewithmrk.com/contact" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tradewithmrk.com/contact" />
        <meta property="og:title" content="Contact Us - Mr. K Trading Arena | Get Expert Trading Support" />
        <meta property="og:description" content="Contact Mr. K Trading Arena for technical support, payment issues, consultation questions, and more. Get expert help from our professional trading team." />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://tradewithmrk.com/contact" />
        <meta property="twitter:title" content="Contact Us - Mr. K Trading Arena | Get Expert Trading Support" />
        <meta property="twitter:description" content="Contact Mr. K Trading Arena for technical support, payment issues, consultation questions, and more. Get expert help from our professional trading team." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="pt-20">
          {/* Hero Section */}
          <section className="py-20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <ScrollReveal>
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-center">
                    <Mail className="w-8 h-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent via-secondary bg-clip-text text-transparent">
                  Contact Us
                </h1>
                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
                  Get in touch with our expert team for support, questions, or partnership opportunities. We're here to help you succeed in your trading journey.
                </p>
              </ScrollReveal>
            </div>
          </section>

          {/* Contact Form Section */}
          <section className="py-20">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid lg:grid-cols-3 gap-12">
                {/* Contact Information */}
                <div className="lg:col-span-1">
                  <ScrollReveal>
                    <Card className="h-fit">
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-3">
                          <MessageSquare className="w-6 h-6 text-primary" />
                          <span>Get In Touch</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-start space-x-3">
                          <Mail className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Email</p>
                            <a href="mailto:contact@tradewithmrk.com" className="text-muted-foreground hover:text-primary transition-colors">
                              contact@tradewithmrk.com
                            </a>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-3">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Response Time</p>
                            <p className="text-muted-foreground">Within 24 hours</p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <Send className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">Telegram</p>
                            <a href="https://t.me/Mrk_trading" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                              @Mrk_trading
                            </a>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-border">
                          <p className="font-medium mb-3">What can we help you with?</p>
                          <div className="space-y-2">
                            {contactReasons.slice(0, 4).map((reason) => (
                              <div key={reason.value} className="flex items-center space-x-2 text-sm">
                                <reason.icon className="w-4 h-4 text-primary" />
                                <span className="text-muted-foreground">{reason.label}</span>
                              </div>
                            ))}
                            <p className="text-xs text-muted-foreground mt-2">...and more!</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                  <ScrollReveal>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-2xl">Send us a message</CardTitle>
                        <p className="text-muted-foreground">
                          Fill out the form below and we'll get back to you as soon as possible.
                        </p>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="name">Full Name *</Label>
                              <Input
                                id="name"
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                placeholder="Enter your full name"
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="email">Email Address *</Label>
                              <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="Enter your email address"
                                required
                                disabled={isSubmitting}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="reason">Reason for Contact *</Label>
                            <Select 
                              value={formData.reason} 
                              onValueChange={(value) => handleInputChange('reason', value)}
                              disabled={isSubmitting}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select the reason for your inquiry">
                                  {selectedReason && (
                                    <div className="flex items-center space-x-2">
                                      <selectedReason.icon className="w-4 h-4" />
                                      <span>{selectedReason.label}</span>
                                    </div>
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {contactReasons.map((reason) => (
                                  <SelectItem key={reason.value} value={reason.value}>
                                    <div className="flex items-center space-x-2">
                                      <reason.icon className="w-4 h-4" />
                                      <span>{reason.label}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="message">Message *</Label>
                            <Textarea
                              id="message"
                              value={formData.message}
                              onChange={(e) => handleInputChange('message', e.target.value)}
                              placeholder="Please provide details about your inquiry..."
                              rows={6}
                              required
                              disabled={isSubmitting}
                            />
                          </div>

                          <Button 
                            type="submit" 
                            size="lg"
                            disabled={isSubmitting}
                            className="w-full md:w-auto"
                          >
                            {isSubmitting ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Sending Message...
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Send Message
                              </>
                            )}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </ScrollReveal>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-20 bg-muted/30">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <ScrollReveal>
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                  <p className="text-muted-foreground">
                    Quick answers to common inquiries
                  </p>
                </div>
              </ScrollReveal>

              <div className="grid md:grid-cols-2 gap-8">
                <ScrollReveal>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-primary mr-2" />
                        How quickly will I get a response?
                      </h3>
                      <p className="text-muted-foreground">
                        We typically respond to all inquiries within 24 hours during business days. For urgent matters, you can also reach us on Telegram.
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>

                <ScrollReveal>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-primary mr-2" />
                        What payment methods do you accept?
                      </h3>
                      <p className="text-muted-foreground">
                        We currently accept Test Coin (TCN) for consultations. Contact us if you need assistance with payments or have questions about other methods.
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>

                <ScrollReveal>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-primary mr-2" />
                        Can I reschedule my consultation?
                      </h3>
                      <p className="text-muted-foreground">
                        Yes, you can reschedule your consultation up to 24 hours before the scheduled time. Contact us with your preferred new time slot.
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>

                <ScrollReveal>
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-center">
                        <CheckCircle className="w-5 h-5 text-primary mr-2" />
                        Do you offer refunds?
                      </h3>
                      <p className="text-muted-foreground">
                        Please review our refund policy for detailed information. Generally, refunds are available under specific circumstances outlined in our terms.
                      </p>
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default ContactUs;