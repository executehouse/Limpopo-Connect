import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, MapPin, User, LogOut, ChevronDown, Store, Shield, Eye } from 'lucide-react';
import { useAuthContext } from '../../lib/AuthProvider';
import rolesConfig from '../../config/roles.json';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, signOut, profile, role, getRoleConfig } = useAuthContext();

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

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsProfileMenuOpen(false);
    };
    if (isProfileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isProfileMenuOpen]);

  // Get role-based navigation items
  const roleConfig = getRoleConfig(role);

  // Map route configs to nav items
  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Business Directory', path: '/business-directory' },
    { name: 'Events', path: '/events' },
    { name: 'Tourism', path: '/tourism' },
    { name: 'News', path: '/news' },
    { name: 'Contact', path: '/contact' },
    ...(isAuthenticated ? [
      { name: 'Connections', path: '/connections' },
      { name: 'Marketplace', path: '/marketplace' },
      { name: 'Chat Rooms', path: '/chat-demo' },
    ] : [])
  ];

  // Get role-specific quick actions
  const quickActions = roleConfig?.quickActions || [];
  
  const getRoleIcon = (userRole: string) => {
    switch (userRole) {
      case 'admin': return Shield;
      case 'business': return Store;
      case 'citizen': return User;
      case 'visitor': return Eye;
      default: return User;
    }
  };

  const getRoleColor = (userRole: string) => {
    const config = rolesConfig[userRole as keyof typeof rolesConfig];
    return config?.color || 'gray';
  };

  const getRoleBgColor = (color: string) => {
    const colorMap: Record<string, string> = {
      red: 'bg-red-100 text-red-800',
      orange: 'bg-orange-100 text-orange-800',
      blue: 'bg-blue-100 text-blue-800',
      gray: 'bg-gray-100 text-gray-800',
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

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
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {/* Role Badge */}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    getRoleBgColor(getRoleColor(role))
                  }`}>
                    {React.createElement(getRoleIcon(role), { className: "h-3 w-3 mr-1" })}
                    {roleConfig?.label || role}
                  </span>
                  
                  {/* User Info */}
                  <div className="flex items-center space-x-1">
                    <User className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-700">
                      {profile?.first_name || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info Header */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-limpopo-green rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {profile?.first_name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {profile?.first_name} {profile?.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{profile?.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Role-specific Quick Links */}
                    {quickActions.length > 0 && (
                      <div className="py-2">
                        <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quick Actions
                        </div>
                        {quickActions.map((action: { label: string; path: string; icon: string }, index: number) => (
                          <Link
                            key={index}
                            to={action.path}
                            className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsProfileMenuOpen(false)}
                          >
                            <span className="text-gray-400">{action.icon}</span>
                            <span>{action.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Standard Links */}
                    <div className="py-2 border-t border-gray-100">
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsProfileMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-gray-400" />
                        <span>My Profile</span>
                      </Link>
                      
                      {/* Role-specific dashboard link */}
                      {role !== 'visitor' && (
                        <Link
                          to={roleConfig?.defaultLanding || '/home'}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setIsProfileMenuOpen(false)}
                        >
                          {React.createElement(getRoleIcon(role), { className: "h-4 w-4 text-gray-400" })}
                          <span>Dashboard</span>
                        </Link>
                      )}
                      
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsProfileMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        <LogOut className="h-4 w-4 text-gray-400" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/auth/login"
                  className="flex items-center space-x-1 nav-link"
                >
                  <User className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/auth/register"
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
                  {/* Role Badge in Mobile */}
                  <div className="px-4 py-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      getRoleBgColor(getRoleColor(role))
                    }`}>
                      {React.createElement(getRoleIcon(role), { className: "h-4 w-4 mr-2" })}
                      {roleConfig?.label || role}
                    </span>
                  </div>
                  
                  {/* Quick Actions for Mobile */}
                  {quickActions.length > 0 && (
                    <div className="px-4 py-2">
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Quick Actions
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {quickActions.slice(0, 4).map((action: { label: string; path: string }, index: number) => (
                          <Link
                            key={index}
                            to={action.path}
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center space-x-1 py-2 px-3 text-xs bg-gray-50 rounded-lg text-gray-700 hover:bg-gray-100"
                          >
                            <span>{action.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    <User className="h-5 w-5" />
                    <span>{profile?.first_name || 'My Profile'}</span>
                  </Link>
                  
                  {/* Dashboard Link */}
                  {role !== 'visitor' && (
                    <Link
                      to={roleConfig?.defaultLanding || '/home'}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                    >
                      {React.createElement(getRoleIcon(role), { className: "h-5 w-5" })}
                      <span>Dashboard</span>
                    </Link>
                  )}
                  
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
                    to="/auth/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex-1 text-center py-3 px-4 rounded-lg text-gray-700 hover:bg-gray-100 font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/auth/register"
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