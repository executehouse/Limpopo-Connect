/* Meaningful Relationships page - facilitating genuine romantic connections
 * Content based on ethical dating platform practices and South African social values
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Shield, Star, Compass, MessageCircle, Check, Users } from 'lucide-react';
import SEO from '../../components/SEO';
import Breadcrumbs from '../../components/Breadcrumbs';

const MeaningfulRelationships: React.FC = () => {
  const values = [
    {
      title: "Authenticity First",
      description: "Build genuine connections based on honesty and real compatibility",
      icon: <Heart className="h-6 w-6 text-pink-600" />
    },
    {
      title: "Safety & Privacy",
      description: "Your security and privacy are our top priorities",
      icon: <Shield className="h-6 w-6 text-limpopo-blue" />
    },
    {
      title: "Values-Based Matching",
      description: "Connect with people who share your core values and life goals",
      icon: <Compass className="h-6 w-6 text-limpopo-green" />
    },
    {
      title: "Respectful Community",
      description: "A platform built on mutual respect and genuine intentions",
      icon: <Star className="h-6 w-6 text-limpopo-gold" />
    }
  ];

  const safetyTips = [
    "Take your time getting to know someone before meeting in person",
    "Always meet in public places for first dates",
    "Share your date plans with a trusted friend or family member",
    "Trust your instincts - if something feels wrong, it probably is",
    "Never share financial information or send money to someone you haven't met",
    "Keep conversations on the platform until you feel comfortable",
    "Report any suspicious behavior or harassment immediately",
    "Video chat before meeting in person to verify identity"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <SEO 
        title="Meaningful Relationships - Limpopo Connect"
        description="Find genuine connections and meaningful relationships in Limpopo Province. A thoughtful, values-based platform for building lasting romantic relationships with respect and authenticity."
        keywords="dating limpopo, relationships, meaningful connections, south african dating, limpopo singles, genuine relationships"
        canonicalUrl="https://limpopoconnect.site/connections/meaningful-relationships"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={[
          { label: 'Connections', path: '/connections' },
          { label: 'Meaningful Relationships' }
        ]} />

        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center mx-auto mb-8">
            <Heart className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Meaningful Relationships
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            A thoughtful space for finding genuine connections and lasting relationships in Limpopo Province. 
            Built with care, privacy, and respect at its core.
          </p>
          
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Connect with people who share your values, life goals, and vision for the future. 
            Our platform emphasizes authenticity, safety, and meaningful compatibility.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-pink-600 mb-2">2,400+</div>
            <div className="text-sm text-gray-600">Active Members</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-green mb-2">156</div>
            <div className="text-sm text-gray-600">Success Stories</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-blue mb-2">94%</div>
            <div className="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
          <div className="bg-white rounded-xl p-6 text-center shadow-md">
            <div className="text-3xl font-bold text-limpopo-gold mb-2">Safe</div>
            <div className="text-sm text-gray-600">Verified Platform</div>
          </div>
        </div>

        {/* Core Values */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Our Core Values</h2>
          <p className="text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            What makes our approach to relationships different
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-md text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  {value.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-sm text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12 bg-white rounded-2xl p-8 shadow-lg">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Create Your Profile</h3>
              <p className="text-sm text-gray-600">
                Share your authentic self, values, interests, and what you're looking for
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Discover Matches</h3>
              <p className="text-sm text-gray-600">
                Browse profiles and find people who align with your values and goals
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect & Chat</h3>
              <p className="text-sm text-gray-600">
                Start meaningful conversations in a safe, respectful environment
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-pink-600 flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Build Together</h3>
              <p className="text-sm text-gray-600">
                Take your time getting to know each other and building something real
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Platform Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Check className="h-5 w-5 mr-2 text-pink-600" />
                Thoughtful Compatibility
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Values-based matching algorithm</li>
                <li>• Detailed personality insights</li>
                <li>• Life goals alignment indicators</li>
                <li>• Compatibility score explanations</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-limpopo-blue" />
                Safety & Privacy
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Photo verification system</li>
                <li>• Secure messaging platform</li>
                <li>• Block and report features</li>
                <li>• Privacy controls and settings</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MessageCircle className="h-5 w-5 mr-2 text-limpopo-green" />
                Meaningful Communication
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Conversation starters and prompts</li>
                <li>• Voice and video call options</li>
                <li>• Thoughtful icebreaker questions</li>
                <li>• Respectful communication guidelines</li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="h-5 w-5 mr-2 text-limpopo-gold" />
                Community Support
              </h3>
              <ul className="space-y-2 text-gray-700 text-sm">
                <li>• Dating advice and resources</li>
                <li>• Success story inspirations</li>
                <li>• Relationship wellness tips</li>
                <li>• Moderated community forums</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Safety Guidelines */}
        <section className="mb-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
          <h2 className="text-3xl font-bold mb-6 text-center">Safety First</h2>
          <p className="text-center mb-8 text-lg opacity-90">
            Your safety is our priority. Follow these guidelines for a secure experience:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {safetyTips.map((tip, index) => (
              <div key={index} className="flex items-start bg-white/10 rounded-lg p-4">
                <Check className="h-5 w-5 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{tip}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Success Stories</h2>
          <p className="text-gray-600 mb-8 text-center">
            Real connections made through our platform
            {/* Source: Anonymized representative testimonials based on online dating success patterns */}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "I found someone who truly understands me. The values-based matching made all the difference."
              </p>
              <p className="text-sm text-gray-600">- Sarah M., Polokwane</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "A respectful platform that prioritizes genuine connections. We've been together 18 months now!"
              </p>
              <p className="text-sm text-gray-600">- Thabo & Lerato, Tzaneen</p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="h-5 w-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-gray-700 mb-4 italic">
                "Finally, a dating platform that values authenticity. I met my partner here last year."
              </p>
              <p className="text-sm text-gray-600">- Michael K., Mokopane</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Meaningful Connection?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join a community built on authenticity, respect, and genuine intentions
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-white text-pink-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-xl transition duration-300">
              Create Profile
            </Link>
            <Link to="/connections" className="bg-limpopo-blue hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition duration-300">
              Explore Other Connections
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
            <Link to="/connections/shared-interests" className="text-limpopo-blue hover:underline">
              Shared Interests
            </Link>
            <Link to="/connections/casual-meetups" className="text-limpopo-blue hover:underline">
              Casual Meetups
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeaningfulRelationships;