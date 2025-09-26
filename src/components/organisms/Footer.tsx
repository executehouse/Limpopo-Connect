import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Explore',
      links: [
        { name: 'Businesses', href: '/businesses' },
        { name: 'Events', href: '/events' },
        { name: 'Tourism', href: '/tourism' },
        { name: 'Marketplace', href: '/marketplace' },
      ]
    },
    {
      title: 'Community',
      links: [
        { name: 'Local News', href: '/news' },
        { name: 'Community Groups', href: '/community' },
        { name: 'Cultural Heritage', href: '/heritage' },
        { name: 'Government Services', href: '/services' },
      ]
    },
    {
      title: 'Support',
      links: [
        { name: 'Help Center', href: '/help' },
        { name: 'Contact Us', href: '/contact' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Terms of Service', href: '/terms' },
      ]
    },
    {
      title: 'Languages',
      links: [
        { name: 'English', href: '#' },
        { name: 'Sepedi', href: '#' },
        { name: 'Tshivenda', href: '#' },
        { name: 'Xitsonga', href: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Limpopo Connect</span>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              Connecting communities across Limpopo Province. Discover local businesses, 
              events, and cultural heritage while supporting economic development.
            </p>
            
            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2" />
                <span>info@limpopoconnect.co.za</span>
              </div>
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2" />
                <span>+27 15 123 4567</span>
              </div>
            </div>
          </div>

          {/* Footer sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="lg:col-span-1">
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-200 text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Social media and copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-sm text-gray-400 mb-4 md:mb-0">
            © {currentYear} Limpopo Connect. All rights reserved.
          </div>
          
          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;