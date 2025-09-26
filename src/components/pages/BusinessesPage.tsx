import React, { useState } from 'react';
import { Search, MapPin, Star, Phone, Globe, Filter } from 'lucide-react';
import Button from '../atoms/Button';
import { BusinessCategory } from '../../types';

// Mock data - in a real app this would come from an API
const mockBusinesses = [
  {
    id: '1',
    name: 'Ubuntu Restaurant',
    category: BusinessCategory.RESTAURANT,
    description: 'Traditional South African cuisine with a modern twist, featuring local Limpopo ingredients.',
    location: {
      name: 'Polokwane CBD',
      address: '123 Church Street',
      city: 'Polokwane',
      province: 'Limpopo',
      postalCode: '0700',
      country: 'South Africa'
    },
    contact: {
      phone: '+27 15 123 4567',
      email: 'info@ubunturestaurant.co.za',
      website: 'https://ubunturestaurant.co.za'
    },
    rating: 4.5,
    reviewCount: 127,
    verified: true,
    images: ['/api/placeholder/300/200'],
    services: ['Traditional Cuisine', 'Catering', 'Private Events']
  },
  {
    id: '2',
    name: 'Baobab Crafts & Curios',
    category: BusinessCategory.RETAIL,
    description: 'Authentic African crafts, artwork, and curios by local Limpopo artisans.',
    location: {
      name: 'Tzaneen Town Center',
      address: '45 Danie Joubert Street',
      city: 'Tzaneen',
      province: 'Limpopo',
      postalCode: '0850',
      country: 'South Africa'
    },
    contact: {
      phone: '+27 15 987 6543',
      email: 'hello@baobabcrafts.co.za'
    },
    rating: 4.8,
    reviewCount: 89,
    verified: true,
    images: ['/api/placeholder/300/200'],
    services: ['Handmade Crafts', 'Custom Orders', 'Cultural Tours']
  },
  {
    id: '3',
    name: 'Limpopo Tech Solutions',
    category: BusinessCategory.TECHNOLOGY,
    description: 'IT support, web development, and digital marketing services for local businesses.',
    location: {
      name: 'Mokopane Business District',
      address: '78 Thabo Mbeki Street',
      city: 'Mokopane',
      province: 'Limpopo',
      postalCode: '0600',
      country: 'South Africa'
    },
    contact: {
      phone: '+27 15 456 7890',
      email: 'info@limpopotech.co.za',
      website: 'https://limpopotech.co.za'
    },
    rating: 4.2,
    reviewCount: 34,
    verified: false,
    images: ['/api/placeholder/300/200'],
    services: ['Web Development', 'IT Support', 'Digital Marketing']
  }
];

const BusinessesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: BusinessCategory.RESTAURANT, label: 'Restaurants' },
    { value: BusinessCategory.RETAIL, label: 'Retail' },
    { value: BusinessCategory.ACCOMMODATION, label: 'Accommodation' },
    { value: BusinessCategory.SERVICES, label: 'Services' },
    { value: BusinessCategory.HEALTHCARE, label: 'Healthcare' },
    { value: BusinessCategory.EDUCATION, label: 'Education' },
    { value: BusinessCategory.TOURISM, label: 'Tourism' },
    { value: BusinessCategory.TECHNOLOGY, label: 'Technology' },
    { value: BusinessCategory.AGRICULTURE, label: 'Agriculture' },
    { value: BusinessCategory.ARTS_CULTURE, label: 'Arts & Culture' }
  ];

  const filteredBusinesses = mockBusinesses.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         business.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || business.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero section */}
      <div className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Discover Local Businesses</h1>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Support your community by exploring and connecting with local businesses across Limpopo Province
            </p>
            
            {/* Search bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search businesses, services, or locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4 lg:mb-6">
                <h3 className="font-semibold text-gray-900">Filters</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              
              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as BusinessCategory | '')}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                    <option value="">All Locations</option>
                    <option value="polokwane">Polokwane</option>
                    <option value="tzaneen">Tzaneen</option>
                    <option value="mokopane">Mokopane</option>
                    <option value="musina">Musina</option>
                    <option value="thabazimbi">Thabazimbi</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating
                  </label>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map((rating) => (
                      <label key={rating} className="flex items-center">
                        <input type="checkbox" className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 flex items-center">
                          {Array.from({ length: rating }).map((_, i) => (
                            <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                          ))}
                          <span className="ml-1 text-sm text-gray-600">& up</span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business listings */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {filteredBusinesses.length} Businesses Found
              </h2>
              <p className="text-gray-600">
                Showing results for "{searchTerm || 'all businesses'}" 
                {selectedCategory && ` in ${categories.find(c => c.value === selectedCategory)?.label}`}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBusinesses.map((business) => (
                <div key={business.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                  <img
                    src={business.images[0]}
                    alt={business.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {business.name}
                      </h3>
                      {business.verified && (
                        <span className="text-primary-600 text-xs font-medium bg-primary-50 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(business.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-600">
                          {business.rating} ({business.reviewCount} reviews)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">
                        {business.location.city}, {business.location.province}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {business.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {business.services.slice(0, 2).map((service) => (
                        <span
                          key={service}
                          className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full"
                        >
                          {service}
                        </span>
                      ))}
                      {business.services.length > 2 && (
                        <span className="text-xs text-gray-500">
                          +{business.services.length - 2} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <a
                          href={`tel:${business.contact.phone}`}
                          className="text-gray-400 hover:text-primary-600"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        {business.contact.website && (
                          <a
                            href={business.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-primary-600"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                      <Button size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredBusinesses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No businesses found</h3>
                <p className="text-gray-600">
                  Try adjusting your search criteria or browse all businesses
                </p>
                <Button
                  className="mt-4"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessesPage;