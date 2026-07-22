import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

type Slide = {
  slug: string;
  title: string;
  excerpt: string;
  cover_image_url: string;
};

export default function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = setInterval(next, 5000);
    return () => clearInterval(id);
  }, [slides.length, next]);

  if (!slides.length) return null;

  const slide = slides[current];

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center overflow-hidden -mt-16">
      {slide.cover_image_url && (
        <img
          src={slide.cover_image_url}
          alt=""
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/90 to-blue-800/90" />
      <div className="relative text-center px-4 max-w-3xl">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-white mb-4">{slide.title}</h1>
        {slide.excerpt && (
          <p className="text-lg text-white/80 mb-8 line-clamp-2">{slide.excerpt}</p>
        )}
        <Link
          to={`/news/${slide.slug}`}
          className="inline-block px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Lire l'article
        </Link>
      </div>
      {slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === current ? 'bg-white' : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
