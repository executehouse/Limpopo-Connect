import React, { useState } from 'react';
import { Search, Filter, MapPin, Phone, Globe } from 'lucide-react';

import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Match the database schema
interface Business {
  id: string;
  name: string;
  category: string;
  description: string;
  address: string;
  phone: string;
  website?: string;
  image_url?: string;
  // rating and reviewCount will be added later
}

const BusinessDirectory: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchBusinesses = async () => {
      try {
        const response = await fetch('/api/businesses');
        if (!response.ok) {
          throw new Error('Failed to fetch businesses');
        }
        const data = await response.json();
        setBusinesses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinesses();
  }, []);

  const categories = ['All', ...new Set(businesses.map(b => b.category))];

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
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600">Loading businesses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-red-100 text-red-700 p-4 rounded-lg">
            <h3 className="font-bold text-lg">Failed to load businesses</h3>
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Showing {filteredBusinesses.length} of {businesses.length} businesses
                {selectedCategory !== 'All' && ` in ${selectedCategory}`}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map((business) => (
                <div key={business.id} className="card hover:shadow-lg transition">
                  <img
                    src={business.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop'}
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
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">{business.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span className="text-sm">{business.phone}</span>
                      </div>
                      {business.website && (
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Globe className="h-4 w-4" />
                          <a
                            href={business.website}
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
                      <Link to={`/business/${business.id}`} className="btn-primary flex-1 text-sm py-2 text-center">
                        View Details
                      </Link>
                      <button className="btn-secondary flex-1 text-sm py-2">
                        Contact
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or category filter
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessDirectory;