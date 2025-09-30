import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand & Socials */}
          <div className="lg:col-span-4">
            <div className="flex items-center space-x-3 mb-6">
              <MapPin className="h-10 w-10 text-limpopo-gold" />
              <span className="text-3xl font-bold">Limpopo Connect</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Your gateway to discovering businesses, events, tourism, and community life across the beautiful Limpopo Province.
            </p>
            <div className="flex space-x-5">
              <a href="#" className="social-icon">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="social-icon">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="social-icon">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2">
            <h3 className="footer-heading">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/business-directory" className="footer-link">Business Directory</Link></li>
              <li><Link to="/events" className="footer-link">Events</Link></li>
              <li><Link to="/marketplace" className="footer-link">Marketplace</Link></li>
              <li><Link to="/tourism" className="footer-link">Tourism</Link></li>
              <li><Link to="/news" className="footer-link">News</Link></li>
            </ul>
          </div>

          {/* Connections */}
          <div className="lg:col-span-3">
            <h3 className="footer-heading">Connections</h3>
            <ul className="space-y-3">
              <li><Link to="/connections/friendship-partners" className="footer-link">Friendship & Partners</Link></li>
              <li><Link to="/connections/meaningful-relationships" className="footer-link">Meaningful Relationships</Link></li>
              <li><Link to="/connections/casual-meetups" className="footer-link">Casual Meetups</Link></li>
              <li><Link to="/connections/shared-interests" className="footer-link">Shared Interests</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h3 className="footer-heading">Get in Touch</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Mail className="h-6 w-6 text-limpopo-gold mt-1" />
                <a href="mailto:info@limpopoconnect.co.za" className="text-gray-300 hover:text-white transition">info@limpopoconnect.co.za</a>
              </li>
              <li className="flex items-start space-x-3">
                <Phone className="h-6 w-6 text-limpopo-gold mt-1" />
                <span className="text-gray-300">+27 15 123 4567</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-6 w-6 text-limpopo-gold mt-1" />
                <span className="text-gray-300">Polokwane, Limpopo, South Africa</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Limpopo Connect. All Rights Reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-gray-500 hover:text-white text-sm transition">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-white text-sm transition">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;