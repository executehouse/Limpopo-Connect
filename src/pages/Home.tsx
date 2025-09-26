import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ShoppingBag, Camera, Newspaper } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-limpopo-green to-limpopo-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to <span className="text-limpopo-gold">Limpopo Connect</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Your gateway to discovering businesses, events, tourism, and community life 
              across the beautiful Limpopo Province
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/business-directory" className="btn-primary text-lg px-8 py-3">
                Explore Businesses
              </Link>
              <Link to="/events" className="btn-secondary text-lg px-8 py-3">
                Find Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Discover Limpopo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with your community through our comprehensive platform
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Business Directory */}
            <Link to="/business-directory" className="card hover:shadow-lg transition group">
              <div className="text-limpopo-blue group-hover:text-limpopo-green transition mb-4">
                <Search className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Business Directory</h3>
              <p className="text-gray-600">
                Find local businesses, services, and professionals with detailed information, 
                reviews, and contact details.
              </p>
            </Link>

            {/* Events */}
            <Link to="/events" className="card hover:shadow-lg transition group">
              <div className="text-limpopo-blue group-hover:text-limpopo-green transition mb-4">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Events</h3>
              <p className="text-gray-600">
                Stay updated with local events, festivals, workshops, and community 
                gatherings happening near you.
              </p>
            </Link>

            {/* Marketplace */}
            <Link to="/marketplace" className="card hover:shadow-lg transition group">
              <div className="text-limpopo-blue group-hover:text-limpopo-green transition mb-4">
                <ShoppingBag className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local Marketplace</h3>
              <p className="text-gray-600">
                Buy and sell local products, services, and goods within your community 
                with trusted sellers.
              </p>
            </Link>

            {/* Tourism */}
            <Link to="/tourism" className="card hover:shadow-lg transition group">
              <div className="text-limpopo-blue group-hover:text-limpopo-green transition mb-4">
                <Camera className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Tourism Hub</h3>
              <p className="text-gray-600">
                Explore tourist attractions, accommodations, and experiences that 
                showcase the beauty of Limpopo.
              </p>
            </Link>

            {/* News */}
            <Link to="/news" className="card hover:shadow-lg transition group">
              <div className="text-limpopo-blue group-hover:text-limpopo-green transition mb-4">
                <Newspaper className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Local News</h3>
              <p className="text-gray-600">
                Stay informed with the latest local news, announcements, and 
                community updates from across Limpopo.
              </p>
            </Link>

            {/* Community Connection */}
            <div className="card hover:shadow-lg transition group">
              <div className="text-limpopo-blue group-hover:text-limpopo-green transition mb-4">
                <MapPin className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Connect</h3>
              <p className="text-gray-600">
                Build connections with residents, visitors, and businesses in your 
                local area and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Join the Limpopo Connect Community
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a resident, business owner, or visitor, become part of 
            our growing community platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-lg px-8 py-3">
              Join Now
            </Link>
            <Link to="/business-directory" className="btn-secondary text-lg px-8 py-3">
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;