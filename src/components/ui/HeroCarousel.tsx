import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { NewsItem } from '../../types';

export default function HeroCarousel({ news }: { news: NewsItem[] }) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % news.length), [news.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + news.length) % news.length), [news.length]);

  useEffect(() => {
    if (paused || news.length <= 1) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [paused, news.length, next]);

  if (news.length === 0) return null;

  const item = news[current];

  return (
    <div
      className="relative min-h-[80vh] -mt-16 flex items-center gradient-hero text-white overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {item.cover_image_url && (
        <img
          src={item.cover_image_url}
          alt={item.title || ''}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
      )}
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <time className="text-sm text-white/70 mb-2 block">
          {new Date(item.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </time>
        <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">{item.title}</h1>
        {item.excerpt && (
          <p className="text-lg text-white/90 mb-8 line-clamp-2">{item.excerpt}</p>
        )}
        <Link
          to={`/news/${item.slug}`}
          className="inline-block px-6 py-3 bg-white text-secondary font-semibold rounded-xl hover:bg-primary transition-colors"
        >
          Lire l'article
        </Link>
      </div>

      {news.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            ‹
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            ›
          </button>
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {news.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === current ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
