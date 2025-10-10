import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, User, LogOut } from 'lucide-react';
import { useAuthContext } from '../../lib/AuthProvider';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut, profile } = useAuthContext();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Business Directory', path: '/business-directory' },
    { name: 'Events', path: '/events' },
    { name: 'Connections', path: '/connections' },
    { name: 'Marketplace', path: '/marketplace' },
    { name: 'Tourism', path: '/tourism' },
    { name: 'News', path: '/news' },
    { name: 'Chat Demo', path: '/chat-demo' },
  ];

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 shadow-lg backdrop-blur-lg' : 'bg-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <MapPin className="h-8 w-8 text-limpopo-green" />
            <span className="text-2xl font-bold text-limpopo-green">
              Limpopo Connect
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link relative ${
                  location.pathname === item.path ? 'active-nav-link' : ''
                }`}
              >
                {item.name}
                {location.pathname === item.path && (
                  <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-limpopo-blue rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-1 nav-link"
                >
                  <User className="h-5 w-5" />
                  <span>{profile?.first_name || 'Profile'}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-1 nav-link"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="flex items-center space-x-1 nav-link"
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/register"
                  className="btn-primary"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md text-gray-500 hover:text-limpopo-blue focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg py-4 border-t border-gray-200">
          <div className="flex flex-col space-y-2 px-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-3 text-lg font-medium rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? 'bg-limpopo-green/10 text-limpopo-blue'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 mt-4 border-t border-gray-200">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-2">
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    <User className="h-5 w-5" />
                    <span>{profile?.first_name || 'My Profile'}</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 font-medium w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 btn-primary text-center"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;