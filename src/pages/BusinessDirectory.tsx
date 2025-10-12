import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Globe, Star, Filter, Mail, Clock, Check } from 'lucide-react';
import { mockBusinesses, simulateApiDelay, filterItemsByCategory, searchItems } from '../lib/mockData';
import type { Business } from '../lib/api';

const BusinessDirectory: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filteredBusinesses, setFilteredBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Get unique categories and locations from data
  const categories = [...new Set(mockBusinesses.map(b => b.category))];
  const locations = [...new Set(mockBusinesses.map(b => b.address.split(',')[1]?.trim() || 'Unknown'))];

  useEffect(() => {
    const loadBusinesses = async () => {
      setLoading(true);
      await simulateApiDelay(800); // Simulate API call
      setBusinesses(mockBusinesses);
      setFilteredBusinesses(mockBusinesses);
      setLoading(false);
    };
    
    loadBusinesses();
  }, []);

  useEffect(() => {
    let filtered = businesses;
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filterItemsByCategory(filtered, selectedCategory);
    }
    
    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(business => 
        business.address.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = searchItems(filtered, searchQuery);
    }
    
    setFilteredBusinesses(filtered);
  }, [businesses, selectedCategory, selectedLocation, searchQuery]);



  const formatRating = (rating?: number) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Business Directory
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Loading businesses...
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="card animate-pulse">
                <div className="h-48 bg-gray-300 rounded-lg mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                  <div className="h-3 bg-gray-300 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Business Directory
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover local businesses, services, and professionals across Limpopo Province.
            Connect with trusted providers in your community.
          </p>
          <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-600">
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              {mockBusinesses.length} Verified Businesses
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              {categories.length} Categories
            </span>
            <span className="flex items-center">
              <Check className="h-4 w-4 text-green-500 mr-2" />
              Updated Daily
            </span>
          </div>
        </div>

        {/* Enhanced Search and Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Businesses
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, service, or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-limpopo-blue transition-colors"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <div className="relative">
                <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-limpopo-blue transition-colors appearance-none bg-white"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-limpopo-blue transition-colors appearance-none bg-white"
                >
                  <option value="">All Locations</option>
                  {locations.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">{filteredBusinesses.length}</span> of <span className="font-semibold">{businesses.length}</span> businesses
              {selectedCategory && <span className="ml-2 text-limpopo-blue">in {selectedCategory}</span>}
              {selectedLocation && <span className="ml-2 text-limpopo-green">in {selectedLocation}</span>}
            </p>
          </div>
        </div>

        {/* Business Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBusinesses.map((business) => (
            <div key={business.id} className="card hover:shadow-xl transition-all duration-300">
              <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                <img 
                  src={business.imageUrl} 
                  alt={business.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://placehold.co/400x300?text=Business+Image';
                  }}
                />
              </div>
              
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">{business.name}</h3>
                  <span className="inline-block px-2 py-1 bg-limpopo-blue/10 text-limpopo-blue rounded-full text-xs font-medium">
                    {business.category}
                  </span>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  <span className="text-sm text-gray-600">{formatRating(business.rating)}</span>
                </div>
              </div>
              
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {business.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{business.address}</span>
                </div>
                
                {business.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="h-4 w-4 flex-shrink-0" />
                    <span>{business.phone}</span>
                  </div>
                )}
                
                {business.email && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{business.email}</span>
                  </div>
                )}
                
                {business.website && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Globe className="h-4 w-4 flex-shrink-0" />
                    <a 
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-limpopo-blue hover:underline truncate"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
                
                {business.openingHours && (
                  <div className="flex items-start space-x-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span className="text-xs">{business.openingHours}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <button className="btn-primary flex-1 mr-2">View Details</button>
                {business.verified && (
                  <div className="flex items-center space-x-1 text-green-600 text-xs">
                    <Check className="h-3 w-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* No results message */}
        {filteredBusinesses.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search criteria or browse all categories.
            </p>
            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setSelectedLocation('');
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Call to Action */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mt-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            List Your Business
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Join our community of local businesses and reach more customers.
            Get discovered by people looking for your services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-3">
              Add Your Business
            </button>
            <button className="btn-secondary text-lg px-8 py-3">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDirectory;