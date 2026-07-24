import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { HeroSlide, HeroSettings } from '../../lib/site-config';
import fallbackImg from '../../assets/man.jpg';

interface HeroCarouselProps {
  slides: HeroSlide[];
  settings: HeroSettings;
}

export default function HeroCarousel({ slides, settings }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), [slides.length]);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    if (!settings.autoplay || paused || slides.length <= 1) return;
    const id = setInterval(next, settings.interval);
    return () => clearInterval(id);
  }, [settings.autoplay, settings.interval, paused, slides.length, next]);

  if (slides.length === 0) return null;

  const slide = slides[current];
  const variant = settings.transition === 'slide'
    ? { initial: { x: 300, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -300, opacity: 0 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } };

  return (
    <div className="relative min-h-[80vh] -mt-16 flex items-center overflow-hidden"
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="absolute inset-0 bg-gradient-to-br from-secondary via-secondary/95 to-primary/30" />
      {slide.image_url && (
        <img src={slide.image_url} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20"
          onError={(e) => { if (e.currentTarget.src !== fallbackImg) e.currentTarget.src = fallbackImg; }} />
      )}
      <AnimatePresence mode="wait">
        <motion.div key={current} className="relative max-w-3xl mx-auto px-4 text-center w-full"
          {...variant} transition={{ duration: 0.5 }}>
          <h1 className="font-display text-4xl md:text-6xl font-black text-white mb-4 drop-shadow-lg">
            {slide.title}
          </h1>
          {slide.subtitle && (
            <p className="text-xl text-white/90 mb-8 drop-shadow">{slide.subtitle}</p>
          )}
          {slide.cta_label && (
            <Link to={slide.cta_link || '#'}
              className="inline-block px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl">
              {slide.cta_label}
            </Link>
          )}
        </motion.div>
      </AnimatePresence>

      {settings.show_arrows && slides.length > 1 && (
        <>
          <button onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all text-white text-2xl"
            aria-label="Précédent">
            ‹
          </button>
          <button onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm flex items-center justify-center transition-all text-white text-2xl"
            aria-label="Suivant">
            ›
          </button>
        </>
      )}

      {settings.show_dots && slides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-3 h-3 rounded-full transition-all ${
                i === current ? 'bg-primary scale-110' : 'bg-white/40 hover:bg-white/60'
              }`} />
          ))}
        </div>
      )}
    </div>
  );
}
