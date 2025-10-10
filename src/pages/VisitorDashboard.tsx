import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Building2, Calendar, Users, UserPlus, ArrowRight } from 'lucide-react';

const VisitorDashboard: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-limpopo-green to-limpopo-blue">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <MapPin className="h-12 w-12 text-white" />
            <h1 className="text-4xl font-bold text-white">
              Welcome to Limpopo Connect
            </h1>
          </div>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Discover the vibrant Limpopo Province community. Connect with locals, explore businesses, and experience our rich culture.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {/* Join Community */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <UserPlus className="h-8 w-8 text-limpopo-green" />
              <span className="text-sm font-medium text-limpopo-green bg-limpopo-green/10 px-3 py-1 rounded-full">
                Free
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Join Our Community
            </h3>
            <p className="text-gray-600 mb-4">
              Create your account to connect with neighbors, participate in discussions, and access exclusive community features.
            </p>
            <Link
              to="/auth/register"
              className="inline-flex items-center text-limpopo-green font-medium hover:text-limpopo-green-dark"
            >
              Sign up now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Explore Businesses */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <Building2 className="h-8 w-8 text-limpopo-blue" />
              <span className="text-sm font-medium text-gray-500">
                Browse
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Local Businesses
            </h3>
            <p className="text-gray-600 mb-4">
              Discover local shops, restaurants, services, and entrepreneurs in the Limpopo Province.
            </p>
            <Link
              to="/business-directory"
              className="inline-flex items-center text-limpopo-blue font-medium hover:text-limpopo-blue-dark"
            >
              Explore directory
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          {/* Events & Activities */}
          <div className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="h-8 w-8 text-orange-500" />
              <span className="text-sm font-medium text-orange-500 bg-orange-100 px-3 py-1 rounded-full">
                Live
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Community Events
            </h3>
            <p className="text-gray-600 mb-4">
              Stay updated with local festivals, cultural events, workshops, and community gatherings.
            </p>
            <Link
              to="/events"
              className="inline-flex items-center text-orange-500 font-medium hover:text-orange-600"
            >
              View events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            What Makes Limpopo Connect Special?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <Users className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Community First</h3>
              <p className="text-white/80">
                Built by locals, for locals. Connect with your neighbors and build lasting relationships.
              </p>
            </div>
            <div className="text-center">
              <MapPin className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Local Focus</h3>
              <p className="text-white/80">
                Discover hidden gems and support local businesses in the beautiful Limpopo Province.
              </p>
            </div>
            <div className="text-center">
              <Building2 className="h-12 w-12 text-white mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Business Growth</h3>
              <p className="text-white/80">
                Help local entrepreneurs thrive by connecting with authentic community members.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to Join the Limpopo Community?
          </h2>
          <p className="text-gray-600 mb-6 max-w-xl mx-auto">
            Create your free account today and start connecting with your neighbors, discovering local businesses, and participating in community life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="btn-primary px-8 py-3 text-center"
            >
              Create Account
            </Link>
            <Link
              to="/auth/login"
              className="btn-secondary px-8 py-3 text-center"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisitorDashboard;