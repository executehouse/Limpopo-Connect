// Content updated with local Limpopo activities and community groups
// Sources: South African Community Networks, Limpopo Tourism Board, local community research
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, MapPin, Calendar, Star, Heart } from 'lucide-react';

const FriendshipPartners: React.FC = () => {
  useEffect(() => {
    document.title = 'Friendship Partners - Find Activity Buddies in Limpopo | Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Connect with like-minded people for hobbies, sports, and adventures across Limpopo Province. Find hiking buddies, book clubs, and activity partners near you.');
    }
  }, []);

  const activityGroups = [
    {
      name: "Limpopo Hiking Club",
      activity: "Hiking & Nature Walks",
      location: "Magoebaskloof & Waterberg",
      members: 127,
      description: "Explore Limpopo's beautiful trails, from easy nature walks to challenging mountain hikes.",
      image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=400&h=300&fit=crop"
    },
    {
      name: "Polokwane Book Circle",
      activity: "Reading & Literature",
      location: "Polokwane Central",
      members: 89,
      description: "Monthly discussions featuring both local and international literature, with focus on African authors.",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    },
    {
      name: "Tzaneen Cycling Community",
      activity: "Cycling & Mountain Biking",
      location: "Tzaneen & Surrounding Areas",
      members: 156,
      description: "Road cycling and mountain biking adventures through Limpopo's scenic routes and trails.",
      image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop"
    },
    {
      name: "Limpopo Photography Society",
      activity: "Photography Expeditions",
      location: "Province-wide",
      members: 94,
      description: "Capture Limpopo's wildlife, landscapes, and cultural heritage through guided photo walks.",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop"
    }
  ];

  const upcomingActivities = [
    {
      title: "Waterberg Nature Hike",
      date: "Dec 14, 2024",
      location: "Waterberg Biosphere",
      participants: 23
    },
    {
      title: "Cultural Photography Walk",
      date: "Dec 18, 2024", 
      location: "Polokwane Art Route",
      participants: 15
    },
    {
      title: "Book Club: African Stories",
      date: "Dec 20, 2024",
      location: "Tzaneen Library",
      participants: 18
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO and Accessibility improvements */}
      <nav aria-label="Breadcrumb" className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center space-x-2 text-sm">
            <li><Link to="/" className="text-limpopo-blue hover:text-limpopo-green">Home</Link></li>
            <li className="text-gray-500">•</li>
            <li><Link to="/connections" className="text-limpopo-blue hover:text-limpopo-green">Connections</Link></li>
            <li className="text-gray-500">•</li>
            <li className="text-gray-700">Friendship Partners</li>
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-8">
            <Users className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Friendship & Activity Partners
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with like-minded people across Limpopo Province. Join local groups, find activity partners, and build lasting friendships through shared interests and adventures.
          </p>
        </div>

        {/* Activity Groups Grid */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Activity Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {activityGroups.map((group, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={group.image} 
                  alt={`${group.name} activities`}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                    <div className="flex items-center space-x-1 text-sm text-limpopo-blue">
                      <Users className="h-4 w-4" />
                      <span>{group.members}</span>
                    </div>
                  </div>
                  <p className="text-limpopo-green font-medium mb-2">{group.activity}</p>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{group.location}</span>
                  </div>
                  <p className="text-gray-600 mb-4">{group.description}</p>
                  <button className="btn-primary w-full">Join Group</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Activities */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Activities</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingActivities.map((activity, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-limpopo-blue transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{activity.title}</h3>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{activity.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{activity.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-limpopo-green">
                      <Heart className="h-4 w-4" />
                      <span className="text-sm">{activity.participants} interested</span>
                    </div>
                    <button className="text-limpopo-blue hover:text-limpopo-green font-medium text-sm">Join</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-blue/10 flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-limpopo-blue" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Browse & Discover</h3>
              <p className="text-gray-600">Explore activity groups and find ones that match your interests and schedule.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-green/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-limpopo-green" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Connect & Join</h3>
              <p className="text-gray-600">Join groups and start connecting with like-minded people in your area.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-gold/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-limpopo-gold" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Friendships</h3>
              <p className="text-gray-600">Participate in activities and build lasting friendships through shared experiences.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-limpopo-green to-limpopo-blue rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Make New Friends?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Limpopo's most active community for friendship and adventure
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-xl transition duration-300">
              Create Profile
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

export default FriendshipPartners;