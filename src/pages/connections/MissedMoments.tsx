import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';

const MissedMoments: React.FC = () => {
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
          <div className="w-24 h-24 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600 flex items-center justify-center mx-auto mb-8">
            <Clock className="h-12 w-12 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Missed Moments
          </h1>
          
          <div className="max-w-2xl mx-auto">
            <p className="text-xl text-gray-600 mb-8">
              This section is coming soon — stay tuned!
            </p>
            <p className="text-lg text-gray-500 mb-12">
              Reconnect with people you met but lost touch with. Whether it was someone 
              from a coffee shop, an event, or a chance encounter, find each other again.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">What's Coming:</h3>
              <ul className="text-left space-y-2 text-gray-600">
                <li>• "Missed connections" posting system</li>
                <li>• Location and time-based matching</li>
                <li>• Anonymous reconnection requests</li>
                <li>• Event-based connection tracking</li>
                <li>• Safe identity verification</li>
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

export default MissedMoments;