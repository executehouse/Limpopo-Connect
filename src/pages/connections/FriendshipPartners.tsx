import React from 'react';
import { Link } from 'react-router-dom';
import { Users, ArrowLeft } from 'lucide-react';

const FriendshipPartners: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back Link */}
        <Link to="/connections" className="inline-flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green mb-8 transition-colors">
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Connections Hub</span>
        </Link>

        {/* Content */}
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 flex items-center justify-center mx-auto mb-8">
            <Users className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Friendship & Activity Partners
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 mb-8">
              This section is coming soon — stay tuned!
            </p>
            <p className="text-lg text-gray-500 mb-12">
              We're building an amazing space where you can connect with like-minded people for hobbies, 
              sports, and adventures across Limpopo Province. From hiking buddies to book clubs, 
              find your perfect activity partners here.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Coming:</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Activity-based matching system</li>
                <li>• Local hobby groups and clubs</li>
                <li>• Event planning tools</li>
                <li>• Interest-based recommendations</li>
                <li>• Group chat functionality</li>
              </ul>
            </div>
            
            <div className="mt-8">
              <Link 
                to="/connections" 
                className="bg-limpopo-blue hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition duration-300"
              >
                Explore Other Categories
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendshipPartners;