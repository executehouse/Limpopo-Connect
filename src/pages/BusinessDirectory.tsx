import React, { useState } from 'react';
import { Search, Filter, MapPin, Star, Phone, Globe } from 'lucide-react';

interface Business {
  id: number;
  name: string;
  category: string;
  description: string;
  location: string;
  phone: string;
  website?: string;
  rating: number;
  reviewCount: number;
  image: string;
}

const BusinessDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Sample data - in real app this would come from an API
  const businesses: Business[] = [
    {
      id: 1,
      name: "Baobab Restaurant & Lodge",
      category: "Hospitality",
      description: "Traditional South African cuisine with a modern twist, featuring local Limpopo ingredients.",
      location: "Polokwane",
      phone: "+27 15 123 4567",
      website: "www.baobarestaurant.co.za",
      rating: 4.5,
      reviewCount: 89,
      image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Limpopo Craft Brewery",
      category: "Food & Beverage",
      description: "Local craft brewery serving authentic South African beers and traditional pub food.",
      location: "Mokopane",
      phone: "+27 15 234 5678",
      rating: 4.2,
      reviewCount: 156,
      image: "https://images.unsplash.com/photo-1568213816046-0ee1c42bd559?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Marula Hardware & Garden",
      category: "Retail",
      description: "Complete hardware and gardening supplies for all your home improvement needs.",
      location: "Tzaneen",
      phone: "+27 15 345 6789",
      rating: 4.0,
      reviewCount: 67,
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop"
    }
  ];

  const categories = ['All', 'Hospitality', 'Food & Beverage', 'Retail', 'Services', 'Healthcare', 'Education'];

  const filteredBusinesses = businesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Business Directory</h1>
          <p className="text-lg text-gray-600 mb-6">
            Discover local businesses and services across Limpopo Province
          </p>
          
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search businesses, services, or products..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredBusinesses.length} of {businesses.length} businesses
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Business Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map((business) => (
            <div key={business.id} className="card hover:shadow-lg transition">
              <img
                src={business.image}
                alt={business.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="text-xl font-semibold text-gray-900">{business.name}</h3>
                  <span className="text-sm bg-limpopo-blue text-white px-2 py-1 rounded">
                    {business.category}
                  </span>
                </div>

                <p className="text-gray-600 text-sm">{business.description}</p>

                <div className="flex items-center space-x-1">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.floor(business.rating)
                            ? 'text-limpopo-gold fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {business.rating} ({business.reviewCount} reviews)
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{business.location}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{business.phone}</span>
                  </div>
                  {business.website && (
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={`https://${business.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-limpopo-blue hover:underline"
                      >
                        {business.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button className="btn-primary flex-1 text-sm py-2">
                    View Details
                  </button>
                  <button className="btn-secondary flex-1 text-sm py-2">
                    Contact
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredBusinesses.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
            <p className="text-gray-600">
              Try adjusting your search terms or category filter
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;