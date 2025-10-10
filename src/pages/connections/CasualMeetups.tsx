// Content featuring real Limpopo social venues and casual meeting opportunities
// Sources: Limpopo Tourism Board venue listings, local community event research
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coffee, ArrowLeft, MapPin, Calendar, Users, Clock, Sun, Music } from 'lucide-react';

const CasualMeetups: React.FC = () => {
  useEffect(() => {
    document.title = 'Casual Meetups - Relaxed Social Gatherings in Limpopo | Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Join relaxed social gatherings and casual meetups across Limpopo. Connect with locals at coffee shops, parks, markets, and community events in a low-pressure environment.');
    }
  }, []);

  const upcomingMeetups = [
    {
      title: "Weekend Coffee & Chat",
      location: "Cafè Neo, Polokwane Mall",
      date: "Saturday, Dec 14",
      time: "10:00 AM",
      attendees: 12,
      maxAttendees: 20,
      description: "Relaxed coffee meetup for friendly conversation and meeting new people.",
      image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=400&h=300&fit=crop"
    },
    {
      title: "Sunday Market Stroll",
      location: "Tzaneen Farmers Market",
      date: "Sunday, Dec 15", 
      time: "9:00 AM",
      attendees: 8,
      maxAttendees: 15,
      description: "Explore local produce and crafts while connecting with community members.",
      image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=300&fit=crop"
    },
    {
      title: "Evening Garden Hangout",
      location: "Polokwane Game Reserve",
      date: "Friday, Dec 20",
      time: "5:30 PM", 
      attendees: 15,
      maxAttendees: 25,
      description: "Casual outdoor gathering with light snacks and good conversation.",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    }
  ];

  const popularVenues = [
    {
      name: "The Coffee Shop",
      location: "Polokwane Central",
      type: "Coffee & Light Meals",
      atmosphere: "Cozy, Wi-Fi, Study-friendly",
      image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop"
    },
    {
      name: "Debonairs Pizza",
      location: "Mall of the North",
      type: "Casual Dining",
      atmosphere: "Family-friendly, Groups welcome",
      image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop"
    },
    {
      name: "Peter Mokaba Stadium Grounds",
      location: "Polokwane",
      type: "Outdoor Picnics",
      atmosphere: "Open space, Sports facilities",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
    },
    {
      name: "Tzaneen Hot Springs",
      location: "Tzaneen",
      type: "Recreation & Relaxation",  
      atmosphere: "Natural setting, Wellness-focused",
      image: "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=400&h=300&fit=crop"
    }
  ];

  const meetupTypes = [
    {
      icon: Coffee,
      title: "Coffee Meetups",
      description: "Casual conversations over coffee at local cafés",
      frequency: "3-4 times per week"
    },
    {
      icon: Sun,
      title: "Outdoor Gatherings",
      description: "Park picnics, nature walks, and outdoor activities",
      frequency: "Weekends"
    },
    {
      icon: Music,
      title: "Cultural Events",
      description: "Local performances, art shows, and cultural celebrations",
      frequency: "Monthly"
    },
    {
      icon: Users,
      title: "Social Hangouts",
      description: "Relaxed group activities and community bonding",
      frequency: "Weekly"
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
            <li className="text-gray-700">Casual Meetups</li>
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-8">
            <Coffee className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Casual Meetups
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join relaxed social gatherings across Limpopo Province. Perfect for low-pressure socializing, meeting new people, and exploring local venues in comfortable, friendly settings.
          </p>
        </div>

        {/* Upcoming Meetups */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">This Week's Meetups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingMeetups.map((meetup, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={meetup.image} 
                  alt={meetup.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{meetup.title}</h3>
                  <p className="text-gray-600 mb-4">{meetup.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{meetup.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>{meetup.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{meetup.location}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4" />
                        <span>{meetup.attendees}/{meetup.maxAttendees} people</span>
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-limpopo-blue h-2 rounded-full" 
                          style={{width: `${(meetup.attendees / meetup.maxAttendees) * 100}%`}}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  <button className="btn-primary w-full">Join Meetup</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Venues */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Meetup Spots in Limpopo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularVenues.map((venue, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={venue.image} 
                  alt={venue.name}
                  className="w-full h-32 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{venue.name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                    <MapPin className="h-3 w-3" />
                    <span>{venue.location}</span>
                  </div>
                  <p className="text-sm text-limpopo-green font-medium mb-1">{venue.type}</p>
                  <p className="text-xs text-gray-500">{venue.atmosphere}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Meetup Types */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Types of Casual Meetups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {meetupTypes.map((type, index) => {
              const IconComponent = type.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                  <p className="text-gray-600 mb-2">{type.description}</p>
                  <p className="text-sm text-limpopo-blue font-medium">{type.frequency}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How to Join */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How to Join Casual Meetups</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="w-16 h-16 rounded-full bg-limpopo-blue/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-limpopo-blue">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Browse Events</h3>
                <p className="text-gray-600">Find meetups that interest you in your area or try something new.</p>
              </div>
              <div>
                <div className="w-16 h-16 rounded-full bg-limpopo-green/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-limpopo-green">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">RSVP & Show Up</h3>
                <p className="text-gray-600">Reserve your spot and arrive ready to meet friendly people.</p>
              </div>
              <div>
                <div className="w-16 h-16 rounded-full bg-limpopo-gold/10 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-limpopo-gold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Enjoy & Connect</h3>
                <p className="text-gray-600">Relax, have fun, and make new connections in a comfortable setting.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready for Some Social Fun?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join our friendly community of locals who love casual meetups and good conversation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-xl transition duration-300">
              Join Community
            </Link>
            <Link to="/events" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-xl border border-white/30 transition duration-300">
              Browse All Events
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CasualMeetups;