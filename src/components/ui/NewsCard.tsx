import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../types';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function NewsCard({ news }: { news: NewsItem & { tags?: string[] } }) {
  const [imgError, setImgError] = useState(false);
  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden card-hover group">
      <Link to={`/news/${news.slug}`}>
        <div className="relative h-48 bg-gray-100 dark:bg-gray-700 overflow-hidden">
          {news.cover_image_url && !imgError ? (
            <img
              src={news.cover_image_url}
              alt={news.title}
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">RCB</div>
          )}
        </div>
      </Link>
      <div className="p-4">
        <time className="text-xs text-gray-500 dark:text-gray-400">{formatDate(news.published_at)}</time>
        <h3 className="font-display font-semibold text-gray-900 dark:text-white mt-1 line-clamp-2">
          <Link to={`/news/${news.slug}`} className="hover:text-primary transition-colors">
            {news.title}
          </Link>
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{news.excerpt}</p>
        {news.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {news.tags.map((tag) => (
              <span key={tag} className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">{tag}</span>
            ))}
          </div>
        )}
        <Link
          to={`/news/${news.slug}`}
          className="inline-block mt-3 text-sm font-medium text-primary hover:text-cta transition-colors"
        >
          Lire la suite →
        </Link>
      </div>
    </article>
  );
}

export default React.memo(NewsCard);
