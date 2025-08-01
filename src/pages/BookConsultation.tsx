import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Clock, Shield, Bitcoin, Copy, CheckCircle, RefreshCw, Calendar, Star, Loader2 } from 'lucide-react';

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

interface CryptoPayment {
  id: string;
  address: string;
  amount_btc: number;
  amount_usd: number;
  expires_at: string;
  qr_code?: string;
}

interface PaymentStatus {
  id: string;
  status: 'pending' | 'partial' | 'completed' | 'expired' | 'failed';
  confirmations: number;
  transaction_hash?: string;
  total_received?: number;
  amount_required?: number;
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
  const [consultationId, setConsultationId] = useState<string | null>(null);
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPayment | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [showCalendly, setShowCalendly] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

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
      if (document.head.contains(script)) document.head.removeChild(script);
      if (document.head.contains(link)) document.head.removeChild(link);
    };
  }, []);

  // Initialize Calendly badge when payment is confirmed
  useEffect(() => {
    if (showCalendly && window.Calendly) {
      window.Calendly.initBadgeWidget({ 
        url: 'https://calendly.com/tradewithmrk', 
        text: 'Schedule Your Session', 
        color: '#0069ff', 
        textColor: '#ffffff', 
        branding: true 
      });
    }
  }, [showCalendly]);

  // Timer for payment expiration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (cryptoPayment) {
      interval = setInterval(() => {
        const now = new Date().getTime();
        const expires = new Date(cryptoPayment.expires_at).getTime();
        const distance = expires - now;

        if (distance > 0) {
          const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
          const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((distance % (1000 * 60)) / 1000);
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else {
          setTimeLeft('Expired');
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cryptoPayment]);

  // Auto-check payment status every 30 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (cryptoPayment && paymentStatus?.status !== 'completed') {
      interval = setInterval(() => {
        checkPaymentStatus();
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [cryptoPayment, paymentStatus]);

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
        description: "Now please complete the $300 BTC payment to secure your consultation slot.",
      });

      setConsultationId(data.consultation_id);

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

  const createCryptoPayment = async () => {
    if (!consultationId) return;

    setIsCreatingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { consultationId }
      });

      if (error) throw error;

      if (data.success) {
        setCryptoPayment({
          ...data.payment,
          amount_btc: data.payment.amount_btc
        });
        setPaymentStatus({
          id: data.payment.id,
          status: 'pending',
          confirmations: 0
        });
        
        toast({
          title: "Payment Address Generated",
          description: "Please send exactly the specified BTC amount to complete your booking.",
        });
      } else {
        throw new Error(data.error || 'Failed to create payment');
      }

    } catch (error) {
      console.error('Error creating crypto payment:', error);
      toast({
        title: "Payment Creation Failed",
        description: "Unable to generate payment address. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const checkPaymentStatus = async () => {
    if (!cryptoPayment) return;

    setIsCheckingPayment(true);

    try {
      const { data, error } = await supabase.functions.invoke('verify-crypto-payment', {
        body: { paymentId: cryptoPayment.id }
      });

      if (error) throw error;

      if (data.success) {
        setPaymentStatus(data.payment);
        
        if (data.payment.status === 'completed') {
          setShowCalendly(true);
          toast({
            title: "Payment Confirmed! 🎉",
            description: "Your consultation is now secured. Use the Calendly widget to schedule your session.",
          });
        }
      }

    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setIsCheckingPayment(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Payment address copied successfully.",
    });
  };

  const formatBTC = (amount: number) => {
    return amount.toFixed(8);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'partial': return 'text-yellow-400';
      case 'expired': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-20 pb-16">
        {/* Header Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <div className="inline-flex items-center px-6 py-3 border border-white/20 rounded-full text-white text-sm font-medium mb-8 backdrop-blur-sm bg-white/5">
              <Star className="w-4 h-4 mr-2" />
              Professional Trading Consultation
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Book Your 30-Minute
              <br />
              <span className="gradient-text">Strategy Session</span>
            </h1>
            <p className="text-white/80 text-lg max-w-3xl mx-auto leading-relaxed mb-8">
              Get personalized trading advice, strategy recommendations, and answers to your specific 
              trading questions in a focused 30-minute session with our expert team.
            </p>
            <div className="inline-flex items-center px-6 py-3 bg-accent/10 border border-accent/20 rounded-full text-accent text-lg font-semibold">
              <Clock className="w-5 h-5 mr-2" />
              30-minute session • $300 USD
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-8">
            
            {/* Left Column - Benefits & Form */}
            <div className="space-y-8">
              {/* What You'll Get */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl">What You'll Get</CardTitle>
                  <CardDescription className="text-white/70">
                    Comprehensive trading guidance tailored to your needs
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      icon: CheckCircle,
                      title: "Personalized Strategy & Risk Management",
                      description: "Tailored advice based on your experience level and goals"
                    },
                    {
                      icon: Shield,
                      title: "Professional Risk Assessment",
                      description: "Position sizing guidance and risk management strategies"
                    },
                    {
                      icon: Calendar,
                      title: "Direct Team Access",
                      description: "30 minutes with our professional trading team"
                    }
                  ].map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <benefit.icon className="w-5 h-5 text-accent mt-1 flex-shrink-0" />
                      <div>
                        <h4 className="text-white font-medium">{benefit.title}</h4>
                        <p className="text-white/70 text-sm">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Booking Form */}
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Schedule Your Call</CardTitle>
                  <CardDescription className="text-white/70">
                    Fill out the form below to begin the booking process
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleConsultationSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-white">Full Name *</Label>
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
                        <Label htmlFor="email" className="text-white">Email Address *</Label>
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
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="telegram" className="text-white">Telegram Handle</Label>
                        <Input 
                          id="telegram"
                          value={formData.telegram}
                          onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                          placeholder="@yourusername" 
                          className="bg-white/5 border-white/20 text-white placeholder:text-gray-400" 
                        />
                      </div>
                      <div>
                        <Label htmlFor="timePreference" className="text-white">Preferred Time *</Label>
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
                    
                    <div>
                      <Label htmlFor="experience" className="text-white">Trading Experience Level *</Label>
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
                    
                    <div>
                      <Label htmlFor="purpose" className="text-white">What would you like to discuss? *</Label>
                      <Textarea 
                        id="purpose"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        placeholder="Tell us about your trading goals, specific challenges, current strategies, and what you'd like to focus on during our session..."
                        rows={4}
                        required
                        className="bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-accent hover:bg-accent/90 text-white font-semibold"
                      disabled={isSubmitting || !!consultationId}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                          Submitting...
                        </>
                      ) : consultationId ? (
                        <>
                          <CheckCircle className="mr-2 w-4 h-4" />
                          Request Submitted
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 w-4 h-4" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Payment Section */}
            <div className="space-y-8">
              
              {/* Payment Instructions */}
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white text-xl flex items-center">
                    <Bitcoin className="w-6 h-6 mr-2 text-accent" />
                    Secure Bitcoin Payment
                  </CardTitle>
                  <CardDescription className="text-white/70">
                    Complete your $300 USD payment to secure your consultation slot
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <span className="text-white">Session Fee:</span>
                    <span className="text-accent font-bold text-lg">$300 USD</span>
                  </div>
                  
                  {!consultationId ? (
                    <div className="text-center py-8">
                      <Bitcoin className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60 mb-4">Submit the form to generate your Bitcoin payment address</p>
                    </div>
                  ) : !cryptoPayment ? (
                    <div className="text-center py-4">
                      <Button 
                        onClick={createCryptoPayment}
                        disabled={isCreatingPayment}
                        className="w-full bg-accent hover:bg-accent/90 text-white font-semibold h-12"
                      >
                        {isCreatingPayment ? (
                          <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            Generating Address...
                          </>
                        ) : (
                          <>
                            <Bitcoin className="mr-2 w-4 h-4" />
                            Generate Bitcoin Address
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Payment Address */}
                      <div>
                        <Label className="text-white">Bitcoin Address:</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input 
                            value={cryptoPayment.address}
                            readOnly
                            className="bg-white/5 border-white/20 text-white font-mono text-sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(cryptoPayment.address)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Amount */}
                      <div>
                        <Label className="text-white">Amount to Send:</Label>
                        <div className="flex items-center space-x-2 mt-1">
                          <Input 
                            value={`${formatBTC(cryptoPayment.amount_btc)} BTC`}
                            readOnly
                            className="bg-white/5 border-white/20 text-white font-mono text-lg font-bold"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(formatBTC(cryptoPayment.amount_btc))}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* QR Code */}
                      {cryptoPayment.qr_code && (
                        <div className="text-center">
                          <img 
                            src={cryptoPayment.qr_code} 
                            alt="Payment QR Code"
                            className="mx-auto max-w-[200px] bg-white p-2 rounded"
                          />
                          <p className="text-white/60 text-sm mt-2">Scan with your Bitcoin wallet</p>
                        </div>
                      )}

                      {/* Payment Status */}
                      {paymentStatus && (
                        <div className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white">Payment Status:</span>
                            <span className={`font-semibold capitalize ${getStatusColor(paymentStatus.status)}`}>
                              {paymentStatus.status}
                            </span>
                          </div>
                          {paymentStatus.confirmations > 0 && (
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white">Confirmations:</span>
                              <span className="text-white font-mono">{paymentStatus.confirmations}</span>
                            </div>
                          )}
                          {paymentStatus.total_received && paymentStatus.amount_required && (
                            <div className="flex items-center justify-between">
                              <span className="text-white">Received:</span>
                              <span className="text-white font-mono">
                                {formatBTC(paymentStatus.total_received)} / {formatBTC(paymentStatus.amount_required)} BTC
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Timer */}
                      <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg">
                        <span className="text-white flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          Time Remaining:
                        </span>
                        <span className="text-accent font-mono font-bold">{timeLeft}</span>
                      </div>

                      {/* Check Payment Button */}
                      <Button 
                        onClick={checkPaymentStatus}
                        disabled={isCheckingPayment || paymentStatus?.status === 'completed'}
                        className="w-full border border-white/20 bg-white/5 hover:bg-white/10 text-white"
                        variant="outline"
                      >
                        {isCheckingPayment ? (
                          <>
                            <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <RefreshCw className="mr-2 w-4 h-4" />
                            Check Payment Status
                          </>
                        )}
                      </Button>

                      {paymentStatus?.status === 'completed' && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                          <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <p className="text-green-400 font-semibold mb-2">Payment Confirmed!</p>
                          <p className="text-white/80 text-sm mb-4">
                            Your consultation is secured. Use the Calendly widget to schedule your session.
                          </p>
                          {showCalendly && (
                            <p className="text-accent text-sm">
                              Look for the Calendly badge in the bottom right corner →
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default BookConsultation;