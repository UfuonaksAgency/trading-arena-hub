import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Copy, Clock, CheckCircle, AlertCircle, Bitcoin, QrCode, Calendar, User, Mail, MessageSquare, Target, Award, Loader2 } from 'lucide-react';

// Calendly interface for TypeScript
declare global {
  interface Window {
    Calendly: {
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
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telegram: '',
    preferredTime: '',
    experienceLevel: '',
    purpose: '',
  });

  // Load Calendly widget
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);

    const link = document.createElement('link');
    link.href = 'https://assets.calendly.com/assets/external/widget.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      if (document.head.contains(link)) {
        document.head.removeChild(link);
      }
    };
  }, []);

  // Initialize Calendly when payment is confirmed
  useEffect(() => {
    if (paymentStatus?.status === 'completed' && !showCalendly && window.Calendly) {
      window.Calendly.initBadgeWidget({
        url: 'https://calendly.com/tradingmentorpro/trading-strategy-session',
        text: 'Schedule Your Session Now!',
        color: '#00a2ff',
        textColor: '#ffffff',
        branding: false,
      });
      setShowCalendly(true);
      setCurrentStep('schedule');
    }
  }, [paymentStatus?.status, showCalendly]);

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

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('verify-crypto-payment', {
          body: { paymentId: cryptoPayment.id }
        });

        if (error) {
          console.error('Payment verification error:', error);
          return;
        }

        if (data?.success && data?.payment) {
          setPaymentStatus(data.payment);
          
          if (data.payment.status === 'completed') {
            toast({
              title: "Payment Confirmed! 🎉",
              description: "Your payment has been verified. You can now schedule your consultation.",
            });
          }
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
      }
    };

    const interval = setInterval(checkStatus, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, [cryptoPayment?.id, paymentStatus?.status, toast]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('submit-consultation-request', {
        body: formData
      });

      if (error) {
        console.error('Form submission error:', error);
        throw new Error(error.message || 'Failed to submit form');
      }

      if (data?.success && data?.consultationId) {
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
      console.error('Error submitting form:', error);
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
    try {
      console.log('Creating payment for consultation:', consultationId);
      
      const { data, error } = await supabase.functions.invoke('create-crypto-payment', {
        body: { consultationId }
      });

      console.log('Payment response:', { data, error });

      if (error) {
        console.error('Payment creation error:', error);
        throw new Error(error.message || 'Failed to create payment');
      }

      if (data?.success && data?.payment) {
        setCryptoPayment(data.payment);
        setPaymentStatus({
          id: data.payment.id,
          status: 'pending',
          confirmations: 0,
        });
        
        toast({
          title: "Payment Created! 💰",
          description: "Your Bitcoin payment address has been generated.",
        });
      } else {
        console.error('Invalid payment response:', data);
        throw new Error('Invalid response from payment service');
      }
    } catch (error: any) {
      console.error('Error creating crypto payment:', error);
      toast({
        title: "Payment Creation Failed",
        description: error.message || "Failed to create payment. Please try again.",
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
      console.error('Failed to copy:', error);
      toast({
        title: "Copy Failed",
        description: "Please copy the address manually",
        variant: "destructive",
      });
    }
  };

  const formatBTC = (amount: number) => {
    return amount.toFixed(8);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/5 via-accent/10 to-primary/5">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%)] animate-pulse"></div>
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Book Your Trading
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> Strategy Session</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
              Get personalized trading guidance from our expert. Complete the form, make payment, and schedule your one-on-one consultation.
            </p>
            
            {/* Progress Steps */}
            <div className="mt-12 flex justify-center">
              <div className="flex items-center space-x-4">
                {['form', 'payment', 'schedule'].map((step, index) => (
                  <React.Fragment key={step}>
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
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Step 1: Form */}
        {currentStep === 'form' && (
          <Card className="mx-auto shadow-lg">
            <CardHeader className="text-center space-y-4">
              <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                <User className="h-8 w-8 text-accent" />
                Your Information
              </CardTitle>
              <p className="text-muted-foreground text-lg">Tell us about yourself and your trading goals</p>
            </CardHeader>
            <CardContent className="space-y-8">
              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
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

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
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
              </form>

              {/* What You'll Get Section */}
              <div className="rounded-lg border-2 border-accent/20 bg-accent/5 p-6">
                <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold">
                  <Award className="h-6 w-6 text-accent" />
                  What You'll Get in Your Session
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-start gap-3">
                    <Target className="mt-1 h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Personalized Strategy</p>
                      <p className="text-sm text-muted-foreground">Tailored to your experience and goals</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MessageSquare className="mt-1 h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Expert Analysis</p>
                      <p className="text-sm text-muted-foreground">Review of your current trading approach</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="mt-1 h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="font-semibold">60-Minute Session</p>
                      <p className="text-sm text-muted-foreground">Dedicated one-on-one consultation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="mt-1 h-5 w-5 text-accent flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Action Plan</p>
                      <p className="text-sm text-muted-foreground">Clear next steps for improvement</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Payment */}
        {currentStep === 'payment' && (
          <div className="space-y-6">
            {isCreatingPayment ? (
              <Card className="border-2 shadow-lg">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-12 w-12 animate-spin text-accent" />
                  <h3 className="mt-4 text-xl font-semibold">Creating Payment Address...</h3>
                  <p className="text-muted-foreground">Please wait while we set up your Bitcoin payment</p>
                </CardContent>
              </Card>
            ) : cryptoPayment ? (
              <Card className="border-2 shadow-lg">
                <CardHeader className="text-center">
                  <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                    <Bitcoin className="h-8 w-8 text-orange-500" />
                    Bitcoin Payment Required
                  </CardTitle>
                  <div className="text-2xl font-bold text-accent">
                    $300 USD = {formatBTC(cryptoPayment.amount_btc)} BTC
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Timer and Status */}
                  <div className="space-y-4">
                    {timeLeft > 0 && paymentStatus?.status !== 'completed' && (
                      <div className="rounded-lg border-2 border-orange-200 bg-orange-50 p-4 text-center dark:border-orange-800 dark:bg-orange-950">
                        <div className="flex items-center justify-center gap-2 text-orange-700 dark:text-orange-300">
                          <Clock className="h-5 w-5" />
                          <span className="font-medium">Payment expires in:</span>
                        </div>
                        <div className="mt-2 text-3xl font-bold text-orange-600 dark:text-orange-400">
                          {formatTime(timeLeft)}
                        </div>
                      </div>
                    )}

                    {/* Payment Status */}
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
                          Received: {formatBTC(paymentStatus.amount_received)} BTC
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Payment Details Grid */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    {/* QR Code */}
                    <div className="flex flex-col items-center space-y-4">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <QrCode className="h-5 w-5" />
                        Scan to Pay
                      </div>
                      {cryptoPayment.qr_code ? (
                        <div className="rounded-lg border-2 p-4 bg-white">
                          <img 
                            src={cryptoPayment.qr_code} 
                            alt="Bitcoin Payment QR Code"
                            className="h-48 w-48 object-contain"
                          />
                        </div>
                      ) : (
                        <div className="flex h-48 w-48 items-center justify-center rounded-lg border-2 bg-muted">
                          <p className="text-center text-sm text-muted-foreground">QR Code not available</p>
                        </div>
                      )}
                    </div>

                    {/* Payment Information */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Bitcoin Address</Label>
                        <div className="flex gap-2">
                          <code className="flex-1 rounded-lg bg-muted p-3 text-xs break-all font-mono">
                            {cryptoPayment.address}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(cryptoPayment.address)}
                            className="shrink-0"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-semibold">Amount (BTC)</Label>
                        <div className="flex gap-2">
                          <code className="flex-1 rounded-lg bg-muted p-3 text-sm font-bold font-mono">
                            {formatBTC(cryptoPayment.amount_btc)}
                          </code>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(formatBTC(cryptoPayment.amount_btc))}
                            className="shrink-0"
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
                  </div>

                  {/* Instructions */}
                  <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6 dark:border-blue-800 dark:bg-blue-950">
                    <h4 className="mb-3 font-semibold text-blue-900 dark:text-blue-100">Payment Instructions:</h4>
                    <ol className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">1.</span>
                        Send exactly <strong>{formatBTC(cryptoPayment.amount_btc)} BTC</strong> to the address above
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">2.</span>
                        Payment will be confirmed automatically within 10-15 minutes
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">3.</span>
                        Once confirmed, you'll be able to schedule your consultation
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-semibold">4.</span>
                        <strong>Important:</strong> Use a personal wallet, not an exchange
                      </li>
                    </ol>
                  </div>

                  {/* Success State */}
                  {paymentStatus?.status === 'completed' && (
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
                        className="mt-6 bg-green-600 hover:bg-green-700 text-white"
                        size="lg"
                      >
                        Schedule Your Session
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
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
            )}
          </div>
        )}

        {/* Step 3: Schedule */}
        {currentStep === 'schedule' && (
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-3xl">
                <Calendar className="h-8 w-8 text-accent" />
                Schedule Your Session
              </CardTitle>
              <p className="text-muted-foreground text-lg">
                Payment confirmed! Click the button below to schedule your consultation.
              </p>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-green-100 px-6 py-3 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Payment Confirmed</span>
              </div>
              
              <p className="text-lg max-w-2xl mx-auto">
                Your trading strategy session is ready to be scheduled. Our expert will provide personalized guidance based on your experience level and goals.
              </p>
              
              <div className="rounded-lg border-2 bg-muted/50 p-6 max-w-md mx-auto">
                <h3 className="mb-4 text-xl font-semibold">Session Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Duration:</span>
                    <span>60 minutes</span>
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
              </div>
              
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  The Calendly scheduling widget should appear automatically. If it doesn't load, try refreshing the page.
                </p>
                <Button 
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="text-lg bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent/70"
                >
                  Refresh Page to Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BookConsultation;