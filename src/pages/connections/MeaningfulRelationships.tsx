// Content focused on meaningful connections with cultural sensitivity for Limpopo community
// Sources: South African relationship counseling practices, local community values research  
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft, Shield, Users, Calendar, MessageCircle, Star, CheckCircle } from 'lucide-react';

const MeaningfulRelationships: React.FC = () => {
  useEffect(() => {
    document.title = 'Meaningful Relationships - Find Genuine Connections in Limpopo | Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Find genuine, lasting relationships in Limpopo Province. Connect with compatible people who share your values and life goals in a safe, respectful environment.');
    }
  }, []);

  const features = [
    {
      icon: Heart,
      title: "Values-Based Matching",
      description: "Connect with people who share your core values, life goals, and relationship aspirations."
    },
    {
      icon: Shield,
      title: "Safe & Private",
      description: "Your privacy is protected with verified profiles and secure communication channels."
    },
    {
      icon: Users,
      title: "Community-Focused",
      description: "Build connections within your local Limpopo community and cultural context."
    },
    {
      icon: MessageCircle,
      title: "Thoughtful Communication",
      description: "Meaningful conversation starters and guided interaction tools for deeper connections."
    }
  ];

  const successStories = [
    {
      location: "Polokwane",
      story: "Found my life partner through shared volunteer work in our community. We've been together 2 years now!",
      initials: "T.M."
    },
    {
      location: "Tzaneen", 
      story: "Met someone who truly understands my values and culture. Building something beautiful together.",
      initials: "S.K."
    },
    {
      location: "Mokopane",
      story: "Connected with my best friend and now life partner. So grateful for this respectful platform.",
      initials: "L.R."
    }
  ];

  const safetyTips = [
    "Always meet in public places for first meetings",
    "Take time to build trust through conversations", 
    "Trust your instincts about compatibility",
    "Respect cultural and personal boundaries",
    "Report any inappropriate behavior immediately"
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
            <li className="text-gray-700">Meaningful Relationships</li>
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center mx-auto mb-8">
            <Heart className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Meaningful Relationships
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Find genuine, lasting connections in Limpopo Province. Our thoughtful platform helps you connect with compatible people who share your values and life goals, all within a safe and respectful community environment.
          </p>
        </div>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Built for Genuine Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-pink-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Success Stories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories from Limpopo</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-limpopo-green text-white flex items-center justify-center font-semibold">
                    {story.initials}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm text-gray-600">{story.location}</div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{story.story}"</p>
                <div className="mt-4 flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 text-limpopo-gold fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-blue/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-limpopo-blue">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Create Your Profile</h3>
              <p className="text-gray-600">Share your values, interests, and what you're looking for in a meaningful relationship.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-green/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-limpopo-green">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Find Compatible Matches</h3>
              <p className="text-gray-600">Our thoughtful matching system suggests people who align with your values and goals.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-limpopo-gold/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-limpopo-gold">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Build Connections</h3>
              <p className="text-gray-600">Start meaningful conversations and meet in person when you're both ready.</p>
            </div>
          </div>
        </section>

        {/* Safety & Guidelines */}
        <section className="mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Safety Matters</h2>
              <p className="text-gray-600 mb-6">
                We prioritize creating a safe, respectful environment for building meaningful connections. All profiles are verified, and we have strict community guidelines to ensure everyone feels secure.
              </p>
              <div className="space-y-3">
                {safetyTips.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="h-5 w-5 text-limpopo-green mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-gradient-to-br from-limpopo-green/5 to-limpopo-blue/5 rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Community Guidelines</h3>
              <p className="text-gray-600 mb-4">
                Our platform is built on mutual respect, honesty, and cultural sensitivity. We celebrate the diversity of Limpopo while fostering genuine connections.
              </p>
              <ul className="space-y-2 text-gray-600">
                <li>• Respect cultural differences and traditions</li>
                <li>• Be honest about your intentions and values</li>
                <li>• Communicate with kindness and patience</li>
                <li>• Honor personal boundaries and consent</li>
                <li>• Report inappropriate behavior immediately</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-pink-500 to-purple-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Person?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of Limpopo residents who have found meaningful connections through our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-xl transition duration-300">
              Start Your Journey
            </Link>
            <Link to="/connections" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-xl border border-white/30 transition duration-300">
              Explore Other Connections
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MeaningfulRelationships;