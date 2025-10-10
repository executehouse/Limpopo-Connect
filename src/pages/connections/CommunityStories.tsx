/* Community Stories page - sharing experiences and celebrating local achievements
 * Content based on community storytelling practices and South African oral tradition
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Book, ArrowLeft, Award, Lightbulb, Heart, TrendingUp, Users, MessageSquare } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const CommunityStories: React.FC = () => {
  const storyCategories = [
    {
      title: "Success Stories",
      description: "Celebrate achievements and inspire others with your journey",
      icon: <Award className="h-8 w-8" />,
      color: "from-yellow-400 to-yellow-600",
      count: 87
    },
    {
      title: "Life Lessons",
      description: "Share wisdom and experiences that shaped who you are",
      icon: <Lightbulb className="h-8 w-8" />,
      color: "from-blue-400 to-blue-600",
      count: 134
    },
    {
      title: "Community Impact",
      description: "Highlight initiatives making a difference in Limpopo",
      icon: <Heart className="h-8 w-8" />,
      color: "from-red-400 to-red-600",
      count: 62
    },
    {
      title: "Heritage & Culture",
      description: "Preserve and share our rich cultural heritage",
      icon: <Book className="h-8 w-8" />,
      color: "from-green-400 to-green-600",
      count: 91
    }
  ];

  const featuredStories = [
    {
      title: "From Township to Tech Entrepreneur",
      author: "Mpho Maluleke",
      category: "Success Stories",
      excerpt: "How I built a successful software company starting from my home in Polokwane, creating jobs and opportunities for local youth.",
      reactions: 234,
      comments: 45
    },
    {
      title: "Reviving Traditional Pottery in Venda",
      author: "Tshifhiwa Netshivhale",
      category: "Heritage & Culture",
      excerpt: "Our cooperative's journey to preserve ancient pottery techniques while creating sustainable livelihoods for local artisans.",
      reactions: 189,
      comments: 32
    },
    {
      title: "Building Community Gardens",
      author: "Sarah Mogale",
      category: "Community Impact",
      excerpt: "How our neighborhood transformed vacant lots into thriving community gardens, feeding families and bringing people together.",
      reactions: 312,
      comments: 67
    }
  ];

  const storyThemes = [
    "Entrepreneurship", "Education", "Agriculture", "Arts & Crafts",
    "Technology", "Youth Development", "Women Empowerment", "Environmental Conservation",
    "Traditional Healing", "Music & Dance", "Sports Achievement", "Community Building"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Community Stories - Limpopo Connect"
        description="Share and discover inspiring stories from Limpopo Province. Celebrate achievements, preserve culture, and connect through shared experiences and community wisdom."
        keywords="community stories limpopo, success stories, local achievements, cultural heritage, south african stories, limpopo community"
        canonicalUrl="https://limpopoconnect.site/connections/community-stories"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Connections', path: '/connections' },
          { label: 'Community Stories' }
        ]} />

        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center mx-auto mb-8">
            <Book className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Community Stories
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Share experiences, celebrate achievements, and connect through the power of storytelling. 
            Every story strengthens our community.
          </p>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            From personal triumphs to community initiatives, from cultural preservation to inspiring innovation — 
            this is where Limpopo's stories come alive and create meaningful connections.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-green-600 mb-2">374</div>
            <div className="text-sm text-gray-600">Stories Shared</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-blue mb-2">1,200+</div>
            <div className="text-sm text-gray-600">Community Members</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-gold mb-2">45</div>
            <div className="text-sm text-gray-600">Featured Stories</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-purple-600 mb-2">12</div>
            <div className="text-sm text-gray-600">Story Categories</div>
          </div>
        </div>

        {/* Story Categories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Story Categories</h2>
          <p className="text-gray-600 mb-8">Choose a category to share or explore stories</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storyCategories.map((category, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all">
                <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${category.color} flex items-center justify-center mb-4 text-white`}>
                  {category.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{category.count} stories</span>
                  <button className="text-limpopo-blue hover:text-limpopo-green font-medium text-sm">
                    Explore →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Stories */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Featured Stories</h2>
          <p className="text-gray-600 mb-8">
            Inspiring stories from our community members
            {/* Source: Representative examples of community achievement narratives in South African provinces */}
          </p>
          
          <div className="space-y-6">
            {featuredStories.map((story, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{story.title}</h3>
                    <p className="text-sm text-gray-600">by {story.author}</p>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                    {story.category}
                  </span>
                </div>
                <p className="text-gray-700 mb-4">{story.excerpt}</p>
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <button className="flex items-center hover:text-limpopo-blue transition-colors">
                    <Heart className="h-4 w-4 mr-1" />
                    {story.reactions}
                  </button>
                  <button className="flex items-center hover:text-limpopo-blue transition-colors">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    {story.comments}
                  </button>
                  <button className="text-limpopo-blue hover:text-limpopo-green font-medium ml-auto">
                    Read Full Story →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Why Share Your Story */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Why Share Your Story?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Inspire Others</h3>
              <p className="text-sm text-gray-600">Your journey can motivate and guide others facing similar challenges</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Book className="h-8 w-8 text-limpopo-blue" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Preserve Heritage</h3>
              <p className="text-sm text-gray-600">Document and share cultural traditions for future generations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Connections</h3>
              <p className="text-sm text-gray-600">Find people with similar experiences and create meaningful bonds</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Amplify Impact</h3>
              <p className="text-sm text-gray-600">Highlight community initiatives and attract support for good causes</p>
            </div>
          </div>
        </section>

        {/* Story Themes */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Story Themes</h2>
          <div className="flex flex-wrap gap-3">
            {storyThemes.map((theme, index) => (
              <button 
                key={index}
                className="px-4 py-2 bg-white border-2 border-green-200 text-gray-700 rounded-full hover:border-green-600 hover:text-green-600 transition-colors"
              >
                {theme}
              </button>
            ))}
          </div>
        </section>

        {/* Storytelling Guidelines */}
        <section className="mb-12 bg-gradient-to-r from-green-50 to-teal-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Storytelling Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Make It Personal</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Share authentic experiences and emotions</li>
                <li>• Be specific about times, places, and people</li>
                <li>• Include challenges you overcame</li>
                <li>• Show vulnerability and growth</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Engage Your Readers</h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Start with a compelling opening</li>
                <li>• Use vivid descriptions and details</li>
                <li>• Include dialogue when relevant</li>
                <li>• End with lessons learned or reflections</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Share Your Story Today
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Your experience matters. Inspire, connect, and make a difference through storytelling.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-green-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition duration-300">
              Start Writing
            </Link>
            <Link to="/connections" className="bg-limpopo-blue hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-300">
              Explore Connections
            </Link>
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Ways to Connect</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/connections/shared-interests" className="text-limpopo-blue hover:underline">
              Shared Interests
            </Link>
            <Link to="/connections/friendship-partners" className="text-limpopo-blue hover:underline">
              Activity Partners
            </Link>
            <Link to="/news" className="text-limpopo-blue hover:underline">
              Local News
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunityStories;