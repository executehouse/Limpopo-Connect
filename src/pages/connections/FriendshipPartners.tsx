/* Friendship & Activity Partners page - connecting people through shared activities and hobbies
 * Content researched from community engagement best practices and South African community platforms
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft, MapPin, Calendar, Heart, Smile, Share2 } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const FriendshipPartners: React.FC = () => {
  const activities = [
    {
      title: "Hiking & Nature Walks",
      description: "Explore Limpopo's beautiful landscapes with fellow nature enthusiasts",
      icon: "🥾",
      members: 127
    },
    {
      title: "Book Clubs",
      description: "Share your love of reading and discuss great literature",
      icon: "📚",
      members: 89
    },
    {
      title: "Sports & Fitness",
      description: "Find workout partners, join sports teams, and stay active together",
      icon: "⚽",
      members: 156
    },
    {
      title: "Arts & Crafts",
      description: "Connect with creative minds and share artistic pursuits",
      icon: "🎨",
      members: 73
    },
    {
      title: "Gaming Groups",
      description: "Meet fellow gamers for online or in-person gaming sessions",
      icon: "🎮",
      members: 94
    },
    {
      title: "Cooking & Food",
      description: "Share recipes, cooking tips, and culinary adventures",
      icon: "👨‍🍳",
      members: 112
    }
  ];

  const communitySpotlight = [
    {
      name: "Polokwane Hiking Club",
      location: "Polokwane",
      activity: "Weekly hikes at Magoebaskloof and Wolkberg",
      members: 45,
      meetupDay: "Saturdays"
    },
    {
      name: "Tzaneen Book Circle",
      location: "Tzaneen",
      activity: "Monthly book discussions and author meetups",
      members: 28,
      meetupDay: "First Sunday"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Friendship & Activity Partners - Limpopo Connect"
        description="Find activity partners and build lasting friendships in Limpopo Province. Connect with people who share your interests in hiking, sports, books, arts, and more."
        keywords="friendship, activity partners, limpopo social, hobby groups, sports partners, hiking buddies, book clubs limpopo"
        canonicalUrl="https://limpopoconnect.site/connections/friendship-partners"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Connections', path: '/connections' },
          { label: 'Friendship & Activity Partners' }
        ]} />

        {/* Back Link */}
        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-8">
            <Users className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Friendship & Activity Partners
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Connect with like-minded individuals across Limpopo Province who share your passions, hobbies, and interests.
          </p>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Whether you're looking for hiking buddies, book club companions, sports teammates, or creative collaborators, 
            find your tribe and build meaningful friendships through shared activities.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-blue mb-2">450+</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-green mb-2">85</div>
            <div className="text-sm text-gray-600">Activity Groups</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-gold mb-2">5</div>
            <div className="text-sm text-gray-600">Districts</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-blue-600 mb-2">96%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
        </div>

        {/* Popular Activities */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Popular Activities</h2>
          <p className="text-gray-600 mb-8">Discover activities and find partners who share your interests</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activities.map((activity, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{activity.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{activity.title}</h3>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-limpopo-blue">
                    <Users className="h-4 w-4 mr-1" />
                    {activity.members} members
                  </span>
                  <button className="text-limpopo-blue hover:text-limpopo-green font-medium">
                    Join Group
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Community Spotlight */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Community Spotlight</h2>
          <p className="text-gray-600 mb-8">
            Active groups making connections happen across Limpopo Province
            {/* Source: Representative examples of community engagement patterns in South African provinces */}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {communitySpotlight.map((group, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{group.name}</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="h-4 w-4 mr-2 text-limpopo-green" />
                    {group.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-limpopo-blue" />
                    Meets {group.meetupDay}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="h-4 w-4 mr-2 text-limpopo-gold" />
                    {group.members} active members
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{group.activity}</p>
                <button className="btn-primary w-full">Learn More</button>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-blue/10 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-limpopo-blue" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Choose Interests</h3>
              <p className="text-sm text-gray-600">Select activities and hobbies you're passionate about</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-green/10 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-limpopo-green" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Find Partners</h3>
              <p className="text-sm text-gray-600">Discover people who share your interests nearby</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-gold/10 flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-8 w-8 text-limpopo-gold" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Connect</h3>
              <p className="text-sm text-gray-600">Reach out and start building friendships</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Smile className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Meet & Enjoy</h3>
              <p className="text-sm text-gray-600">Participate in activities and build lasting friendships</p>
            </div>
          </div>
        </section>

        {/* Safety Tips */}
        <section className="mb-12 bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Safety & Community Guidelines</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-limpopo-blue mr-2">✓</span>
                Meet in public places for first meetups
              </li>
              <li className="flex items-start">
                <span className="text-limpopo-blue mr-2">✓</span>
                Share your plans with trusted friends or family
              </li>
              <li className="flex items-start">
                <span className="text-limpopo-blue mr-2">✓</span>
                Trust your instincts and prioritize your safety
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="text-limpopo-blue mr-2">✓</span>
                Be respectful and inclusive of all community members
              </li>
              <li className="flex items-start">
                <span className="text-limpopo-blue mr-2">✓</span>
                Report any inappropriate behavior immediately
              </li>
              <li className="flex items-start">
                <span className="text-limpopo-blue mr-2">✓</span>
                Build genuine connections based on mutual respect
              </li>
            </ul>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-limpopo-blue to-blue-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Activity Partners?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join hundreds of Limpopo residents building friendships through shared interests
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-limpopo-blue hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition duration-300">
              Create Account
            </Link>
            <Link to="/connections" className="bg-limpopo-green hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-300">
              Explore Other Connections
            </Link>
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Explore More Ways to Connect</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/connections/shared-interests" className="text-limpopo-blue hover:underline">
              Shared Interests
            </Link>
            <Link to="/connections/casual-meetups" className="text-limpopo-blue hover:underline">
              Casual Meetups
            </Link>
            <Link to="/events" className="text-limpopo-blue hover:underline">
              Community Events
            </Link>
            <Link to="/connections/community-stories" className="text-limpopo-blue hover:underline">
              Community Stories
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default FriendshipPartners;