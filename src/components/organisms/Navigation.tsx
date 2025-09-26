import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, MapPin, Calendar, Store, Users, Bell, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../atoms/Button';

const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();

  const navigationItems = [
    { name: 'Home', href: '/', icon: null },
    { name: 'Businesses', href: '/businesses', icon: Store },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Tourism', href: '/tourism', icon: MapPin },
    { name: 'Community', href: '/community', icon: Users },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center mr-2">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-xl text-gray-900">Limpopo Connect</span>
              </Link>
            </div>
            
            {/* Desktop navigation */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent transition-colors duration-200"
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-2" />}
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right side navigation */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200">
                  <Bell className="w-5 h-5" />
                </button>
                
                <div className="relative">
                  <button className="flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-2">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName || 'User'} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <User className="w-4 h-4 text-primary-600" />
                      )}
                    </div>
                    <span className="hidden lg:block">
                      {user.displayName || user.email?.split('@')[0]}
                    </span>
                  </button>
                </div>

                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center pl-3 pr-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                onClick={() => setIsOpen(false)}
              >
                {item.icon && <item.icon className="w-5 h-5 mr-3" />}
                {item.name}
              </Link>
            ))}
          </div>
          
          {/* Mobile user menu */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            {user ? (
              <div className="space-y-1">
                <div className="flex items-center px-4 py-2">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                    {user.photoURL ? (
                      <img 
                        src={user.photoURL} 
                        alt={user.displayName || 'User'} 
                        className="w-10 h-10 rounded-full"
                      />
                    ) : (
                      <User className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-800">
                      {user.displayName || user.email?.split('@')[0]}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                <Link
                  to="/login"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;