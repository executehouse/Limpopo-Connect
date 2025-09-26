import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-limpopo-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-8 w-8 text-limpopo-gold" />
              <span className="text-2xl font-bold">Limpopo Connect</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Connecting communities across Limpopo Province. Discover local businesses, 
              events, tourism opportunities, and stay connected with your community.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-limpopo-gold transition">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-limpopo-gold transition">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-limpopo-gold transition">
                <Instagram className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/business-directory" className="text-gray-300 hover:text-white transition">
                  Business Directory
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-gray-300 hover:text-white transition">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-gray-300 hover:text-white transition">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/tourism" className="text-gray-300 hover:text-white transition">
                  Tourism
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-gray-300 hover:text-white transition">
                  News
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-limpopo-gold" />
                <span className="text-gray-300">info@limpopoconnect.co.za</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-limpopo-gold" />
                <span className="text-gray-300">+27 15 xxx xxxx</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-limpopo-gold" />
                <span className="text-gray-300">Limpopo Province, South Africa</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-green-700 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © 2024 Limpopo Connect. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <Link to="/privacy" className="text-gray-300 hover:text-white text-sm transition">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-300 hover:text-white text-sm transition">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;