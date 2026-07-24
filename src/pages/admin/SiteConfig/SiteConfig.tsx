import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getSiteConfig, updateSiteConfig, DEFAULT_CONFIG, type SiteConfig, type HeroSlide } from '../../../lib/site-config';

export default function SiteConfigPage() {
  const [values, setValues] = useState<Partial<SiteConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getSiteConfig().then(data => {
      const base = data ? { ...data } : { ...DEFAULT_CONFIG };
      if (!base.metrics_config?.length) base.metrics_config = [...DEFAULT_CONFIG.metrics_config];
      setValues(base);
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
        <div className="flex items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h3 className="font-display font-bold text-gray-900 dark:text-white">Mode maintenance</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Désactiver l'accès public au site</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={(values as any).maintenance_mode || false} onChange={e => setValues(p => ({ ...p, maintenance_mode: e.target.checked }))} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
          </label>
        </div>

        <div>
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Métriques de l'accueil
          </h3>
          <div className="space-y-3">
            {((values as any).metrics_config || []).map((mc: { key: string; label: string; visible: boolean }, i: number) => (
              <div key={mc.key} className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input type="checkbox" checked={mc.visible} onChange={e => {
                    const cfg = [...((values as any).metrics_config || [])]; cfg[i] = { ...cfg[i], visible: e.target.checked }; setValues(p => ({ ...p, metrics_config: cfg }));
                  }} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary" />
                </label>
                <input value={mc.label} onChange={e => {
                  const cfg = [...((values as any).metrics_config || [])]; cfg[i] = { ...cfg[i], label: e.target.value }; setValues(p => ({ ...p, metrics_config: cfg }));
                }} className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                <input type="number" value={(values as any)[mc.key] ?? ''} onChange={e => setValues(p => ({ ...p, [mc.key]: Number(e.target.value) }))}
                  className="w-20 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-right" />
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
            {[
              { name: 'address', label: 'Adresse', type: 'text' },
              { name: 'email', label: 'Email', type: 'email' },
              { name: 'phone', label: 'Téléphone', type: 'text' },
            ].map(f => (
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
            {[
              { name: 'facebook_url', label: 'Facebook URL', type: 'url' },
              { name: 'instagram_url', label: 'Instagram URL', type: 'url' },
              { name: 'twitter_url', label: 'Twitter URL', type: 'url' },
              { name: 'youtube_url', label: 'YouTube URL', type: 'url' },
            ].map(f => (
              <div key={f.name}>
                <label className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{f.label}</label>
                <input type="url" value={(values as any)[f.name] ?? ''} onChange={e => setValues(p => ({ ...p, [f.name]: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm" placeholder="https://" />
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            Slides du carrousel
          </h3>
          <div className="space-y-3">
            {((values as any).hero_slides || []).map((slide: HeroSlide, i: number) => (
              <div key={slide.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Slide {i + 1}</span>
                  <button onClick={() => {
                    const slides = [...((values as any).hero_slides || [])];
                    slides.splice(i, 1);
                    setValues(p => ({ ...p, hero_slides: slides }));
                  }} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input placeholder="Titre" value={slide.title} onChange={e => {
                    const slides = [...((values as any).hero_slides || [])]; slides[i] = { ...slides[i], title: e.target.value }; setValues(p => ({ ...p, hero_slides: slides }));
                  }} className="col-span-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                  <input placeholder="Sous-titre" value={slide.subtitle} onChange={e => {
                    const slides = [...((values as any).hero_slides || [])]; slides[i] = { ...slides[i], subtitle: e.target.value }; setValues(p => ({ ...p, hero_slides: slides }));
                  }} className="col-span-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                  <input placeholder="Texte du bouton" value={slide.cta_label} onChange={e => {
                    const slides = [...((values as any).hero_slides || [])]; slides[i] = { ...slides[i], cta_label: e.target.value }; setValues(p => ({ ...p, hero_slides: slides }));
                  }} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                  <input placeholder="Lien du bouton (ex: /effectif)" value={slide.cta_link} onChange={e => {
                    const slides = [...((values as any).hero_slides || [])]; slides[i] = { ...slides[i], cta_link: e.target.value }; setValues(p => ({ ...p, hero_slides: slides }));
                  }} className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                  <input placeholder="URL de l'image" value={slide.image_url || ''} onChange={e => {
                    const slides = [...((values as any).hero_slides || [])]; slides[i] = { ...slides[i], image_url: e.target.value }; setValues(p => ({ ...p, hero_slides: slides }));
                  }} className="col-span-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
                </div>
              </div>
            ))}
            <button onClick={() => {
              const slides = [...((values as any).hero_slides || [])];
              slides.push({ id: String(Date.now()), title: '', subtitle: '', cta_label: '', cta_link: '', image_url: '', order: slides.length });
              setValues(p => ({ ...p, hero_slides: slides }));
            }} className="w-full py-2.5 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 text-sm text-gray-500 hover:border-primary hover:text-primary transition-colors">
              + Ajouter une slide
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
          <h3 className="font-display font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Paramètres du carrousel
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Transition</label>
              <select value={(values as any).hero_settings?.transition || 'fade'} onChange={e => setValues(p => ({ ...p, hero_settings: { ...p.hero_settings, transition: e.target.value } as any }))}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm">
                <option value="fade">Fondu</option>
                <option value="slide">Glissement</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Intervalle (ms)</label>
              <input type="number" value={(values as any).hero_settings?.interval || 5000} onChange={e => setValues(p => ({ ...p, hero_settings: { ...p.hero_settings, interval: Number(e.target.value) } as any }))}
                className="mt-1 w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { key: 'autoplay', label: 'Lecture auto' },
              { key: 'show_arrows', label: 'Flèches' },
              { key: 'show_dots', label: 'Points' },
            ].map(t => (
              <label key={t.key} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={!!((values as any).hero_settings || {})[t.key]} onChange={e => setValues(p => ({ ...p, hero_settings: { ...p.hero_settings, [t.key]: e.target.checked } as any }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary" />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
