/* Shared Interests page - connecting people through common passions and hobbies
 * Content based on community engagement research and South African interest groups
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ArrowLeft, Users, TrendingUp, Heart, Sparkles, BookOpen, Camera } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const SharedInterests: React.FC = () => {
  const interestCategories = [
    {
      title: "Arts & Creativity",
      description: "Photography, painting, crafts, music, and creative expression",
      icon: <Camera className="h-8 w-8" />,
      color: "from-purple-400 to-purple-600",
      members: 142,
      groups: 18
    },
    {
      title: "Learning & Education",
      description: "Languages, skills development, book clubs, and knowledge sharing",
      icon: <BookOpen className="h-8 w-8" />,
      color: "from-blue-400 to-blue-600",
      members: 189,
      groups: 24
    },
    {
      title: "Health & Wellness",
      description: "Fitness, yoga, meditation, nutrition, and holistic living",
      icon: <Heart className="h-8 w-8" />,
      color: "from-green-400 to-green-600",
      members: 167,
      groups: 21
    },
    {
      title: "Technology & Innovation",
      description: "Coding, startups, digital innovation, and tech entrepreneurship",
      icon: <Sparkles className="h-8 w-8" />,
      color: "from-yellow-400 to-yellow-600",
      members: 98,
      groups: 12
    }
  ];

  const featuredGroups = [
    {
      name: "Limpopo Photography Club",
      interest: "Wildlife & Landscape Photography",
      members: 64,
      location: "Province-wide",
      description: "Capturing Limpopo's stunning natural beauty through the lens"
    },
    {
      name: "Polokwane Book Lovers",
      interest: "Literature & Reading",
      members: 52,
      location: "Polokwane",
      description: "Monthly book discussions and author engagement sessions"
    },
    {
      name: "Tech Innovators Limpopo",
      interest: "Technology & Entrepreneurship",
      members: 78,
      location: "Virtual & In-person",
      description: "Building the future of tech in Limpopo Province"
    }
  ];

  const benefits = [
    {
      title: "Skill Development",
      description: "Learn from others and develop your talents",
      icon: <TrendingUp className="h-6 w-6 text-limpopo-blue" />
    },
    {
      title: "Collaborative Projects",
      description: "Work together on passion projects and initiatives",
      icon: <Users className="h-6 w-6 text-limpopo-green" />
    },
    {
      title: "Knowledge Sharing",
      description: "Exchange expertise and experiences with like-minded people",
      icon: <BookOpen className="h-6 w-6 text-purple-600" />
    },
    {
      title: "Community Support",
      description: "Find encouragement and motivation from your tribe",
      icon: <Heart className="h-6 w-6 text-pink-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Shared Interests - Limpopo Connect"
        description="Connect with people who share your passions in Limpopo Province. Join interest groups for photography, books, technology, arts, wellness, and more."
        keywords="shared interests, hobby groups limpopo, photography club, book club, tech community, creative arts limpopo"
        canonicalUrl="https://limpopoconnect.site/connections/shared-interests"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Connections', path: '/connections' },
          { label: 'Shared Interests' }
        ]} />

        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-purple-400 to-purple-600 flex items-center justify-center mx-auto mb-8">
            <Star className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Shared Interests
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Bond over common passions, hobbies, and interests. Find your tribe and connect with people 
            who love what you love across Limpopo Province.
          </p>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From photography and literature to technology and wellness, discover communities built around 
            shared passions. Learn, grow, and create together with like-minded individuals.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">75+</div>
            <div className="text-sm text-gray-600">Interest Groups</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-blue mb-2">596</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-green mb-2">30+</div>
            <div className="text-sm text-gray-600">Categories</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-amber-600 mb-2">92%</div>
            <div className="text-sm text-gray-600">Match Success</div>
          </div>
        </div>

        {/* Interest Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Interest Categories</h2>
          <p className="text-gray-600 mb-8">Explore diverse categories and find communities that match your passions</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interestCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 text-white`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{category.members} members</span>
                  <span className="text-gray-600">{category.groups} groups</span>
                  <button className="text-limpopo-blue hover:text-limpopo-green font-medium">
                    Explore →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Groups */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Interest Groups</h2>
          <p className="text-gray-600 mb-8">
            Active communities making meaningful connections through shared passions
            {/* Source: Representative examples of community interest groups in South African provinces */}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGroups.map((group, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-sm text-purple-600 font-medium mb-3">{group.interest}</p>
                <p className="text-gray-600 text-sm mb-4">{group.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                  <span className="flex items-center">
                    <Users className="h-4 w-4 mr-1" />
                    {group.members} members
                  </span>
                  <span>{group.location}</span>
                </div>
                <button className="btn-primary w-full text-sm">Join Group</button>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Join Interest Groups?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-sm text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Getting Started</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Discover Interests</h3>
              <p className="text-sm text-gray-600">
                Browse interest categories and find groups that match your passions and hobbies.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Join Groups</h3>
              <p className="text-sm text-gray-600">
                Join groups that resonate with you and start engaging with fellow members.
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Engage & Grow</h3>
              <p className="text-sm text-gray-600">
                Participate in discussions, events, and projects. Learn and grow together.
              </p>
            </div>
          </div>
        </section>

        {/* Popular Interests */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Interests in Limpopo</h2>
          <div className="flex flex-wrap gap-3">
            {[
              "Wildlife Photography", "African Literature", "Web Development", "Yoga & Meditation",
              "Traditional Crafts", "Hiking & Nature", "Cooking & Recipes", "Music Production",
              "Sustainable Living", "Entrepreneurship", "Gardening", "Digital Art",
              "Language Learning", "Community Service", "Film & Video", "Board Games"
            ].map((interest, index) => (
              <button 
                key={index}
                className="px-4 py-2 bg-white border-2 border-purple-200 text-gray-700 rounded-full hover:border-purple-600 hover:text-purple-600 transition-colors"
              >
                {interest}
              </button>
            ))}
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Find Your Tribe Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join interest groups and connect with people who share your passions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition duration-300">
              Get Started
            </Link>
            <Link to="/connections" className="bg-limpopo-blue hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-300">
              Explore All Connections
            </Link>
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Ways to Connect</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/connections/friendship-partners" className="text-limpopo-blue hover:underline">
              Activity Partners
            </Link>
            <Link to="/connections/community-stories" className="text-limpopo-blue hover:underline">
              Community Stories
            </Link>
            <Link to="/events" className="text-limpopo-blue hover:underline">
              Events Calendar
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SharedInterests;