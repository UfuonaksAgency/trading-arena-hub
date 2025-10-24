import { Link } from 'react-router-dom';
import { TrendingUp, Send, Twitter, Instagram, MessageCircle } from 'lucide-react';

const Footer = () => {
  const socialLinks = [
    {
      name: 'Telegram',
      href: 'https://t.me/Mrktradingchannel',
      icon: Send,
    },
    {
      name: 'X (Twitter)',
      href: 'https://x.com/kelvinc003',
      icon: Twitter,
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/mrktradingarena?igsh=bjI4ZGRsZmI2cWho&utm_source=qr',
      icon: Instagram,
    },
    {
      name: 'Discord',
      href: 'https://discord.gg/7vrPJ3Gf7',
      icon: MessageCircle,
    },
  ];

  const legalLinks = [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund' },
    { name: 'Risk Disclaimer', href: '/disclaimer' },
  ];

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center space-x-3 mb-6 group">
              <div className="w-10 h-10 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 group-hover:border-primary">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold section-header text-lg mb-0">
                Mr. K Trading Arena
              </span>
            </Link>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed">
              Expert trading guidance through proven strategies and genuine insights, 
              helping traders navigate their path to consistent success.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center hover:bg-white hover:text-black transition-all duration-300 hover:scale-110 group"
                  aria-label={link.name}
                >
                  <link.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Quick Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  1-on-1 Mentorship
                </Link>
              </li>
              <li>
                <a href="/#resources" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Free Resources
                </a>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Legal Information</h3>
            <ul className="space-y-3">
              {legalLinks.map((link, index) => {
                const colors = ['hover:text-primary', 'hover:text-accent', 'hover:text-secondary', 'hover:text-muted-foreground'];
                return (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className={`text-gray-400 transition-colors text-sm ${colors[index % colors.length]}`}
                    >
                      {link.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} Mr. K Trading Arena. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 mt-3">
            Trading involves substantial risk. Past performance is not indicative of future results.
            <br />
            <span className="text-primary">Guided by professional expertise.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;