import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Clock, CheckCircle, AlertCircle, Coins, QrCode, Calendar, User, Mail, MessageSquare, Target, Award, Loader2, AlertTriangle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

import { ScrollReveal } from '@/hooks/useScrollReveal';

// Production configuration
const CONSULTATION_FEE_USD = 2;

// Calendly interface for TypeScript
declare global {
  interface Window {
    Calendly: {
      initInlineWidget: (options: {
        url: string;
        parentElement: HTMLElement;
        prefill?: object;
        utm?: object;
        settings?: object;
      }) => void;
      initPopupWidget: (options: {
        url: string;
        prefill?: object;
        utm?: object;
        settings?: object;
      }) => void;
      initBadgeWidget: (options: {
        url: string;
        text: string;
        color: string;
        textColor: string;
        branding?: boolean;
      }) => void;
    };
  }
}

// Listen for Calendly events
const handleCalendlyMessage = (e: MessageEvent) => {
  // allow both Calendly origins
  if (!['https://calendly.com', 'https://assets.calendly.com'].includes(e.origin)) return;

  
  if (e.data.event && e.data.event.indexOf('calendly') === 0) {
    return e.data;
  }
};

interface CryptoPayment {
  id: string;
  payment_address: string;
  amount_crypto: number;
  amount_usd: number;
  expires_at: string;
  qr_code?: string;
}

interface PaymentStatus {
  id: string;
  status: 'pending' | 'partial' | 'completed' | 'expired';
  confirmations: number;
  amount_received?: number;
  transaction_hash?: string;
}

const BookConsultation = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'schedule'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPayment | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showCalendly, setShowCalendly] = useState(false);
  const [isCreatingPayment, setIsCreatingPayment] = useState(false);
  const [isScheduleClicked, setIsScheduleClicked] = useState(false);
  const [hasBookedAppointment, setHasBookedAppointment] = useState(false);
  const [isCalendlyLoading, setIsCalendlyLoading] = useState(false);
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);

  // Add state for consultation ID to persist between steps
  const [consultationId, setConsultationId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    preferredTime: '',
    experienceLevel: '',
    purpose: '',
  });

  // Page refresh prevention and local storage backup
  useEffect(() => {
    // Save form data to localStorage whenever it changes
    if (currentStep === 'payment' && cryptoPayment) {
      localStorage.setItem('bookConsultation', JSON.stringify({
        formData,
        cryptoPayment,
        paymentStatus,
        consultationId,
        currentStep,
        timestamp: Date.now()
      }));
    }

    // Clean up localStorage when consultation is completed
    if (currentStep === 'schedule' && paymentStatus?.status === 'completed') {
      localStorage.removeItem('bookConsultation');
    }
  }, [formData, cryptoPayment, paymentStatus, consultationId, currentStep]);

  // Restore data from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('bookConsultation');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        // Only restore if data is less than 24 hours old
        if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
          setFormData(data.formData || formData);
          setCryptoPayment(data.cryptoPayment);
          setPaymentStatus(data.paymentStatus);
          setConsultationId(data.consultationId);
          if (data.currentStep === 'payment' && data.cryptoPayment) {
            setCurrentStep('payment');
          }
        } else {
          localStorage.removeItem('bookConsultation');
        }
      } catch (error) {
        localStorage.removeItem('bookConsultation');
      }
    }
  }, []);

  // Prevent page refresh/close during payment
  useEffect(() => {
    if (currentStep === 'payment' && cryptoPayment && paymentStatus?.status !== 'completed') {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = 'Your payment is in progress. Are you sure you want to leave? Your payment details will be lost.';
        return e.returnValue;
      };

      window.addEventListener('beforeunload', handleBeforeUnload);

      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [currentStep, cryptoPayment, paymentStatus?.status]);

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStep]);

  // Reset schedule button state when step changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsScheduleClicked(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, [isScheduleClicked]);
  

  // Load Calendly widget and set up event listeners
  useEffect(() => {
    // Check if Calendly is already loaded
    if (window.Calendly) {
      setIsCalendlyLoaded(true);
      return;
    }

    // Don't load script if it already exists
    if (document.querySelector('script[src*="calendly.com"]')) {
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    // script.crossOrigin = 'anonymous';
    
    script.onload = () => {
      console.log('Calendly script loaded successfully');
      setIsCalendlyLoaded(true);
    };
    
    script.onerror = (error) => {
      console.error('Calendly script failed to load:', error);
      toast({
        title: "Calendar Loading Error",
        description: "There was an issue loading the calendar. Please check your connection and try refreshing the page.",
        variant: "destructive",
      });
    };
    
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    // Set up Calendly event listener
    const handleCalendlyEvent = (e: MessageEvent) => {
      // allow both Calendly origins
      if (!['https://calendly.com', 'https://assets.calendly.com'].includes(e.origin)) return;
      
      if (e.data.event === 'calendly.event_scheduled') {
        setHasBookedAppointment(true);
        setIsCalendlyLoading(false);
        toast({
          title: "Appointment Booked! 🎉",
          description: "Your consultation has been successfully scheduled. You'll receive a confirmation email shortly.",
        });
      }
    };

    window.addEventListener('message', handleCalendlyEvent);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
      window.removeEventListener('message', handleCalendlyEvent);
    };
  }, [toast]);

  // Initialize Calendly when payment is confirmed
  useEffect(() => {
    if (paymentStatus?.status === 'completed' && !showCalendly) {
      setShowCalendly(true);
      setCurrentStep('schedule');
    }
  }, [paymentStatus?.status, showCalendly]);

  // Initialize Calendly widget when schedule step is reached
  useEffect(() => {
    if (currentStep === 'schedule') {
      let retryCount = 0;
      const maxRetries = 5;
      
      const initializeCalendly = () => {
        const container = document.querySelector('#calendly-inline-widget');
        
        if (!window.Calendly) {
          // Retry if Calendly hasn't loaded yet
          if (retryCount < maxRetries) {
            retryCount++;
            setTimeout(initializeCalendly, 1000);
          }
          return;
        }
        
        if (container && !container.querySelector('iframe')) {
          const calendlyUrl = 'https://calendly.com/tradewithmrk/30min';
          
          try {
            window.Calendly.initInlineWidget({
              url: calendlyUrl,
              parentElement: container as HTMLElement,
              prefill: {
                name: formData.name,
                email: formData.email
              },
              utm: {},
              settings: {
                hideEventTypeDetails: false,
                hideLandingPageDetails: false
              }
            });
          } catch (error) {
            // Calendly initialization error - retry
            if (retryCount < maxRetries) {
              retryCount++;
              setTimeout(initializeCalendly, 1000 * retryCount);
            }
          }
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(initializeCalendly, 500);
        }
      };

      const timer = setTimeout(initializeCalendly, 500);
      return () => clearTimeout(timer);
    }
  }, [currentStep, formData.name, formData.email]);

  // Payment expiration timer
  useEffect(() => {
    if (!cryptoPayment?.expires_at) return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(cryptoPayment.expires_at).getTime();
      const difference = expiry - now;

      if (difference > 0) {
        setTimeLeft(Math.floor(difference / 1000));
      } else {
        setTimeLeft(0);
        setPaymentStatus(prev => prev ? { ...prev, status: 'expired' } : null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [cryptoPayment?.expires_at]);

  // Check payment status periodically
  useEffect(() => {
    if (!cryptoPayment?.id || paymentStatus?.status === 'completed') return;

    {
      const checkStatus = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('verify-crypto-payment', {
            body: { paymentId: cryptoPayment.id }
          });

          if (error) {
            return;
          }

          if (data?.success && data?.payment) {
            setPaymentStatus(data.payment);
            
            if (data.payment.status === 'completed') {
              // Send payment success emails
              try {
                await supabase.functions.invoke('send-payment-success-email', {
                  body: {
                    userEmail: formData.email,
                    userName: formData.name,
                    paymentAddress: cryptoPayment.payment_address,
                    amountCrypto: cryptoPayment.amount_crypto,
                    amountUSD: cryptoPayment.amount_usd,
                    transactionHash: data.payment.transaction_hash,
                    consultationId: consultationId || cryptoPayment.id
                  }
                });
              } catch (emailError) {
                console.error('Failed to send payment success emails:', emailError);
                // Don't block the UI for email failures
              }

              toast({
                title: "Payment Confirmed! 🎉",
                description: "Your payment has been verified. You can now schedule your consultation.",
              });
            }
          }
        } catch (error) {
          // Silent error handling for payment status checks
        }
      };

      const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
      return () => clearInterval(interval);
    }
  }, [cryptoPayment?.id, paymentStatus?.status, toast]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-consultation-request', {
        body: formData
      });

      if (error) {
        throw new Error(error.message || 'Failed to submit form');
      }

      if (data?.success && data?.consultationId) {
        setConsultationId(data.consultationId);
        await createCryptoPayment(data.consultationId);
        setCurrentStep('payment');
        toast({
          title: "Form Submitted Successfully! ✅",
          description: "Please complete the payment to confirm your consultation booking.",
        });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const createCryptoPayment = async (consultationId: string) => {
    setIsCreatingPayment(true);
    console.log('🚀 Creating crypto payment for consultation:', consultationId);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { 
          consultationId,
          amountUSD: CONSULTATION_FEE_USD 
        }
      });

      console.log('💡 Payment creation response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw new Error(`Function error: ${error.message}`);
      }

      if (data?.success && data?.payment) {
        console.log('✅ Payment created successfully:', data.payment);
        setCryptoPayment(data.payment);
        setPaymentStatus({
          id: data.payment.id,
          status: 'pending',
          confirmations: 0,
        });
        
        toast({
          title: "Payment Created! 💰",
          description: "Your Test Coin payment address has been generated. Check your email for payment details.",
        });
      } else {
        console.error('❌ Payment creation failed:', data);
        const errorMessage = data?.error || "Unknown error occurred";
        const errorType = data?.type || "unknown";
        const errorDetails = data?.details || "";
        
        let userFriendlyMessage = "There was an issue creating your payment. Please try again.";
        
        if (errorType === 'credentials_error') {
          userFriendlyMessage = "Payment system is temporarily unavailable. Please contact support.";
        } else if (errorType === 'nowpayments_error') {
          userFriendlyMessage = "Payment provider error. Please try again in a few minutes.";
        } else if (errorType === 'database_error') {
          userFriendlyMessage = "Database error. Please try again or contact support.";
        }
        
        throw new Error(`${errorMessage}${errorDetails ? ` (${errorDetails})` : ''}`);
      }
    } catch (error: any) {
      console.error('💥 Payment creation error:', error);
      toast({
        title: "Payment Creation Failed",
        description: error.message || "There was an issue creating your payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingPayment(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied! 📋",
        description: "Address copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  const formatTCN = (amount: number) => {
    return amount.toFixed(2);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      case 'expired': return 'text-red-600 dark:text-red-400';
      default: return 'text-blue-600 dark:text-blue-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'partial': return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'expired': return <AlertCircle className="h-5 w-5 text-red-600" />;
      default: return <Clock className="h-5 w-5 text-blue-600" />;
    }
  };

  const handleScheduleClick = () => {
    if (!window.Calendly || !isCalendlyLoaded) {
      toast({
        title: "Calendar Loading",
        description: "Please wait for the calendar to load and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsCalendlyLoading(true);
    setIsScheduleClicked(true);

    try {
      const calendlyUrl = 'https://calendly.com/tradewithmrk/30min';
      
      window.Calendly.initPopupWidget({
        url: calendlyUrl,
        prefill: {
          name: formData.name,
          email: formData.email
        },
        utm: {},
        settings: {
          hideEventTypeDetails: false,
          hideLandingPageDetails: false
        }
      });

      // Reset loading state after a short delay
      setTimeout(() => {
        setIsCalendlyLoading(false);
      }, 1000);

    } catch (error) {
      toast({
        title: "Calendar Error",
        description: "Failed to open calendar. Please try refreshing the page.",
        variant: "destructive",
      });
      setIsCalendlyLoading(false);
    }
  };

  return ( 
    <div>
      <Helmet>
        <title>Book Trading Consultation - $300 TCN Payment | Mr. K Trading Arena</title>
        <meta name="description" content="Book a 30-minute personalized trading consultation with professional crypto trader Mr. K for $300 USD. Expert market analysis, strategy development, and actionable trading insights." />
        <meta name="keywords" content="trading consultation, crypto trading advice, test payment, trading strategy, market analysis, professional trader" />
        <link rel="canonical" href="https://tradewithmrk.com/book-consultation" />
        <meta property="og:title" content="Book Trading Consultation - Professional Crypto Trading Guidance" />
        <meta property="og:description" content="Get personalized trading advice from expert trader Mr. K. 30-minute consultation for $300 USD with test payment." />
        <meta property="og:url" content="https://tradewithmrk.com/book-consultation" />
        <meta property="og:type" content="website" />
      </Helmet>
      <Header />
      <div className="min-h-screen pt-16 bg-gradient-to-br from-background via-background to-muted/30">
       
      
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] animate-pulse"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <ScrollReveal>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Book Your Trading
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Strategy Session</span>
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={100}>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Get personalized trading guidance from our expert. Complete the form, make payment, and schedule your one-on-one consultation.
              </p>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              {/* Progress Steps */}
              <div className="mt-12 flex justify-center">
                <div className="flex items-center space-x-4">
                  {['form', 'payment', 'schedule'].map((step, index) => (
                    <div key={step} className="flex items-center space-x-4">
                      <div className={`flex items-center space-x-2 ${
                        currentStep === step ? 'text-accent' : 
                        ['form', 'payment', 'schedule'].indexOf(currentStep) > index ? 'text-green-600' : 'text-muted-foreground'
                      }`}>
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full border-2 font-semibold ${
                          currentStep === step ? 'border-accent bg-accent text-accent-foreground' :
                          ['form', 'payment', 'schedule'].indexOf(currentStep) > index ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground bg-background'
                        }`}>
                          {['form', 'payment', 'schedule'].indexOf(currentStep) > index ? (
                            <CheckCircle className="h-5 w-5" />
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                        <span className="hidden font-medium sm:block">
                          {step === 'form' ? 'Submit Form' : step === 'payment' ? 'Make Payment' : 'Schedule Call'}
                        </span>
                      </div>
                      {index < 2 && (
                        <div className={`h-0.5 w-12 rounded ${
                          ['form', 'payment', 'schedule'].indexOf(currentStep) > index ? 'bg-green-600' : 'bg-muted-foreground/30'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Step 1: Form */}
        {currentStep === 'form' && (
          <div className="space-y-8">
            {/* Fee Information - Prominent Display */}
            <ScrollReveal delay={0} distance="30px" duration={600}>
              <Card className="border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-accent/5 mb-8">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                    <Award className="h-6 w-6 text-primary" />
                    Professional Trading Consultation
                  </CardTitle>
                  <div className="text-3xl font-bold text-primary mt-2">$300 USD</div>
                  <p className="text-muted-foreground mt-2">One-time fee for your 30-minute expert session</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    This investment covers a personalized consultation with our expert trader, including market analysis, 
                    strategy development, and actionable insights tailored to your trading goals.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Payment via Test Coin (TCN) for testing purposes</p>
                    <p>• Schedule immediately after payment confirmation</p>
                    <p>• Professional guidance worth much more than the fee</p>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* What You'll Get Section - Moved to Top */}
            <div className="grid md:grid-cols-2 gap-6">
              <ScrollReveal delay={100} distance="30px" duration={600}>
                <Card className="border-2 border-accent/20 bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-accent" />
                      Personalized Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Get a customized trading strategy tailored specifically to your experience level, goals, and risk tolerance.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={150} distance="30px" duration={600}>
                <Card className="border-2 border-accent/20 bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <MessageSquare className="h-5 w-5 text-accent" />
                      Expert Market Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Receive professional analysis of current market conditions and opportunities you might be missing.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={200} distance="30px" duration={600}>
                <Card className="border-2 border-accent/20 bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="h-5 w-5 text-accent" />
                      30-Minute Focused Session
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Intensive one-on-one consultation designed to maximize value and provide actionable insights quickly.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>

              <ScrollReveal delay={250} distance="30px" duration={600}>
                <Card className="border-2 border-accent/20 bg-accent/5">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle className="h-5 w-5 text-accent" />
                      Clear Action Plan
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">Walk away with a concrete plan and next steps to immediately improve your trading performance.</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            </div>

            <ScrollReveal delay={300} distance="30px" duration={700}>
              <Card className="mx-auto shadow-lg max-w-2xl">
                <CardHeader className="text-center space-y-4 px-4 sm:px-6">
                  <CardTitle className="flex items-center justify-center gap-2 text-2xl sm:text-3xl">
                    <User className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                    Your Information
                  </CardTitle>
                  <p className="text-muted-foreground text-base sm:text-lg">Tell us about yourself and your trading goals</p>
                </CardHeader>
                <CardContent className="space-y-6 px-4 sm:px-6">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <ScrollReveal delay={400} distance="20px" duration={500}>
                    <div className="grid gap-4 sm:gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12 text-base"
                        />
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={450} distance="20px" duration={500}>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="telegram" className="text-sm font-medium">Telegram Username</Label>
                        <Input
                          id="telegram"
                          type="text"
                          placeholder="@yourusername"
                          value={formData.telegram}
                          onChange={(e) => setFormData({ ...formData, telegram: e.target.value })}
                          className="h-12 text-base"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferredTime" className="text-sm font-medium">Preferred Time Zone *</Label>
                        <Select value={formData.preferredTime} onValueChange={(value) => setFormData({ ...formData, preferredTime: value })}>
                          <SelectTrigger className="h-12 text-base">
                            <SelectValue placeholder="Select your time zone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="EST">Eastern Time (EST)</SelectItem>
                            <SelectItem value="PST">Pacific Time (PST)</SelectItem>
                            <SelectItem value="GMT">Greenwich Mean Time (GMT)</SelectItem>
                            <SelectItem value="CET">Central European Time (CET)</SelectItem>
                            <SelectItem value="JST">Japan Standard Time (JST)</SelectItem>
                            <SelectItem value="AEST">Australian Eastern Time (AEST)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={500} distance="20px" duration={500}>
                    <div className="space-y-2">
                      <Label htmlFor="experienceLevel" className="text-sm font-medium">Trading Experience Level *</Label>
                      <Select value={formData.experienceLevel} onValueChange={(value) => setFormData({ ...formData, experienceLevel: value })}>
                        <SelectTrigger className="h-12 text-base">
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                          <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                          <SelectItem value="advanced">Advanced (3+ years)</SelectItem>
                          <SelectItem value="professional">Professional (5+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={550} distance="20px" duration={500}>
                    <div className="space-y-2">
                      <Label htmlFor="purpose" className="text-sm font-medium">What would you like to discuss? *</Label>
                      <Textarea
                        id="purpose"
                        placeholder="Describe your trading goals, challenges, or specific topics you'd like to cover during the session..."
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                        required
                        className="min-h-[120px] resize-none text-base"
                      />
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={600} distance="20px" duration={600}>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70 transform transition-transform duration-200 hover:scale-105"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting...
                        </div>
                      ) : (
                        'Continue to Payment'
                      )}
                    </Button>
                  </ScrollReveal>
                </form>

              </CardContent>
            </Card>
            </ScrollReveal>
          </div>
        )}

        {/* Step 2: Payment */}
        {currentStep === 'payment' && (
          <div className="space-y-6">
            {isCreatingPayment ? (
              <ScrollReveal>
                <Card className="border-2 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Loader2 className="h-12 w-12 animate-spin text-accent" />
                    <h3 className="mt-4 text-xl font-semibold">Creating Payment Address...</h3>
                    <p className="text-muted-foreground">Please wait while we set up your TCN payment</p>
                  </CardContent>
                </Card>
              </ScrollReveal>
            ) : cryptoPayment ? (
              <div className="space-y-6">
                <ScrollReveal delay={0} distance="30px" duration={600}>
                  <Card className="border-2 shadow-lg">
                    <CardHeader className="text-center">
                      <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                        <Coins className="h-8 w-8 text-orange-500" />
                        TCN Payment Required
                      </CardTitle>
                       <div className="text-2xl font-bold text-accent">
                        ${cryptoPayment.amount_usd} USD = {formatTCN(cryptoPayment.amount_crypto)} TCN
                      </div>
                    </CardHeader>
                  </Card>
                </ScrollReveal>

                <ScrollReveal delay={100} distance="30px" duration={600}>
                  <Card className="border-2 shadow-lg">
                    <CardContent className="space-y-6 pt-6">
                      {/* Critical Warning Alert */}
                      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div className="space-y-2">
                            <h3 className="font-semibold text-destructive">⚠️ Critical: Do Not Refresh This Page</h3>
                            <ul className="text-sm text-destructive/80 space-y-1 list-disc list-inside">
                              <li>Your payment details will be permanently lost if you refresh</li>
                              <li>Keep this tab open until payment is confirmed</li>
                              <li>Use a different tab if you need to check your wallet</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      {/* Timer and Status */}
                      <div className="space-y-4">
                        {timeLeft > 0 && paymentStatus?.status !== 'completed' && (
                          <ScrollReveal delay={150} distance="20px" duration={500}>
                            <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 text-center dark:border-orange-800 dark:bg-orange-950">
                              <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300">
                                <Clock className="h-5 w-5" />
                                <span className="font-medium">Payment expires in:</span>
                              </div>
                              <div className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
                                {formatTime(timeLeft)}
                              </div>
                            </div>
                          </ScrollReveal>
                        )}

                        {/* Payment Status */}
                        <ScrollReveal delay={200} distance="20px" duration={500}>
                          <div className="rounded-lg border-2 p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                {getStatusIcon(paymentStatus?.status || 'pending')}
                                <div>
                                  <span className="font-semibold">
                                    Status: <span className={getStatusColor(paymentStatus?.status || 'pending')}>
                                      {paymentStatus?.status?.charAt(0).toUpperCase() + paymentStatus?.status?.slice(1) || 'Pending'}
                                    </span>
                                  </span>
                                  <div className="text-sm text-muted-foreground">
                                    Confirmations: {paymentStatus?.confirmations || 0}/1 required
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {paymentStatus?.amount_received && (
                              <div className="mt-2 text-sm text-muted-foreground">
                                Received: {formatTCN(paymentStatus.amount_received)} TCN
                              </div>
                            )}
                          </div>
                        </ScrollReveal>
                      </div>

                      {/* Payment Details Grid */}
                      <div className="grid gap-6 lg:grid-cols-2">
                        {/* QR Code */}
                        <ScrollReveal delay={250} distance="30px" duration={600}>
                          <div className="flex flex-col items-center space-y-4">
                            <div className="flex items-center gap-2 text-lg font-semibold">
                              <QrCode className="h-5 w-5" />
                              Scan to Pay
                            </div>
                            {cryptoPayment.qr_code ? (
                              <div className="rounded-lg border-2 p-4 bg-white">
                                <img 
                                  src={cryptoPayment.qr_code} 
                                  alt="Test Coin Payment QR Code"
                                  className="h-48 w-48 object-contain"
                                />
                              </div>
                            ) : (
                              <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 bg-muted">
                                <p className="text-center text-sm text-muted-foreground">QR Code not available</p>
                              </div>
                            )}
                          </div>
                        </ScrollReveal>

                        {/* Payment Information */}
                        <ScrollReveal delay={300} distance="30px" duration={600}>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Test Coin Address</Label>
                              <div className="flex gap-2">
                                <code className="flex-1 rounded-lg bg-muted p-3 text-xs break-all font-mono">
                                  {cryptoPayment.payment_address}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(cryptoPayment.payment_address)}
                                  className="shrink-0 hover:scale-105 transition-transform duration-200"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Amount (TCN)</Label>
                              <div className="flex gap-2">
                                <code className="flex-1 rounded-lg bg-muted p-3 text-sm font-bold font-mono">
                                  {formatTCN(cryptoPayment.amount_crypto)}
                                </code>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => copyToClipboard(formatTCN(cryptoPayment.amount_crypto))}
                                  className="shrink-0 hover:scale-105 transition-transform duration-200"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label className="text-sm font-semibold">Amount (USD)</Label>
                              <div className="rounded-lg bg-muted p-3">
                                <span className="text-lg font-bold">${cryptoPayment.amount_usd}</span>
                              </div>
                            </div>
                          </div>
                        </ScrollReveal>
                      </div>

                      {/* Instructions */}
                      <ScrollReveal delay={350} distance="30px" duration={600}>
                        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
                          <h4 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">Payment Instructions:</h4>
                          <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                            <li className="flex items-start gap-2">
                              <span className="font-semibold">1.</span>
                              Send exactly <strong>{formatTCN(cryptoPayment.amount_crypto)} TCN</strong> to the address above
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-semibold">2.</span>
                              Payment will be confirmed automatically within 10-15 minutes
                            </li>
                            <li className="flex items-start gap-2">
                              <span className="font-semibold">3.</span>
                              Once confirmed, you'll be able to schedule your consultation
                            </li>
                          </ol>
                        </div>
                      </ScrollReveal>

                      {/* Success State */}
                      {paymentStatus?.status === 'completed' && (
                        <ScrollReveal delay={400} distance="30px" duration={700}>
                          <div className="rounded-lg border-2 border-green-200 bg-green-50 p-6 text-center dark:border-green-800 dark:bg-green-950">
                            <CheckCircle className="mx-auto h-16 w-16 text-green-600 dark:text-green-400" />
                            <h3 className="mt-4 text-2xl font-bold text-green-900 dark:text-green-100">
                              Payment Confirmed! 🎉
                            </h3>
                            <p className="mt-2 text-green-800 dark:text-green-200">
                              Your payment has been verified. You can now schedule your consultation.
                            </p>
                            <Button 
                              onClick={() => setCurrentStep('schedule')}
                              className="mt-6 bg-green-600 hover:bg-green-700 text-white hover:scale-105 transition-transform duration-200"
                              size="lg"
                            >
                              Schedule Your Session
                            </Button>
                          </div>
                        </ScrollReveal>
                      )}
                    </CardContent>
                  </Card>
                </ScrollReveal>
              </div>
            ) : (
              <ScrollReveal>
                <Card className="border-2 border-red-200 shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <h3 className="mt-4 text-xl font-semibold">Payment Creation Failed</h3>
                    <p className="text-muted-foreground text-center">There was an issue creating your payment. Please try again.</p>
                    <Button 
                      onClick={() => setCurrentStep('form')}
                      variant="outline"
                      className="mt-4"
                    >
                      Return to Form
                    </Button>
                  </CardContent>
                </Card>
              </ScrollReveal>
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 'schedule' && (
          <div className="space-y-6 sm:space-y-8 w-full max-w-2xl mx-auto">
            {/* Session Info Header */}
            <ScrollReveal>
              <div className="text-center space-y-4 sm:space-y-6 px-4">
                <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-4 sm:px-6 py-2 sm:py-3 text-sm sm:text-base text-green-800 dark:bg-green-900 dark:text-green-200">
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="font-semibold">Payment Confirmed</span>
                </div>
                
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground px-2">
                  Schedule Your Trading Strategy Session
                </h2>
                
                <p className="text-base sm:text-lg text-muted-foreground px-2">
                  Your payment has been confirmed! Click the button below to schedule your 30-minute consultation.
                </p>
              </div>
            </ScrollReveal>

            {/* Session Details Card */}
            <ScrollReveal delay={100} distance="30px" duration={600}>
              <Card className="mx-4 sm:mx-auto sm:max-w-md">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-3 sm:mb-4 text-lg sm:text-xl font-semibold text-center">Session Details</h3>
                  <div className="space-y-2 sm:space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Duration:</span>
                      <span>30 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Format:</span>
                      <span>Video call</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Price:</span>
                      <span className="text-green-600 font-semibold">Paid ✓</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Main Scheduling Action */}
            <ScrollReveal delay={150} distance="30px" duration={700}>
              <Card className="text-center shadow-lg mx-4 sm:mx-0">
                <CardContent className="p-6 sm:p-8 lg:p-12">
                  <div className="space-y-4 sm:space-y-6">
                    <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-accent/10 rounded-full flex items-center justify-center">
                      <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-accent" />
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                        Ready to Schedule?
                      </h3>
                      <p className="text-sm sm:text-base text-muted-foreground">
                        Click the button below to open Calendly and select your preferred time slot.
                      </p>
                    </div>

                    {/* Calendly Popup Widget Button - Hidden after successful booking */}
                    {!hasBookedAppointment && (
                      <div className="text-center space-y-4">
                        <Button
                          onClick={handleScheduleClick}
                          disabled={isCalendlyLoading || !isCalendlyLoaded}
                          className="w-full max-w-md h-14 text-lg font-semibold hover:scale-105 transition-transform duration-200"
                          size="lg"
                        >
                          {isCalendlyLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                              Opening calendar...
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              Schedule My Trading Session
                            </div>
                          )}
                        </Button>
                        {!isCalendlyLoaded && (
                          <p className="text-sm text-muted-foreground">
                            Loading calendar system...
                          </p>
                        )}
                      </div>
                    )}

                    {/* Booking Confirmation - Appears after actual booking */}
                    {hasBookedAppointment && (
                      <ScrollReveal delay={200} distance="20px" duration={600}>
                        <Card className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800 mt-6">
                          <CardContent className="p-6">
                            <div className="text-center space-y-4">
                              <div className="flex justify-center">
                                <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
                              </div>
                              <h4 className="text-2xl font-bold text-green-900 dark:text-green-100">
                                🎉 Appointment Successfully Booked!
                              </h4>
                              <p className="text-green-800 dark:text-green-200">
                                Thank you! Your consultation has been scheduled. You'll receive a confirmation email with all the details shortly.
                              </p>
                              <div className="text-sm text-green-700 dark:text-green-300 space-y-1">
                                <p>• Check your email for the meeting link</p>
                                <p>• Add the event to your calendar</p>
                                <p>• Prepare any questions you'd like to discuss</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </ScrollReveal>
                    )}

                    {isScheduleClicked && (
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        <p className="text-accent font-medium">• Button will be available again in 5 seconds</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>

            {/* Alternative Contact Information */}
            <ScrollReveal delay={250} distance="30px" duration={600}>
              <Card className="bg-muted/50 mx-4 sm:mx-0">
                <CardContent className="p-4 sm:p-6 text-center">
                  <h4 className="font-semibold mb-2 text-sm sm:text-base">Having Issues?</h4>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                    If you have any trouble scheduling, feel free to reach out directly:
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                     <Button variant="outline" size="sm" asChild className="min-h-[44px] text-sm hover:scale-105 transition-transform duration-200">
                       <a href="mailto:support@tradewithmrk.com" className="inline-flex items-center gap-2">
                         <Mail className="h-4 w-4" />
                         Email Support
                       </a>
                     </Button>
                     <Button variant="outline" size="sm" asChild className="min-h-[44px] text-sm hover:scale-105 transition-transform duration-200">
                       <a href="https://t.me/Mrk_trading" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2">
                         <MessageSquare className="h-4 w-4" />
                         Telegram
                       </a>
                     </Button>
                   </div>
                 </CardContent>
               </Card>
             </ScrollReveal>
           </div>
         )}
       </div>
       </div>
       <Footer />
     </div>
   );
 };

export default BookConsultation;