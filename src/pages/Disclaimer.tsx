import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Disclaimer = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Risk Disclaimer</h1>
        <div className="prose prose-invert max-w-none">
          
          <div className="p-6 bg-destructive/10 border border-destructive/20 rounded-lg mb-8">
            <h2 className="text-xl font-bold text-destructive mb-4">⚠️ IMPORTANT RISK WARNING</h2>
            <p className="text-muted-foreground">
              Trading in financial markets involves substantial risk and is not suitable for all investors. 
              You can lose more than your initial investment. Please read this disclaimer carefully.
            </p>
          </div>

          <h2 className="text-2xl font-semibold mt-8 mb-4">1. General Risk Warning</h2>
          <p className="text-muted-foreground mb-4">
            Trading in financial instruments carries a high level of risk and may not be suitable for all investors. 
            The high degree of leverage can work against you as well as for you. Before deciding to trade, 
            you should carefully consider your investment objectives, level of experience, and risk appetite.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. No Guarantee of Profits</h2>
          <p className="text-muted-foreground mb-4">
            There is no guarantee that you will make money from trading. Past performance is not indicative of future results. 
            Mr. K Trading Arena does not guarantee any specific results or profits from our educational services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Educational Purpose Only</h2>
          <p className="text-muted-foreground mb-4">
            All content provided by Mr. K Trading Arena is for educational purposes only and should not be considered as:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Financial or investment advice</li>
            <li>A recommendation to buy or sell any financial instrument</li>
            <li>A guarantee of trading success</li>
            <li>Professional financial planning services</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Market Risks</h2>
          <p className="text-muted-foreground mb-4">
            Financial markets are subject to various risks including but not limited to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Market volatility and price fluctuations</li>
            <li>Economic and political events</li>
            <li>Liquidity risks</li>
            <li>Currency exchange rate fluctuations</li>
            <li>Interest rate changes</li>
            <li>Force majeure events</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Leveraged Trading Risks</h2>
          <p className="text-muted-foreground mb-4">
            Leveraged trading amplifies both potential gains and losses. You should be aware that:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Small market movements can result in large gains or losses</li>
            <li>You may lose more than your initial deposit</li>
            <li>Margin calls may require additional funds</li>
            <li>Positions may be closed automatically if margin requirements are not met</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Technology Risks</h2>
          <p className="text-muted-foreground mb-4">
            Electronic trading platforms may experience technical issues that could affect your ability to trade:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>System downtime or connectivity issues</li>
            <li>Platform malfunctions or errors</li>
            <li>Delayed or failed order execution</li>
            <li>Data feed interruptions</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Psychological Factors</h2>
          <p className="text-muted-foreground mb-4">
            Trading can be emotionally challenging and may lead to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Emotional decision-making</li>
            <li>Overtrading or revenge trading</li>
            <li>Ignoring risk management rules</li>
            <li>Stress and psychological pressure</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Regulatory Considerations</h2>
          <p className="text-muted-foreground mb-4">
            Financial markets are subject to regulation that may change over time. You should be aware of:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Changing regulatory requirements</li>
            <li>Tax implications of trading</li>
            <li>Reporting obligations</li>
            <li>Jurisdictional differences in regulation</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Personal Responsibility</h2>
          <p className="text-muted-foreground mb-4">
            By using our services, you acknowledge that:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>You are solely responsible for your trading decisions</li>
            <li>You will not risk money you cannot afford to lose</li>
            <li>You will seek independent financial advice if needed</li>
            <li>You understand and accept all trading risks</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            Mr. K Trading Arena shall not be liable for any losses, damages, or costs arising from your trading activities 
            or the use of our educational services.
          </p>

          <div className="mt-8 p-6 bg-accent/10 border border-accent/20 rounded-lg">
            <h3 className="text-lg font-semibold text-accent mb-2">Professional Advice Recommendation</h3>
            <p className="text-sm text-muted-foreground">
              Before making any trading decisions, we strongly recommend consulting with a qualified financial advisor 
              who can assess your individual financial situation and risk tolerance.
            </p>
          </div>

          <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-border">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </>
  );
};

export default Disclaimer;