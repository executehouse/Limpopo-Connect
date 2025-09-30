import React from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ShoppingBag, Camera, Newspaper, ArrowRight } from 'lucide-react';

const Home: React.FC = () => {
  const features = [
    {
      icon: <Search className="h-12 w-12" />,
      title: 'Business Directory',
      description: 'Find local businesses, services, and professionals with detailed information and reviews.',
      path: '/business-directory',
    },
    {
      icon: <Calendar className="h-12 w-12" />,
      title: 'Community Events',
      description: 'Stay updated with local events, festivals, workshops, and community gatherings.',
      path: '/events',
    },
    {
      icon: <ShoppingBag className="h-12 w-12" />,
      title: 'Local Marketplace',
      description: 'Buy and sell local products and services within your community with trusted sellers.',
      path: '/marketplace',
    },
    {
      icon: <Camera className="h-12 w-12" />,
      title: 'Tourism Hub',
      description: 'Explore attractions, accommodations, and experiences that showcase Limpopo\'s beauty.',
      path: '/tourism',
    },
    {
      icon: <Newspaper className="h-12 w-12" />,
      title: 'Local News',
      description: 'Stay informed with the latest news, announcements, and community updates.',
      path: '/news',
    },
    {
      icon: <MapPin className="h-12 w-12" />,
      title: 'Community Connect',
      description: 'Build connections with residents, visitors, and businesses in your local area and beyond.',
      path: '/connections',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative text-white overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-90"></div>
        <div className="absolute inset-0 bg-hero-pattern opacity-10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-shadow-lg">
              Welcome to <span className="text-limpopo-gold">Limpopo Connect</span>
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-4xl mx-auto font-light text-shadow">
              Your gateway to discovering businesses, events, tourism, and community life across the beautiful Limpopo Province.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link to="/business-directory" className="btn-primary text-lg">
                Explore Businesses
              </Link>
              <Link to="/events" className="btn-secondary text-lg">
                Find Events
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover Everything Limpopo
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              A comprehensive platform designed to connect and empower our community.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <Link to={feature.path} key={index} className="feature-card group">
                <div className="feature-icon bg-limpopo-green/10 text-limpopo-green group-hover:bg-limpopo-blue group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{feature.description}</p>
                <div className="flex items-center text-limpopo-blue font-semibold group-hover:underline">
                  Learn More <ArrowRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-white rounded-2xl shadow-xl p-12 md:p-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Become Part of Our Community
          </h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Whether you're a resident, business owner, or visitor, join our platform to connect, engage, and grow with us.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/register" className="btn-primary text-lg">
              Join Now
            </Link>
            <Link to="/business-directory" className="btn-secondary text-lg">
              List Your Business
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;