import { useEffect } from "react";
import { CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const PaymentSuccess = () => {
  useEffect(() => {
    // Add the stage-light effect when component mounts
    document.body.classList.add('overflow-x-hidden');
    return () => document.body.classList.remove('overflow-x-hidden');
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Stage Light Effect */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo/Brand Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent mb-2">
            Trade With Mr K
          </h1>
          <p className="text-muted-foreground text-lg">Trading Arena</p>
        </div>

        {/* Success Card */}
        <Card className="minimal-card backdrop-blur-sm bg-background/80 border-primary/20">
          <CardContent className="p-8 md:p-12 text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <CheckCircle className="w-20 h-20 text-green-500 animate-scale-in" />
                <div className="absolute inset-0 w-20 h-20 text-green-500/30 animate-ping">
                  <CheckCircle className="w-20 h-20" />
                </div>
              </div>
            </div>

            {/* Main Message */}
            <h2 className="section-header text-3xl md:text-4xl mb-6">
              Payment Received Successfully!
            </h2>
            
            <div className="space-y-4 mb-8">
              <p className="text-xl text-muted-foreground">
                Your crypto payment has been confirmed.
              </p>
              
              {/* Return Instructions - Dark Red as requested */}
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
                <div className="flex items-center justify-center mb-3">
                  <ArrowLeft className="w-6 h-6 text-red-700 dark:text-red-400 mr-2" />
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">
                    Important: Return to Original Window
                  </h3>
                </div>
                <p className="text-red-700 dark:text-red-400 font-medium">
                  Please return to the original booking page window/tab to confirm your consultation and proceed with scheduling your session.
                </p>
              </div>
            </div>

            {/* Additional Instructions */}
            <div className="text-sm text-muted-foreground space-y-2">
              <p>The original page will automatically detect your payment.</p>
              <p>If you closed the original window, you can contact us for assistance.</p>
            </div>
          </CardContent>
        </Card>

        {/* Support Info */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>Need help? Contact us at support@tradewithmrk.com</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;