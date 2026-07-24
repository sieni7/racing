import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSiteConfig, updateSiteConfig, DEFAULT_CONFIG, type SiteConfig } from '../../../lib/site-config';

const FIELDS = [
  { name: 'club_history_years', label: 'Années d\'histoire', type: 'number' },
  { name: 'players_count', label: 'Nombre de joueurs', type: 'number' },
  { name: 'championships', label: 'Championnats', type: 'number' },
  { name: 'staff_count', label: 'Staff', type: 'number' },
  { type: 'separator', name: 'contacts', label: 'Coordonnées' },
  { name: 'address', label: 'Adresse', type: 'text' },
  { name: 'email', label: 'Email', type: 'email' },
  { name: 'phone', label: 'Téléphone', type: 'text' },
  { type: 'separator', name: 'socials', label: 'Réseaux sociaux' },
  { name: 'facebook_url', label: 'Facebook URL', type: 'url' },
  { name: 'instagram_url', label: 'Instagram URL', type: 'url' },
  { name: 'twitter_url', label: 'Twitter URL', type: 'url' },
  { name: 'youtube_url', label: 'YouTube URL', type: 'url' },
];

export default function SiteConfigPage() {
  const [values, setValues] = useState<Partial<SiteConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteConfig().then(data => {
      setValues(data ? { ...data } : { ...DEFAULT_CONFIG });
      setLoading(false);
    }).catch(() => {
      setValues({ ...DEFAULT_CONFIG } as any);
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await updateSiteConfig(values);
      toast.success('Configuration enregistrée');
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Configuration du site</h1>
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900 dark:text-white">Configuration du site</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Métriques, contacts et liens réseaux sociaux</p>
        </div>
        <button onClick={handleSubmit} disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
        <div>
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Métriques de l'accueil
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {FIELDS.slice(0, 4).map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{f.label}</label>
                <input type="number" value={(values as any)[f.name] ?? ''} onChange={e => setValues(p => ({ ...p, [f.name]: Number(e.target.value) }))}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Coordonnées
          </h3>
          <div className="space-y-4">
            {FIELDS.slice(4, 7).map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{f.label}</label>
                <input type={f.type === 'email' ? 'email' : 'text'} value={(values as any)[f.name] ?? ''} onChange={e => setValues(p => ({ ...p, [f.name]: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Réseaux sociaux
          </h3>
          <div className="space-y-4">
            {FIELDS.slice(7).map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{f.label}</label>
                <input type="url" value={(values as any)[f.name] ?? ''} onChange={e => setValues(p => ({ ...p, [f.name]: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" placeholder="https://" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
