import { useState, useEffect, useCallback } from 'react';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';
import { newsService, type NewsArticle } from '@/services';

interface NewsFeedProps {
  maxArticles?: number;
  category?: 'limpopo' | 'south-africa' | 'community';
}

export function NewsFeed({ maxArticles = 5, category = 'limpopo' }: NewsFeedProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let newsArticles: NewsArticle[] = [];
      
      switch (category) {
        case 'limpopo':
          newsArticles = await newsService.getLimpopoNews();
          break;
        case 'south-africa':
          newsArticles = await newsService.getSouthAfricaNews();
          break;
        case 'community':
          newsArticles = await newsService.getCommunityNews();
          break;
      }

      setArticles(newsArticles.slice(0, maxArticles));
    } catch (err) {
      console.error('News feed error:', err);
      setError('Unable to load news');
    } finally {
      setLoading(false);
    }
  }, [category, maxArticles]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center mb-4">
          <Newspaper className="w-6 h-6 text-limpopo-green mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Latest News</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || articles.length === 0) {
    return null; // Silently fail if news is not available
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Newspaper className="w-6 h-6 text-limpopo-green mr-2" />
          <h3 className="text-xl font-bold text-gray-900">Latest News</h3>
        </div>
        <button
          onClick={loadNews}
          className="text-sm text-limpopo-green hover:text-limpopo-green-dark"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {articles.map((article, index) => (
          <article
            key={`${article.link}-${index}`}
            className="border-b border-gray-200 last:border-0 pb-4 last:pb-0"
          >
            <a
              href={article.link === '#' ? undefined : article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <h4 className="text-base font-semibold text-gray-900 group-hover:text-limpopo-green mb-1 line-clamp-2">
                {article.title}
              </h4>
              {article.description && (
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {article.description}
                </p>
              )}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-2">
                  <Clock className="w-3 h-3" />
                  <span>{formatDate(article.pubDate)}</span>
                  {article.source_id && (
                    <>
                      <span>•</span>
                      <span className="capitalize">{article.source_id}</span>
                    </>
                  )}
                </div>
                {article.link !== '#' && (
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </div>
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
