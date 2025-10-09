import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Tag, Filter, Search, User } from 'lucide-react';
import { mockEvents, simulateApiDelay, filterItemsByCategory, searchItems } from '../lib/mockData';
import type { Event } from '../lib/api';

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');

  // Get unique categories and locations from data
  const categories = [...new Set(mockEvents.map(e => e.category))];
  const locations = [...new Set(mockEvents.map(e => e.location))];

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true);
      await simulateApiDelay(600); // Simulate API call
      setEvents(mockEvents);
      setFilteredEvents(mockEvents);
      setLoading(false);
    };
    
    loadEvents();
  }, []);

  useEffect(() => {
    let filtered = events;
    
    // Apply category filter
    if (selectedCategory) {
      filtered = filterItemsByCategory(filtered, selectedCategory);
    }
    
    // Apply location filter
    if (selectedLocation) {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }
    
    // Apply search filter
    if (searchQuery) {
      filtered = searchItems(filtered, searchQuery);
    }
    
    setFilteredEvents(filtered);
  }, [events, selectedCategory, selectedLocation, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Cultural': 'bg-purple-100 text-purple-800',
      'Education': 'bg-blue-100 text-blue-800',
      'Community': 'bg-green-100 text-green-800',
      'Business': 'bg-orange-100 text-orange-800',
      'Health': 'bg-red-100 text-red-800',
      'Sport': 'bg-yellow-100 text-yellow-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityStatus = (event: Event) => {
    const spotsLeft = event.maxAttendees ? event.maxAttendees - event.currentAttendees : null;
    if (!spotsLeft) return { text: 'Open Registration', color: 'text-green-600' };
    if (spotsLeft <= 0) return { text: 'Full', color: 'text-red-600' };
    if (spotsLeft <= 10) return { text: `${spotsLeft} spots left`, color: 'text-orange-600' };
    return { text: 'Available', color: 'text-green-600' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Community Events
            </h1>
            <p className="text-xl text-gray-600">Loading events...</p>
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
            Community Events
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover exciting events, workshops, festivals, and gatherings happening across Limpopo Province.
            Connect with your community and expand your horizons.
          </p>
          <div className="mt-6 flex justify-center space-x-8 text-sm text-gray-600">
            <span className="flex items-center">
              <Calendar className="h-4 w-4 text-limpopo-blue mr-2" />
              {mockEvents.length} Upcoming Events
            </span>
            <span className="flex items-center">
              <Users className="h-4 w-4 text-limpopo-green mr-2" />
              {categories.length} Categories
            </span>
            <span className="flex items-center">
              <MapPin className="h-4 w-4 text-limpopo-gold mr-2" />
              {locations.length} Locations
            </span>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search events, workshops, festivals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <select 
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue"
              >
                <option value="">All Locations</option>
                {locations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
              <button className="btn-primary px-6 py-3 flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter</span>
              </button>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredEvents.length} of {events.length} events
            {selectedCategory && (
              <span className="ml-2 px-2 py-1 bg-limpopo-blue/10 text-limpopo-blue rounded-full text-xs">
                {selectedCategory}
              </span>
            )}
            {selectedLocation && (
              <span className="ml-2 px-2 py-1 bg-limpopo-green/10 text-limpopo-green rounded-full text-xs">
                {selectedLocation}
              </span>
            )}
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => {
            const availability = getAvailabilityStatus(event);
            
            return (
              <div key={event.id} className="card hover:shadow-xl transition-all duration-300">
                <div className="h-48 bg-gray-100 rounded-lg mb-4 overflow-hidden">
                  <img 
                    src={event.imageUrl} 
                    alt={event.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://placehold.co/400x300?text=Event+Image';
                    }}
                  />
                </div>
                
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(event.category)}`}>
                      {event.category}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">
                  {event.description}
                </p>
                
                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4 flex-shrink-0 text-limpopo-blue" />
                    <div>
                      <div className="font-medium">{formatDate(event.startDate)}</div>
                      <div className="text-xs">{formatTime(event.startDate)}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-limpopo-green" />
                    <div>
                      <div className="font-medium">{event.location}</div>
                      <div className="text-xs">{event.address}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <User className="h-4 w-4 flex-shrink-0 text-limpopo-gold" />
                    <div>
                      <div className="font-medium">{event.organizer}</div>
                      <div className="text-xs">{event.contactInfo}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="h-4 w-4" />
                      <span>{event.currentAttendees}{event.maxAttendees ? `/${event.maxAttendees}` : ''} attendees</span>
                    </div>
                    <span className={`font-medium ${availability.color}`}>
                      {availability.text}
                    </span>
                  </div>
                  
                  {event.ticketPrice !== undefined && (
                    <div className="text-lg font-bold text-limpopo-blue">
                      {event.ticketPrice === 0 ? 'Free Event' : `R${event.ticketPrice}`}
                    </div>
                  )}
                </div>
                
                {/* Tags */}
                {event.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {event.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                    {event.tags.length > 3 && (
                      <span className="text-xs text-gray-500">+{event.tags.length - 3} more</span>
                    )}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button className="btn-primary flex-1 text-sm">
                    View Details
                  </button>
                  <button 
                    className="btn-secondary flex-1 text-sm"
                    disabled={availability.text === 'Full'}
                  >
                    {event.ticketPrice === 0 ? 'Register Free' : 'Register'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* No results message */}
        {filteredEvents.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Calendar className="h-16 w-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No events found</h3>
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
            Host Your Event
          </h2>
          <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
            Organize workshops, festivals, community gatherings, or business events.
            Reach your target audience and build community connections.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary text-lg px-8 py-3">
              Create Event
            </button>
            <button className="btn-secondary text-lg px-8 py-3">
              Event Guidelines
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;