import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, MapPin, Calendar, Store, Users, Zap } from 'lucide-react';
import Button from '../atoms/Button';

const HomePage: React.FC = () => {
  const features = [
    {
      icon: Store,
      title: 'Local Businesses',
      description: 'Discover and support local businesses across Limpopo Province',
      link: '/businesses'
    },
    {
      icon: Calendar,
      title: 'Community Events',
      description: 'Stay connected with upcoming events and cultural activities',
      link: '/events'
    },
    {
      icon: MapPin,
      title: 'Tourism & Heritage',
      description: 'Explore attractions, accommodations, and cultural sites',
      link: '/tourism'
    },
    {
      icon: Users,
      title: 'Community Hub',
      description: 'Connect with your community and local initiatives',
      link: '/community'
    }
  ];

  const stats = [
    { label: 'Local Businesses', value: '500+' },
    { label: 'Community Events', value: '200+' },
    { label: 'Active Users', value: '5000+' },
    { label: 'Tourist Attractions', value: '100+' }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
              Welcome to{' '}
              <span className="text-secondary-300">Limpopo Connect</span>
            </h1>
            <p className="text-xl lg:text-2xl text-primary-100 mb-8 leading-relaxed">
              Your digital gateway to Limpopo Province. Discover local businesses, 
              explore cultural heritage, and connect with your community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/businesses">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Explore Businesses
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/events">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-300 text-white hover:bg-primary-600">
                  View Events
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-black opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Explore Limpopo
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From local businesses to cultural heritage sites, 
            Limpopo Connect is your comprehensive guide to the province.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="group bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all duration-200"
            >
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors duration-200">
                <feature.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700">
                Learn More
                <ArrowRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Growing Together
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Join thousands of residents, businesses, and visitors who are already part of the Limpopo Connect community.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-primary-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 lg:p-12 text-white text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Connect with Limpopo?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join our community today and start discovering everything Limpopo has to offer.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Get Started Today
                  <Zap className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/about">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto border-primary-300 text-white hover:bg-primary-600"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;