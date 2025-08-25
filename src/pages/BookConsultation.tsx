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
import { Coins, Calendar, User, Mail, MessageSquare, Target, Award, Loader2, CheckCircle, Clock, AlertTriangle, RefreshCw } from 'lucide-react';


import { ScrollReveal } from '@/hooks/useScrollReveal';

// Testing configuration - will change to 300 after testing
const CONSULTATION_FEE_USD = 17;

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


const BookConsultation = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<'form' | 'payment' | 'schedule'>('form');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isScheduleClicked, setIsScheduleClicked] = useState(false);
  const [hasBookedAppointment, setHasBookedAppointment] = useState(false);
  const [isCalendlyLoading, setIsCalendlyLoading] = useState(false);
  const [isCalendlyLoaded, setIsCalendlyLoaded] = useState(false);

  // Payment status tracking
  const [paymentStatus, setPaymentStatus] = useState<'unpaid' | 'processing' | 'completed' | 'confirmed'>('unpaid');
  const [paymentWindowOpened, setPaymentWindowOpened] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  const [invoiceUrl, setInvoiceUrl] = useState<string>('');

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

  // Clear any old localStorage data on mount
  useEffect(() => {
    localStorage.removeItem('bookConsultation');
  }, []);

  // Check URL parameters for payment status on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentParam = urlParams.get('payment');
    
    if (paymentParam === 'success') {
      console.log('Payment success detected from URL');
      setCurrentStep('payment');
      setPaymentStatus('processing');
      toast({
        title: "Payment Processing 🔄",
        description: "Your payment is being verified. We'll update you when it's confirmed.",
      });
      
      // Start checking payment status immediately
      setTimeout(() => {
        checkPaymentStatus();
      }, 2000);
      
      // Clear URL parameters to clean up the URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    } else if (paymentParam === 'cancelled') {
      console.log('Payment cancelled detected from URL');
      setCurrentStep('payment');
      toast({
        title: "Payment Cancelled ❌",
        description: "Your payment was cancelled. You can try again when ready.",
        variant: "destructive",
      });
      
      // Clear URL parameters
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // Auto-advance to schedule step when payment is confirmed
  useEffect(() => {
    if (currentStep === 'payment' && (paymentStatus === 'completed' || paymentStatus === 'confirmed')) {
      const timer = setTimeout(() => {
        setCurrentStep('schedule');
        toast({
          title: "Ready to Schedule! 🎉",
          description: "Your payment is confirmed. You can now schedule your consultation.",
        });
      }, 1500); // Give user time to see the confirmation
      
      return () => clearTimeout(timer);
    }
  }, [currentStep, paymentStatus, toast]);

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

  const checkPaymentStatus = useCallback(async () => {
    if (!formData.email && !consultationId && !paymentId) return;
    
    setIsCheckingPayment(true);
    console.log('🔍 Checking payment status...', { email: formData.email, consultationId, paymentId });
    
    try {
      let consultationData;
      let shouldVerifyPayment = false;
      
      // Check by consultation ID first if available, otherwise by email
      if (consultationId) {
        const { data, error } = await supabase
          .from('consultations')
          .select('payment_status, admin_notes, email')
          .eq('id', consultationId)
          .single();
          
        if (error) {
          console.error('Consultation check by ID error:', error);
        } else {
          consultationData = data;
          console.log('Found consultation by ID:', consultationData);
          // Update formData.email if not set
          if (!formData.email && data?.email) {
            setFormData(prev => ({ ...prev, email: data.email }));
          }
        }
      }
      
      // Fallback to email lookup if no consultation ID or ID lookup failed
      if (!consultationData && formData.email) {
        const { data, error } = await supabase
          .from('consultations')
          .select('payment_status, admin_notes, id')
          .eq('email', formData.email)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          console.error('Consultation check by email error:', error);
        } else {
          consultationData = data;
          console.log('Found consultation by email:', consultationData);
          // Set consultation ID if found
          if (data?.id && !consultationId) {
            setConsultationId(data.id);
          }
        }
      }

      // If we have a paymentId and payment is not already confirmed, verify with NOWPayments
      if (paymentId && consultationData?.payment_status !== 'paid') {
        console.log('Verifying payment with NOWPayments API...');
        shouldVerifyPayment = true;
        
        try {
          const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-crypto-payment', {
            body: { paymentId }
          });

          if (verifyError) {
            console.error('Payment verification error:', verifyError);
            
            // Check if it's a server error vs payment not found
            if (verifyError.message?.includes('Payment not found')) {
              toast({
                title: "Payment Not Found",
                description: "Unable to locate your payment. Please contact support if you've made a payment.",
                variant: "destructive",
              });
            } else {
              toast({
                title: "Verification Failed",
                description: "Unable to verify payment with provider. Please try again in a few minutes.",
                variant: "destructive",
              });
            }
            return;
          }

          if (verifyData?.success && verifyData?.payment) {
            console.log('Payment verification response:', verifyData.payment);
            
            // Map verification response to consultation status
            const verifiedStatus = verifyData.payment.consultation_payment_status || verifyData.payment.status;
            if (verifiedStatus === 'paid' || verifiedStatus === 'completed') {
              // Update local data to reflect confirmed payment
              consultationData = { ...consultationData, payment_status: 'paid' };
            }
            
            // Re-check consultation status after verification
            if (consultationId) {
              const { data: updatedConsultation } = await supabase
                .from('consultations')
                .select('payment_status')
                .eq('id', consultationId)
                .single();
              
              if (updatedConsultation) {
                consultationData = { ...consultationData, payment_status: updatedConsultation.payment_status };
                console.log('Updated consultation status after verification:', updatedConsultation.payment_status);
              }
            }
          }
        } catch (verifyError) {
          console.error('Payment verification failed:', verifyError);
          toast({
            title: "Verification Error",
            description: "Failed to verify payment. Please try again later.",
            variant: "destructive",
          });
        }
      }

      // Update UI based on final payment status
      console.log('Final consultation payment status:', consultationData?.payment_status);
      
      if (consultationData?.payment_status === 'paid') {
        console.log('✅ Payment confirmed, advancing to schedule step');
        setPaymentStatus('confirmed');
        
        // Only auto-advance if we're currently on the payment step
        if (currentStep === 'payment') {
          setCurrentStep('schedule');
          toast({
            title: "Payment Confirmed! 🎉",
            description: "Your payment has been confirmed. You can now schedule your consultation.",
          });
        }
      } else if (consultationData?.payment_status === 'processing') {
        console.log('⏳ Payment processing');
        setPaymentStatus('processing');
        toast({
          title: "Payment Processing",
          description: "Your payment is being verified. Please wait a moment...",
        });
      } else {
        console.log('❌ Payment not confirmed');
        setPaymentStatus('unpaid');
        if (shouldVerifyPayment) {
          toast({
            title: "Payment Pending",
            description: "Payment is still being processed. Please wait or check again in a few minutes.",
          });
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
      toast({
        title: "Check Failed",
        description: "Unable to verify payment status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingPayment(false);
    }
  }, [formData.email, consultationId, paymentId, currentStep, toast]);

  // Real-time payment status updates
  useEffect(() => {
    if (currentStep === 'payment' && (formData.email || consultationId)) {
      console.log('🔄 Setting up real-time payment listeners...', { email: formData.email, consultationId });
      
      const channel = supabase
        .channel('consultation-payments')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'consultations',
            filter: formData.email ? `email=eq.${formData.email}` : `id=eq.${consultationId}`
          },
          (payload) => {
            console.log('📡 Consultation updated via real-time:', payload);
            const newPaymentStatus = payload.new.payment_status;
            
            if (newPaymentStatus === 'paid') {
              console.log('✅ Real-time: Payment confirmed, advancing to schedule');
              setPaymentStatus('confirmed');
              setCurrentStep('schedule');
              toast({
                title: "Payment Confirmed! 🎉",
                description: "Your payment has been confirmed. You can now schedule your consultation.",
              });
            } else if (newPaymentStatus === 'processing') {
              console.log('⏳ Real-time: Payment processing');
              setPaymentStatus('processing');
              toast({
                title: "Payment Processing",
                description: "Your payment is being verified...",
              });
            }
          }
        );

      // Also listen to crypto_payments table updates
      if (consultationId) {
        channel.on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'crypto_payments',
            filter: `consultation_id=eq.${consultationId}`,
          },
          (payload) => {
            console.log('📡 Payment update received via real-time:', payload);
            if (payload.new && typeof payload.new === 'object' && 'status' in payload.new) {
              const newStatus = payload.new.status as string;
              console.log('📊 New payment status from real-time:', newStatus);
              
              if (newStatus === 'completed') {
                console.log('✅ Real-time: Crypto payment completed, advancing to schedule');
                setPaymentStatus('confirmed');
                setCurrentStep('schedule');
                toast({
                  title: "Payment Confirmed! 🎉",
                  description: "Your payment has been successfully processed. You can now schedule your consultation.",
                });
              } else if (newStatus === 'processing' || payload.new.status === 'partial') {
                console.log('⏳ Real-time: Crypto payment processing');
                setPaymentStatus('processing');
              }
            }
          }
        );
      }

      channel.subscribe();

      // Initial check
      checkPaymentStatus();
      
      // More frequent polling for better UX
      const interval = setInterval(() => {
        console.log('🔄 Polling payment status...');
        checkPaymentStatus();
      }, 15000); // Check every 15 seconds

      return () => {
        console.log('🧹 Cleaning up real-time listeners');
        supabase.removeChannel(channel);
        clearInterval(interval);
      };
    }
  }, [currentStep, formData.email, consultationId, checkPaymentStatus, toast]);

  // Window focus detection for payment UX
  useEffect(() => {
    if (paymentWindowOpened && consultationId) {
      const handleFocus = async () => {
        setIsCheckingPayment(true);
        await checkPaymentStatus();
        setIsCheckingPayment(false);
      };

      window.addEventListener('focus', handleFocus);
      return () => window.removeEventListener('focus', handleFocus);
    }
  }, [paymentWindowOpened, consultationId, checkPaymentStatus]);
  

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


  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // First submit the consultation form
      const { data, error } = await supabase.functions.invoke('submit-consultation-request', {
        body: formData
      });

      if (error) {
        toast({
          title: "Form Submission Failed",
          description: error.message || "Failed to submit your consultation request. Please try again.",
          variant: "destructive",
        });
        return;
      }

      if (!data?.success || !data?.consultationId) {
        toast({
          title: "Form Submission Failed", 
          description: "Invalid response from server. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Consultation successfully submitted
      setConsultationId(data.consultationId);
      
      toast({
        title: "Consultation Request Submitted! ✅",
        description: "Your request is saved. Setting up payment...",
      });

      // Now try to create payment invoice
      try {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-crypto-payment', {
          body: {
            consultationId: data.consultationId,
            amountUSD: CONSULTATION_FEE_USD
          }
        });

        if (paymentError || !paymentData?.success || !paymentData?.payment?.invoice_url) {
          console.error('Payment creation error:', paymentError);
          
          // Show consultation success but payment setup failed
          setCurrentStep('payment');
          setPaymentStatus('unpaid');
          
          toast({
            title: "Payment Setup Issue ⚠️",
            description: "Your consultation request is saved, but there was an issue setting up payment. Please try the 'Retry Payment' button or contact support.",
            variant: "destructive",
          });
          return;
        }

        // Payment invoice created successfully
        setInvoiceUrl(paymentData.payment.invoice_url);
        setPaymentId(paymentData.payment.id);
        
        console.log('Invoice created successfully:', paymentData.payment.invoice_url);
        
        setCurrentStep('payment');
        toast({
          title: "Ready for Payment! 💳",
          description: "Click the payment button to open the secure payment page in a new tab.",
        });

      } catch (paymentError: any) {
        console.error('Payment creation failed:', paymentError);
        
        // Show consultation success but payment setup failed
        setCurrentStep('payment');
        setPaymentStatus('unpaid');
        
        toast({
          title: "Payment Setup Issue ⚠️",
          description: "Your consultation request is saved, but payment setup failed. Please use the 'Retry Payment' button below.",
          variant: "destructive",
        });
      }

    } catch (error: any) {
      console.error('Form submission error:', error);
      toast({
        title: "Form Submission Failed",
        description: error.message || "There was an error submitting your form. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleRetryPayment = async () => {
    if (!consultationId) {
      toast({
        title: "Error",
        description: "No consultation ID found. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: paymentData, error: paymentError } = await supabase.functions.invoke('create-crypto-payment', {
        body: {
          consultationId,
          amountUSD: CONSULTATION_FEE_USD
        }
      });

      if (paymentError || !paymentData?.success || !paymentData?.payment?.invoice_url) {
        console.error('Payment retry error:', paymentError);
        toast({
          title: "Payment Setup Failed",
          description: "Still having trouble setting up payment. Please contact support.",
          variant: "destructive",
        });
        return;
      }

      // Payment invoice created successfully
      setInvoiceUrl(paymentData.payment.invoice_url);
      setPaymentId(paymentData.payment.id);
      setPaymentStatus('unpaid');
      
      toast({
        title: "Payment Ready! 💳",
        description: "Payment setup successful. Please complete your payment now.",
      });

    } catch (error: any) {
      console.error('Payment retry failed:', error);
      toast({
        title: "Retry Failed",
        description: "Unable to retry payment setup. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
                  <div className="text-3xl font-bold text-primary mt-2">${CONSULTATION_FEE_USD} USD</div>
                  <p className="text-muted-foreground mt-2">One-time fee for your 30-minute expert session</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    This investment covers a personalized consultation with our expert trader, including market analysis, 
                    strategy development, and actionable insights tailored to your trading goals.
                  </p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Payment via cryptocurrency for secure processing</p>
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
            <ScrollReveal delay={0} distance="30px" duration={600}>
              <Card className="border-2 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                    <Coins className="h-8 w-8 text-primary" />
                    Complete Your Payment
                  </CardTitle>
                  <div className="text-2xl font-bold text-accent">
                    ${CONSULTATION_FEE_USD} USD
                  </div>
                  <p className="text-muted-foreground">
                    Click the secure payment button to complete your consultation booking
                  </p>
                </CardHeader>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={100} distance="30px" duration={600}>
              <Card className="border-2 shadow-lg">
                <CardContent className="p-6">
                  <div className="text-center space-y-6">
                    <h3 className="text-xl font-semibold">Complete Your Crypto Payment</h3>
                    
                     {/* Invoice Payment Button */}
                     <div className="flex justify-center">
                       {invoiceUrl ? (
                         <div className="space-y-4">
                            <Button
                              onClick={() => {
                                setPaymentWindowOpened(true);
                                setPaymentStatus('processing');
                                window.open(invoiceUrl, '_blank');
                                toast({
                                  title: "Payment window opened",
                                  description: "Complete your payment in the new tab, then return to this page. We'll automatically check your payment status.",
                                });
                              }}
                              className="w-full max-w-md h-14 text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 hover:scale-105 transition-all duration-200"
                            >
                              <div className="flex items-center gap-2">
                                <Coins className="h-6 w-6" />
                                Pay with Crypto - ${CONSULTATION_FEE_USD} USD
                              </div>
                            </Button>
                            <p className="text-sm text-muted-foreground">
                              Click to open secure payment page in a new tab
                            </p>
                         </div>
                       ) : consultationId ? (
                         <div className="space-y-4">
                           <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                             <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                               <AlertTriangle className="h-4 w-4" />
                               <span className="font-medium">Payment Setup Issue</span>
                             </div>
                             <p className="text-sm text-yellow-700 dark:text-yellow-300">
                               Your consultation request is saved, but there was an issue setting up the payment. Please try again.
                             </p>
                           </div>
                           <Button
                             onClick={handleRetryPayment}
                             disabled={isSubmitting}
                             className="w-full max-w-md h-14 text-lg font-semibold bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 hover:scale-105 transition-all duration-200"
                           >
                             {isSubmitting ? (
                               <div className="flex items-center gap-2">
                                 <Loader2 className="h-5 w-5 animate-spin" />
                                 Setting up payment...
                               </div>
                             ) : (
                               <div className="flex items-center gap-2">
                                 <RefreshCw className="h-6 w-6" />
                                 Retry Payment Setup
                               </div>
                             )}
                           </Button>
                           <p className="text-sm text-muted-foreground">
                             Click to retry setting up your payment
                           </p>
                         </div>
                       ) : (
                         <div className="flex items-center gap-2 text-muted-foreground">
                           <Loader2 className="h-4 w-4 animate-spin" />
                           Loading payment options...
                         </div>
                       )}
                     </div>

                    <div className="text-sm text-muted-foreground space-y-2 bg-yellow-50 dark:bg-yellow-950/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 font-medium text-yellow-800 dark:text-yellow-200">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Important Payment Instructions</span>
                      </div>
                      <p>• Please verify the payment amount (${CONSULTATION_FEE_USD} USD) is correct before proceeding</p>
                      <p>• Click the payment button to open secure NOWPayments page</p>
                      <p>• Complete the <strong>full payment</strong> to proceed with scheduling</p>
                      <p>• Return to this page after completing payment</p>
                      <p>• Payment is processed securely through NOWPayments</p>
                    </div>
                    
                      {/* Payment Status Information */}
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg border">
                         <h4 className="font-semibold text-center mb-3 flex items-center justify-center gap-2">
                           <div className={`w-3 h-3 rounded-full ${
                             paymentStatus === 'completed' || paymentStatus === 'confirmed' ? 'bg-green-500' : 
                             paymentStatus === 'processing' ? 'bg-yellow-500' : 'bg-red-500'
                           }`}></div>
                           {isCheckingPayment ? "Checking Payment Status..." : 
                            `Payment Status: ${(paymentStatus === 'completed' || paymentStatus === 'confirmed') ? 'Confirmed' : 
                                               paymentStatus === 'processing' ? 'Processing' : 'Awaiting Payment'}`}
                         </h4>
                        {(paymentStatus === 'completed' || paymentStatus === 'confirmed') && (
                          <div className="text-center text-green-600 dark:text-green-400">
                            <CheckCircle className="h-6 w-6 mx-auto mb-2" />
                            <p className="font-medium">Payment confirmed! You can now proceed to scheduling.</p>
                          </div>
                        )}
                        {paymentStatus === 'processing' && (
                          <div className="text-center text-yellow-600 dark:text-yellow-400">
                            <Clock className="h-6 w-6 mx-auto mb-2 animate-spin" />
                            <p className="font-medium">Payment received, verifying transaction...</p>
                            <p className="text-sm text-yellow-500 mt-1">This usually takes 1-5 minutes</p>
                          </div>
                        )}
                         {paymentStatus === 'unpaid' && (
                           <div className="text-center text-muted-foreground">
                             <p>{paymentWindowOpened 
                               ? "Return to this tab after completing your payment. We'll automatically detect when it's confirmed." 
                               : "Complete your payment using the button above to proceed."}</p>
                             {consultationId && (
                               <p className="mt-2 text-xs font-mono bg-muted/50 p-2 rounded">
                                 Order ID: {consultationId}
                               </p>
                             )}
                           </div>
                         )}
                     </div>

                     {/* Payment Status Check and Continue Button */}
                     <div className="pt-6 border-t space-y-4">
                       {/* Manual Payment Check Button */}
                       <div className="flex items-center justify-center">
                         <Button 
                           onClick={checkPaymentStatus}
                           disabled={isCheckingPayment}
                           variant="outline"
                           className="w-full max-w-sm h-10 text-sm"
                         >
                           {isCheckingPayment ? (
                             <div className="flex items-center gap-2">
                               <Loader2 className="h-4 w-4 animate-spin" />
                               Checking Status...
                             </div>
                           ) : (
                             <div className="flex items-center gap-2">
                               <RefreshCw className="h-4 w-4" />
                               Check Payment Status
                             </div>
                           )}
                         </Button>
                       </div>
                       
                        {/* Auto-advance notice */}
                        {(paymentStatus === 'completed' || paymentStatus === 'confirmed') && (
                          <div className="text-center text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-800 animate-pulse">
                            <div className="flex items-center justify-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4" />
                              <span className="font-semibold">Payment Confirmed!</span>
                            </div>
                            <p>Automatically advancing to scheduling...</p>
                          </div>
                        )}
                       
                         {/* Manual Continue Button and Override Option */}
                         {paymentStatus !== 'completed' && paymentStatus !== 'confirmed' && (
                           <div className="space-y-4">
                             {/* Disabled continue button */}
                             <Button 
                               onClick={() => setCurrentStep('schedule')}
                               disabled={true}
                               className="w-full max-w-md h-12 text-lg font-semibold bg-muted text-muted-foreground cursor-not-allowed transition-all duration-200"
                             >
                               <div className="flex items-center gap-2">
                                 <Clock className="h-5 w-5" />
                                 Complete Payment to Continue
                               </div>
                             </Button>
                             <p className="text-xs text-muted-foreground text-center">
                               This button will be enabled once your payment is confirmed
                             </p>
                             
                             {/* Manual Override - Available after payment creation */}
                             {(invoiceUrl || paymentId) && (
                               <div className="pt-4 border-t border-muted-foreground/20">
                                 <p className="text-sm text-muted-foreground text-center mb-3">
                                   Already completed your payment but not detected yet?
                                 </p>
                                 <Button 
                                   onClick={() => {
                                     console.log('🚀 Manual override: proceeding to schedule');
                                     setPaymentStatus('confirmed');
                                     setCurrentStep('schedule');
                                     toast({
                                       title: "Proceeding to Schedule",
                                       description: "You can now schedule your consultation. If payment wasn't completed, please contact support.",
                                     });
                                   }}
                                   variant="outline"
                                   className="w-full max-w-md h-11 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-all duration-200"
                                 >
                                   <div className="flex items-center gap-2">
                                     <CheckCircle className="h-4 w-4" />
                                     I've Completed Payment - Continue to Schedule
                                   </div>
                                 </Button>
                                 <p className="text-xs text-muted-foreground/80 text-center mt-2">
                                   Use this if automatic verification is taking too long
                                 </p>
                               </div>
                             )}
                           </div>
                         )}
                     </div>
                  </div>
                </CardContent>
              </Card>
            </ScrollReveal>
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