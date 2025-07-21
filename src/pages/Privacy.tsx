import Header from '@/components/Header';
import Footer from '@/components/Footer';

const Privacy = () => {
  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
          <p className="text-muted-foreground mb-4">
            We collect information you provide directly to us, such as when you:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Register for our services</li>
            <li>Submit consultation forms</li>
            <li>Apply for mentorship programs</li>
            <li>Contact us for support</li>
            <li>Subscribe to our resources</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Types of Information</h2>
          <p className="text-muted-foreground mb-4">
            The information we collect may include:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Name and email address</li>
            <li>Telegram handle and contact information</li>
            <li>Trading experience and goals</li>
            <li>Payment information (when applicable)</li>
            <li>Communication preferences</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
          <p className="text-muted-foreground mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Provide and improve our services</li>
            <li>Process consultation and mentorship applications</li>
            <li>Send educational content and updates</li>
            <li>Respond to inquiries and provide support</li>
            <li>Ensure security and prevent fraud</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Information Sharing</h2>
          <p className="text-muted-foreground mb-4">
            We do not sell, trade, or otherwise transfer your personal information to third parties except:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With trusted service providers under strict confidentiality agreements</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Security</h2>
          <p className="text-muted-foreground mb-4">
            We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">6. Data Retention</h2>
          <p className="text-muted-foreground mb-4">
            We retain your information for as long as necessary to provide our services and comply with legal obligations.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">7. Your Rights</h2>
          <p className="text-muted-foreground mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside text-muted-foreground mb-4 space-y-2">
            <li>Access your personal information</li>
            <li>Correct inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of communications</li>
            <li>Data portability</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cookies and Tracking</h2>
          <p className="text-muted-foreground mb-4">
            We use cookies and similar technologies to improve your experience, analyze usage, and provide personalized content.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">9. Third-Party Services</h2>
          <p className="text-muted-foreground mb-4">
            Our website may contain links to third-party services. We are not responsible for their privacy practices.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">10. Changes to Privacy Policy</h2>
          <p className="text-muted-foreground mb-4">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.
          </p>

          <h2 className="text-2xl font-semibold mt-8 mb-4">11. Contact Us</h2>
          <p className="text-muted-foreground mb-4">
            If you have any questions about this privacy policy, please contact us through our official channels.
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

export default Privacy;