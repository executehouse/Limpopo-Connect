import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Calendar, ShoppingBag, Camera, Newspaper, ArrowRight } from 'lucide-react';
import heroImage from '../assets/hero-bg.jpg';

const Home: React.FC = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      {/* Ultra-Modern Hero Section with Background Image */}
      <section className="relative text-white overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Parallax Effect */}
        <div 
          className="absolute inset-0 parallax-layer"
          style={{
            transform: `translateY(${scrollY * 0.5}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          <img 
            src={heroImage} 
            alt="Limpopo Province Landscape" 
            className="w-full h-full object-cover object-center"
            loading="eager"
          />
        </div>
        
        {/* Creative Gradient Overlay with Color Blending */}
        <div className="absolute inset-0 hero-image-overlay"></div>
        
        {/* Animated Gradient Accent */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
        
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 bg-hero-pattern opacity-5"></div>
        
        {/* Content Container */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 w-full z-10">
          <div className="text-center animate-fade-in">
            {/* Main Heading with Gradient Text Effect */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 tracking-tight animate-slide-up">
              <span className="block mb-2">Welcome to</span>
              <span className="text-limpopo-gold drop-shadow-2xl inline-block transform hover:scale-105 transition-transform duration-300">
                Limpopo Connect
              </span>
            </h1>
            
            {/* Subtitle with Enhanced Typography */}
            <p className="text-xl md:text-2xl lg:text-3xl mb-12 max-w-4xl mx-auto font-light text-shadow-lg leading-relaxed animate-slide-up animation-delay-200">
              Your gateway to discovering businesses, events, tourism, and community life across the beautiful Limpopo Province.
            </p>
            
            {/* CTA Buttons with Enhanced Effects */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-slide-up animation-delay-400">
              <Link 
                to="/business-directory" 
                className="btn-primary text-lg group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Explore Businesses
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link 
                to="/events" 
                className="btn-secondary text-lg group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center">
                  Find Events
                  <Calendar className="ml-2 h-5 w-5 transform group-hover:scale-110 transition-transform" />
                </span>
              </Link>
            </div>
            
            {/* Scroll Indicator */}
            <div className="mt-16 animate-bounce">
              <div className="w-6 h-10 border-2 border-white/50 rounded-full mx-auto flex items-start justify-center p-2">
                <div className="w-1 h-3 bg-white/70 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features Section with Modern Grid Layout */}
      <section className="py-24 bg-white relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 opacity-50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-20 animate-fade-in">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Discover Everything <span className="text-gradient">Limpopo</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              A comprehensive platform designed to connect and empower our community.
            </p>
            <div className="mt-6 flex justify-center">
              <div className="w-24 h-1 bg-gradient-to-r from-limpopo-green via-limpopo-blue to-limpopo-gold rounded-full"></div>
            </div>
          </div>
          
          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
            {features.map((feature, index) => (
              <Link 
                to={feature.path} 
                key={index} 
                className="feature-card group animate-scale-in hover-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="feature-icon bg-limpopo-green/10 text-limpopo-green group-hover:bg-gradient-to-br group-hover:from-limpopo-green group-hover:to-limpopo-blue group-hover:text-white transform group-hover:rotate-6 group-hover:scale-110">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-limpopo-blue transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6 text-base">
                  {feature.description}
                </p>
                <div className="flex items-center text-limpopo-blue font-semibold group-hover:gap-2 transition-all">
                  Learn More 
                  <ArrowRight className="h-5 w-5 ml-1 transition-transform group-hover:translate-x-2" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Content Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Discover <span className="text-limpopo-green">Limpopo</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From world-class wildlife experiences to vibrant local businesses, explore what makes our province special
            </p>
          </div>

          {/* Featured Businesses */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Featured Businesses</h3>
              <Link to="/business-directory" className="text-limpopo-blue hover:text-limpopo-green transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/99ce67aa-5659-4285-a324-6ef5a9cedb33.png" 
                  alt="Makhadzi Restaurant"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Makhadzi Restaurant</h4>
                  <p className="text-gray-600 mb-3">Authentic Venda cuisine serving traditional dishes with modern flair</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-limpopo-green font-semibold">Restaurant</span>
                    <div className="flex items-center">
                      <span className="text-limpopo-gold text-sm">★★★★☆</span>
                      <span className="text-gray-500 text-sm ml-1">(4.5)</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <img 
                  src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a9155348-a844-4fff-9b59-61909228f4c6.png" 
                  alt="Mokopane Fresh Produce"
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Mokopane Fresh Produce</h4>
                  <p className="text-gray-600 mb-3">Farm-fresh vegetables, fruits, and grains directly from local farmers</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-limpopo-green font-semibold">Agriculture</span>
                    <div className="flex items-center">
                      <span className="text-limpopo-gold text-sm">★★★★☆</span>
                      <span className="text-gray-500 text-sm ml-1">(4.4)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="w-full h-48 bg-gradient-to-br from-limpopo-blue/20 to-limpopo-green/20 flex items-center justify-center">
                  <Camera className="h-12 w-12 text-limpopo-green" />
                </div>
                <div className="p-6">
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Baobab Craft Centre</h4>
                  <p className="text-gray-600 mb-3">Handcrafted African art, pottery, and jewelry made by local artisans</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-limpopo-green font-semibold">Arts & Crafts</span>
                    <div className="flex items-center">
                      <span className="text-limpopo-gold text-sm">★★★★★</span>
                      <span className="text-gray-500 text-sm ml-1">(4.8)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="mb-16">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Upcoming Events</h3>
              <Link to="/events" className="text-limpopo-blue hover:text-limpopo-green transition-colors">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gradient-to-br from-limpopo-green/10 to-limpopo-blue/10 rounded-xl p-6 border border-limpopo-green/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-semibold text-limpopo-green bg-limpopo-green/10 px-3 py-1 rounded-full">
                      Cultural
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 mt-2">Limpopo Arts & Culture Festival 2024</h4>
                  </div>
                  <Calendar className="h-6 w-6 text-limpopo-green" />
                </div>
                <p className="text-gray-600 mb-4">Annual celebration featuring traditional music, dance, art exhibitions, and local cuisine</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">📍 Polokwane Civic Centre</span>
                  <span className="text-limpopo-blue font-semibold">May 15-17</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-limpopo-gold/10 to-limpopo-green/10 rounded-xl p-6 border border-limpopo-gold/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-sm font-semibold text-limpopo-gold bg-limpopo-gold/10 px-3 py-1 rounded-full">
                      Education
                    </span>
                    <h4 className="text-xl font-bold text-gray-900 mt-2">Kruger Conservation Workshop</h4>
                  </div>
                  <Calendar className="h-6 w-6 text-limpopo-gold" />
                </div>
                <p className="text-gray-600 mb-4">Educational workshop on wildlife conservation and community involvement</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">📍 Skukuza Rest Camp</span>
                  <span className="text-limpopo-blue font-semibold">April 20</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tourism Highlights */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Must-Visit Attractions</h3>
              <Link to="/tourism" className="text-limpopo-blue hover:text-limpopo-green transition-colors">
                Explore More →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-limpopo-green/30 to-limpopo-blue/30"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-xl font-bold">Kruger National Park</h4>
                  <p className="text-sm opacity-90">World-renowned Big Five safari experience</p>
                </div>
                <Camera className="absolute top-4 right-4 h-6 w-6 text-white/80" />
              </div>
              
              <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-limpopo-gold/30 to-limpopo-green/30"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-xl font-bold">God's Window</h4>
                  <p className="text-sm opacity-90">Breathtaking views over Blyde River Canyon</p>
                </div>
                <Camera className="absolute top-4 right-4 h-6 w-6 text-white/80" />
              </div>
              
              <div className="relative rounded-xl overflow-hidden h-64 group cursor-pointer">
                <div className="absolute inset-0 bg-gradient-to-br from-limpopo-blue/30 to-limpopo-gold/30"></div>
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors"></div>
                <div className="absolute bottom-4 left-4 text-white">
                  <h4 className="text-xl font-bold">Mapungubwe National Park</h4>
                  <p className="text-sm opacity-90">UNESCO World Heritage archaeological site</p>
                </div>
                <Camera className="absolute top-4 right-4 h-6 w-6 text-white/80" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section with Glassmorphism */}
      <section className="py-24 bg-gradient-to-br from-gray-100 via-blue-50 to-gray-100 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute top-10 left-10 w-72 h-72 bg-limpopo-blue/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-limpopo-gold/10 rounded-full blur-3xl animate-float animation-delay-400"></div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="cta-card text-center">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 relative z-10">
              Become Part of <span className="text-gradient">Our Community</span>
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed relative z-10">
              Whether you're a resident, business owner, or visitor, join our platform to connect, engage, and grow with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center relative z-10">
              <Link to="/register" className="btn-primary text-lg group">
                <span className="flex items-center justify-center">
                  Join Now
                  <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link to="/business-directory" className="btn-secondary text-lg group">
                <span className="flex items-center justify-center">
                  List Your Business
                  <ShoppingBag className="ml-2 h-5 w-5 transform group-hover:scale-110 transition-transform" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;