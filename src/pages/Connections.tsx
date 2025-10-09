import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Heart, Users, Coffee, Star, Book, Clock } from 'lucide-react';

const Connections: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All');

  const districts = ['All', 'Capricorn', 'Vhembe', 'Mopani', 'Waterberg', 'Sekhukhune'];

  const categories = [
    {
      id: 'friendship-partners',
      title: 'Friendship & Activity Partners',
      description: 'Connect with like-minded people for hobbies, sports, and adventures',
      icon: Users,
      count: 128,
      gradient: 'from-blue-400 to-blue-600',
      hoverGradient: 'hover:from-blue-500 hover:to-blue-700'
    },
    {
      id: 'meaningful-relationships',
      title: 'Meaningful Relationships',
      description: 'Find genuine connections and lasting relationships in your area',
      icon: Heart,
      count: 89,
      gradient: 'from-pink-400 to-pink-600',
      hoverGradient: 'hover:from-pink-500 hover:to-pink-700'
    },
    {
      id: 'casual-meetups',
      title: 'Casual Meetups',
      description: 'Join relaxed gatherings and social events in your community',
      icon: Coffee,
      count: 156,
      gradient: 'from-amber-400 to-amber-600',
      hoverGradient: 'hover:from-amber-500 hover:to-amber-700'
    },
    {
      id: 'shared-interests',
      title: 'Shared Interests',
      description: 'Bond over common passions, hobbies, and interests',
      icon: Star,
      count: 94,
      gradient: 'from-purple-400 to-purple-600',
      hoverGradient: 'hover:from-purple-500 hover:to-purple-700'
    },
    {
      id: 'community-stories',
      title: 'Community Stories',
      description: 'Share experiences and connect through local stories',
      icon: Book,
      count: 67,
      gradient: 'from-green-400 to-green-600',
      hoverGradient: 'hover:from-green-500 hover:to-green-700'
    },
    {
      id: 'missed-moments',
      title: 'Missed Moments',
      description: 'Reconnect with people you met but lost touch with',
      icon: Clock,
      count: 42,
      gradient: 'from-indigo-400 to-indigo-600',
      hoverGradient: 'hover:from-indigo-500 hover:to-indigo-700'
    }
  ];

  const filteredCategories = categories.filter(category => {
    const term = searchTerm.toLowerCase();
    return (
      category.title.toLowerCase().includes(term) ||
      category.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-limpopo-green to-limpopo-blue text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Connections in <span className="text-limpopo-gold">Limpopo</span>
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">
              Find people, friendships, and shared experiences across the province
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search for connections, interests, or activities..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white/20 border border-white/30 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-limpopo-gold focus:border-transparent"
                  />
                </div>
                
                {/* District Filter */}
                <div className="relative">
                  <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 h-5 w-5" />
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="appearance-none bg-white/20 border border-white/30 rounded-xl text-white pl-12 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-limpopo-gold focus:border-transparent min-w-[180px]"
                  >
                    {districts.map((district) => (
                      <option key={district} value={district} className="text-gray-900">
                        {district === 'All' ? 'All Districts' : district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Find Your Community
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore different ways to connect with people in Limpopo Province
            </p>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Link
                  key={category.id}
                  to={`/connections/${category.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border border-gray-100 group-hover:-translate-y-2">
                    {/* Icon with gradient background */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${category.gradient} ${category.hoverGradient} flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>

                    {/* Category Info */}
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-limpopo-blue transition-colors">
                        {category.title}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {category.description}
                      </p>
                      
                      {/* Count Badge */}
                      <div className="inline-flex items-center space-x-2 bg-gray-100 group-hover:bg-limpopo-gold/20 px-4 py-2 rounded-full transition-colors">
                        <span className="text-2xl font-bold text-limpopo-blue">
                          {category.count}
                        </span>
                        <span className="text-sm text-gray-600 font-medium">
                          connections
                        </span>
                      </div>
                    </div>

                    {/* Hover arrow */}
                    <div className="mt-6 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-limpopo-blue text-white px-6 py-2 rounded-full text-sm font-medium">
                        Explore →
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-16 bg-gradient-to-r from-limpopo-green/5 to-limpopo-blue/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Growing Together as a Community
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-4xl font-bold text-limpopo-blue mb-2">576</div>
                <div className="text-gray-600 font-medium">Total Connections</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-4xl font-bold text-limpopo-green mb-2">5</div>
                <div className="text-gray-600 font-medium">Districts Covered</div>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-4xl font-bold text-limpopo-gold mb-2">89%</div>
                <div className="text-gray-600 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-r from-limpopo-green to-limpopo-blue rounded-3xl p-12 text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Make New Connections?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join our vibrant community and start building meaningful relationships today
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-xl transition duration-300">
                Join the Community
              </Link>
              <Link to="/login" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-xl border border-white/30 transition duration-300">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Connections;