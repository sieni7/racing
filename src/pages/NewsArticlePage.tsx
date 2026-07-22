import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { NewsItem } from '../types';
import { getNewsBySlug } from '../lib/news';

export default function NewsArticlePage() {
  const { slug } = useParams() as { slug: string };
  const [article, setArticle] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not_found' | 'network' | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getNewsBySlug(slug);
        setArticle(data);
      } catch (err) {
        console.error('Erreur chargement article:', err);
        const supabaseErr = err as { code?: string };
        if (supabaseErr?.code === 'PGRST116') {
          setError('not_found');
        } else {
          setError('network');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (error === 'not_found') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-4">Article non trouvé</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Cet article n'existe pas ou a été retiré.</p>
        <Link to="/news" className="text-primary hover:text-cta">← Retour aux actualités</Link>
      </div>
    );
  }

  if (error === 'network') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white mb-4">Erreur réseau</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Impossible de charger l'article. Vérifiez votre connexion.</p>
        <Link to="/news" className="text-primary hover:text-cta">← Retour aux actualités</Link>
      </div>
    );
  }

  if (!article) return null;

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      <Link to="/news" className="text-sm text-primary hover:text-cta mb-6 inline-block">← Retour aux actualités</Link>
      <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{article.title}</h1>
      <time className="text-sm text-gray-500 dark:text-gray-400">
        {new Date(article.published_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </time>
      {article.cover_image_url && !imgError ? (
        <img
          src={article.cover_image_url}
          alt={article.title}
          loading="lazy"
          onError={() => setImgError(true)}
          className="w-full h-64 md:h-80 object-cover rounded-xl my-6"
        />
      ) : article.cover_image_url ? (
        <div className="w-full h-64 md:h-80 rounded-xl my-6 bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-400">
          {article.title[0]}
        </div>
      ) : null}
      <div className="prose prose-gray dark:prose-invert max-w-none mt-6">
        <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">{article.content}</p>
      </div>
    </article>
  );
}
