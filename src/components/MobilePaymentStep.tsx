import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Clock, AlertTriangle, RefreshCw, CreditCard, ExternalLink, CheckCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MobilePaymentStepProps {
  paymentStatus: 'unpaid' | 'processing' | 'completed' | 'confirmed';
  isCheckingPayment: boolean;
  invoiceUrl: string;
  onRetryPayment: () => void;
  onCheckPayment: () => void;
  onOpenInvoice: () => void;
  consultationFeeUSD: number;
}

export const MobilePaymentStep: React.FC<MobilePaymentStepProps> = ({
  paymentStatus,
  isCheckingPayment,
  invoiceUrl,
  onRetryPayment,
  onCheckPayment,
  onOpenInvoice,
  consultationFeeUSD,
}) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return null; // Only render on mobile
  }

  return (
    <div className="min-h-screen bg-background p-4 animate-mobile-fade-in">
      <div className="max-w-md mx-auto space-y-4">
        {/* Header */}
        <div className="text-center mb-6">
          <Coins className="mx-auto h-12 w-12 text-accent mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Complete Payment
          </h2>
          <p className="text-muted-foreground text-sm">
            Secure cryptocurrency payment - ${consultationFeeUSD}
          </p>
        </div>

        {/* Payment Status Card */}
        <Card className="border-border bg-card/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {paymentStatus === 'unpaid' && (
                <>
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Payment Required
                </>
              )}
              {paymentStatus === 'processing' && (
                <>
                  <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
                  Processing Payment
                </>
              )}
              {(paymentStatus === 'completed' || paymentStatus === 'confirmed') && (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Payment Confirmed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {paymentStatus === 'unpaid' && (
              <div className="space-y-4">
                {/* Important Payment Instructions */}
                <div className="text-xs space-y-2 bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 font-medium text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-3 w-3" />
                    <span>Important Payment Instructions</span>
                  </div>
                  <div className="space-y-1 text-red-700 dark:text-red-400">
                    <p>• Verify the payment amount (${consultationFeeUSD} USD) is correct before proceeding</p>
                    <p>• <strong>A new TradeWithMrk payment page will open in a separate tab</strong></p>
                    <p>• <strong>Complete the full payment in that new tab</strong></p>
                    <p>• <strong className="text-red-800 dark:text-red-300">CRITICAL: Return to this page after payment to confirm your consultation</strong></p>
                    <p>• We'll automatically detect your payment and update this page when you return</p>
                  </div>
                </div>

                {invoiceUrl ? (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Click below to open your payment invoice and complete the transaction.
                    </p>
                    <Button 
                      onClick={onOpenInvoice}
                      className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Pay with Crypto - ${consultationFeeUSD} USD
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Payment Setup Issue */}
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium text-sm">Payment Setup Issue</span>
                      </div>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Your consultation request is saved, but there was an issue setting up the payment. Please try again.
                      </p>
                    </div>
                    <Button 
                      onClick={onRetryPayment}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Retry Payment Setup
                    </Button>
                  </div>
                )}
              </div>
            )}

            {paymentStatus === 'processing' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-yellow-600">
                    Payment is being verified...
                  </span>
                </div>
                <Button 
                  onClick={onCheckPayment}
                  variant="outline"
                  className="w-full"
                  disabled={isCheckingPayment}
                >
                  {isCheckingPayment ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Check Status
                </Button>
              </div>
            )}

            {(paymentStatus === 'completed' || paymentStatus === 'confirmed') && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-green-600">
                    Payment confirmed! Proceeding to scheduling...
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="border-border bg-card/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Need Help?</h4>
                <p className="text-xs text-muted-foreground">
                  Payment issues? Contact support at{' '}
                  <a href="mailto:contact@tradewithmrk" className="text-accent underline">
                    contact@tradewithmrk
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobilePaymentStep;