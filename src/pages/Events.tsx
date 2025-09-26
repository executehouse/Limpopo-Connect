import React from 'react';
import { Calendar, MapPin, Clock } from 'lucide-react';

const Events: React.FC = () => {
  const events = [
    {
      id: 1,
      title: "Limpopo Cultural Festival",
      date: "2024-12-15",
      time: "09:00",
      location: "Polokwane City Hall",
      description: "Celebrate the rich cultural heritage of Limpopo with traditional music, dance, and food.",
      image: "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Business Networking Breakfast",
      date: "2024-12-10",
      time: "07:30",
      location: "Mokopane Conference Centre",
      description: "Connect with local entrepreneurs and business leaders over breakfast.",
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Marula Festival",
      date: "2024-12-20",
      time: "10:00",
      location: "Tzaneen Civic Centre",
      description: "Annual celebration of the marula fruit harvest with local products and entertainment.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Community Events</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="card hover:shadow-lg transition">
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4">{event.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{event.date}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>{event.time}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <button className="btn-primary w-full mt-4">
                Learn More
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Events;