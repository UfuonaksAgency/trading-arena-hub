import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Refund = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
        <div className="prose prose-invert max-w-none">
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. General Refund Policy</h2>
          <p className="text-muted-foreground mb-4">
            At Mr. K Trading Arena, we strive to provide exceptional educational services. Our refund policy is designed to be fair to both our students and our business.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Consultation Services</h2>
          <p className="text-muted-foreground mb-4">
            For one-time consultation sessions:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Refunds are available up to 24 hours before the scheduled session</li>
            <li>No refunds are provided for no-shows or late cancellations</li>
            <li>Rescheduling is allowed up to 48 hours in advance</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Mentorship Program</h2>
          <p className="text-muted-foreground mb-4">
            For our mentorship programs:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>7-day money-back guarantee from the start date</li>
            <li>Partial refunds may be considered on a case-by-case basis</li>
            <li>No refunds after 50% of the program has been completed</li>
            <li>Refunds exclude any materials or resources already accessed</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Digital Products and Resources</h2>
          <p className="text-muted-foreground mb-4">
            For digital products and educational materials:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Free resources are provided as-is with no refund necessary</li>
            <li>Paid digital products have a 48-hour refund window</li>
            <li>Refunds are not available once materials have been downloaded or accessed</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Refund Process</h2>
          <p className="text-muted-foreground mb-4">
            To request a refund:
          </p>
          <ol className="list-decimal list-inside text-muted-foreground mb-4 space-y-2">
            <li>Contact us through our official support channels</li>
            <li>Provide your order/booking reference number</li>
            <li>State the reason for the refund request</li>
            <li>Allow 5-7 business days for processing</li>
          </ol>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Exceptions</h2>
          <p className="text-muted-foreground mb-4">
            Refunds may not be available in the following cases:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Violation of our terms of service</li>
            <li>Inappropriate behavior during sessions</li>
            <li>Attempts to record or redistribute content</li>
            <li>Failure to participate actively in the program</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Processing Time</h2>
          <p className="text-muted-foreground mb-4">
            Approved refunds will be processed within 5-7 business days and will be credited back to the original payment method.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Partial Refunds</h2>
          <p className="text-muted-foreground mb-4">
            In some cases, partial refunds may be offered based on:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Amount of content accessed or sessions attended</li>
            <li>Time elapsed since purchase</li>
            <li>Specific circumstances of the request</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Dispute Resolution</h2>
          <p className="text-muted-foreground mb-4">
            If you're unsatisfied with our refund decision, you may escalate the matter to our management team for review.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Refund Policy</h2>
          <p className="text-muted-foreground mb-4">
            We reserve the right to modify this refund policy at any time. Changes will be effective immediately upon posting.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Information</h2>
          <p className="text-muted-foreground mb-4">
            For refund requests or questions about this policy, please contact us through our official support channels.
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

export default Refund;