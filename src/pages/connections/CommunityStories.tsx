// Content celebrating Limpopo community stories and cultural heritage
// Sources: Limpopo provincial heritage, local community achievements research
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Book, ArrowLeft, Heart, Star, MapPin, User, Calendar, Award } from 'lucide-react';

const CommunityStories: React.FC = () => {
  useEffect(() => {
    document.title = 'Community Stories - Share Experiences in Limpopo | Limpopo Connect';
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Share and discover inspiring community stories from across Limpopo Province. Connect through shared experiences, achievements, and local heritage narratives.');
    }
  }, []);

  const featuredStories = [
    {
      title: "From Teacher to Community Leader",
      author: "Sarah M.",
      location: "Polokwane",
      category: "Inspiration",
      excerpt: "How starting a literacy program in my community led to meeting my closest friends and building a support network that changed everything.",
      readTime: "4 min read",
      likes: 89,
      image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop"
    },
    {
      title: "Preserving Our Marula Traditions",
      author: "David K.",
      location: "Tzaneen",
      category: "Heritage",
      excerpt: "Learning traditional marula fruit processing from community elders connected me with people who share my passion for cultural preservation.",
      readTime: "6 min read",
      likes: 156,
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop"
    },
    {
      title: "Building Bridges Through Art",
      author: "Nomsa R.",
      location: "Mokopane",
      category: "Creativity",
      excerpt: "My pottery workshop became a meeting place for women from different backgrounds, creating lasting friendships through shared creativity.",
      readTime: "5 min read",
      likes: 127,
      image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop"
    }
  ];

  const storyCategories = [
    {
      name: "Heritage & Culture",
      count: 34,
      icon: Award,
      description: "Stories about preserving and celebrating Limpopo's rich cultural traditions"
    },
    {
      name: "Community Impact",
      count: 28,
      icon: Heart,
      description: "Inspiring tales of community service and social impact projects"
    },
    {
      name: "Personal Growth",
      count: 45,
      icon: Star,
      description: "Journeys of self-discovery and personal development within community"
    },
    {
      name: "Local Business",
      count: 19,
      icon: MapPin,
      description: "Success stories from local entrepreneurs and business builders"
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
            <li className="text-gray-700">Community Stories</li>
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center mx-auto mb-8">
            <Book className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Community Stories
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Discover inspiring stories from across Limpopo Province. Share your journey, celebrate achievements, and connect with others through the power of storytelling and shared experiences.
          </p>
        </div>

        {/* Featured Stories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Community Stories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredStories.map((story, index) => (
              <article key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <img 
                  src={story.image} 
                  alt={story.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-limpopo-green/10 text-limpopo-green px-3 py-1 rounded-full text-sm font-medium">
                      {story.category}
                    </span>
                    <span className="text-sm text-gray-500">{story.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{story.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{story.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{story.author}</span>
                      <MapPin className="h-4 w-4 text-gray-400 ml-2" />
                      <span className="text-sm text-gray-600">{story.location}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-gray-600">{story.likes}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Story Categories */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Story Categories</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {storyCategories.map((category, index) => {
              const IconComponent = category.icon;
              return (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{category.name}</h3>
                  <p className="text-gray-600 text-sm mb-3">{category.description}</p>
                  <div className="text-2xl font-bold text-limpopo-blue">{category.count}</div>
                  <div className="text-sm text-gray-500">stories</div>
                </div>
              );
            })}
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl p-12 text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Share Your Story</h2>
          <p className="text-xl mb-8 opacity-90">
            Every story matters. Share your journey and inspire others in the Limpopo community
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="bg-limpopo-gold hover:bg-yellow-500 text-gray-900 font-bold py-4 px-8 rounded-xl transition duration-300">
              Share Your Story
            </Link>
            <Link to="/connections" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-8 rounded-xl border border-white/30 transition duration-300">
              Explore Connections
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default CommunityStories;