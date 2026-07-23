import { useEffect, useState, useCallback } from 'react';
import type { Gallery } from '../types';

const categories = ['Tous', 'Match', 'Entraînement', 'Événement', 'Autre'] as const;

export default function GalleryPage() {
  const [gallery, setGallery] = useState<Gallery[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/.netlify/functions/get-gallery')
      .then(r => r.json())
      .then(data => { setGallery(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredGallery = gallery.filter(g => activeCategory === 'Tous' || g.category === activeCategory);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);
  const prevImage = useCallback(() => {
    setCurrentIndex(i => (i - 1 + filteredGallery.length) % filteredGallery.length);
  }, [filteredGallery.length]);
  const nextImage = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filteredGallery.length);
  }, [filteredGallery.length]);

  useKeyboardNavigation(lightboxOpen, closeLightbox, prevImage, nextImage);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-display font-bold mb-8">Galerie</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-display font-bold">Galerie</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{gallery.length} média{gallery.length > 1 ? 's' : ''}</p>
      </header>

      <div className="flex flex-wrap gap-2 mb-8" role="tablist" aria-label="Filtres galerie">
        {categories.map(cat => (
          <button
            key={cat}
            role="tab"
            aria-selected={activeCategory === cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredGallery.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-12">Aucun média dans cette catégorie</p>
      ) : (
        <div
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          role="list"
          aria-label="Galerie photos"
        >
          {filteredGallery.map((item) => (
            <article
              key={item.id}
              role="listitem"
              className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800 cursor-pointer"
              onClick={() => {
                const idx = filteredGallery.findIndex(f => f.id === item.id);
                setCurrentIndex(idx);
                setLightboxOpen(true);
              }}
            >
              <img
                src={item.thumbnail_url || item.image_url}
                alt={item.title}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute bottom-3 left-3 right-3 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="font-semibold truncate">{item.title}</h3>
                {item.category && <span className="text-sm">{item.category}</span>}
              </div>
            </article>
          ))}
        </div>
      )}

      {lightboxOpen && filteredGallery.length > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
          role="dialog"
          aria-modal="true"
          aria-label="Visionneuse galerie"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white rounded-full bg-black/50"
            onClick={closeLightbox}
            aria-label="Fermer"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            className="absolute left-4 p-2 text-white/70 hover:text-white rounded-full bg-black/50"
            onClick={(e) => { e.stopPropagation(); prevImage(); }}
            aria-label="Précédent"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <div className="relative w-full max-w-5xl max-h-[85vh]">
            <img
              src={filteredGallery[currentIndex]?.image_url}
              alt={filteredGallery[currentIndex]?.title}
              className="max-w-full max-h-[80vh] object-contain"
            />
            <div className="absolute bottom-4 left-0 right-0 text-center text-white">
              <p className="font-medium">{filteredGallery[currentIndex]?.title}</p>
              <p className="text-sm text-white/70">{currentIndex + 1} / {filteredGallery.length}</p>
            </div>
          </div>

          <button
            className="absolute right-4 p-2 text-white/70 hover:text-white rounded-full bg-black/50"
            onClick={(e) => { e.stopPropagation(); nextImage(); }}
            aria-label="Suivant"
          >
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function useKeyboardNavigation(open: boolean, onClose: () => void, onPrev: () => void, onNext: () => void) {
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose, onPrev, onNext]);
}