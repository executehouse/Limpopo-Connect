import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

const MeaningfulRelationships: React.FC = () => {
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-400 to-pink-600 flex items-center justify-center mx-auto mb-8">
            <Heart className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Meaningful Relationships
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 mb-8">
              This section is coming soon — stay tuned!
            </p>
            <p className="text-lg text-gray-500 mb-12">
              A thoughtful space for finding genuine connections and lasting relationships 
              in your area. Built with care, privacy, and respect at its core.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Coming:</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• Thoughtful compatibility matching</li>
                <li>• Values-based connection system</li>
                <li>• Safe and private communication</li>
                <li>• Local meetup suggestions</li>
                <li>• Relationship goal alignment</li>
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

export default MeaningfulRelationships;