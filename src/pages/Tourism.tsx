import React from 'react';
import { Camera, MapPin, Star } from 'lucide-react';

const Tourism: React.FC = () => {
  const attractions = [
    {
      id: 1,
      name: "Kruger National Park",
      location: "Eastern Limpopo",
      description: "World-renowned wildlife sanctuary home to the Big Five and incredible biodiversity",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      name: "Mapungubwe National Park",
      location: "Northern Limpopo",
      description: "UNESCO World Heritage Site with rich archaeological and cultural significance",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      name: "Magoebaskloof",
      location: "Near Tzaneen",
      description: "Scenic mountain pass with indigenous forests, waterfalls, and hiking trails",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Tourism in Limpopo</h1>
          <p className="text-lg text-gray-600">
            Discover the natural beauty and rich heritage of Limpopo Province
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction) => (
            <div key={attraction.id} className="card hover:shadow-lg transition">
              <div className="relative">
                <img
                  src={attraction.image}
                  alt={attraction.name}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md">
                  <Camera className="h-5 w-5 text-limpopo-blue" />
                </div>
              </div>
              
              <h3 className="text-xl font-semibold mb-2">{attraction.name}</h3>
              <p className="text-gray-600 mb-4">{attraction.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{attraction.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 text-limpopo-gold fill-current" />
                  <span className="text-sm font-medium">{attraction.rating}</span>
                </div>
              </div>
              
              <button className="btn-primary w-full">
                Explore More
              </button>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-limpopo-green to-limpopo-blue rounded-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Plan Your Limpopo Adventure</h2>
          <p className="text-lg mb-6">
            Find accommodations, tour guides, and create unforgettable memories
          </p>
          <button className="bg-limpopo-gold text-limpopo-green font-semibold py-3 px-8 rounded-lg hover:bg-yellow-400 transition">
            Start Planning
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tourism;