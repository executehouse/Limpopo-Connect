import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ShoppingBag, Camera, Newspaper } from 'lucide-react';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <section className="bg-hero-gradient text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
              Welcome to <span className="text-limpopo-gold">Limpopo Connect</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto font-light">
              Your gateway to discovering businesses, events, tourism, and community life 
              across the beautiful Limpopo Province.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/business-directory" className="btn-primary">
                Explore Businesses
              </Link>
              <Link to="/events" className="btn-secondary">
                Find Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Limpopo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with your community through our comprehensive platform.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Business Directory */}
            <Link to="/business-directory" className="card text-center group">
              <div className="text-limpopo-green group-hover:text-limpopo-blue transition-colors duration-300 mb-5">
                <Search className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Business Directory</h3>
              <p className="text-gray-600 leading-relaxed">
                Find local businesses, services, and professionals with detailed information, 
                reviews, and contact details.
              </p>
            </Link>

            {/* Events */}
            <Link to="/events" className="card text-center group">
              <div className="text-limpopo-green group-hover:text-limpopo-blue transition-colors duration-300 mb-5">
                <Calendar className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Community Events</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay updated with local events, festivals, workshops, and community 
                gatherings happening near you.
              </p>
            </Link>

            {/* Marketplace */}
            <Link to="/marketplace" className="card text-center group">
              <div className="text-limpopo-green group-hover:text-limpopo-blue transition-colors duration-300 mb-5">
                <ShoppingBag className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Local Marketplace</h3>
              <p className="text-gray-600 leading-relaxed">
                Buy and sell local products, services, and goods within your community 
                with trusted sellers.
              </p>
            </Link>

            {/* Tourism */}
            <Link to="/tourism" className="card text-center group">
              <div className="text-limpopo-green group-hover:text-limpopo-blue transition-colors duration-300 mb-5">
                <Camera className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Tourism Hub</h3>
              <p className="text-gray-600 leading-relaxed">
                Explore tourist attractions, accommodations, and experiences that 
                showcase the beauty of Limpopo.
              </p>
            </Link>

            {/* News */}
            <Link to="/news" className="card text-center group">
              <div className="text-limpopo-green group-hover:text-limpopo-blue transition-colors duration-300 mb-5">
                <Newspaper className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Local News</h3>
              <p className="text-gray-600 leading-relaxed">
                Stay informed with the latest local news, announcements, and 
                community updates from across Limpopo.
              </p>
            </Link>

            {/* Community Connection */}
            <div className="card text-center group">
              <div className="text-limpopo-green group-hover:text-limpopo-blue transition-colors duration-300 mb-5">
                <MapPin className="h-16 w-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Community Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Build connections with residents, visitors, and businesses in your 
                local area and beyond.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Join the Limpopo Connect Community
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Whether you're a resident, business owner, or visitor, become part of 
            our growing community platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register" className="btn-primary">
              Join Now
            </Link>
            <Link to="/business-directory" className="btn-secondary">
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;