import { Link } from 'react-router-dom';
import { TrendingUp, Send, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    {
      name: 'Telegram',
      href: '#', // Replace with actual Telegram link
      icon: Send,
    },
    {
      name: 'X (Twitter)',
      href: '#', // Replace with actual Twitter link
      icon: Twitter,
    },
    {
      name: 'Instagram',
      href: '#', // Replace with actual Instagram link
      icon: Instagram,
    },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
    { name: 'Risk Disclaimer', href: '/disclaimer' },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center glow-primary">
                <TrendingUp className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Mr. K Trading Arena
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-md">
              Helping traders grow through free tools and real-world insights. 
              No fluff, just strategy.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors glow-primary"
                  aria-label={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors animated-underline">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="text-muted-foreground hover:text-foreground transition-colors animated-underline">
                  1-on-1 Mentorship
                </Link>
              </li>
              <li>
                <a href="/#resources" className="text-muted-foreground hover:text-foreground transition-colors animated-underline">
                  Free Resources
                </a>
              </li>
              <li>
                <a href="/#contact" className="text-muted-foreground hover:text-foreground transition-colors animated-underline">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-muted-foreground hover:text-foreground transition-colors animated-underline"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground">
            © {new Date().getFullYear()} Mr. K Trading Arena. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Trading involves substantial risk. Past performance is not indicative of future results.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;