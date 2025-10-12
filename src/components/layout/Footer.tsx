import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Facebook, Twitter, Instagram, Mail, Phone, Code, Heart, Github, Linkedin } from 'lucide-react';

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

          {/* Developer Credits Section */}
          <div className="border-t border-gray-800 mt-12 pt-8">
            <div className="bg-gradient-to-r from-limpopo-green/10 to-limpopo-gold/10 rounded-lg p-6 border border-gray-700">
              <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Code className="h-5 w-5 text-limpopo-gold animate-pulse" />
                    <span className="text-gray-300 text-sm font-medium">Crafted with</span>
                    <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                    <span className="text-gray-300 text-sm font-medium">by</span>
                  </div>
                  <div className="text-lg font-bold bg-gradient-to-r from-limpopo-gold to-limpopo-green bg-clip-text text-transparent">
                    Emmanuel Charley Raluswinga
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-xs text-gray-400 hidden sm:block">
                    Full-Stack Developer • React • TypeScript • Supabase
                  </span>
                  <div className="flex space-x-3">
                    <a 
                      href="https://github.com/Tshikwetamakole" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 border border-gray-600 hover:border-limpopo-gold"
                      title="View GitHub Profile"
                    >
                      <Github className="h-4 w-4 text-gray-400 group-hover:text-limpopo-gold transition-colors" />
                    </a>
                    <a 
                      href="https://linkedin.com/in/tshikweta-makole" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 border border-gray-600 hover:border-blue-400"
                      title="Connect on LinkedIn"
                    >
                      <Linkedin className="h-4 w-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    </a>
                    <a 
                      href="https://www.facebook.com/share/17QpP4VCFn/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-all duration-300 border border-gray-600 hover:border-blue-500"
                      title="Follow on Facebook"
                    >
                      <Facebook className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                    </a>
                  </div>
                </div>
              </div>
              <div className="mt-3 text-center lg:text-left">
                <p className="text-xs text-gray-400">
                  Building digital solutions for communities across South Africa • 
                  <span className="text-limpopo-gold mx-1">React</span>•
                  <span className="text-blue-400 mx-1">TypeScript</span>•
                  <span className="text-green-400 mx-1">Supabase</span>•
                  <span className="text-purple-400 mx-1">Tailwind CSS</span>
                </p>
              </div>
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