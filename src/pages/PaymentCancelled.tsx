import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

const PaymentCancelled = () => {
  useEffect(() => {
    // Add overflow-x-hidden to prevent any horizontal scrolling
    document.body.classList.add('overflow-x-hidden');
    return () => {
      document.body.classList.remove('overflow-x-hidden');
    };
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Stage-light effect */}
      <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent"></div>
      
      <div className="container mx-auto px-4 py-12 relative z-10">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Trade With <span className="text-primary">Mr K</span>
          </h1>
          <p className="text-muted-foreground text-lg">Professional Trading Consultation</p>
        </div>

        {/* Main success card */}
        <div className="max-w-2xl mx-auto">
          <Card className="minimal-card">
            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                <XCircle 
                  className="h-20 w-20 text-destructive animate-pulse" 
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                Payment Cancelled
              </h2>
              <p className="text-muted-foreground text-lg">
                Your payment was cancelled. No charges have been made to your account.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Main instruction */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
                <h3 className="text-xl font-semibold text-white mb-3">
                  Return to Original Window
                </h3>
                <p className="text-destructive text-lg font-medium leading-relaxed">
                  Please return to the original booking window/tab to continue with your consultation request. 
                  You can try the payment again or choose a different payment method.
                </p>
              </div>

              {/* Additional info */}
              <div className="space-y-4 text-center">
                <div className="border-t border-border pt-4">
                  <p className="text-muted-foreground">
                    If you continue to experience issues or need assistance, please contact our support team.
                  </p>
                  <p className="text-primary font-medium mt-2">
                    We're here to help you get started with your trading journey.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelled;