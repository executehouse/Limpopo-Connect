// Content for reconnecting with missed connections across Limpopo locations
// Sources: Local venue research, community event spaces
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, MapPin, Calendar, Search, Shield, Heart, Coffee } from 'lucide-react';

const MissedMoments: React.FC = () => {
  useEffect(() => {
    document.title = 'Missed Moments - Reconnect in Limpopo | Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Reconnect with people you met but lost touch with across Limpopo Province. Find missed connections from events, cafés, and chance encounters in a safe environment.');
    }
  }, []);

  const recentMissedConnections = [
    {
      title: "Coffee Shop Conversation",
      location: "Cafè Neo, Polokwane Mall",
      date: "Dec 8, 2024",
      time: "Around 2:30 PM",
      description: "We talked about books and travel plans. You mentioned visiting the Drakensberg. I was reading a Paulo Coelho book.",
      poster: "Book lover"
    },
    {
      title: "Marula Festival Helper",
      location: "Tzaneen Civic Centre",
      date: "Dec 5, 2024", 
      time: "Morning setup",
      description: "You helped me carry supplies to the cultural display tent. We laughed about the heavy traditional pots. Hope to find you!",
      poster: "Festival organizer"
    },
    {
      title: "Wildlife Photography Chat",
      location: "Kruger Gate",
      date: "Dec 3, 2024",
      time: "Early morning",
      description: "We discussed camera settings while waiting for the park to open. You had amazing shots of elephants on your camera.",
      poster: "Nature photographer"
    }
  ];

  const popularLocations = [
    {
      name: "Mall of the North",
      city: "Polokwane",
      type: "Shopping Center",
      connections: 23
    },
    {
      name: "Tzaneen Cultural Hub",
      city: "Tzaneen",
      type: "Community Center", 
      connections: 15
    },
    {
      name: "Peter Mokaba Stadium",
      city: "Polokwane",
      type: "Sports Venue",
      connections: 18
    },
    {
      name: "Waterberg Nature Reserve",
      city: "Waterberg",
      type: "Nature Reserve",
      connections: 12
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: "Describe the Moment",
      description: "Share details about when and where you met, what you talked about, and any memorable details."
    },
    {
      step: 2,
      title: "Stay Anonymous",
      description: "Your identity stays private until both people confirm they want to connect."
    },
    {
      step: 3,
      title: "Safe Reconnection",
      description: "If it's a match, both parties are notified and can choose to exchange contact information."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-limpopo-blue hover:text-limpopo-green">Home</Link></li>
            <li className="text-gray-500">•</li>
            <li><Link to="/connections" className="text-limpopo-blue hover:text-limpopo-green">Connections</Link></li>
            <li className="text-gray-500">•</li>
            <li className="text-gray-700">Missed Moments</li>
          </ol>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center mx-auto mb-8">
            <Clock className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Missed Moments
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Reconnect with people you met but lost touch with across Limpopo Province. Whether it was a chance encounter at a café, event, or local attraction, find each other again in a safe, respectful environment.
          </p>
        </div>

        {/* Recent Missed Connections */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Recent Missed Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentMissedConnections.map((connection, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{connection.title}</h3>
                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>{connection.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{connection.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>{connection.time}</span>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic">"{connection.description}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-limpopo-blue font-medium">- {connection.poster}</span>
                  <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">Respond</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Locations */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Connection Spots</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularLocations.map((location, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow duration-300">
                <h3 className="font-semibold text-gray-900 mb-2">{location.name}</h3>
                <p className="text-limpopo-green font-medium mb-1">{location.city}</p>
                <p className="text-sm text-gray-600 mb-3">{location.type}</p>
                <div className="text-2xl font-bold text-indigo-600">{location.connections}</div>
                <div className="text-sm text-gray-500">missed connections</div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-indigo-600">{item.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Safety Features */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Safe & Respectful Reconnections</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-shield-100 flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Privacy Protected</h3>
                <p className="text-gray-600">Your identity and contact information remain private until you both choose to connect.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-heart-100 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Respectful Environment</h3>
                <p className="text-gray-600">Community guidelines ensure all interactions are respectful and appropriate.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-search-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Easy to Find</h3>
                <p className="text-gray-600">Search by location, date, or keywords to find your missed connection.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Looking for Someone Special?</h2>
          <p className="text-xl mb-8 opacity-90">
            Post your missed connection or browse existing ones to find that person you can't stop thinking about
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-xl transition duration-300">
              Post Connection
            </Link>
            <Link to="/connections" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-xl border border-white/30 transition duration-300">
              Browse All Categories
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MissedMoments;