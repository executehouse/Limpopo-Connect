// Content featuring popular interests and hobbies in Limpopo communities
// Sources: South African hobby groups, Limpopo cultural activities research
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft, Camera, BookOpen, Brush, Music, TreePine, Utensils, Users, Calendar } from 'lucide-react';

const SharedInterests: React.FC = () => {
  useEffect(() => {
    document.title = 'Shared Interests - Connect Through Hobbies in Limpopo | Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find people who share your interests and hobbies in Limpopo Province. Join groups for photography, cooking, gardening, arts, music, and cultural activities.');
    }
  }, []);

  const interestGroups = [
    {
      name: "Limpopo Photography Circle",
      category: "Photography",
      members: 156,
      description: "Capture Limpopo's natural beauty, wildlife, and cultural heritage through organized photo walks and workshops.",
      meetingFreq: "Twice monthly",
      icon: Camera,
      gradient: "from-blue-400 to-blue-600",
      image: "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=400&h=300&fit=crop"
    },
    {
      name: "Traditional Cooking Collective",
      category: "Culinary Arts",
      members: 89,
      description: "Learn and share traditional Limpopo recipes, cooking techniques, and food preservation methods.",
      meetingFreq: "Weekly",
      icon: Utensils,
      gradient: "from-orange-400 to-orange-600",
      image: "https://images.unsplash.com/photo-1556909114-5437d7c04d70?w=400&h=300&fit=crop"
    },
    {
      name: "Baobab Arts & Crafts",
      category: "Arts & Crafts",
      members: 134,
      description: "Explore traditional and contemporary art forms, pottery, beadwork, and sculpture inspired by African heritage.",
      meetingFreq: "Weekly workshops",
      icon: Brush,
      gradient: "from-purple-400 to-purple-600",
      image: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop"
    },
    {
      name: "Indigenous Plant Society",
      category: "Gardening & Nature",
      members: 78,
      description: "Learn about Limpopo's indigenous plants, medicinal herbs, and sustainable gardening practices.",
      meetingFreq: "Monthly outings",
      icon: TreePine,
      gradient: "from-green-400 to-green-600",
      image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop"
    },
    {
      name: "Limpopo Book Club",
      category: "Literature",
      members: 67,
      description: "Discuss African literature, local authors, and stories that reflect our cultural experiences and heritage.",
      meetingFreq: "Monthly meetings",
      icon: BookOpen,
      gradient: "from-indigo-400 to-indigo-600",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop"
    },
    {
      name: "Traditional Music Circle",
      category: "Music & Performance",
      members: 92,
      description: "Preserve and celebrate traditional Limpopo music, drumming, and dance through group sessions.",
      meetingFreq: "Bi-weekly",
      icon: Music,
      gradient: "from-red-400 to-red-600",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop"
    }
  ];

  const upcomingEvents = [
    {
      title: "Wildlife Photography Workshop",
      group: "Photography Circle",
      date: "Dec 16, 2024",
      location: "Kruger National Park Gate"
    },
    {
      title: "Traditional Bread Making",
      group: "Cooking Collective", 
      date: "Dec 18, 2024",
      location: "Polokwane Community Centre"
    },
    {
      title: "Pottery & Clay Work",
      group: "Arts & Crafts",
      date: "Dec 21, 2024",
      location: "Tzaneen Cultural Hub"
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
            <li className="text-gray-700">Shared Interests</li>
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-8">
            <Star className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Shared Interests
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with like-minded people who share your passions and hobbies across Limpopo Province. From traditional arts to modern interests, find your community and build lasting friendships.
          </p>
        </div>

        {/* Interest Groups */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Popular Interest Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {interestGroups.map((group, index) => {
              const IconComponent = group.icon;
              return (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                  <img 
                    src={group.image} 
                    alt={`${group.name} activities`}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${group.gradient} flex items-center justify-center`}>
                        <IconComponent className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1 text-sm text-limpopo-blue">
                          <Users className="h-4 w-4" />
                          <span>{group.members}</span>
                        </div>
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
                    <p className="text-limpopo-green font-medium mb-2">{group.category}</p>
                    <p className="text-gray-600 mb-4">{group.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm text-gray-500">{group.meetingFreq}</span>
                    </div>
                    <button className="btn-primary w-full">Join Group</button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Upcoming Interest-Based Events</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-6 hover:border-limpopo-blue transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                  <p className="text-limpopo-green text-sm font-medium mb-2">{event.group}</p>
                  <div className="flex items-center space-x-2 text-gray-600 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">{event.date}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 mb-4">
                    <span className="text-sm">{event.location}</span>
                  </div>
                  <button className="text-limpopo-blue hover:text-limpopo-green font-medium text-sm">Learn More</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-purple-500 to-indigo-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Find Your Passion Community</h2>
          <p className="text-xl mb-8 opacity-90">
            Join Limpopo's most active interest-based groups and turn your hobbies into lasting friendships
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-xl transition duration-300">
              Join Community
            </Link>
            <Link to="/connections" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-xl border border-white/30 transition duration-300">
              Explore All Categories
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SharedInterests;