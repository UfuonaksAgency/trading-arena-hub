import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Terms = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Terms & Conditions</h1>
        <div className="prose prose-invert max-w-none">
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground mb-4">
            By accessing and using Mr. K Trading Arena's services, you accept and agree to be bound by the terms and provision of this agreement.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Educational Services</h2>
          <p className="text-muted-foreground mb-4">
            All content provided by Mr. K Trading Arena is for educational purposes only. Our services include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Trading education and mentorship</li>
            <li>Market analysis and insights</li>
            <li>Strategy development guidance</li>
            <li>Risk management education</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. No Financial Advice</h2>
          <p className="text-muted-foreground mb-4">
            The information provided is not financial advice and should not be considered as such. You should consult with a qualified financial advisor before making any investment decisions.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Risk Acknowledgment</h2>
          <p className="text-muted-foreground mb-4">
            Trading involves substantial risk and is not suitable for all investors. You acknowledge that:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>You may lose some or all of your invested capital</li>
            <li>Past performance does not guarantee future results</li>
            <li>Market conditions can change rapidly</li>
            <li>You trade at your own risk</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Mentorship Program</h2>
          <p className="text-muted-foreground mb-4">
            Our mentorship program is subject to availability and selection criteria. We reserve the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Accept or decline mentorship applications</li>
            <li>Terminate mentorship relationships for violations of terms</li>
            <li>Modify program structure and pricing</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Intellectual Property</h2>
          <p className="text-muted-foreground mb-4">
            All content, materials, and resources provided are the intellectual property of Mr. K Trading Arena and are protected by copyright laws.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. User Conduct</h2>
          <p className="text-muted-foreground mb-4">
            You agree not to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Share or redistribute proprietary content</li>
            <li>Engage in disruptive or harmful behavior</li>
            <li>Use services for illegal activities</li>
            <li>Attempt to gain unauthorized access to systems</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
          <p className="text-muted-foreground mb-4">
            Mr. K Trading Arena shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use of our services.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Modifications</h2>
          <p className="text-muted-foreground mb-4">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            For questions about these terms, please contact us through our official channels.
          </p>

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

export default Terms;