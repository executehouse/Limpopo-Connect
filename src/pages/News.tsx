import React from 'react';
import { Calendar, User, ExternalLink } from 'lucide-react';

const News: React.FC = () => {
  const articles = [
    {
      id: 1,
      title: "New Infrastructure Development in Polokwane",
      summary: "Major road improvements and public facility upgrades announced for the city center",
      author: "Limpopo Today",
      date: "2024-11-28",
      category: "Development",
      image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=300&fit=crop"
    },
    {
      id: 2,
      title: "Limpopo Tourism Industry Shows Strong Recovery",
      summary: "Local tourism sector reports significant growth with increased visitor numbers and bookings",
      author: "Business Limpopo",
      date: "2024-11-26",
      category: "Tourism",
      image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400&h=300&fit=crop"
    },
    {
      id: 3,
      title: "Agricultural Innovation Hub Opens in Tzaneen",
      summary: "New facility to support local farmers with modern technology and sustainable practices",
      author: "Rural Development News",
      date: "2024-11-24",
      category: "Agriculture",
      image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=300&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Local News</h1>
          <p className="text-lg text-gray-600">
            Stay updated with the latest news and developments across Limpopo
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <article key={article.id} className="card hover:shadow-lg transition">
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              
              <div className="mb-2">
                <span className="inline-block bg-limpopo-blue text-white text-xs px-2 py-1 rounded">
                  {article.category}
                </span>
              </div>
              
              <h2 className="text-xl font-semibold mb-3 text-gray-900">
                {article.title}
              </h2>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>{article.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>{article.date}</span>
                </div>
              </div>
              
              <button className="flex items-center space-x-2 text-limpopo-blue hover:text-limpopo-green font-medium transition">
                <span>Read Full Article</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </article>
          ))}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-white rounded-lg p-8 shadow-md">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Stay Informed
            </h2>
            <p className="text-gray-600 mb-6">
              Subscribe to our newsletter for the latest news and updates from across Limpopo
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-limpopo-blue focus:border-transparent"
              />
              <button className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;