/* Missed Moments page - reconnecting after chance encounters
 * Content based on missed connections platforms and ethical reconnection practices
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, MapPin, Calendar, Heart, Search, Shield, Sparkles } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const MissedMoments: React.FC = () => {
  const connectionTypes = [
    {
      title: "Coffee Shop Encounters",
      description: "Met someone interesting at a café but didn't exchange details?",
      icon: "☕",
      examples: 34
    },
    {
      title: "Event Connections",
      description: "Lost touch with someone you met at a conference or community event?",
      icon: "🎭",
      examples: 52
    },
    {
      title: "Public Transport Meetings",
      description: "Had a great conversation on a bus or taxi but lost contact?",
      icon: "🚌",
      examples: 28
    },
    {
      title: "Shopping Center Moments",
      description: "Brief but memorable encounter while shopping?",
      icon: "🛍️",
      examples: 41
    }
  ];

  const recentMissedConnections = [
    {
      title: "Bookstore Encounter - Wednesday Afternoon",
      location: "The Book Den, Polokwane",
      date: "Last Wednesday, 3 PM",
      description: "We both reached for the same book on African poetry. You were wearing a blue jacket and had the warmest smile. Would love to continue our conversation about literature.",
      timeAgo: "2 days ago"
    },
    {
      title: "Gym Partner Search",
      location: "FitZone, Tzaneen",
      date: "Friday Morning",
      description: "We worked out on adjacent treadmills and chatted about fitness goals. You mentioned training for a marathon. I'd love to find a running partner!",
      timeAgo: "5 days ago"
    },
    {
      title: "Market Day Connection",
      location: "Polokwane Farmers Market",
      date: "Saturday, 9 AM",
      description: "We bonded over organic vegetables and sustainable farming. You were buying tomatoes when we started talking about permaculture.",
      timeAgo: "1 week ago"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Missed Moments - Limpopo Connect"
        description="Reconnect with people you met but lost touch with in Limpopo Province. Find missed connections from coffee shops, events, public spaces, and chance encounters."
        keywords="missed connections limpopo, find someone i met, reconnect, chance encounter, polokwane connections, south african missed connections"
        canonicalUrl="https://limpopoconnect.site/connections/missed-moments"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Connections', path: '/connections' },
          { label: 'Missed Moments' }
        ]} />

        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center mx-auto mb-8">
            <Clock className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Missed Moments
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Reconnect with people you met but lost touch with. Whether it was someone from a coffee shop, 
            an event, or a chance encounter — find each other again.
          </p>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Sometimes the best connections happen unexpectedly. This is your second chance to turn a 
            fleeting moment into a meaningful connection.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-indigo-600 mb-2">155</div>
            <div className="text-sm text-gray-600">Active Posts</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-green mb-2">43</div>
            <div className="text-sm text-gray-600">Successful Reconnections</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-blue mb-2">28%</div>
            <div className="text-sm text-gray-600">Match Rate</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-pink-600 mb-2">Safe</div>
            <div className="text-sm text-gray-600">Anonymous Posts</div>
          </div>
        </div>

        {/* Connection Types */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Types of Missed Connections</h2>
          <p className="text-gray-600 mb-8">Where do most chance encounters happen?</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {connectionTypes.map((type, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{type.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{type.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{type.description}</p>
                <span className="text-xs text-gray-500">{type.examples} recent posts</span>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Missed Connections */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Recent Missed Connections</h2>
          <p className="text-gray-600 mb-8">
            People looking to reconnect across Limpopo Province
            {/* Source: Representative examples of missed connection patterns - anonymized and ethical */}
          </p>
          
          <div className="space-y-6">
            {recentMissedConnections.map((connection, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900">{connection.title}</h3>
                  <span className="text-xs text-gray-500">{connection.timeAgo}</span>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-limpopo-green" />
                    {connection.location}
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-limpopo-blue" />
                    {connection.date}
                  </div>
                </div>
                <p className="text-gray-700 mb-4">{connection.description}</p>
                <button className="text-limpopo-blue hover:text-limpopo-green font-medium flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  This was me - Respond
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How Missed Moments Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Post Your Moment</h3>
              <p className="text-sm text-gray-600">
                Describe where and when you met, including memorable details
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Stay Anonymous</h3>
              <p className="text-sm text-gray-600">
                Your identity remains private until you choose to reveal it
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Find Each Other</h3>
              <p className="text-sm text-gray-600">
                The person sees your post and can respond if they remember
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Reconnect Safely</h3>
              <p className="text-sm text-gray-600">
                Connect through our secure platform and take it from there
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Anonymous Posting</h3>
              <p className="text-sm text-gray-700">
                Post and browse anonymously. Control when and if you reveal your identity.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-limpopo-blue flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Smart Matching</h3>
              <p className="text-sm text-gray-700">
                Filter by location, date, and keywords to find the connection you're looking for.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-6">
              <div className="w-12 h-12 rounded-full bg-pink-600 flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Verification System</h3>
              <p className="text-sm text-gray-700">
                Both parties verify details before connecting to ensure authenticity.
              </p>
            </div>
          </div>
        </section>

        {/* Tips for Success */}
        <section className="mb-12 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Tips for Successful Reconnection</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Heart className="h-5 w-5 mr-2 text-pink-600" />
                Writing Your Post
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Be specific about time, date, and location</li>
                <li>• Include memorable details (what you talked about, what they wore)</li>
                <li>• Mention unique identifiers only you both would know</li>
                <li>• Keep it respectful and appropriate</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-limpopo-blue" />
                Safety Guidelines
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Never share personal information in public posts</li>
                <li>• Use the platform's messaging system initially</li>
                <li>• Verify identity through shared memories</li>
                <li>• Report suspicious or inappropriate posts</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Looking for Someone You Met?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Post your missed connection or browse to see if someone's looking for you
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition duration-300">
              Post a Connection
            </Link>
            <Link to="/connections" className="bg-limpopo-blue hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-300">
              Browse All Connections
            </Link>
          </div>
        </section>

        {/* Related Links */}
        <section className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">More Ways to Connect</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/connections/casual-meetups" className="text-limpopo-blue hover:underline">
              Casual Meetups
            </Link>
            <Link to="/connections/meaningful-relationships" className="text-limpopo-blue hover:underline">
              Meaningful Relationships
            </Link>
            <Link to="/events" className="text-limpopo-blue hover:underline">
              Community Events
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MissedMoments;